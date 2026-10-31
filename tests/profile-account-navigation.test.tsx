import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { I18nextProvider } from "react-i18next";
import type { TUserResponse } from "@/types/user";
import { TRoles } from "@/types/user/roles";
import i18n, { syncLanguage } from "@/lib/i18n";
import { ThemeProvider } from "@/providers/theme";

const state = vi.hoisted(() => ({
	user: null as TUserResponse | null,
	pending: false,
	compact: true,
	logout: vi.fn(),
}));
vi.mock("@/providers/auth", () => ({
	useAuth: () => ({
		user: state.user,
		isPending: state.pending,
		logout: state.logout,
	}),
}));
vi.mock("@/hooks/ui/use-mobile", () => ({
	useIsMobile: () => state.compact,
	useIsTablet: () => state.compact,
}));
vi.mock("@/components/layout/profile/avatar", () => ({
	default: ({ user }: { user: TUserResponse }) => (
		<img alt={user.displayName} src="/avatar.png" />
	),
}));
import Header from "@/components/layout/header";
import { Route as DashboardIndexRoute } from "@/routes/{-$locale}/dashboard/index";

async function renderNavigation(locale = "pl", path = "/pl/user/hasira") {
	await syncLanguage(locale);
	window.history.replaceState({}, "", path);
	document.documentElement.lang = locale;
	const root = createRootRoute({
		component: () => (
			<ThemeProvider>
				<Header />
				<Outlet />
			</ThemeProvider>
		),
	});
	const page = createRoute({
		getParentRoute: () => root,
		path: "$",
		component: () => <h1>Page content</h1>,
	});
	const router = createRouter({
		routeTree: root.addChildren([
			DashboardIndexRoute.update({
				getParentRoute: () => root,
				path: "/{-$locale}/dashboard",
			} as never),
			page,
		]),
		history: createMemoryHistory({ initialEntries: [path] }),
		defaultPendingMinMs: 0,
	});
	render(
		<I18nextProvider i18n={i18n}>
			<RouterProvider router={router as never} />
		</I18nextProvider>,
	);
	await screen.findByRole("heading", { name: "Page content" });
	return {
		router,
		navigation: screen.getByRole("navigation", {
			name: locale === "pl" ? "Nawigacja konta" : "Account navigation",
		}),
	};
}

beforeEach(() => {
	state.user = {
		userId: "me",
		username: "hasira",
		displayName: "Hasira",
		pronouns: null,
		bio: null,
		avatarPath: null,
		coverPath: null,
		accentColor: null,
		isVerified: false,
		isPremium: false,
		roles: [TRoles.Artist],
		socials: [],
		createdAt: "2026-10-26",
	};
	state.pending = false;
	state.compact = true;
	localStorage.clear();
	window.scrollTo = vi.fn();
	window.matchMedia = vi.fn().mockImplementation(() => ({
		matches: false,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	}));
});
afterEach(async () => {
	cleanup();
	localStorage.clear();
	await syncLanguage("en");
	document.documentElement.lang = "en";
});

describe("mobile account dock", () => {
	it("keeps one set of artist controls without a top hamburger, with localized chat navigation", async () => {
		const { router, navigation } = await renderNavigation();
		expect(
			screen.getAllByRole("navigation", { name: "Nawigacja konta" }),
		).toHaveLength(1);
		expect(
			screen.queryByRole("button", { name: "Otwórz nawigację" }),
		).toBeNull();
		const chat = within(navigation).getByRole("link", { name: "Wiadomości" });
		expect(chat.getAttribute("href")).toBe("/pl/chat");
		fireEvent.click(chat);
		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/pl/chat"),
		);
		expect(
			within(navigation)
				.getByRole("link", { name: "Wiadomości" })
				.getAttribute("aria-current"),
		).toBe("page");
	});

	it.each([
		["Strona główna", "/pl"],
		["Sklep", "/pl/shop"],
		["Zapytania", "/pl/my-requests"],
		["Oferty", "/pl/dashboard/services"],
		["Formularze", "/pl/dashboard/forms_templates"],
	])(
		"opens %s from the avatar menu and closes the drawer",
		async (label, path) => {
			const { router, navigation } = await renderNavigation();
			fireEvent.click(
				within(navigation).getByRole("button", { name: "Hasira" }),
			);
			const drawer = await screen.findByRole("dialog");
			fireEvent.click(within(drawer).getByRole("link", { name: label }));
			await waitFor(() => expect(router.state.location.pathname).toBe(path));
			await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
			expect(document.body.style.pointerEvents).not.toBe("none");
		},
	);

	it("keeps site navigation available in the guest dock menu", async () => {
		state.user = null;
		const { router, navigation } = await renderNavigation();
		fireEvent.click(
			within(navigation).getByRole("button", { name: "Nawigacja konta" }),
		);
		const drawer = await screen.findByRole("dialog");
		expect(within(drawer).getByRole("link", { name: "Zaloguj" })).toBeDefined();
		expect(
			within(drawer).getByRole("link", { name: "Zarejestruj" }),
		).toBeDefined();
		fireEvent.click(within(drawer).getByRole("link", { name: "Sklep" }));
		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/pl/shop"),
		);
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	it("opens the localized artist dashboard and marks it active", async () => {
		const { router, navigation } = await renderNavigation();
		fireEvent.click(
			within(navigation).getByRole("link", { name: "Panel artysty" }),
		);
		await waitFor(() =>
			expect(router.state.location.pathname).toBe(
				"/pl/dashboard/commissions_requests",
			),
		);
		expect(
			within(navigation)
				.getByRole("link", { name: "Panel artysty" })
				.getAttribute("aria-current"),
		).toBe("page");
	});

	it("opens account settings from the dock avatar and releases the drawer", async () => {
		const { router, navigation } = await renderNavigation();
		fireEvent.click(within(navigation).getByRole("button", { name: "Hasira" }));
		const drawer = await screen.findByRole("dialog");
		fireEvent.click(within(drawer).getByRole("button", { name: /Ustawienia/ }));
		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/pl/settings/profile"),
		);
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(document.body.style.pointerEvents).not.toBe("none");
	});

	it("keeps chat and the avatar available for clients without an artist dashboard", async () => {
		state.user!.roles = [TRoles.User];
		const { navigation } = await renderNavigation("en", "/user/hasira");
		expect(
			within(navigation).getByRole("link", { name: "Messages" }),
		).toBeDefined();
		expect(
			within(navigation).getByRole("button", { name: "Hasira" }),
		).toBeDefined();
		expect(
			within(navigation).queryByRole("link", { name: "Dashboard" }),
		).toBeNull();
	});

	it("offers login and registration to guests", async () => {
		state.user = null;
		const { navigation } = await renderNavigation();
		expect(
			within(navigation)
				.getByRole("link", { name: "Zaloguj" })
				.getAttribute("href"),
		).toBe("/pl/auth/login");
		expect(
			within(navigation)
				.getByRole("link", { name: "Zarejestruj" })
				.getAttribute("href"),
		).toBe("/pl/auth/register");
	});

	it("shows a loading state before account information is ready", async () => {
		state.user = null;
		state.pending = true;
		const { navigation } = await renderNavigation();
		expect(navigation.getAttribute("aria-busy")).toBe("true");
		expect(
			within(navigation).queryByRole("link", { name: "Zaloguj" }),
		).toBeNull();
	});

	it.each([false, true])(
		"offers desktop appearance choices to guests=%s",
		async (guest) => {
			state.compact = false;
			if (guest) state.user = null;
			const { navigation } = await renderNavigation("en", "/user/hasira");
			fireEvent.keyDown(
				within(navigation).getByRole("button", {
					name: guest ? "Account navigation" : "Hasira",
				}),
				{ key: "ArrowDown" },
			);
			const appearance = await screen.findByRole("menuitem", {
				name: /^Appearance/,
			});
			if (guest)
				expect(screen.queryByRole("menuitem", { name: "Logout" })).toBeNull();
			fireEvent.keyDown(appearance, { key: "ArrowRight" });
			expect(
				await screen.findByRole("menuitemradio", { name: "OLED" }),
			).toBeDefined();
			fireEvent.click(screen.getByRole("menuitemradio", { name: "Dark" }));
			await waitFor(() =>
				expect(localStorage.getItem("familiar-theme")).toBe("dark"),
			);
			expect(document.documentElement.classList.contains("dark")).toBe(true);
			await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
		},
	);

	it("keeps mobile theme selection in the account sheet", async () => {
		const { navigation } = await renderNavigation();
		fireEvent.click(within(navigation).getByRole("button", { name: "Hasira" }));
		const drawer = await screen.findByRole("dialog");
		fireEvent.click(within(drawer).getByText("Wygląd"));
		fireEvent.click(within(drawer).getByRole("radio", { name: "Ciemny" }));
		await waitFor(() =>
			expect(localStorage.getItem("familiar-theme")).toBe("dark"),
		);
		expect(
			within(drawer)
				.getByRole("radio", { name: "Ciemny" })
				.getAttribute("aria-checked"),
		).toBe("true");
		expect(screen.getByRole("dialog")).toBe(drawer);
	});

	it.each([false, true])(
		"switches guest language and preserves the URL on mobile=%s",
		async (compact) => {
			state.compact = compact;
			state.user = null;
			const { router, navigation } = await renderNavigation(
				"en",
				"/user/hasira?settings=profile#portfolio",
			);
			const trigger = within(navigation).getByRole("button", {
				name: "Account navigation",
			});
			if (compact) {
				fireEvent.click(trigger);
				const drawer = await screen.findByRole("dialog");
				fireEvent.click(within(drawer).getByText("Language"));
				fireEvent.click(within(drawer).getByRole("radio", { name: "Polski" }));
			} else {
				fireEvent.keyDown(trigger, { key: "ArrowDown" });
				fireEvent.keyDown(
					await screen.findByRole("menuitem", { name: /^Language/ }),
					{ key: "ArrowRight" },
				);
				fireEvent.click(
					await screen.findByRole("menuitemradio", { name: "Polski" }),
				);
			}
			await waitFor(() =>
				expect(router.state.location.pathname).toBe("/pl/user/hasira"),
			);
			expect(router.state.location.searchStr).toContain("settings=profile");
			expect(router.state.location.hash).toBe("portfolio");
			expect(i18n.language).toBe("pl");
			await waitFor(() =>
				expect(screen.queryByRole(compact ? "dialog" : "menu")).toBeNull(),
			);
			expect(document.body.style.pointerEvents).not.toBe("none");
		},
	);
});
