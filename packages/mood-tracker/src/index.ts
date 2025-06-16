import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { logMood, getMoods, initializeDatabase } from './db';
import { appendFileSync } from 'fs';

/**
 * Log to a file instead of stdout to avoid interfering with MCP
 */
function log(message: string, level: 'info' | 'error' = 'info', data?: any) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
    // Write to a log file instead of console
    appendFileSync('mood-tracker.log', logEntry);
  } catch (e) {
    // Silent fail - we don't want logging errors to break the app
  }
}

// Initialize the database when the server starts
initializeDatabase();

export const MoodTrackerServer = new McpServer({
  name: 'mood-tracker',
  version: '0.1.0',
  capabilities: {
    tools: {},
    resources: {}
  },
});

MoodTrackerServer.tool(
  'logMood',
  'Log a mood with optional metadata',
  {
    mood: z.string().min(1, "Mood cannot be empty"),
    metadata: z.string().optional()
  },
  async (params) => {
    try {
      await logMood(params.mood, params.metadata);
      log(`Mood "${params.mood}" logged successfully`);
      return {
        content: [{ type: 'text', text: `Mood "${params.mood}" logged successfully` }]
      };
    } catch (error: any) {
      log('Error logging mood', 'error', { error: error instanceof Error ? error.message : String(error) });
      return {
        content: [{ type: 'text', text: `Failed to log mood: ${error?.message || 'Unknown error'}` }]
      };
    }
  }
);

MoodTrackerServer.tool(
  'getMoods',
  'Retrieve all logged moods',
  {},
  async () => {
    log('Retrieving moods');
    try {
      const moods = await getMoods();
      log('Retrieved moods', 'info', { count: moods.length });
      
      // Convert moods to a formatted text representation
      const moodList = moods.map(mood => 
        `- ${mood.mood} (${mood.timestamp})${mood.metadata ? `: ${mood.metadata}` : ''}`
      ).join('\n');
      
      return {
        content: [
          { 
            type: 'text', 
            text: `Retrieved ${moods.length} mood entries:\n\n${moodList}` 
          }
        ]
      };
    } catch (error: any) {
      log('Error retrieving moods', 'error', { error: error instanceof Error ? error.message : String(error) });
      return {
        content: [{ type: 'text', text: `Failed to retrieve moods: ${error?.message || 'Unknown error'}` }]
      };
    }
  }
);

export const server = MoodTrackerServer;

