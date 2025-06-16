import { appendFileSync } from 'fs';

/**
 * Log to a file instead of stdout to avoid interfering with MCP
 */
export function log(message: string, level: 'info' | 'error' = 'info', data?: any) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
    appendFileSync('mood-tracker.log', logEntry);
  } catch (e) {
    // Silent fail - we don't want logging errors to break the app
  }
} 