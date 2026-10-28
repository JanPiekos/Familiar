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
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { ProfileDetailsContent } from "@/components/layout/profile/profile-details";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import type { TUserProfile } from "@/types/user";
import en from "@/i18n/en";
import pl from "@/i18n/pl";

const artist: TUserProfile = {
	userId: "artist-id",
	username: "artist",
	displayName: "Artist",
	pronouns: "they/them",
	bio: "An artist who loves **character artwork**.\n\n[My portfolio](https://example.com/art)",
	avatarPath: null,
	coverPath: null,
	accentColor: null,
	isVerified: false,
	isPremium: false,
	roles: [],
	socials: [{ platform: "WEBSITE", value: "https://example.com" }],
	createdAt: "2026-09-20T12:00:00Z",
};
beforeEach(() => {
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	);
	window.scrollTo = vi.fn();
});
afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

async function show(user = artist, locale = "en") {
	const i18n = createInstance();
	await i18n.init({
		lng: locale,
		fallbackLng: "en",
		resources: { en: { translation: en }, pl: { translation: pl } },
		interpolation: { escapeValue: false },
	});
	const root = createRootRoute({ component: Outlet });
	const route = createRoute({
		getParentRoute: () => root,
		path: "/",
		component: () => (
			<Dialog>
				<DialogTrigger asChild>
					<Button>Open about</Button>
				</DialogTrigger>
				<ProfileDetailsContent user={user} />
			</Dialog>
		),
	});
	const router = createRouter({
		routeTree: root.addChildren([route]),
		history: createMemoryHistory({ initialEntries: ["/"] }),
		defaultPendingMinMs: 0,
	});
	render(
		<I18nextProvider i18n={i18n}>
			<RouterProvider router={router as never} />
		</I18nextProvider>,
	);
	const trigger = await screen.findByRole("button", { name: "Open about" });
	fireEvent.click(trigger);
	return { trigger, dialog: await screen.findByRole("dialog") };
}
describe("About me dialog", () => {
	it("shows the profile identity, localized date, markdown bio, and website links", async () => {
		const { dialog } = await show();
		expect(dialog.getAttribute("aria-labelledby")).toBe(
			screen.getByRole("heading", { name: "About me" }).id,
		);
		expect(
			document.getElementById(dialog.getAttribute("aria-describedby")!)
				?.textContent,
		).toBe("More about Artist.");
		expect(
			within(dialog).getByRole("heading", { name: "Artist" }),
		).toBeDefined();
		expect(within(dialog).getByText("@artist")).toBeDefined();
		expect(within(dialog).getByText("they/them")).toBeDefined();
		expect(within(dialog).getByText("Joined September 2026")).toBeDefined();
		const bio = within(dialog).getByRole("region", { name: "Bio" });
		expect(within(bio).getByText("character artwork").tagName).toBe("STRONG");
		expect(
			within(bio)
				.getByRole("link", { name: "My portfolio" })
				.getAttribute("href"),
		).toBe("https://example.com/art");
		expect(
			within(dialog)
				.getByRole("region", { name: "Links" })
				.querySelector("a")
				?.getAttribute("href"),
		).toBe("https://example.com/");
	});
	it("omits missing sections and invalid dates and falls back to the username", async () => {
		const { dialog } = await show({
			...artist,
			displayName: "",
			pronouns: null,
			bio: "  ",
			socials: [],
			createdAt: "invalid",
		});
		expect(
			within(dialog).getByRole("heading", { name: "artist" }),
		).toBeDefined();
		expect(within(dialog).queryByRole("region", { name: "Bio" })).toBeNull();
		expect(within(dialog).queryByRole("region", { name: "Links" })).toBeNull();
		expect(within(dialog).queryByText(/Joined|Unknown/)).toBeNull();
	});
	it("uses Polish labels and join-date formatting", async () => {
		const { dialog } = await show(artist, "pl");
		expect(
			within(dialog).getByRole("heading", { name: "O mnie" }),
		).toBeDefined();
		expect(within(dialog).getByText("Dołączył(a) wrzesień 2026")).toBeDefined();
		expect(
			within(dialog).getByRole("region", { name: "Biografia" }),
		).toBeDefined();
		expect(within(dialog).getByRole("region", { name: "Linki" })).toBeDefined();
		expect(
			within(dialog).getByRole("button", { name: "Zamknij" }),
		).toBeDefined();
	});
	it("dismisses with Escape and returns focus to its trigger", async () => {
		const { trigger, dialog } = await show();
		fireEvent.keyDown(dialog, { key: "Escape" });
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		await waitFor(() => expect(document.activeElement).toBe(trigger));
	});
});
