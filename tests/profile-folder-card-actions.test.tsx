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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import type { ReactNode } from "react";
import en from "@/i18n/en";
import pl from "@/i18n/pl";

const state = vi.hoisted(() => ({ rename: vi.fn(), remove: vi.fn() }));
vi.mock("@/hooks/portfolio/use-portfolio", async () => {
	const { useMutation } = await import("@tanstack/react-query");
	return {
		useUpdateCatalog: () => useMutation({ mutationFn: state.rename }),
		useDeleteCatalog: (onDeleted?: () => void | Promise<void>) =>
			useMutation({ mutationFn: state.remove, onSuccess: onDeleted }),
		useRemovePortfolioPostFromCatalog: () => ({ mutateAsync: vi.fn() }),
		useAddPortfolioPostToCatalog: () => ({ mutateAsync: vi.fn() }),
	};
});
vi.mock("@/hooks/ui/use-mobile", () => ({
	useIsTablet: () => false,
	useIsMobile: () => false,
}));
vi.mock("@/components/layout/profile/feed/profile-feed", () => ({
	ProfileFeed: () => null,
}));
vi.mock("@/components/layout/filter-bar", () => ({ FilterBar: () => null }));
vi.mock("@/components/layout/content-warning-overlay", () => ({
	ContentWarningOverlay: ({ children }: { children: ReactNode }) => (
		<>{children}</>
	),
}));
import { ProfilePortfolio } from "@/components/layout/profile/feed/portfolio";

const folders = [
	{ id: "folder-1", name: "Illustrations", description: "Finished artwork" },
	{ id: "folder-2", name: "Sketches", description: "Work in progress" },
];
const clients: QueryClient[] = [];
beforeEach(() => {
	state.rename.mockReset().mockResolvedValue(folders[1]);
	state.remove.mockReset().mockResolvedValue(undefined);
	window.scrollTo = vi.fn();
	window.HTMLElement.prototype.scrollIntoView = vi.fn();
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe() {}
			disconnect() {}
		},
	);
});
afterEach(() => {
	cleanup();
	clients.forEach((client) => client.clear());
	clients.length = 0;
	vi.unstubAllGlobals();
});

async function app(owner = true, locale = "en") {
	const i18n = createInstance();
	await i18n.init({
		lng: locale,
		fallbackLng: "en",
		resources: { en: { translation: en }, pl: { translation: pl } },
		interpolation: { escapeValue: false },
	});
	document.documentElement.lang = locale;
	const root = createRootRoute({ component: Outlet });
	const profile = createRoute({
		getParentRoute: () => root,
		path: "/{-$locale}/user/$username/$tab",
		component: Outlet,
	});
	const index = createRoute({
		getParentRoute: () => profile,
		path: "/",
		component: () => (
			<ProfilePortfolio
				username="artist"
				posts={[]}
				folders={folders}
				canManageCatalogs={owner}
			/>
		),
	});
	const folder = createRoute({
		getParentRoute: () => profile,
		path: "folder/$folderSlug",
		component: () => <h1>Opened folder</h1>,
	});
	const router = createRouter({
		routeTree: root.addChildren([profile.addChildren([index, folder])]),
		history: createMemoryHistory({
			initialEntries: [
				(locale === "pl" ? "/pl" : "") + "/user/artist/portfolio",
			],
		}),
		defaultPendingMinMs: 0,
	});
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	clients.push(client);
	render(
		<QueryClientProvider client={client}>
			<I18nextProvider i18n={i18n}>
				<RouterProvider router={router as never} />
			</I18nextProvider>
		</QueryClientProvider>,
	);
	await screen.findByRole("heading", { name: "Sketches" });
	return router;
}
async function menu(locale = "en") {
	const trigger = screen.getByRole("button", {
		name:
			locale === "pl"
				? "Zarządzaj folderem: Sketches"
				: "Manage folder: Sketches",
	});
	expect(trigger.closest("a")).toBeNull();
	fireEvent.keyDown(trigger, { key: "ArrowDown" });
	return screen.findByRole("menu");
}

describe("folder card management", () => {
	it("renames the selected folder without entering it", async () => {
		const router = await app();
		fireEvent.click(
			within(await menu()).getByRole("menuitem", { name: "Rename folder" }),
		);
		const dialog = await screen.findByRole("dialog", { name: "Rename folder" });
		expect(router.state.location.pathname).toBe("/user/artist/portfolio");
		const name = within(dialog).getByRole("textbox", {
			name: /Folder name/,
		}) as HTMLInputElement;
		expect(name.value).toBe("Sketches");
		fireEvent.change(name, { target: { value: "  Studies  " } });
		fireEvent.click(
			within(dialog).getByRole("button", { name: "Save changes" }),
		);
		await waitFor(() =>
			expect(state.rename).toHaveBeenCalledWith(
				{
					catalogId: "folder-2",
					data: { name: "Studies", description: "Work in progress" },
				},
				expect.anything(),
			),
		);
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(state.remove).not.toHaveBeenCalled();
	});

	it.each(["en", "pl"])(
		"confirms deletion of the selected card and supports cancellation in %s",
		async (locale) => {
			const router = await app(true, locale);
			fireEvent.click(
				within(await menu(locale)).getByRole("menuitem", {
					name: locale === "pl" ? "Usuń folder" : "Delete folder",
				}),
			);
			let dialog = await screen.findByRole("alertdialog");
			expect(within(dialog).getByText("Sketches")).toBeDefined();
			expect(state.remove).not.toHaveBeenCalled();
			fireEvent.click(
				within(dialog).getByRole("button", {
					name: locale === "pl" ? "Anuluj" : "Cancel",
				}),
			);
			await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
			expect(state.remove).not.toHaveBeenCalled();
			fireEvent.click(
				within(await menu(locale)).getByRole("menuitem", {
					name: locale === "pl" ? "Usuń folder" : "Delete folder",
				}),
			);
			dialog = await screen.findByRole("alertdialog");
			fireEvent.click(
				within(dialog).getByRole("button", {
					name: locale === "pl" ? "Usuń" : "Delete",
				}),
			);
			await waitFor(() =>
				expect(state.remove).toHaveBeenCalledWith(
					"folder-2",
					expect.anything(),
				),
			);
			await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
			expect(router.state.location.pathname).toBe(
				(locale === "pl" ? "/pl" : "") + "/user/artist/portfolio",
			);
		},
	);

	it("retains a failed deletion for retry and disables repeated submits while pending", async () => {
		state.remove.mockRejectedValueOnce(new Error("unavailable"));
		let finish!: () => void;
		state.remove.mockImplementationOnce(
			() =>
				new Promise<void>((resolve) => {
					finish = resolve;
				}),
		);
		await app();
		fireEvent.click(
			within(await menu()).getByRole("menuitem", { name: "Delete folder" }),
		);
		const dialog = await screen.findByRole("alertdialog");
		fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
		await screen.findByRole("alert");
		fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
		const pending = (await within(dialog).findByRole("button", {
			name: "Deleting...",
		})) as HTMLButtonElement;
		expect(pending.disabled).toBe(true);
		expect(
			(
				within(dialog).getByRole("button", {
					name: "Cancel",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
		fireEvent.click(pending);
		expect(state.remove).toHaveBeenCalledTimes(2);
		finish();
		await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
	});

	it("hides management controls for visitors while ordinary folder links still work", async () => {
		const router = await app(false);
		expect(screen.queryByRole("button", { name: /Manage folder/ })).toBeNull();
		const folder = screen.getByRole("group", { name: "Sketches" });
		fireEvent.click(within(folder).getByRole("link"));
		await screen.findByRole("heading", { name: "Opened folder" });
		expect(router.state.location.pathname).toContain("folder/folder-2");
	});
});
