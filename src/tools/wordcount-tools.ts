import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TextAnalyzer } from "../analyzer/TextAnalyzer.js";

// Schema for text input validation
const TextInputSchema = {
  text: z.string().describe("The text to analyze"),
};

/**
 * Helper function to create a tool handler with consistent error handling
 * @param analyzer The TextAnalyzer instance
 * @param methodName The analyzer method to call
 * @param resultLabel The label for the result (e.g., "Word count")
 * @returns Tool handler function
 */
function createToolHandler(
  analyzer: TextAnalyzer,
  methodName: keyof TextAnalyzer,
  resultLabel: string
) {
  return async (args: { text: string }) => {
    try {
      const { text } = args;
      const method = analyzer[methodName] as (text: string) => number;
      const result = method.call(analyzer, text);
      
      return {
        content: [{
          type: "text" as const,
          text: result.toString(),
        }],
      };
    } catch (error) {
      console.error(`Error in ${String(methodName)}:`, error);
      throw error;
    }
  };
}

/**
 * Registers all word count tools with the MCP server
 * @param server The MCP server instance
 */
export function registerWordCountTools(server: McpServer) {
  const analyzer = new TextAnalyzer();

  // Register count_words tool
  server.registerTool(
    "count_words",
    {
      description: "Count words by splitting on whitespace",
      inputSchema: TextInputSchema,
    },
    createToolHandler(analyzer, "countWords", "Word count")
  );

  // Register count_letters tool
  server.registerTool(
    "count_letters",
    {
      description: "Count alphabetic characters (a-z, A-Z)",
      inputSchema: TextInputSchema,
    },
    createToolHandler(analyzer, "countLetters", "Letter count")
  );

  // Register count_characters tool
  server.registerTool(
    "count_characters",
    {
      description: "Count total characters including spaces",
      inputSchema: TextInputSchema,
    },
    createToolHandler(analyzer, "countCharacters", "Character count")
  );

  // Register count_sentences tool
  server.registerTool(
    "count_sentences",
    {
      description: "Count sentences split by terminators (. ! ?)",
      inputSchema: TextInputSchema,
    },
    createToolHandler(analyzer, "countSentences", "Sentence count")
  );

  // Register count_paragraphs tool
  server.registerTool(
    "count_paragraphs",
    {
      description: "Count paragraphs split by double line breaks",
      inputSchema: TextInputSchema,
    },
    createToolHandler(analyzer, "countParagraphs", "Paragraph count")
  );
}