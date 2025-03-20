# dicedb-node

[![npm version](https://badge.fury.io/js/dicedb-node.svg)](https://badge.fury.io/js/dicedb-node)
[![Under Development](https://img.shields.io/badge/status-beta-orange)](https://github.com/jaiminpatel345/dicedb-node)

Node.js SDK for DiceDB - An unofficial Node.js client library for [DiceDB](https://github.com/dicedb/dice), the fast,
reactive, in-memory database optimized for modern hardware.

### ⚠️ This SDK is in under construction

### 📦 Installation

```bash
  npm install dicedb-node
```

**OR**

```bash
  yarn add dicedb-node
```

### ✅ Supported Commands

| Command | Method             | Example                          |
|---------|--------------------|----------------------------------|
| PING    | `.ping() `         | `await client.ping() `           |
| SET     | `.set(key, value)` | `await client.set('foo', 'bar')` |
| GET     | `.get(key)`        | `await client.get('foo')`        |

