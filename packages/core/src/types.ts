import { z } from 'zod';

export const LogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  type: z.string(),
  data: z.record(z.unknown()),
  metadata: z.record(z.unknown()).optional(),
});

export type LogEntry = z.infer<typeof LogEntrySchema>;

export const MCPSchema = z.object({
  name: z.string(),
  description: z.string(),
  triggers: z.array(z.string()),
  actions: z.array(z.string()),
  conditions: z.array(z.string()),
});

export type MCP = z.infer<typeof MCPSchema>;

export interface Agent {
  processLogEntry(entry: LogEntry): Promise<void>;
  registerMCP(mcp: MCP): void;
  unregisterMCP(mcpName: string): void;
}

export interface LogDB {
  insert(entry: LogEntry): Promise<void>;
  query(filter: Partial<LogEntry>): Promise<LogEntry[]>;
  delete(id: string): Promise<void>;
} 