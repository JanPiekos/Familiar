import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	notFound,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { I18nextProvider } from "react-i18next";
import {
	RouteErrorPage,
	RouteNotFoundPage,
} from "@/components/layout/error-page";
import i18n from "@/lib/i18n";
import { getRouteSeo } from "@/lib/route-seo";
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

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

async function app(
	path: string,
	insideMainLayout: boolean,
	outcome: "missing-user" | "missing-post" | "empty" | 500 = "missing-user",
) {
	window.scrollTo = vi.fn();
	await i18n.changeLanguage(path.startsWith("/pl/") ? "pl" : "en");
	const root = createRootRoute({
		component: Outlet,
		notFoundComponent: RouteNotFoundPage,
		errorComponent: RouteErrorPage,
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
		component: Outlet,
	});
	const post = createRoute({
		getParentRoute: () => tab,
		path: "$postId",
		loader: () => {
			throw notFound();
		},
	});
	const home = createRoute({
		getParentRoute: () => root,
		path: "/",
		component: () => <h1>Home</h1>,
	});
	const router = createRouter({
		routeTree: root.addChildren(
			insideMainLayout
				? [main.addChildren([profile.addChildren([tab.addChildren([post])])])]
				: [home],
		),
		history: createMemoryHistory({ initialEntries: [path] }),
		context: {
			queryClient: {
				ensureQueryData: vi.fn(async () => {
					if (outcome === "missing-user") throw { status: 404 };
					if (outcome === 500) throw { status: 500 };
					return outcome === "empty"
						? null
						: { username: "artist", userId: "1", roles: ["ARTIST"] };
				}),
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
		["/user/missing_user/portfolio", "User not found", "/"],
		["/pl/user/missing_user/portfolio", "Nie znaleziono użytkownika", "/pl"],
	])("keeps a single site header for %s", async (path, title, home) => {
		const router = await app(path, true);
		await screen.findByRole("heading", { name: title });
		expect(document.querySelectorAll("header")).toHaveLength(1);
		const main = screen.getByRole("main");
		expect(within(main).queryByRole("link", { name: "Familiar" })).toBeNull();
		expect(main.textContent).not.toContain("FAMILIAR");
		expect(within(main).getByText("@missing_user")).toBeDefined();
		expect(
			within(main).queryByText(i18n.t("error_pages.status", { status: 404 })),
		).toBeNull();
		expect(main.querySelector('a[href="' + home + '"]')).not.toBeNull();
		expect(router.state.location.pathname).toBe(path);
		expect(getRouteSeo(router.state.matches).meta[0]).toEqual({
			title: `${title} | Familiar`,
		});
	});

	it("shows the profile-specific view for an empty lookup result", async () => {
		await app("/user/missing_user/portfolio", true, "empty");
		await screen.findByRole("heading", { name: "User not found" });
	});

	it("keeps a missing post separate from a missing user", async () => {
		const router = await app(
			"/user/artist/portfolio/missing-post",
			true,
			"missing-post",
		);
		await screen.findByRole("heading", { name: "This page couldn't be found" });
		expect(screen.queryByText("User not found")).toBeNull();
		expect(getRouteSeo(router.state.matches).meta[0]).toEqual({
			title: "This page couldn't be found | Familiar",
		});
	});

	it("does not label a server failure as a missing account", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(console, "warn").mockImplementation(() => {});
		await app("/user/artist/portfolio", true, 500);
		await screen.findByRole("heading", {
			name: "Something went wrong on the server",
		});
		expect(screen.queryByText("User not found")).toBeNull();
	});

	it("preserves the standalone error-page brand outside the site layout", async () => {
		await app("/does/not/exist", false);
		await screen.findByRole("heading", { name: "This page couldn't be found" });
		expect(screen.getAllByRole("link", { name: "Familiar" })).toHaveLength(1);
		expect(document.querySelector("header")).toBeNull();
	});
});
