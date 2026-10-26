import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { saveProfileSettings } from "@/hooks/user/save-profile-settings";
import { useUpdateProfile } from "@/hooks/user/use-update-profile";

vi.mock("@/lib/supabase", () => ({ getAccessToken: async () => "test-token" }));
const initialValues = { username: "hasira", display_name: "Hasira", bio: "Old bio", avatar_url: "", cover_url: "", accent_color: "" };
const savedUser = { userId: "user-1", username: "hasira", displayName: "Hasira", bio: "New bio", roles: [], socials: [], createdAt: "2026-01-01" };
const fetchMock = vi.fn();
function json(body: unknown, status = 200) {
 return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
beforeEach(() => {
 vi.stubGlobal("fetch", fetchMock);
 vi.stubEnv("VITE_API_URL", "https://example.test/api");
 fetchMock.mockReset();
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("settings profile persistence", () => {
 it.each(["https://example.test", "https://example.test/api", "https://example.test/api/v1"])("sends authenticated PATCH at the v1 path with base %s", async (base) => {
  vi.stubEnv("VITE_API_URL", base);
  fetchMock.mockResolvedValue(json(savedUser));
  await saveProfileSettings({ initialValues, values: { ...initialValues, bio: " New bio " } });
  const [url, request] = fetchMock.mock.calls[0];
  expect(url).toBe("https://example.test/api/v1/users/me");
  expect(request.method).toBe("PATCH");
  expect(request.headers.get("Authorization")).toBe("Bearer test-token");
  expect(JSON.parse(request.body)).toEqual({ bio: "New bio" });
 });
 it("does not send an empty PATCH when nothing changed", async () => {
  expect(await saveProfileSettings({ initialValues, values: { ...initialValues } })).toBeNull();
  expect(fetchMock).not.toHaveBeenCalled();
 });
 it("does not accept a 200 response that still contains the old bio", async () => {
  fetchMock.mockResolvedValue(json({ ...savedUser, bio: initialValues.bio }));
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  client.setQueryData(["users", "me"], { bio: "Old bio" });
  const { result } = renderHook(useUpdateProfile, { wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
  await act(async () => { await expect(result.current.mutateAsync({ initialValues, values: { ...initialValues, bio: "New bio" } })).rejects.toThrow("different bio"); });
  expect(client.getQueryData(["users", "me"])).toEqual({ bio: "Old bio" });
  client.clear();
 });

 it("clears bio using an empty string and omits unchanged media", async () => {
  fetchMock.mockResolvedValue(json({ ...savedUser, bio: "" }));
  await saveProfileSettings({ initialValues, values: { ...initialValues, bio: "" } });
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ bio: "" });
 });
 it("uploads and polls an image, then PATCHes the multimedia ID rather than the job ID or preview", async () => {
  vi.useFakeTimers();
  fetchMock.mockResolvedValueOnce(json([{ jobId: "job-1", status: "pending" }], 202))
   .mockResolvedValueOnce(json({ jobId: "job-1", status: "completed", fullSizeId: "image-1" }))
   .mockResolvedValueOnce(json(savedUser));
  const pending = saveProfileSettings({ initialValues, values: { ...initialValues, avatar_url: "data:image/png;base64,YQ==" } });
  await vi.advanceTimersByTimeAsync(750);
  await pending;
  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
   "https://example.test/api/v1/media/upload", "https://example.test/api/v1/media/jobs/job-1", "https://example.test/api/v1/users/me",
  ]);
  expect(fetchMock.mock.calls[0][1].body.get("files")).toBeInstanceOf(Blob);
  expect(fetchMock.mock.calls[0][1].headers.has("Content-Type")).toBe(false);
  expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({ avatarMultimediaId: "image-1" });
 });
 it("stops immediately on media processing failure without PATCHing", async () => {
  fetchMock.mockResolvedValueOnce(json([{ jobId: "job-1", status: "failed", errorMessage: "Invalid image" }], 202));
  await expect(saveProfileSettings({ initialValues, values: { ...initialValues, cover_url: "data:image/png;base64,YQ==" } })).rejects.toThrow("Invalid image");
  expect(fetchMock).toHaveBeenCalledTimes(1);
 });
 it("rejects invalid form data before making requests", async () => {
  await expect(saveProfileSettings({ initialValues, values: { ...initialValues, bio: "x".repeat(151) } })).rejects.toThrow();
  expect(fetchMock).not.toHaveBeenCalled();
 });
 it("rejects unsupported name changes before any partial save", async () => {
  await expect(saveProfileSettings({ initialValues, values: { ...initialValues, display_name: "Other", bio: "New" } })).rejects.toThrow("not supported");
  expect(fetchMock).not.toHaveBeenCalled();
 });
 it("never sends null to pretend that a saved avatar was deleted", async () => {
  await expect(saveProfileSettings({ initialValues: { ...initialValues, avatar_url: "/old.png" }, values: initialValues })).rejects.toThrow("Removing an existing avatar");
  expect(fetchMock).not.toHaveBeenCalled();
 });
 it("updates own, ID, and public username caches after a successful save", async () => {
  fetchMock.mockResolvedValue(json(savedUser));
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const { result } = renderHook(useUpdateProfile, { wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
  await act(async () => { await result.current.mutateAsync({ initialValues, values: { ...initialValues, bio: "New bio" } }); });
  for (const key of [["users", "me"], ["users", "id", "user-1"], ["users", "username", "hasira"]]) {
   expect(client.getQueryData(key)).toMatchObject({ bio: "New bio" });
  }
  client.clear();
 });
 it("preserves cached profile on PATCH failure and rejects the mutation", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  fetchMock.mockResolvedValue(json({ message: "Not allowed" }, 403));
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  client.setQueryData(["users", "me"], { bio: "Old bio" });
  const { result } = renderHook(useUpdateProfile, { wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
  await act(async () => { await expect(result.current.mutateAsync({ initialValues, values: { ...initialValues, bio: "New bio" } })).rejects.toThrow("403"); });
  expect(client.getQueryData(["users", "me"])).toEqual({ bio: "Old bio" });
  client.clear();
 });
});
