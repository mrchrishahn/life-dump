import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import OpenAI from 'openai';

export const LogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  type: z.string(),
  data: z.record(z.unknown()),
  metadata: z.record(z.unknown()).optional(),
});

export type LogEntry = z.infer<typeof LogEntrySchema>;

export class LogServer {
  private server: Server;
  private openai: OpenAI;
  private logs: LogEntry[] = [];

  constructor(apiKey: string, baseURL: string) {
    this.openai = new OpenAI({ apiKey, baseURL });
    this.server = new Server(
      {
        name: 'life-dump-log-server',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {
            insertLog: {
              description: 'Insert a new log entry',
              parameters: LogEntrySchema
            },
            queryLogs: {
              description: 'Query logs with filters',
              parameters: z.object({
                filter: z.record(z.unknown()).optional()
              })
            }
          }
        }
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler('insertLog', async (request) => {
      const entry = request.params;
      this.logs.push(entry);
      
      // Process with AI
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ 
          role: 'user', 
          content: `Process this log entry: ${JSON.stringify(entry)}` 
        }],
      });

      return {
        success: true,
        aiResponse: response.choices[0]?.message?.content
      };
    });

    this.server.setRequestHandler('queryLogs', async (request) => {
      const { filter } = request.params;
      const results = this.logs.filter(entry => {
        if (!filter) return true;
        return Object.entries(filter).every(([key, value]) => {
          return entry[key as keyof LogEntry] === value;
        });
      });
      return { logs: results };
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
} 