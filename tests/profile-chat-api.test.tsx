import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/supabase", () => ({ getAccessToken: async () => "test-token" }));
import { postConversationDirect } from "@/api/chat/chat";
import { ApiFetchError } from "@/lib/fetch";

const recipient = "081ec7d7-ddee-4fdc-8ba4-63b9b83c87bb";
const direct = { id: "conversation-1", otherParticipant: { userId: recipient }, commissionRequestId: null };
const fetchMock = vi.fn<typeof fetch>();
function json(body: unknown, status = 200) {
 return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
function page(content: unknown[] = [], number = 0, totalPages = 1) {
 return json({ content, number, totalPages, last: number + 1 >= totalPages });
}
beforeEach(() => {
 fetchMock.mockReset();
 vi.stubGlobal("fetch", fetchMock);
 vi.stubEnv("VITE_API_URL", "https://api.familiar.art/api/v1");
 vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("direct conversation API client", () => {
 it("opens an existing direct conversation without calling the failing create endpoint", async () => {
  fetchMock.mockResolvedValueOnce(page([direct]));
  await expect(postConversationDirect(recipient)).resolves.toEqual(direct);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0][0]).toBe("https://api.familiar.art/api/v1/chat/conversations?page=0&size=100");
 });
 it("checks later pages and never substitutes a commission chat or another recipient", async () => {
  fetchMock.mockResolvedValueOnce(page([{ ...direct, commissionRequestId: "request-1" },
   { ...direct, otherParticipant: { userId: "00000000-0000-0000-0000-000000000000" } }], 0, 2))
   .mockResolvedValueOnce(page([direct], 1, 2));
  await expect(postConversationDirect(recipient)).resolves.toEqual(direct);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[1][0]).toContain("page=1");
 });
 it("sends the documented URL, UUID body, JSON headers and bearer token when creation is needed", async () => {
  fetchMock.mockResolvedValueOnce(page()).mockResolvedValueOnce(json(direct));
  await expect(postConversationDirect(` ${recipient.toUpperCase()} `)).resolves.toEqual(direct);
  const [url, init] = fetchMock.mock.calls[1];
  expect(url).toBe("https://api.familiar.art/api/v1/chat/conversations/direct");
  expect(init?.method).toBe("POST");
  expect(JSON.parse(init?.body as string)).toEqual({ otherUserId: recipient });
  const headers = new Headers(init?.headers);
  expect(headers.get("Authorization")).toBe("Bearer test-token");
  expect(headers.get("Content-Type")).toBe("application/json");
  expect(headers.get("Accept")).toBe("application/json");
 });
 it("recovers a conversation committed before a 500 response without repeating the POST", async () => {
  fetchMock.mockResolvedValueOnce(page()).mockResolvedValueOnce(json({ error: "Internal Server Error" }, 500))
   .mockResolvedValueOnce(page([direct]));
  await expect(postConversationDirect(recipient)).resolves.toEqual(direct);
  expect(fetchMock.mock.calls.filter(([, init]) => init?.method === "POST")).toHaveLength(1);
 });
 it("preserves the actual 500 when no conversation was created", async () => {
  fetchMock.mockResolvedValueOnce(page()).mockResolvedValueOnce(json({ error: "Internal Server Error" }, 500))
   .mockResolvedValueOnce(page());
  await expect(postConversationDirect(recipient)).rejects.toMatchObject({ status: 500, body: '{"error":"Internal Server Error"}' });
  expect(fetchMock).toHaveBeenCalledTimes(3);
 });
 it("preserves the original server error when the recovery lookup also fails", async () => {
  fetchMock.mockResolvedValueOnce(page()).mockResolvedValueOnce(json({ error: "Original" }, 500))
   .mockRejectedValueOnce(new TypeError("Network unavailable"));
  await expect(postConversationDirect(recipient)).rejects.toMatchObject({ status: 500, body: '{"error":"Original"}' });
 });
 it("still tries normal creation if the initial list endpoint is unavailable", async () => {
  fetchMock.mockResolvedValueOnce(json({}, 503)).mockResolvedValueOnce(json(direct));
  await expect(postConversationDirect(recipient)).resolves.toEqual(direct);
 });
 it("stops on an authentication failure", async () => {
  fetchMock.mockResolvedValueOnce(json({}, 401));
  await expect(postConversationDirect(recipient)).rejects.toBeInstanceOf(ApiFetchError);
  expect(fetchMock).toHaveBeenCalledTimes(1);
 });
 it("does not retry or recover a rejected creation request", async () => {
  fetchMock.mockResolvedValueOnce(page()).mockResolvedValueOnce(json({}, 403));
  await expect(postConversationDirect(recipient)).rejects.toMatchObject({ status: 403 });
  expect(fetchMock).toHaveBeenCalledTimes(2);
 });
 it("rejects a missing or malformed recipient before making requests", async () => {
  await expect(postConversationDirect("")).rejects.toThrow("valid recipient");
  await expect(postConversationDirect("username")).rejects.toThrow("valid recipient");
  expect(fetchMock).not.toHaveBeenCalled();
 });
});
