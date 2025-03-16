var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Socket } from 'net';
import { EventEmitter } from 'events';
import { parseResponse, encodeCommand } from './protocol.js';
export class DiceClient extends EventEmitter {
    constructor(options = {}) {
        super();
        this.socket = null;
        this.connected = false;
        this.commandQueue = [];
        this.buffer = '';
        this.host = options.host || 'localhost';
        this.port = options.port || 7379;
    }
    /**
     * Connect to the DiceDB server
     */
    connect() {
        return new Promise((resolve, reject) => {
            this.socket = new Socket();
            this.socket.on('connect', () => {
                this.connected = true;
                this.emit('connect');
                resolve();
            });
            this.socket.on('data', (data) => {
                this.buffer += data.toString();
                console.log("data", data);
                this.processBuffer();
            });
            this.socket.on('error', (err) => {
                this.emit('error', err);
                reject(err);
            });
            this.socket.on('close', () => {
                this.connected = false;
                this.socket = null;
                this.emit('close');
            });
            this.socket.connect(this.port, this.host);
        });
    }
    /**
     * Close the connection to the DiceDB server
     */
    quit() {
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
    processBuffer() {
        if (this.commandQueue.length === 0 || this.buffer.length === 0) {
            return;
        }
        try {
            const { value, rest } = parseResponse(this.buffer);
            this.buffer = rest;
            const command = this.commandQueue.shift();
            if (command) {
                command.resolve(value);
            }
            // Continue processing if there might be more complete responses
            if (this.buffer.length > 0) {
                this.processBuffer();
            }
        }
        catch (err) {
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
    execute(command) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.socket || !this.connected) {
                yield this.connect();
            }
            return new Promise((resolve, reject) => {
                const encodedCommand = encodeCommand(command);
                this.commandQueue.push({
                    command,
                    resolve: resolve,
                    reject
                });
                this.socket.write(encodedCommand);
            });
        });
    }
    /**
     * Ping the server
     */
    ping(message) {
        return this.execute([`PING ${message}`]);
    }
    /**
     * Set a key to a value
     */
    set(key, value) {
        return this.execute(['SET', key, value]);
    }
    /**
     * Get the value of a key
     */
    get(key) {
        return this.execute(['GET', key]);
    }
}
