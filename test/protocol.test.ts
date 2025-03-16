import {encodeCommand, parseResponse} from "../src/protocol";


describe('DiceDB Protocol', () => {
  describe('encodeCommand', () => {
    it('should encode a simple command', () => {
      const result = encodeCommand(['PING']);
      expect(result).toBe('PING\r\n');
    });

    it('should encode a command with arguments', () => {
      const result = encodeCommand(['SET', 'key', 'value']);
      expect(result).toBe('SET key value\r\n');
    });

    it('should handle empty commands', () => {
      const result = encodeCommand([]);
      expect(result).toBe('\r\n');
    });
  });

  describe('parseResponse', () => {
    it('should parse a simple response', () => {
      const result = parseResponse('OK PONG\r\n');
      expect(result.value).toBe('PONG');
      expect(result.rest).toBe('');
    });

    it('should parse a nil response', () => {
      const result = parseResponse('OK (nil)\r\n');
      expect(result.value).toBe(null);
      expect(result.rest).toBe('');
    });

    it('should handle multiple responses', () => {
      const result = parseResponse('OK value1\r\nOK value2\r\n');
      expect(result.value).toBe('value1');
      expect(result.rest).toBe('OK value2\r\n');
    });

    it('should throw on incomplete response', () => {
      expect(() => {
        parseResponse('OK incomplete');
      }).toThrow('Incomplete response');
    });

    it('should throw on protocol error', () => {
      expect(() => {
        parseResponse('ERROR something went wrong\r\n');
      }).toThrow('Protocol error');
    });
  });

  describe('integrated command-response flow', () => {
    it('should handle a full command-response cycle', () => {
      // Encode a command
      const command = encodeCommand(['SET', 'mykey', 'myvalue']);
      expect(command).toBe('SET mykey myvalue\r\n');

      // Simulate server response
      const response = 'OK OK\r\n';

      // Parse the response
      const result = parseResponse(response);
      expect(result.value).toBe('OK');
    });

    it('should handle a GET command that returns a value', () => {
      // Encode a command
      const command = encodeCommand(['GET', 'mykey']);
      expect(command).toBe('GET mykey\r\n');

      // Simulate server response
      const response = 'OK myvalue\r\n';

      // Parse the response
      const result = parseResponse(response);
      expect(result.value).toBe('myvalue');
    });

    it('should handle a GET command that returns nil', () => {
      // Encode a command
      const command = encodeCommand(['GET', 'nonexistent']);
      expect(command).toBe('GET nonexistent\r\n');

      // Simulate server response
      const response = 'OK (nil)\r\n';

      // Parse the response
      const result = parseResponse(response);
      expect(result.value).toBe(null);
    });
  });
});