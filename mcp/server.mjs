#!/usr/bin/env node
// zoneshift MCP server — exposes the live https://tz.wrapper-agency.com API as
// MCP tools so agents can call it natively. Thin wrapper over /api/v1.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = process.env.ZONESHIFT_BASE || "https://tz.wrapper-agency.com";
const server = new McpServer({ name: 'zoneshift', version: "1.0.0" });

server.registerTool(
  'convert_timezone',
  {
    description: 'Convert a time between IANA timezones (DST-correct), or an epoch to a zone.',
    inputSchema: {
      from: z.string().describe('Source IANA zone, e.g. America/New_York'),
      to: z.string().describe('Target IANA zone, e.g. Asia/Tokyo'),
      time: z.string().optional().describe('Local time to convert (ISO or HH:MM); omit for now'),
      epoch: z.string().optional().describe('Unix epoch seconds to convert instead of a time')
    },
  },
  async (args) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(args)) {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    }
    const r = await fetch(`${BASE}/api/v1/tz?${qs.toString()}`);
    return { content: [{ type: "text", text: await r.text() }] };
  }
);

await server.connect(new StdioServerTransport());
