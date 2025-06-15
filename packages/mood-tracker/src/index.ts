import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { logMood, getMoods } from './db';

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
      return {
        content: [{ type: 'text', text: `Mood "${params.mood}" logged successfully` }]
      };
    } catch (error: any) {
      console.error('Error logging mood:', error);
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
    try {
      const moods = await getMoods();
      
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
      console.error('Error retrieving moods:', error);
      return {
        content: [{ type: 'text', text: `Failed to retrieve moods: ${error?.message || 'Unknown error'}` }]
      };
    }
  }
);

export const server = MoodTrackerServer;

