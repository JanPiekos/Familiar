import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	act,
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
import type { CatalogResponse } from "@/api/portfolio/catalogs/catalog-types";
import type { PortfolioPostResponse } from "@/api/portfolio/posts/post-types";
import en from "@/i18n/en";
import pl from "@/i18n/pl";

const state = vi.hoisted(() => ({
	owner: true,
	posts: [] as PortfolioPostResponse[],
	update: vi.fn(),
	remove: vi.fn(),
	delete: vi.fn(),
	add: vi.fn(),
}));
vi.mock("@/hooks/ui/use-mobile", () => ({
	useIsMobile: () => false,
	useIsTablet: () => false,
}));
vi.mock("@/hooks/portfolio/use-portfolio", () => ({
	useAddPortfolioPostToCatalog: () => ({
		mutateAsync: state.add,
		isPending: false,
	}),
	useUpdatePortfolioPost: () => ({ mutateAsync: vi.fn() }),
	useDeletePortfolioPost: () => ({ mutateAsync: vi.fn() }),
	useUpdateCatalog: () => ({ mutateAsync: state.update, isPending: false }),
	useDeleteCatalog: () => ({ mutateAsync: state.delete, isPending: false }),
	useRemovePortfolioPostFromCatalog: () => ({
		mutateAsync: state.remove,
		isPending: false,
	}),
	useUploadPortfolioPostMedia: () => ({
		mutateAsync: vi.fn(),
		isPending: false,
	}),
}));
vi.mock("@/components/layout/profile/feed/profile-feed", () => ({
	ProfileFeed: ({
		posts,
		onPostClick,
		isOwner,
		onManagePost,
	}: {
		posts: PortfolioPostResponse[];
		onPostClick: (post: PortfolioPostResponse) => void;
		isOwner: boolean;
		onManagePost: (post: PortfolioPostResponse, action: "move") => void;
	}) => (
		<section aria-label="Folder posts" data-owner={isOwner}>
			{posts.map((post) => (
				<div key={post.id}>
					<button onClick={() => onPostClick(post)}>{post.title}</button>
					{isOwner && (
						<button onClick={() => onManagePost(post, "move")}>
							Move post
						</button>
					)}
				</div>
			))}
		</section>
	),
}));
vi.mock("@/components/layout/filter-bar", () => ({
	FilterBar: ({
		searchQuery,
		onSearchChange,
		searchPlaceholder,
	}: {
		searchQuery: string;
		onSearchChange: (value: string) => void;
		searchPlaceholder: string;
	}) => (
		<input
			aria-label={searchPlaceholder}
			value={searchQuery}
			onChange={(event) => onSearchChange(event.target.value)}
		/>
	),
}));
import { ProfilePortfolio } from "@/components/layout/profile/feed/portfolio";

const folders: CatalogResponse[] = [
	{
		id: "folder-1",
		name: "Character illustrations",
		description: "Finished character artwork.",
	},
	{ id: "folder-2", name: "Sketches" },
];
beforeEach(() => {
	state.owner = true;
	state.posts = [];
	state.update.mockReset();
	state.remove.mockReset();
	state.delete.mockReset();
	state.add.mockReset().mockResolvedValue(undefined);
	window.scrollTo = vi.fn();
	window.HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

async function app(locale = "en") {
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
		component: () => <h1>Portfolio overview</h1>,
	});
	const folder = createRoute({
		getParentRoute: () => profile,
		path: "folder/$folderSlug",
		component: () => (
			<ProfilePortfolio
				username="artist"
				posts={state.posts}
				folders={folders}
				folderId={(folder.useParams() as { folderSlug: string }).folderSlug}
				canManageCatalogs={state.owner}
			/>
		),
	});
	const post = createRoute({
		getParentRoute: () => folder,
		path: "$postId",
		component: () => <h1>Opened post</h1>,
	});
	const router = createRouter({
		routeTree: root.addChildren([
			profile.addChildren([index, folder.addChildren([post])]),
		]),
		history: createMemoryHistory({
			initialEntries: [
				(locale === "pl" ? "/pl" : "") +
					"/user/artist/portfolio/folder/folder-1",
			],
		}),
		defaultPendingMinMs: 0,
	});
	render(
		<I18nextProvider i18n={i18n}>
			<RouterProvider router={router as never} />
		</I18nextProvider>,
	);
	await screen.findByRole("heading", { name: folders[0].name });
	return router;
}
const artwork = (
	id: string,
	title: string,
	catalogIds = ["folder-1"],
): PortfolioPostResponse => ({ id, title, catalogIds });

describe("folder contents", () => {
	it("keeps a partial move retryable when a refetch empties the current folder", async () => {
		state.posts = [artwork("a", "Fox portrait")];
		const router = await app();
		fireEvent.click(screen.getByRole("button", { name: "Move post" }));
		fireEvent.keyDown(
			screen.getByRole("combobox", { name: "Destination folder" }),
			{ key: "ArrowDown" },
		);
		fireEvent.click(await screen.findByRole("option", { name: "Sketches" }));
		state.remove.mockImplementationOnce(async () => {
			state.posts = [];
			await router.invalidate();
			throw new Error("failed");
		});
		fireEvent.click(screen.getByRole("button", { name: "Move to folder" }));
		expect((await screen.findByRole("alert")).textContent).toContain(
			"Retry to finish",
		);
		expect(screen.getByRole("dialog")).toBeDefined();
		state.remove.mockResolvedValueOnce(undefined);
		fireEvent.click(screen.getByRole("button", { name: "Move to folder" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(state.add).toHaveBeenCalledTimes(1);
		expect(state.remove).toHaveBeenCalledTimes(2);
	});
	it.each([true, false])(
		"passes post ownership into the folder feed: %s",
		async (owner) => {
			state.owner = owner;
			state.posts = [artwork("a", "Fox portrait")];
			await app();
			expect(
				screen
					.getByRole("region", { name: "Folder posts" })
					.getAttribute("data-owner"),
			).toBe(String(owner));
		},
	);
	it("explains an owner's empty folder and keeps its management actions accessible", async () => {
		const router = await app();
		expect(screen.getByText("0 posts")).toBeDefined();
		expect(screen.getByText("Finished character artwork.")).toBeDefined();
		expect(
			screen.getByText(/Add existing posts from your portfolio/),
		).toBeDefined();
		const search = screen.getByRole("textbox", {
			name: "Search this folder...",
		});
		expect(
			search.compareDocumentPosition(
				screen.getByRole("heading", { name: folders[0].name }),
			) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		expect(screen.queryByText("No posts yet.")).toBeNull();
		fireEvent.keyDown(screen.getByRole("button", { name: "Manage folder" }), {
			key: "Enter",
		});
		expect(
			await screen.findByRole("menuitem", { name: "Rename folder" }),
		).toBeDefined();
		expect(
			screen.getByRole("menuitem", { name: "Delete folder" }),
		).toBeDefined();
		fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
		await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
		fireEvent.click(screen.getByRole("link", { name: "Browse portfolio" }));
		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/user/artist/portfolio"),
		);
		expect(
			await screen.findByRole("heading", { name: "Portfolio overview" }),
		).toBeDefined();
		expect(state.update).not.toHaveBeenCalled();
		expect(state.delete).not.toHaveBeenCalled();
	});

	it("uses visitor guidance without owner controls", async () => {
		state.owner = false;
		await app();
		expect(
			screen.getByText("Posts added to this folder will appear here."),
		).toBeDefined();
		expect(
			screen.queryByText(/Add existing posts from your portfolio/),
		).toBeNull();
		expect(screen.queryByRole("button", { name: "Manage folder" })).toBeNull();
	});

	it("distinguishes no search matches from an empty folder and clears the actual search", async () => {
		state.posts = [
			artwork("a", "Fox portrait"),
			artwork("b", "Other folder", ["folder-2"]),
		];
		await app();
		expect(screen.getByText("1 post")).toBeDefined();
		expect(screen.getByRole("button", { name: "Fox portrait" })).toBeDefined();
		expect(screen.queryByRole("button", { name: "Other folder" })).toBeNull();
		const search = screen.getByRole("textbox", {
			name: "Search this folder...",
		}) as HTMLInputElement;
		fireEvent.change(search, { target: { value: "unmatched" } });
		expect(
			screen.getByRole("heading", { name: "No matching posts" }),
		).toBeDefined();
		expect(
			screen.queryByRole("heading", { name: "This folder is empty" }),
		).toBeNull();
		fireEvent.click(
			screen.getByRole("button", { name: "Clear search and filters" }),
		);
		expect(search.value).toBe("");
		expect(screen.getByRole("button", { name: "Fox portrait" })).toBeDefined();
	});

	it("clears a folder's search when navigating to a different folder", async () => {
		state.posts = [
			artwork("a", "Fox portrait"),
			artwork("b", "Pencil study", ["folder-2"]),
		];
		const router = await app();
		fireEvent.change(screen.getByRole("textbox"), {
			target: { value: "unmatched" },
		});
		expect(
			screen.getByRole("heading", { name: "No matching posts" }),
		).toBeDefined();
		await act(async () => {
			await router.navigate({
				to: "/user/artist/portfolio/folder/folder-2" as never,
			});
		});
		expect(
			await screen.findByRole("heading", { name: "Sketches" }),
		).toBeDefined();
		expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("");
		expect(screen.getByRole("button", { name: "Pencil study" })).toBeDefined();
	});

	it("uses Polish post counts and preserves the locale when returning to the portfolio", async () => {
		state.posts = [artwork("a", "Lis"), artwork("b", "Wilk")];
		const router = await app("pl");
		expect(screen.getByText("2 posty")).toBeDefined();
		fireEvent.click(screen.getByRole("link", { name: "Powrót do portfolio" }));
		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/pl/user/artist/portfolio"),
		);
	});

	it("adds only eligible existing posts to the current folder", async () => {
		state.posts = [
			artwork("inside", "Already added"),
			artwork("a", "Fox portrait", []),
			artwork("b", "Wolf sketch", ["folder-2"]),
		];
		await app();
		fireEvent.click(screen.getByRole("button", { name: "Add posts" }));
		const dialog = await screen.findByRole("dialog");
		expect(
			within(dialog).queryByRole("checkbox", { name: "Already added" }),
		).toBeNull();
		fireEvent.click(
			within(dialog).getByRole("checkbox", { name: "Fox portrait" }),
		);
		fireEvent.click(
			within(dialog).getByRole("checkbox", { name: "Wolf sketch" }),
		);
		fireEvent.click(
			within(dialog).getByRole("button", { name: "Add 2 posts" }),
		);
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(state.add.mock.calls.map((call) => call[0])).toEqual([
			{ postId: "a", catalogId: "folder-1" },
			{ postId: "b", catalogId: "folder-1" },
		]);
		expect(state.remove).not.toHaveBeenCalled();
	});

	it("retries only the remaining selection after a partial failure", async () => {
		state.posts = [
			artwork("a", "Fox portrait", []),
			artwork("b", "Wolf sketch", []),
		];
		state.add
			.mockResolvedValueOnce(undefined)
			.mockRejectedValueOnce(new Error("Unavailable"))
			.mockResolvedValueOnce(undefined);
		await app();
		fireEvent.click(screen.getAllByRole("button", { name: "Add posts" })[0]);
		const dialog = await screen.findByRole("dialog");
		fireEvent.click(
			within(dialog).getByRole("checkbox", { name: "Fox portrait" }),
		);
		fireEvent.click(
			within(dialog).getByRole("checkbox", { name: "Wolf sketch" }),
		);
		fireEvent.click(
			within(dialog).getByRole("button", { name: "Add 2 posts" }),
		);
		expect(await within(dialog).findByRole("alert")).toBeDefined();
		expect(
			within(dialog)
				.getByRole("checkbox", { name: "Fox portrait" })
				.getAttribute("aria-checked"),
		).toBe("false");
		expect(
			within(dialog)
				.getByRole("checkbox", { name: "Wolf sketch" })
				.getAttribute("aria-checked"),
		).toBe("true");
		fireEvent.click(within(dialog).getByRole("button", { name: "Add 1 post" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(state.add.mock.calls.map((call) => call[0].postId)).toEqual([
			"a",
			"b",
			"b",
		]);
	});

	it("keeps the picker open and blocks repeat actions while adding", async () => {
		state.posts = [artwork("a", "Fox portrait", [])];
		let finish!: () => void;
		state.add.mockImplementationOnce(
			() =>
				new Promise<void>((resolve) => {
					finish = resolve;
				}),
		);
		await app();
		fireEvent.click(screen.getAllByRole("button", { name: "Add posts" })[0]);
		const dialog = await screen.findByRole("dialog");
		fireEvent.click(
			within(dialog).getByRole("checkbox", { name: "Fox portrait" }),
		);
		fireEvent.click(within(dialog).getByRole("button", { name: "Add 1 post" }));
		expect(
			(
				within(dialog).getByRole("button", {
					name: "Adding...",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
		expect(
			(
				within(dialog).getByRole("button", {
					name: "Close",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
		fireEvent.keyDown(dialog, { key: "Escape" });
		expect(screen.getByRole("dialog")).toBeDefined();
		expect(state.add).toHaveBeenCalledTimes(1);
		await act(async () => finish());
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	it("finds untitled posts and preserves the selection while searching", async () => {
		state.posts = [
			artwork("untitled", "", []),
			artwork("a", "Fox portrait", []),
		];
		await app();
		fireEvent.click(screen.getAllByRole("button", { name: "Add posts" })[0]);
		const dialog = await screen.findByRole("dialog");
		fireEvent.click(
			within(dialog).getByRole("checkbox", { name: "Untitled post" }),
		);
		fireEvent.change(
			within(dialog).getByRole("textbox", { name: "Search your posts..." }),
			{ target: { value: "fox" } },
		);
		expect(
			within(dialog).queryByRole("checkbox", { name: "Untitled post" }),
		).toBeNull();
		fireEvent.click(
			within(dialog).getByRole("checkbox", { name: "Fox portrait" }),
		);
		fireEvent.click(
			within(dialog).getByRole("button", { name: "Add 2 posts" }),
		);
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(state.add.mock.calls.map((call) => call[0].postId)).toEqual([
			"untitled",
			"a",
		]);
	});
});
