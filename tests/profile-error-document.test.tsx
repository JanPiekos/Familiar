// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import {
	createMemoryHistory,
	createRoute,
	Outlet,
	createRootRouteWithContext,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ApiFetchError } from "@/lib/fetch";
import { Route as AppRoot } from "@/routes/__root";

vi.mock("@/styles.css?url", () => ({ default: "/assets/app.css" }));
vi.mock("@tanstack/react-start-server", () => ({ getCookie: () => undefined }));
vi.mock("@/providers/auth", () => ({
	AuthProvider: ({ children }: { children: ReactNode }) => children,
	useAuth: () => ({ user: null, isPending: false }),
}));
vi.mock(
	"@/components/layout/modal/profile/settings/routed-user-settings",
	() => ({ RoutedUserSettings: () => null }),
);
vi.mock("@tanstack/react-router", async () => ({
	...(await vi.importActual("@tanstack/react-router")),
	Scripts: () => null,
}));

describe("error document", () => {
	it.each(["/does/not/exist", "/typo"])(
		"marks missing URL %s as not-found and gives it error metadata",
		async (path) => {
			const root = createRootRouteWithContext<{ queryClient: QueryClient }>()({
				...AppRoot.options,
				component: Outlet,
				beforeLoad: AppRoot.options.beforeLoad,
			} as never);
			const index = createRoute({
				getParentRoute: () => root,
				path: "/{-$locale}",
				component: () => <h1>Home</h1>,
			});
			const router = createRouter({
				routeTree: root.addChildren([index]),
				context: { queryClient: new QueryClient() },
				history: createMemoryHistory({ initialEntries: [path] }),
			});
			await router.load();
			const html = renderToString(<RouterProvider router={router as never} />);
			expect(
				router.state.matches.some(
					(match) => match.status === "notFound" || match._notFound,
				),
			).toBe(true);
			expect(html).toContain("This page couldn&#x27;t be found");
			expect(html).toContain(
				"<title>This page couldn&#x27;t be found | Familiar</title>",
			);
			expect(html.match(/<title>/g)).toHaveLength(1);
		},
	);

	it("keeps a styled HTML document, safe metadata and no-index when the root loader fails", async () => {
		const root = createRootRouteWithContext<{ queryClient: QueryClient }>()({
			...AppRoot.options,
			beforeLoad: () => {
				throw new ApiFetchError(
					new Response("", { status: 530 }),
					"<private server detail>",
				);
			},
		} as never);
		const router = createRouter({
			routeTree: root,
			context: { queryClient: new QueryClient() },
			history: createMemoryHistory({ initialEntries: ["/"] }),
		});
		await router.load();
		const html = renderToString(<RouterProvider router={router as never} />);
		expect(html).toContain("<html");
		expect(html).toContain("<head>");
		expect(html).toContain("<body>");
		expect(html).toContain('rel="stylesheet"');
		expect(html).toContain("noindex, nofollow");
		expect(html).toContain("Familiar is temporarily unavailable");
		expect(html).not.toContain("<private server detail>");
		expect(html).not.toContain("Something went wrong!");
	});
});
