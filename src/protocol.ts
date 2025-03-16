/**
 * protocol.ts - Implements the DiceDB wire protocol
 *
 * This module handles encoding commands to send to the DiceDB server
 * and parsing the responses received back.
 */

/**
 * Encode a command to be sent to the DiceDB server
 *
 * @param args Array of command arguments
 * @returns Encoded command string ready to be sent over the socket
 */


export function encodeCommand(args: string[]): string {
  // Join arguments with spaces to create the command string
  // For example: ["SET", "key", "value"] becomes "SET key value"
  return args.join(' ') + '\r\n';
}

/**
 * Parse a response from the DiceDB server
 *
 * @param data Raw response data from the server
 * @returns Parsed response value and any remaining data
 */
export function parseResponse(data: string): { value: any; rest: string } {
  // Split the data by newline to handle multiple responses
  const lines = data.split('\r\n');

  // If there's no complete line, the response is incomplete
  if (lines.length <= 1) {
    throw new Error('Incomplete response');
  }

  // Get the first complete line
  const line = lines[0];

  // Calculate the rest of the data (for future processing)
  const rest = lines.slice(1).join('\r\n');

  // If the line doesn't start with "OK", it's an error
  if (!line.startsWith('OK ')) {
    throw new Error(`Protocol error: ${line}`);
  }

  // Extract the value part (everything after "OK ")
  const valueStr = line.substring(3);

  // Handle nil values
  if (valueStr === '(nil)') {
    return { value: null, rest };
  }

  // Return the parsed value
  return { value: valueStr, rest };
}
