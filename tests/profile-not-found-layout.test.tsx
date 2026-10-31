import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { I18nextProvider } from "react-i18next";
import { RouteNotFoundPage } from "@/components/layout/error-page";
import i18n from "@/lib/i18n";
import { Route as MainRoute } from "@/routes/{-$locale}/_main";
import { Route as ProfileRoute } from "@/routes/{-$locale}/_main/user.$username";

vi.mock("@/providers/auth", () => ({
	useAuth: () => ({ user: null, isPending: false }),
}));
vi.mock("@/hooks/ui/use-mobile", () => ({
	useIsMobile: () => false,
	useIsTablet: () => false,
}));
vi.mock("@/components/layout/footer", () => ({ default: () => null }));
vi.mock("@/components/layout/floating-toolbar", () => ({
	default: () => null,
}));

afterEach(cleanup);

async function app(path: string, insideMainLayout: boolean) {
	window.scrollTo = vi.fn();
	await i18n.changeLanguage(path.startsWith("/pl/") ? "pl" : "en");
	const root = createRootRoute({
		component: Outlet,
		notFoundComponent: RouteNotFoundPage,
	});
	const main = MainRoute.update({
		path: "/{-$locale}",
		id: "/{-$locale}/_main",
		getParentRoute: () => root,
	} as never);
	const profile = ProfileRoute.update({
		path: "/user/$username",
		id: "/user/$username",
		getParentRoute: () => main,
	} as never);
	const tab = createRoute({
		getParentRoute: () => profile,
		path: "$tab",
		component: () => <h1>Profile</h1>,
	});
	const home = createRoute({
		getParentRoute: () => root,
		path: "/",
		component: () => <h1>Home</h1>,
	});
	const router = createRouter({
		routeTree: root.addChildren(
			insideMainLayout
				? [main.addChildren([profile.addChildren([tab])])]
				: [home],
		),
		history: createMemoryHistory({ initialEntries: [path] }),
		context: {
			queryClient: {
				ensureQueryData: vi.fn().mockRejectedValue({ status: 404 }),
			},
		},
		defaultPendingMinMs: 0,
	} as never);
	await router.load();
	render(
		<I18nextProvider i18n={i18n}>
			<RouterProvider router={router as never} />
		</I18nextProvider>,
	);
	return router;
}

describe("missing-profile layout", () => {
	it.each([
		["/user/missing_user/portfolio", "This page couldn't be found", "/"],
		[
			"/pl/user/missing_user/portfolio",
			"Nie udało się znaleźć tej strony",
			"/pl",
		],
	])("keeps a single site header for %s", async (path, title, home) => {
		const router = await app(path, true);
		await screen.findByRole("heading", { name: title });
		expect(document.querySelectorAll("header")).toHaveLength(1);
		const main = screen.getByRole("main");
		expect(
			within(main).queryByRole("link", { name: "Familiar" }),
		).toBeNull();
		expect(main.textContent).not.toContain("FAMILIAR");
		expect(main.querySelector('a[href="' + home + '"]')).not.toBeNull();
		expect(router.state.location.pathname).toBe(path);
	});

	it("preserves the standalone error-page brand outside the site layout", async () => {
		await app("/does/not/exist", false);
		await screen.findByRole("heading", { name: "This page couldn't be found" });
		expect(
			screen.getAllByRole("link", { name: "Familiar" }),
		).toHaveLength(1);
		expect(document.querySelector("header")).toBeNull();
	});
});
