// Tests for the chat session manager, using a fake backend (no network).
// Run with: npm test
import { describe, expect, it, vi } from "vitest";
import type { ChatSessionInfo } from "@/types";
import { ApiError } from "./api";
import { createChatSessionManager, isChatSessionEnded, type ChatSessionClient } from "./chat-session";

function sessionInfo(id: string): ChatSessionInfo {
  return { sessionId: id, createdAt: "", expiresAt: "", authenticated: false, csrfToken: `csrf-${id}` };
}

const expired = () => new ApiError(401, "CHAT_SESSION_EXPIRED", "Your chat session has expired.");
const noSession = () => new ApiError(401, "CHAT_SESSION_REQUIRED", "Please start a chat session first.");
const reply = { reply: "ok", category: "faq" as const, suggestions: [] };

/** A fake backend: starts with no session; createSession hands out s1, s2, ... */
function fakeClient(overrides: Partial<ChatSessionClient> = {}) {
  let count = 0;
  const client = {
    currentSession: vi.fn<ChatSessionClient["currentSession"]>(async () => {
      throw noSession();
    }),
    createSession: vi.fn<ChatSessionClient["createSession"]>(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5)); // like a real network call
      count += 1;
      return sessionInfo(`s${count}`);
    }),
    endSession: vi.fn<ChatSessionClient["endSession"]>(async () => null),
    send: vi.fn<ChatSessionClient["send"]>(async () => reply),
  };
  if (overrides.currentSession) client.currentSession.mockImplementation(overrides.currentSession);
  if (overrides.send) client.send.mockImplementation(overrides.send);
  return client;
}

describe("chat session manager", () => {
  it("creates a session when the browser has none", async () => {
    const client = fakeClient();
    const manager = createChatSessionManager(client);
    expect((await manager.ensure()).sessionId).toBe("s1");
    expect(client.createSession).toHaveBeenCalledTimes(1);
  });

  it("reuses an existing session instead of creating one", async () => {
    const client = fakeClient({ currentSession: async () => sessionInfo("existing") });
    const manager = createChatSessionManager(client);
    expect((await manager.ensure()).sessionId).toBe("existing");
    expect(client.createSession).not.toHaveBeenCalled();
  });

  it("creates only ONE session when started several times at once", async () => {
    const client = fakeClient();
    const manager = createChatSessionManager(client);
    const results = await Promise.all([manager.ensure(), manager.ensure(), manager.ensure(), manager.send("Hi")]);
    expect(client.createSession).toHaveBeenCalledTimes(1);
    expect(results.slice(0, 3).map((info) => (info as ChatSessionInfo).sessionId)).toEqual(["s1", "s1", "s1"]);
    expect(client.send).toHaveBeenCalledWith("Hi", "csrf-s1");
  });

  it("reports an expired session, then recovers with a new conversation", async () => {
    const client = fakeClient();
    const manager = createChatSessionManager(client);
    await manager.ensure();

    client.send.mockRejectedValueOnce(expired());
    const error = await manager.send("Hello").catch((caught: unknown) => caught);
    expect(isChatSessionEnded(error)).toBe(true);

    // "Start a new conversation": a fresh session is created and used.
    expect((await manager.restart()).sessionId).toBe("s2");
    await manager.send("Hello again");
    expect(client.send).toHaveBeenLastCalledWith("Hello again", "csrf-s2");
  });

  it("ends the old session when restarting an active chat", async () => {
    const client = fakeClient();
    const manager = createChatSessionManager(client);
    await manager.ensure();
    await manager.restart();
    expect(client.endSession).toHaveBeenCalledWith("csrf-s1");
  });

  it("re-reads an out-of-date security token once and retries", async () => {
    const client = fakeClient({ currentSession: async () => sessionInfo("s1-rotated") });
    const manager = createChatSessionManager(client);
    await manager.ensure();

    client.send.mockRejectedValueOnce(new ApiError(403, "CHAT_CSRF_INVALID", "stale"));
    await expect(manager.send("Hello")).resolves.toEqual(reply);
    expect(client.send).toHaveBeenLastCalledWith("Hello", "csrf-s1-rotated");
  });

  it("passes other errors through unchanged", async () => {
    const client = fakeClient({ send: async () => Promise.reject(new ApiError(429, "RATE_LIMITED", "Slow down")) });
    const manager = createChatSessionManager(client);
    await expect(manager.send("Hello")).rejects.toMatchObject({ code: "RATE_LIMITED" });
    expect(isChatSessionEnded(new ApiError(429, "RATE_LIMITED", ""))).toBe(false);
  });
});
