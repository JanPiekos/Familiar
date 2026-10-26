import { cleanup, renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const api = vi.hoisted(() => ({ upload: vi.fn(), wait: vi.fn(), add: vi.fn(), remove: vi.fn() }));
vi.mock("@/api/media/media", () => ({ waitForMediaJob: api.wait }));
vi.mock("@/api/portfolio/posts/post", () => ({
 uploadPortfolioPostMedia: api.upload,
 addPortfolioPostToCatalog: api.add,
 removePortfolioPostFromCatalog: api.remove,
}));
import { useUploadPortfolioPostMedia, useAddPortfolioPostToCatalog, useRemovePortfolioPostFromCatalog } from "@/hooks/portfolio/use-portfolio";

function setup() {
 const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
 const keys = [
  ["portfolio", "artist", "artist-name", "catalog", "folder-1", "posts"],
  ["portfolio", "post", "post-1"],
  ["profile-content", "artist-name", "portfolio"],
 ];
 for (const key of keys) client.setQueryData(key, { content: [] });
 const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
 return { client, keys, wrapper };
}
afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe("portfolio refresh", () => {
 it("waits for image processing before completing the upload and refreshing grid and folder caches", async () => {
  const { client, keys, wrapper } = setup();
  let finish!: (value: unknown) => void;
  api.upload.mockResolvedValue({ jobId: "job-1", status: "PENDING" });
  api.wait.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const { result } = renderHook(() => useUploadPortfolioPostMedia(), { wrapper });
  act(() => result.current.mutate({ postId: "post-1", file: new File(["image"], "art.png") }));
  await waitFor(() => expect(api.wait).toHaveBeenCalledWith("job-1"));
  expect(result.current.isPending).toBe(true);
  for (const key of keys) expect(client.getQueryState(key)?.isInvalidated).toBe(false);
  await act(async () => { finish({ status: "COMPLETED" }); });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  for (const key of keys) expect(client.getQueryState(key)?.isInvalidated).toBe(true);
  client.clear();
 });
 for (const [action, useMutation, mock] of [
  ["adding", useAddPortfolioPostToCatalog, api.add],
  ["removing", useRemovePortfolioPostFromCatalog, api.remove],
 ] as const) {
  it(`refreshes the actual username-scoped folder and profile caches after ${action} a post`, async () => {
   const { client, keys, wrapper } = setup();
   mock.mockResolvedValue(undefined);
   const { result } = renderHook(() => useMutation(), { wrapper });
   await act(async () => { await result.current.mutateAsync({ postId: "post-1", catalogId: "folder-1" }); });
   for (const key of keys) expect(client.getQueryState(key)?.isInvalidated).toBe(true);
   client.clear();
  });
 }
});
