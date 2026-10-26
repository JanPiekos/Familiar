import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
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
import type { TUserResponse } from "@/types/user";
import { TRoles } from "@/types/user/roles";
import en from "@/i18n/en";
import pl from "@/i18n/pl";

const state = vi.hoisted(() => ({
	compact: true,
	user: null as TUserResponse | null,
	createPost: vi.fn(),
	createFolder: vi.fn(),
	upload: vi.fn(),
}));
vi.mock("@/providers/auth", () => ({
	useAuth: () => ({ user: state.user, isPending: false }),
}));
vi.mock("@/hooks/ui/use-mobile", () => ({
	useIsMobile: () => state.compact,
	useIsTablet: () => state.compact,
}));
vi.mock("@/api/portfolio/posts/post", async (original) => ({
	...(await original<typeof import("@/api/portfolio/posts/post")>()),
	createPortfolioPost: (...args: unknown[]) => state.createPost(...args),
	uploadPortfolioPostMedia: (...args: unknown[]) => state.upload(...args),
}));
vi.mock("@/api/portfolio/catalogs/catalog", async (original) => ({
	...(await original<typeof import("@/api/portfolio/catalogs/catalog")>()),
	createCatalog: (...args: unknown[]) => state.createFolder(...args),
	getMyCatalogs: async () => [],
}));
vi.mock("@/api/commisions/index", async (original) => ({
	...(await original<typeof import("@/api/commisions/index")>()),
	getTags: async () => [],
}));
vi.mock("@/api/commisions/categories", () => ({
	getCommissionCategories: async () => [],
}));
vi.mock("@/components/layout/filter-bar", () => ({
	FilterBar: ({
		endAction,
		onSearchChange,
	}: {
		endAction: React.ReactNode;
		onSearchChange?: (value: string) => void;
	}) => (
		<section aria-label="Portfolio filters">
			<input
				aria-label="Search portfolio"
				onChange={(event) => onSearchChange?.(event.target.value)}
			/>
			{endAction}
		</section>
	),
}));

vi.mock("@/components/layout/profile/avatar", () => ({
	default: ({ user }: { user: TUserResponse }) => (
		<img alt={user.displayName} src="/avatar.png" />
	),
}));
import Header from "@/components/layout/header";
import { PortfolioCreationProvider } from "@/components/layout/profile/portfolio-creation";
import { ProfilePortfolio } from "@/components/layout/profile/feed/portfolio";
import { CreationLayout } from "@/routes/{-$locale}/create";
import { CreatePostPage } from "@/routes/{-$locale}/create/post";
import { CreateFolderPage } from "@/routes/{-$locale}/create/folder";
import {
	getCreationReturnPath,
	validateCreationSearch,
} from "@/lib/portfolio-creation";

const clients: QueryClient[] = [];
beforeEach(() => {
	state.compact = true;
	state.user = {
		userId: "artist-id",
		username: "artist",
		displayName: "Artist",
		roles: [TRoles.Artist],
		socials: [],
	} as unknown as TUserResponse;
	state.createPost
		.mockReset()
		.mockResolvedValue({ id: "post-1", title: "Artwork" });
	state.createFolder
		.mockReset()
		.mockResolvedValue({ id: "folder-1", name: "Artwork" });
	state.upload.mockReset().mockResolvedValue({});
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	);
	window.scrollTo = vi.fn();
	let urlIndex = 0;
	vi.spyOn(URL, "createObjectURL").mockImplementation(
		() => "blob:preview-" + ++urlIndex,
	);
	vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});
afterEach(() => {
	cleanup();
	for (const client of clients) client.clear();
	clients.length = 0;
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

async function app(path = "/user/artist/portfolio", locale = "en") {
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
		path: "/{-$locale}/user/$username/portfolio",
		component: () => (
			<PortfolioCreationProvider>
				<Header />
				<h1>Portfolio</h1>
				<ProfilePortfolio
					username={profile.useParams().username}
					posts={[]}
					folders={[]}
					canManageCatalogs={
						state.user?.username === profile.useParams().username &&
						state.user?.roles?.includes(TRoles.Artist)
					}
					canCreatePosts={
						state.user?.username === profile.useParams().username &&
						state.user?.roles?.includes(TRoles.Artist)
					}
					onCreateCatalog={state.createFolder}
					onCreatePost={state.createPost}
				/>
			</PortfolioCreationProvider>
		),
	});
	const creation = createRoute({
		getParentRoute: () => root,
		path: "/{-$locale}/create",
		validateSearch: validateCreationSearch,
		component: CreationLayout,
	});
	const post = createRoute({
		getParentRoute: () => creation,
		path: "post",
		component: CreatePostPage,
	});
	const folder = createRoute({
		getParentRoute: () => creation,
		path: "folder",
		component: CreateFolderPage,
	});
	const login = createRoute({
		getParentRoute: () => root,
		path: "/{-$locale}/auth/login",
		component: () => <h1>Sign in</h1>,
	});
	const router = createRouter({
		routeTree: root.addChildren([
			profile,
			creation.addChildren([post, folder]),
			login,
		]),
		history: createMemoryHistory({ initialEntries: [path] }),
		defaultPendingMinMs: 0,
	});
	const client = new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: Infinity },
			mutations: { retry: false },
		},
	});
	clients.push(client);
	render(
		<QueryClientProvider client={client}>
			<I18nextProvider i18n={i18n}>
				<RouterProvider router={router as never} />
			</I18nextProvider>
		</QueryClientProvider>,
	);
	await screen.findAllByRole("heading");
	return router;
}
const openMenu = () =>
	fireEvent.keyDown(screen.getByRole("button", { name: "Add to portfolio" }), {
		key: "Enter",
	});
const openPost = () => {
	openMenu();
	fireEvent.click(screen.getByRole("menuitem", { name: "Create post" }));
};
const openFolder = () => {
	openMenu();
	fireEvent.click(screen.getByRole("menuitem", { name: "Create folder" }));
};

describe("mobile creation pages", () => {
	it("keeps creation in its own container to the right of account navigation", async () => {
		await app();
		const dock = screen.getByRole("navigation", { name: "Account navigation" });
		const trigger = screen.getByRole("button", { name: "Add to portfolio" });
		expect(dock.contains(trigger)).toBe(false);
		expect(dock.nextElementSibling).toBe(trigger.parentElement);
		expect(trigger.parentElement?.children).toHaveLength(1);
		const filters = screen.getByRole("region", { name: "Portfolio filters" });
		expect(filters.querySelector("button")).toBeNull();
		openMenu();
		expect(
			screen.getAllByRole("menuitem").map((item) => item.textContent),
		).toEqual(["Create post", "Create folder"]);
		fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
		await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
		expect(document.body.style.pointerEvents).not.toBe("none");
	});

	it("offers both creation actions below an owner's empty portfolio", async () => {
		const router = await app();
		expect(
			screen.getByText(
				"Share your first artwork or organize your portfolio with a folder.",
			),
		).toBeDefined();
		expect(screen.getByRole("button", { name: "Create folder" })).toBeDefined();
		fireEvent.click(screen.getByRole("button", { name: "Create post" }));
		await screen.findByRole("heading", { name: "New Post", level: 1 });
		expect(router.state.location.pathname).toBe("/create/post");
		expect(screen.queryByRole("menu")).toBeNull();
	});

	it("does not show first-post actions for search results", async () => {
		await app();
		fireEvent.change(
			screen.getByRole("textbox", { name: "Search portfolio" }),
			{ target: { value: "search" } },
		);
		expect(screen.queryByRole("button", { name: "Create post" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Create folder" })).toBeNull();
		expect(
			screen.getByRole("button", { name: "Add to portfolio" }),
		).toBeDefined();
	});

	it("does not offer creation while viewing another artist's portfolio", async () => {
		await app("/user/other-artist/portfolio");
		expect(
			screen.queryByRole("button", { name: "Add to portfolio" }),
		).toBeNull();
		expect(screen.queryByRole("button", { name: "Create post" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Create folder" })).toBeNull();
		expect(
			screen.getByText(
				"This user hasn't posted anything to their portfolio yet.",
			),
		).toBeDefined();
	});

	it("opens a folder page and browser Back returns to the source URL without creating anything", async () => {
		const router = await app("/user/artist/portfolio?sort=latest#work");
		openFolder();
		await screen.findByRole("heading", { name: "Create folder", level: 1 });
		expect(router.state.location.pathname).toBe("/create/folder");
		expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
		expect(screen.queryByRole("dialog")).toBeNull();
		fireEvent.change(screen.getByRole("textbox", { name: /Folder name/ }), {
			target: { value: "Draft" },
		});
		await act(async () => {
			router.history.back();
		});
		await screen.findByRole("heading", { name: "Portfolio" });
		expect(router.state.location.href).toBe(
			"/user/artist/portfolio?sort=latest#work",
		);
		expect(state.createFolder).not.toHaveBeenCalled();
		openFolder();
		await screen.findByRole("heading", { name: "Create folder", level: 1 });
		expect(
			(screen.getByRole("textbox", { name: /Folder name/ }) as HTMLInputElement)
				.value,
		).toBe("");
	});

	it("creates a folder with trimmed values and returns to the portfolio", async () => {
		const router = await app();
		openFolder();
		await screen.findByRole("heading", { name: "Create folder", level: 1 });
		fireEvent.change(screen.getByRole("textbox", { name: /Folder name/ }), {
			target: { value: "  Sketches  " },
		});
		fireEvent.change(screen.getByRole("textbox", { name: "Description" }), {
			target: { value: "  Finished work  " },
		});
		fireEvent.click(screen.getByRole("button", { name: "Create folder" }));
		await screen.findByRole("heading", { name: "Portfolio" });
		expect(state.createFolder).toHaveBeenCalledWith({
			name: "Sketches",
			description: "Finished work",
		});
		expect(router.state.location.pathname).toBe("/user/artist/portfolio");
	});

	it("retains an unsuccessful post draft and submits it again", async () => {
		state.createPost.mockRejectedValueOnce(new Error("Please retry"));
		const router = await app();
		openPost();
		await screen.findByRole("heading", { name: "New Post", level: 1 });
		expect(router.state.location.pathname).toBe("/create/post");
		expect(screen.queryByRole("dialog")).toBeNull();
		const title = screen.getByRole("textbox", {
			name: "TITLE *",
		}) as HTMLInputElement;
		fireEvent.change(title, { target: { value: "  New artwork  " } });
		fireEvent.click(screen.getByRole("button", { name: "Create" }));
		expect((await screen.findByRole("alert")).textContent).toBe("Please retry");
		expect(title.value).toBe("  New artwork  ");
		fireEvent.click(screen.getByRole("button", { name: "Create" }));
		await screen.findByRole("heading", { name: "Portfolio" });
		expect(state.createPost).toHaveBeenCalledTimes(2);
		expect(state.createPost.mock.calls[1][0]).toMatchObject({
			title: "New artwork",
			visibility: "PUBLIC",
		});
	});

	it("blocks duplicate submissions and navigation while a post is being created", async () => {
		let finish!: (value: unknown) => void;
		state.createPost.mockImplementation(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				}),
		);
		const router = await app();
		openPost();
		await screen.findByRole("heading", { name: "New Post", level: 1 });
		fireEvent.change(screen.getByRole("textbox", { name: "TITLE *" }), {
			target: { value: "Artwork" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Create" }));
		await waitFor(() =>
			expect(
				(screen.getByRole("button", { name: "Back" }) as HTMLButtonElement)
					.disabled,
			).toBe(true),
		);
		fireEvent.submit(
			screen.getByRole("textbox", { name: "TITLE *" }).closest("form")!,
		);
		expect(state.createPost).toHaveBeenCalledTimes(1);
		expect(
			(screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
		await act(async () => {
			void router.navigate({ to: "/user/artist/portfolio" as never });
		});
		expect(router.state.location.pathname).toBe("/create/post");
		await act(async () => finish({ id: "post-1" }));
		await screen.findByRole("heading", { name: "Portfolio" });
	});

	it("keeps image previews valid when adding files and releases them on exit", async () => {
		await app();
		openPost();
		await screen.findByRole("heading", { name: "New Post", level: 1 });
		const input =
			document.querySelector<HTMLInputElement>('input[type="file"]')!;
		fireEvent.change(input, {
			target: { files: [new File(["one"], "one.png", { type: "image/png" })] },
		});
		fireEvent.change(input, {
			target: { files: [new File(["two"], "two.png", { type: "image/png" })] },
		});
		expect(screen.getAllByRole("img", { name: /Preview/ })).toHaveLength(2);
		expect(URL.revokeObjectURL).not.toHaveBeenCalled();
		fireEvent.click(screen.getAllByRole("button", { name: "Remove image" })[0]);
		expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview-1");
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
		await screen.findByRole("heading", { name: "Portfolio" });
		expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview-2");
		expect(state.upload).not.toHaveBeenCalled();
	});

	it("supports a direct page visit and a safe return URL", async () => {
		const router = await app(
			"/create/post?returnTo=https%3A%2F%2Fevil.example",
		);
		await screen.findByRole("heading", { name: "New Post", level: 1 });
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
		await screen.findByRole("heading", { name: "Portfolio" });
		expect(router.state.location.pathname).toBe("/user/artist/portfolio");
	});

	it("keeps localized page links and return paths", async () => {
		const router = await app("/pl/user/artist/portfolio", "pl");
		fireEvent.keyDown(
			screen.getByRole("button", { name: "Dodaj do portfolio" }),
			{ key: "Enter" },
		);
		fireEvent.click(screen.getByRole("menuitem", { name: "Utwórz folder" }));
		await screen.findByRole("heading", { name: "Utwórz folder", level: 1 });
		expect(router.state.location.pathname).toBe("/pl/create/folder");
		fireEvent.click(screen.getByRole("button", { name: "Anuluj" }));
		await screen.findByRole("heading", { name: "Portfolio" });
		expect(router.state.location.pathname).toBe("/pl/user/artist/portfolio");
	});

	it.each([null, { username: "client", roles: [TRoles.User] }])(
		"does not expose creation forms to an unsupported account",
		async (user) => {
			state.user = user as TUserResponse | null;
			await app("/create/folder");
			expect(screen.queryByRole("textbox")).toBeNull();
			expect(state.createFolder).not.toHaveBeenCalled();
		},
	);

	it("keeps desktop folder creation in its existing dialog", async () => {
		state.compact = false;
		const router = await app();
		openFolder();
		expect(
			await screen.findByRole("dialog", { name: "Create folder" }),
		).toBeDefined();
		expect(router.state.location.pathname).toBe("/user/artist/portfolio");
	});
});

describe("creation return URL validation", () => {
	const fallback = "/user/artist/portfolio";
	it.each([
		"https://evil.example",
		"//evil.example",
		"/create/post",
		"/user/a/portfolio/../../../create/post",
		"/user/a/portfolio\\bad",
		"/user/a/portfolio\n",
		undefined,
	])("rejects %s", (value) => {
		expect(getCreationReturnPath(value, fallback)).toBe(fallback);
	});
	it("retains a localized folder URL, search, and anchor", () => {
		const path = "/pl/user/artist/portfolio/folder/sketches?sort=new#posts";
		expect(getCreationReturnPath(path, fallback)).toBe(path);
	});
});
