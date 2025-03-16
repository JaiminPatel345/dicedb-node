// Export the main client

// Export types for users of the SDK
import {DiceClient} from "./client";

export * from './types/index';

// Re-export useful utilities that users might need

// Create a convenience function for creating a new client instance
export function createClient(options: { host?: string, port?: number } = {}) {
  const host = options.host || 'localhost';
  const port = options.port || 7379;

  return new DiceClient({ host, port });
}

// Default export for CommonJS compatibility
export default {
  createClient
};