import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';
import path from 'node:path';

interface MCPRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id: string | number;
  result?: any;
  error?: any;
}

/**
 * Send an MCP request to the child process and wait for response
 */
function mcpCall(child: ChildProcessWithoutNullStreams, method: string, params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: Math.random().toString(36).substring(7),
      method,
      params
    };

    let responseData = '';
    let timeoutId: NodeJS.Timeout;

    const onData = (chunk: Buffer) => {
      responseData += chunk.toString();
      
      // Try to parse complete JSON response
      try {
        const lines = responseData.split('\n').filter(line => line.trim());
        for (const line of lines) {
          const response: MCPResponse = JSON.parse(line);
          if (response.id === request.id) {
            clearTimeout(timeoutId);
            child.stdout.removeListener('data', onData);
            
            if (response.error) {
              reject(new Error(`MCP Error: ${JSON.stringify(response.error)}`));
            } else {
              resolve(response.result);
            }
            return;
          }
        }
      } catch (e) {
        // Continue reading if JSON is incomplete
      }
    };

    // Set up response listener
    child.stdout.on('data', onData);

    // Set up timeout
    timeoutId = setTimeout(() => {
      child.stdout.removeListener('data', onData);
      reject(new Error(`MCP request timeout after 5000ms: ${method}`));
    }, 5000);

    // Send request
    child.stdin.write(JSON.stringify(request) + '\n');
  });
}

describe('MCP End-to-End Tests', () => {
  const binPath = path.resolve(process.cwd(), 'dist', 'index.js');
  let child: ChildProcessWithoutNullStreams;

  beforeAll(async () => {
    // Start the MCP server
    child = spawn('node', [binPath], { 
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'test' }
    });

    // Wait for server to start
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, 5000);

      child.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('wordcount-mcp server started successfully')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  });

  afterAll(async () => {
    if (child && !child.killed) {
      child.kill('SIGTERM');
      
      // Wait for process to exit
      await new Promise<void>((resolve) => {
        child.on('close', () => resolve());
        setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL');
          }
          resolve();
        }, 2000);
      });
    }
  });

  describe('MCP Protocol Compliance', () => {
    it('should respond to initialize request', async () => {
      const result = await mcpCall(child, 'initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      });

      expect(result).toHaveProperty('protocolVersion');
      expect(result).toHaveProperty('capabilities');
      expect(result).toHaveProperty('serverInfo');
      expect(result.serverInfo.name).toBe('wordcount-mcp');
    });

    it('should list available tools', async () => {
      const result = await mcpCall(child, 'tools/list', {});

      expect(result).toHaveProperty('tools');
      expect(Array.isArray(result.tools)).toBe(true);
      expect(result.tools).toHaveLength(5);

      const toolNames = result.tools.map((tool: any) => tool.name);
      expect(toolNames).toContain('count_words');
      expect(toolNames).toContain('count_letters');
      expect(toolNames).toContain('count_characters');
      expect(toolNames).toContain('count_sentences');
      expect(toolNames).toContain('count_paragraphs');
    });
  });

  describe('Word Count Tools', () => {
    const testCases = [
      {
        tool: 'count_words',
        input: 'Hello world, how are you?',
        expected: '5',
        description: 'count words correctly'
      },
      {
        tool: 'count_letters',
        input: 'Hello world! 123',
        expected: '10',
        description: 'count letters correctly'
      },
      {
        tool: 'count_characters',
        input: 'Hello world!',
        expected: '12',
        description: 'count characters correctly'
      },
      {
        tool: 'count_sentences',
        input: 'Hello world! How are you? I am fine.',
        expected: '3',
        description: 'count sentences correctly'
      },
      {
        tool: 'count_paragraphs',
        input: 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.',
        expected: '3',
        description: 'count paragraphs correctly'
      }
    ];

    test.each(testCases)('$tool should $description', async ({ tool, input, expected }) => {
      const result = await mcpCall(child, 'tools/call', {
        name: tool,
        arguments: { text: input }
      });

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text', expected);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing parameters gracefully', async () => {
      try {
        await mcpCall(child, 'tools/call', {
          name: 'count_words',
          arguments: {}
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error instanceof Error ? error.message : String(error)).toContain('MCP Error');
      }
    });

    it('should handle invalid tool names gracefully', async () => {
      try {
        await mcpCall(child, 'tools/call', {
          name: 'invalid_tool',
          arguments: { text: 'test' }
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error instanceof Error ? error.message : String(error)).toContain('MCP Error');
      }
    });

    it('should handle null/undefined text input', async () => {
      try {
        await mcpCall(child, 'tools/call', {
          name: 'count_words',
          arguments: { text: null }
        });
        fail('Should have thrown an error for null text');
      } catch (error) {
        expect(error instanceof Error ? error.message : String(error)).toContain('Expected string, received null');
      }
    });
  });

  describe('Performance under Load', () => {
    it('should handle large text efficiently', async () => {
      const largeText = 'word '.repeat(1000); // 1000 words
      const startTime = Date.now();

      const result = await mcpCall(child, 'tools/call', {
        name: 'count_words',
        arguments: { text: largeText }
      });

      const elapsedTime = Date.now() - startTime;

      expect(result.content[0].text).toBe('1000');
      expect(elapsedTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = [
        mcpCall(child, 'tools/call', { name: 'count_words', arguments: { text: 'hello world' } }),
        mcpCall(child, 'tools/call', { name: 'count_letters', arguments: { text: 'hello world' } }),
        mcpCall(child, 'tools/call', { name: 'count_characters', arguments: { text: 'hello world' } })
      ];

      const results = await Promise.all(requests);

      expect(results[0].content[0].text).toBe('2');
      expect(results[1].content[0].text).toBe('10');
      expect(results[2].content[0].text).toBe('11');
    });
  });
});