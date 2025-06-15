# Life Dump

A TypeScript monorepo for personal life management with AI-powered insights.

## Project Structure

- `packages/core`: Core package containing the log database and AI agent
- `packages/projects`: Project management application
- `packages/crm`: Contact and relationship management
- `packages/mood-tracking`: Mood and emotional state tracking
- `packages/food-tracking`: Food and nutrition tracking

## Setup

1. Install dependencies:
```bash
bun install
```

2. Build all packages:
```bash
bun run build
```

3. Start development mode:
```bash
bun run dev
```

## Development

Each package follows a similar structure:
- `src/types.ts`: Type definitions and MCP configuration
- `src/index.ts`: Main implementation
- `package.json`: Package configuration
- `tsconfig.json`: TypeScript configuration

### MCP (Machine Control Program)

Each app defines an MCP that specifies:
- Triggers: Events that activate the MCP
- Actions: Available actions the AI can take
- Conditions: Rules for when actions should be taken

The AI agent processes log entries and executes MCPs based on the defined rules.

## Linting and Formatting

This project uses Biome for linting and formatting:

```bash
# Check for issues
bun run lint

# Format code
bun run format
```

## Environment Variables

Create a `.env` file in the root directory with:

```
OPENAI_API_KEY=your_api_key_here
```

## License

Private - All rights reserved 