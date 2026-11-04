#!/usr/bin/env node

/**
 * Model Context Protocol (MCP) Standard Input/Output (stdio) Bridge.
 * Allows AI clients like Claude Desktop and Cursor to connect directly to the Integration Platform.
 *
 * Usage:
 * INTEGRATION_API_KEY=ip_live_... INTEGRATION_USER_ID=user_123 node mcp-server.js
 */

const readline = require('readline');

const API_KEY = process.env.INTEGRATION_API_KEY;
const USER_ID = process.env.INTEGRATION_USER_ID || 'default_user';
const BASE_URL = (process.env.INTEGRATION_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '') + '/v1/mcp';

if (!API_KEY) {
  process.stderr.write('[MCP Bridge Error] Missing INTEGRATION_API_KEY environment variable.\n');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  try {
    const jsonReq = JSON.parse(trimmed);

    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'X-API-Key': API_KEY,
        'X-Project-User-Id': USER_ID,
      },
      body: JSON.stringify(jsonReq),
    });

    const jsonRes = await res.json();
    process.stdout.write(JSON.stringify(jsonRes) + '\n');
  } catch (err) {
    const errorResponse = {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: 'MCP Bridge request error: ' + (err.message || String(err)),
      },
    };
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
  }
});
