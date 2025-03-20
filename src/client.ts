import {Socket} from 'net';
import {EventEmitter} from 'events';
import {encodeCommand, parseResponse} from './protocol.js';
import {ClientOptions} from "./types";
import {uuid} from "./utils/uuid";
import * as net from "node:net";

export class DiceClient extends EventEmitter {
  private socket: net.Socket;
  private host: string;
  private port: number;
  private connected: boolean = false;
  private commandQueue: Array<{
    command: string[],
    resolve: (value: any) => void,
    reject: (reason: any) => void
  }> = [];
  private buffer: string = '';

  constructor(options: ClientOptions = {}) {
    super();
    this.host = options.host || 'localhost';
    this.port = options.port || 7379;
    this.socket = new net.Socket()
    this.socket.on('data', data => {
      console.log("Data cames :",data)
    })

    this.socket.on('close', () => {
      console.log("Closing socket")
    })

    this.socket.on('error', err => {
      console.log("Error cames :",err)
    })

  }

  /**
   * Connect to the DiceDB server
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new Socket();
      this.socket.connect(this.port, this.host);


      this.socket.once('connect', () => {
        this.connected = true;
        const handshake = encodeCommand(
            ['HANDSHAKE',
              uuid(),
              'command',]
        )
        this.emit('connect');

        this.socket.write(handshake)

        this.socket.on('data', (data) => {
          this.buffer += data.toString();
          console.log("data", data);
          this.processBuffer();
        });
      });


      this.socket.on('error', (err) => {
        this.emit('error', err);
        reject(err);
      });

      this.socket.on('close', () => {
        this.connected = false;
        this.emit('close');
      });

    });
  }

  /**
   * Close the connection to the DiceDB server
   */
  public quit(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.socket || !this.connected) {
        resolve();
        return;
      }

      this.socket.once('close', () => {
        resolve();
      });

      this.socket.end();
    });
  }

  /**
   * Process the response buffer
   */
  private processBuffer(): void {
    if (this.commandQueue.length === 0 || this.buffer.length === 0) {
      return;
    }

    try {
      const {value, rest} = parseResponse(this.buffer);
      this.buffer = rest;

      const command = this.commandQueue.shift();
      if (command) {
        command.resolve(value);
      }

      // Continue processing if there might be more complete responses
      if (this.buffer.length > 0) {
        this.processBuffer();
      }
    } catch (err: any) {
      // Not enough data for a complete response
      if (err.message === 'Incomplete response') {
        return;
      }

      // Protocol error
      const command = this.commandQueue.shift();
      if (command) {
        command.reject(err);
      }
    }
  }

  /**
   * Execute a command on the DiceDB server
   */
  public async execute<T = any>(command: string[]): Promise<T> {
    if (!this.socket || !this.connected) {
      await this.connect();
    }

    return new Promise<T>((resolve, reject) => {
      const encodedCommand = encodeCommand(command);

      this.commandQueue.push({
        command,
        resolve: resolve as any,
        reject
      });

      this.socket!.write(encodedCommand);
    });
  }

  /**
   * Ping the server
   */
  public ping(message: string): Promise<string> {
    return this.execute([`PING ${message}`]);
  }

  /**
   * Set a key to a value
   */
  public set(key: string, value: string): Promise<string> {
    return this.execute(['SET', key, value]);
  }

  /**
   * Get the value of a key
   */
  public get(key: string): Promise<string | null> {
    return this.execute(['GET', key]);
  }

}