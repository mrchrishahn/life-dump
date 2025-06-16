import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Gets the absolute path to a file relative to the package root
 * @param relativePath - Path relative to the package root
 * @returns Absolute path to the file
 */
export function getPackagePath(relativePath: string): string {
  // Get the directory where the calling module is located
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  // Go up two levels: from src/utils to the package root
  const packageRoot = join(__dirname, '..', '..');
  // Join with the relative path
  return join(packageRoot, relativePath);
} 