import { test } from "node:test";
import assert from "node:assert/strict";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TaigaClient } from "../client.js";
import { registerEpicTools } from "./epics.js";

type Handler = (args: Record<string, unknown>) => Promise<unknown>;

function setup() {
  const handlers = new Map<string, Handler>();
  const server = {
    tool: (name: string, _desc: string, _schema: unknown, handler: Handler) => {
      handlers.set(name, handler);
    },
  } as unknown as McpServer;

  const posts: { path: string; body: unknown }[] = [];
  const client = {
    post: async (path: string, body?: unknown) => {
      posts.push({ path, body });
      return {};
    },
  } as unknown as TaigaClient;

  registerEpicTools(server, client);
  return { handlers, posts };
}

test("related_userstories_add sends the epic id in the body", async () => {
  const { handlers, posts } = setup();

  await handlers.get("taiga_epics_related_userstories_add")!({
    epic_id: 9,
    user_story: 33,
  });

  assert.deepEqual(posts, [
    {
      path: "/epics/9/related_userstories",
      body: { epic: 9, user_story: 33 },
    },
  ]);
});
