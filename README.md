# wordcount-mcp

[![npm version](https://img.shields.io/npm/v/wordcount-mcp.svg)](https://www.npmjs.com/package/wordcount-mcp)
[![License](https://img.shields.io/npm/l/wordcount-mcp)](./LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

A TypeScript-based MCP (Model Context Protocol) server for text analysis and word counting. This lightweight server provides comprehensive text analysis capabilities to AI assistants through the MCP protocol.

## Features

- **Word counting** - Count words by splitting on whitespace
- **Letter counting** - Count alphabetic characters (a-z, A-Z)
- **Character counting** - Count total characters including spaces
- **Sentence counting** - Count sentences split by terminators (. ! ?)
- **Paragraph counting** - Count paragraphs split by double line breaks

## Installation

### Global Installation (Recommended)

```bash
npm install -g wordcount-mcp
```

### Local Installation

```bash
npm install wordcount-mcp
```

## Usage

### Command Line

To start the MCP server:

```bash
npx wordcount-mcp
```

The server will start and listen for MCP connections via stdio transport.

### Claude Desktop Configuration

To use this server with Claude Desktop, add the following configuration to your `claude_desktop_config.json` file:

**macOS/Linux:**
```json
{
  "mcpServers": {
    "wordcount-mcp": {
      "command": "npx",
      "args": ["wordcount-mcp"]
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "wordcount-mcp": {
      "command": "npx.cmd",
      "args": ["wordcount-mcp"]
    }
  }
}
```

If you installed globally, you can also use:
```json
{
  "mcpServers": {
    "wordcount-mcp": {
      "command": "wordcount-mcp"
    }
  }
}
```

## API Documentation

This MCP server provides the following tools:

### count_words

Count words in text by splitting on whitespace.

**Input:**
- `text` (string): The text to analyze

**Output:**
- Returns the number of words as a string

**Example:**
```
Input: "Hello world, how are you?"
Output: "5"
```

### count_letters

Count alphabetic characters (a-z, A-Z) in text.

**Input:**
- `text` (string): The text to analyze

**Output:**
- Returns the number of alphabetic characters as a string

**Example:**
```
Input: "Hello world! 123"
Output: "10"
```

### count_characters

Count total characters including spaces and punctuation.

**Input:**
- `text` (string): The text to analyze

**Output:**
- Returns the total character count as a string

**Example:**
```
Input: "Hello world!"
Output: "12"
```

### count_sentences

Count sentences by splitting on sentence terminators (. ! ?).

**Input:**
- `text` (string): The text to analyze

**Output:**
- Returns the number of sentences as a string

**Example:**
```
Input: "Hello world! How are you? I am fine."
Output: "3"
```

### count_paragraphs

Count paragraphs by splitting on double line breaks.

**Input:**
- `text` (string): The text to analyze

**Output:**
- Returns the number of paragraphs as a string

**Example:**
```
Input: "First paragraph.\n\nSecond paragraph.\n\nThird paragraph."
Output: "3"
```

## Examples

Here are some example interactions with the MCP server:

### Basic Word Counting
```
Tool: count_words
Input: { "text": "The quick brown fox jumps over the lazy dog" }
Output: "9"
```

### Text Analysis
```
Tool: count_characters
Input: { "text": "Hello, world!" }
Output: "13"

Tool: count_letters
Input: { "text": "Hello, world!" }
Output: "10"
```

### Document Analysis
```
Tool: count_sentences
Input: { "text": "This is sentence one. This is sentence two! Is this sentence three?" }
Output: "3"

Tool: count_paragraphs
Input: { "text": "Paragraph one.\n\nParagraph two.\n\nParagraph three." }
Output: "3"
```

## Development

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## Architecture

The server is built with:

- **TypeScript** for type safety
- **@modelcontextprotocol/sdk** for MCP protocol implementation
- **Zod** for input validation
- **Jest** for testing

The main components are:

- `src/index.ts` - Main server entry point
- `src/tools/wordcount-tools.ts` - Tool implementations
- `src/analyzer/TextAnalyzer.ts` - Core text analysis logic

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Repository

GitHub: https://github.com/simonfalke-01/wordcount-mcp

## Support

For issues and questions, please visit: https://github.com/simonfalke-01/wordcount-mcp/issues