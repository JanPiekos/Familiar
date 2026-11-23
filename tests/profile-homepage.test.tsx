import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import en from "@/i18n/en";
import pl from "@/i18n/pl";

const auth = vi.hoisted(() => ({ user: null as { username: string } | null }));
vi.mock("@/providers/auth", () => ({ useAuth: () => auth }));
import { HomePage } from "@/routes/{-$locale}/_main/index";

beforeEach(() => {
	auth.user = null;
});
afterEach(cleanup);

async function home(locale = "en") {
	const i18n = createInstance();
	await i18n.init({
		lng: locale,
		resources: { en: { translation: en }, pl: { translation: pl } },
		interpolation: { escapeValue: false },
	});
	const root = createRootRoute({ component: Outlet });
	const landing = createRoute({
		getParentRoute: () => root,
		path: "/{-$locale}/",
		component: HomePage,
	});
	const registration = createRoute({
		getParentRoute: () => root,
		path: "/{-$locale}/auth/register",
		component: () => <h1>Registration</h1>,
	});
	const login = createRoute({
		getParentRoute: () => root,
		path: "/{-$locale}/auth/login",
		component: () => <h1>Login</h1>,
	});
	const profile = createRoute({
		getParentRoute: () => root,
		path: "/{-$locale}/user/$username",
		component: () => <h1>Your profile</h1>,
	});
	const router = createRouter({
		routeTree: root.addChildren([landing, registration, login, profile]),
		history: createMemoryHistory({
			initialEntries: [locale === "pl" ? "/pl" : "/"],
		}),
	});
	render(
		<I18nextProvider i18n={i18n}>
			<RouterProvider router={router as never} />
		</I18nextProvider>,
	);
	await screen.findByRole("heading", { level: 1 });
	return router;
}

it("explains the closed beta and links guests to sign-in and invited registration", async () => {
	await home();
	expect(screen.getByText("Closed beta")).toBeDefined();
	expect(
		screen.getByText(/Familiar is currently in closed beta testing/),
	).toBeDefined();
	expect(
		screen.getByText("Access is currently by invitation only."),
	).toBeDefined();
	expect(
		screen.getByRole("link", { name: "Sign in" }).getAttribute("href"),
	).toBe("/auth/login");
	fireEvent.click(screen.getByRole("link", { name: "I have an invitation" }));
	await screen.findByRole("heading", { name: "Registration" });
});

it("preserves Polish locale when invited testers register", async () => {
	const router = await home("pl");
	expect(screen.getByText("Zamknięta beta")).toBeDefined();
	expect(
		screen.getByText(/Familiar jest obecnie w fazie zamkniętych testów beta/),
	).toBeDefined();
	fireEvent.click(screen.getByRole("link", { name: "Mam zaproszenie" }));
	await screen.findByRole("heading", { name: "Registration" });
	expect(router.state.location.pathname).toBe("/pl/auth/register");
});

it("takes signed-in testers to their profile instead of asking them to sign in again", async () => {
	auth.user = { username: "kiro" };
	const router = await home("pl");
	expect(screen.queryByRole("link", { name: "Mam zaproszenie" })).toBeNull();
	expect(screen.queryByRole("link", { name: "Zaloguj się" })).toBeNull();
	fireEvent.click(
		screen.getByRole("link", { name: "Przejdź do mojego profilu" }),
	);
	await screen.findByRole("heading", { name: "Your profile" });
	expect(router.state.location.pathname).toBe("/pl/user/kiro");
});
