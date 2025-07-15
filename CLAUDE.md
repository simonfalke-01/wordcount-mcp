# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript-based MCP (Model Context Protocol) server for text analysis and word counting. The project implements a lightweight npm-published server that provides text analysis capabilities to AI assistants through the MCP protocol.

## Development Setup

Since this is a new project with no existing codebase, you'll need to implement the complete structure based on the PRD specifications.

### Required Project Structure
```
wordcount-mcp/
├── src/
│   ├── index.ts          # Main server entry point
│   ├── tools/
│   │   └── wordcount-tools.ts  # Tool implementations
│   └── utils/
│       └── text-analyzer.ts     # Core text analysis logic
├── dist/                 # Compiled JavaScript output
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
└── .gitignore
```

### Key Dependencies
- `@modelcontextprotocol/sdk`: "^1.15.1" - Core MCP framework
- `zod`: "^3.x.x" - Schema validation for input parameters

### Development Commands
Based on the PRD, the following npm scripts should be implemented:
- `npm run build`: Compile TypeScript and make executable
- `npm run dev`: Watch mode compilation
- `npm run test`: Run Jest tests
- `npm run prepublishOnly`: Build before publishing

## Technical Architecture

### MCP Tools to Implement
1. **count_words** - Count words by splitting on whitespace
2. **count_letters** - Count alphabetic characters (a-z, A-Z)
3. **count_characters** - Count total characters including spaces
4. **count_sentences** - Count sentences split by terminators (. ! ?)
5. **count_paragraphs** - Count paragraphs split by double line breaks

### Entry Point Requirements
- Must be executable with shebang `#!/usr/bin/env node`
- Uses stdio transport for MCP communication
- Implements proper error handling and input validation

### Package Configuration
- Type: "module" (ES modules)
- Main entry: "./dist/index.js"
- Binary: "wordcount-mcp"
- Node.js version: >=18.0.0

## License & Distribution

- Licensed under GPL-3.0 (see LICENSE file)
- Will be published to npm registry
- Runnable via `npx wordcount-mcp`