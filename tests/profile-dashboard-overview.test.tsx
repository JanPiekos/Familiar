import { cleanup, render, screen, within } from "@testing-library/react";
import { createInstance } from "i18next";
import type { ComponentProps } from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import en from "@/i18n/en";
import pl from "@/i18n/pl";
import type { TUserResponse } from "@/types/user";
import { TRoles } from "@/types/user/roles";

const state = vi.hoisted(() => ({
	user: null as TUserResponse | null,
	pending: false,
	path: "/dashboard",
}));
vi.mock("@/providers/auth", () => ({
	useAuth: () => ({ user: state.user, isPending: state.pending }),
}));
vi.mock("@/components/layout/account-navigation", () => ({
	AccountNavigation: () => <nav aria-label="Account dock" />,
}));
vi.mock("@/components/layout/profile/avatar", () => ({
	default: () => <span>Avatar</span>,
}));
vi.mock("@tanstack/react-router", async (original) => ({
	...(await original<typeof import("@tanstack/react-router")>()),
	Link: ({ to, ...props }: ComponentProps<"a"> & { to: string }) => (
		<a href={to} {...props} />
	),
	useLocation: () => ({ pathname: state.path }),
	Outlet: () => <div data-testid="protected-page">Section contents</div>,
}));
import { DashboardOverview } from "@/components/layout/dashboard/overview";
import { DashboardHeader } from "@/components/layout/dashboard/header";
import { DashboardLayout } from "@/routes/{-$locale}/dashboard";

async function mount(component = <DashboardLayout />, locale = "en") {
	const i18n = createInstance();
	await i18n.init({
		lng: locale,
		fallbackLng: "en",
		resources: { en: { translation: en }, pl: { translation: pl } },
		interpolation: { escapeValue: false },
	});
	return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>);
}
beforeEach(() => {
	state.user = {
		userId: "creator-1",
		username: "hasira",
		displayName: "Hasira",
		roles: [TRoles.Artist],
		socials: [],
	} as unknown as TUserResponse;
	state.pending = false;
	state.path = "/dashboard";
});
afterEach(cleanup);

it("waits for authentication without mounting protected pages", async () => {
	state.pending = true;
	await mount();
	expect(
		screen.getByRole("status", { name: "Loading your dashboard…" }),
	).toBeTruthy();
	expect(screen.queryByTestId("protected-page")).toBeNull();
});
it("shows a localized sign-in action for guests", async () => {
	state.user = null;
	state.path = "/pl/dashboard/services";
	await mount(undefined, "pl");
	expect(
		screen.getByRole("link", { name: "Zaloguj" }).getAttribute("href"),
	).toBe("/pl/auth/login");
	expect(screen.queryByTestId("protected-page")).toBeNull();
});
it.each([TRoles.User, TRoles.Moderator, TRoles.Admin])(
	"never mounts commission pages for role %s",
	async (role) => {
		state.user!.roles = [role];
		state.path = "/dashboard/services";
		await mount();
		expect(screen.getByRole("heading", { name: "Creator tools" })).toBeTruthy();
		expect(screen.queryByTestId("protected-page")).toBeNull();
		expect(
			screen
				.getAllByRole("link", { name: "Overview" })
				.every((link) => link.getAttribute("href") === "/dashboard"),
		).toBe(true);
	},
);
it("keeps creator sections and active navigation localized, with one account dock", async () => {
	state.path = "/pl/dashboard/services";
	await mount(undefined, "pl");
	const nav = screen.getByRole("navigation", { name: "Sekcje panelu" });
	expect(
		within(nav)
			.getByRole("link", { name: "Oferty" })
			.getAttribute("aria-current"),
	).toBe("page");
	expect(
		within(nav)
			.getByRole("link", { name: "Przegląd" })
			.getAttribute("aria-current"),
	).toBeNull();
	expect(
		within(nav).getByRole("link", { name: "Formularze" }).getAttribute("href"),
	).toBe("/pl/dashboard/forms_templates");
	expect(
		screen.getAllByRole("navigation", { name: "Account dock" }),
	).toHaveLength(1);
	expect(screen.getByTestId("protected-page")).toBeTruthy();
	expect(
		screen
			.getAllByRole("link")
			.every((link) => link.getAttribute("href") !== "#"),
	).toBe(true);
});
it("allows a signed-in client to use the overview without exposing creator navigation", async () => {
	state.user!.roles = [TRoles.User];
	await mount();
	expect(screen.getByTestId("protected-page")).toBeTruthy();
	expect(
		within(
			screen.getByRole("navigation", { name: "Dashboard sections" }),
		).getAllByRole("link"),
	).toHaveLength(1);
});
it("offers real localized portfolio and workflow links without fabricated metrics", async () => {
	await mount(<DashboardOverview />, "pl");
	expect(
		screen.getByRole("heading", { name: "Witaj ponownie, Hasira" }),
	).toBeTruthy();
	expect(
		screen.getByRole("link", { name: "Otwórz portfolio" }).getAttribute("href"),
	).toBe("/pl/user/hasira");
	expect(
		screen.getByRole("link", { name: "Edytuj profil" }).getAttribute("href"),
	).toBe("/pl/settings/profile");
	expect(
		screen.getByRole("link", { name: /Oferty/ }).getAttribute("href"),
	).toBe("/pl/dashboard/services");
});
it("keeps a client's overview focused on their account", async () => {
	state.user!.roles = [TRoles.User];
	await mount(<DashboardOverview />);
	expect(
		screen.getByRole("link", { name: /Account settings/ }).getAttribute("href"),
	).toBe("/settings/profile");
	expect(screen.queryByRole("link", { name: /Services/ })).toBeNull();
});
it("renders section titles and preserves existing header actions", async () => {
	await mount(
		<DashboardHeader
			title="Form templates"
			actions={<button type="button">Create form</button>}
		/>,
	);
	expect(screen.getByText("Form templates")).toBeTruthy();
	expect(screen.getByRole("button", { name: "Create form" })).toBeTruthy();
});
