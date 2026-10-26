import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import { QueryClient, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { attachRouterServerSsrUtils } from "@tanstack/react-router/ssr/server";
import { getRouter } from "../src/router";

// Keep app routes out of this focused test; the real router factory,
// SSR integration, QueryClient provider and streaming code are exercised.
vi.mock("../src/routeTree.gen", async () => {
 const { createRootRoute } = await import("@tanstack/react-router");
 return { routeTree: createRootRoute() };
});

const clients: QueryClient[] = [];
afterEach(() => { clients.forEach((client) => client.clear()); clients.length = 0; });

function setup() {
 const router = getRouter();
 const queryClient = router.options.context.queryClient;
 clients.push(queryClient);
 attachRouterServerSsrUtils({ router, manifest: undefined });
 return { router, queryClient };
}

describe("Router Query SSR integration", () => {
 it("creates queries with the current SSR API without isDehydrated", () => {
  const { router, queryClient } = setup();
  expect("isDehydrated" in router.serverSsr!).toBe(false);
  expect(() => queryClient.getQueryCache().build(queryClient, { queryKey: ["ssr-new-query"] })).not.toThrow();
 });

 it("uses a separate QueryClient for each server request", () => {
  const first = setup();
  const second = setup();
  first.queryClient.setQueryData(["private-user"], "first request");
  expect(second.queryClient).not.toBe(first.queryClient);
  expect(second.queryClient.getQueryData(["private-user"])).toBeUndefined();
 });

 it("renders a query through the router wrapper and streams its result", async () => {
  const { router, queryClient } = setup();
  queryClient.setQueryData(["prefetched"], "from loader");
  const state = await router.options.dehydrate!() as any;
  expect(state.query.initial[0].state.data).toBe("from loader");
  const reader = state.query.stream.getReader();
  const chunkPromise = reader.read();
  const Wrap = router.options.Wrap!;
  function Content() {
   expect(useQueryClient()).toBe(queryClient);
   const { data } = useSuspenseQuery({ queryKey: ["render-query"], queryFn: async () => "SSR query works" });
   return createElement("p", null, data);
  }
  const htmlStream = await renderToReadableStream(createElement(Wrap, null, createElement(Content)));
  const html = await new Response(htmlStream).text();
  expect(html).toContain("SSR query works");
  const chunk = await chunkPromise;
  expect(chunk.value.some((query: any) => query.queryKey[0] === "render-query")).toBe(true);
  router.serverSsr!.setRenderFinished();
  while (!(await reader.read()).done) { /* drain remaining streamed states */ }
 });
});
