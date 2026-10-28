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
	createRootRoute,
	createRoute,
	createRouter,
	createMemoryHistory,
	RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import en from "@/i18n/en";
import pl from "@/i18n/pl";
const state = vi.hoisted(() => ({ update: vi.fn(), tags: vi.fn() }));
vi.mock("@/api/commisions/index", () => ({ getTags: () => state.tags() }));
vi.mock("@/hooks/ui/use-mobile", () => ({
	useIsMobile: () => false,
	useIsTablet: () => false,
}));
vi.mock("@/hooks/portfolio/use-portfolio", async () => {
	const { useMutation } = await import("@tanstack/react-query");
	return {
		useUpdatePortfolioPost: () => useMutation({ mutationFn: state.update }),
		useUpdateCatalog: () => ({ mutateAsync: vi.fn(), isPending: false }),
		useDeleteCatalog: () => ({ mutateAsync: vi.fn(), isPending: false }),
		useAddPortfolioPostToCatalog: () => ({
			mutateAsync: vi.fn(),
			isPending: false,
		}),
		useRemovePortfolioPostFromCatalog: () => ({
			mutateAsync: vi.fn(),
			isPending: false,
		}),
	};
});
vi.mock("@/components/layout/filter-bar", () => ({ FilterBar: () => null }));
vi.mock("@/components/layout/profile/feed/profile-feed", () => ({
	ProfileFeed: () => null,
}));
import { ContentWarningOverlay } from "@/components/layout/content-warning-overlay";
import { PortfolioFeedItem } from "@/components/layout/feed/item";
import { ProfilePortfolio } from "@/components/layout/profile/feed/portfolio";
import { PostWarningsDialog } from "@/components/layout/modal/portfolio-post/post-warnings-dialog";
import { normalizePortfolioPost } from "@/api/portfolio/posts/normalize-post";
const tag = {
	id: "warning",
	name: "Violence",
	hasContentWarning: true,
	isAdultOnly: false,
	isActive: true,
	createdAt: "",
	updatedAt: "",
};
const flagged = normalizePortfolioPost({
	id: "flagged",
	title: "Flagged art",
	tags: [tag],
	catalogIds: [
		"flagged-folder",
		"safe-folder",
		"unknown-folder",
		"fallback-folder",
	],
	images: [
		{
			id: "image",
			mediaType: "IMAGE",
			fullSize: { id: "flagged-media", path: "/flagged.png" },
		},
	],
});
const safe = normalizePortfolioPost({
	id: "safe",
	title: "Safe art",
	tags: [],
	catalogIds: flagged.catalogIds,
	images: [
		{
			id: "safe-image",
			mediaType: "IMAGE",
			fullSize: { id: "safe-media", path: "/safe.png" },
		},
	],
});
const clients: QueryClient[] = [];
beforeEach(() => {
	state.update.mockReset().mockResolvedValue(flagged);
	state.tags.mockReset().mockResolvedValue([tag]);
	window.scrollTo = vi.fn();
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	);
});
afterEach(() => {
	cleanup();
	clients.forEach((c) => c.clear());
	clients.length = 0;
	vi.unstubAllGlobals();
});
async function show(content: React.ReactNode, locale = "en") {
	const i18n = createInstance();
	await i18n.init({
		lng: locale,
		fallbackLng: "en",
		resources: { en: { translation: en }, pl: { translation: pl } },
		interpolation: { escapeValue: false },
	});
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	clients.push(client);
	const root = createRootRoute({ component: () => content });
	const route = createRoute({ getParentRoute: () => root, path: "/" });
	const router = createRouter({
		routeTree: root.addChildren([route]),
		history: createMemoryHistory({ initialEntries: ["/"] }),
		defaultPendingMinMs: 0,
	});
	render(
		<QueryClientProvider client={client}>
			<I18nextProvider i18n={i18n}>
				<RouterProvider router={router as never} />
			</I18nextProvider>
		</QueryClientProvider>,
	);
	await act(async () => {
		await router.load();
	});
	return { i18n, client };
}
describe("warning covers", () => {
	it("covers flagged post tiles and opens the post through its warning", async () => {
		const open = vi.fn();
		await show(
			<PortfolioFeedItem
				p={{
					id: "flagged",
					widthUnit: 1,
					heightUnit: 1,
					cover: { path: "/flagged.png", width: 300, height: 300, alt: "" },
				}}
				post={{ ...flagged, images: [...flagged.images!, ...flagged.images!] }}
				style={{ width: 300, height: 300 }}
				isOwner={false}
				handlePostClick={open}
			/>,
		);
		const warning = await screen.findByRole("button", {
			name: "Open post with sensitive content",
		});
		expect(screen.queryByRole("img", { name: "Flagged art" })).toBeNull();
		expect(document.querySelector("[inert]")).not.toBeNull();
		expect(
			screen.queryByRole("button", { name: "View post: Flagged art" }),
		).toBeNull();
		fireEvent.click(warning);
		expect(open).toHaveBeenCalledWith("flagged");
	});
	it("reveals and hides media only on request, and covers it again for changed warnings", async () => {
		const { i18n } = await show(
			<ContentWarningOverlay warnings={["Violence"]}>
				<img src="/art.png" alt="Artwork" />
			</ContentWarningOverlay>,
		);
		expect(screen.queryByRole("img", { name: "Artwork" })).toBeNull();
		fireEvent.click(await screen.findByRole("button", { name: "Show" }));
		expect(screen.getByRole("img", { name: "Artwork" })).toBeDefined();
		fireEvent.click(
			screen.getByRole("button", { name: "Hide sensitive content" }),
		);
		expect(screen.queryByRole("img", { name: "Artwork" })).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Show" }));
		cleanup();
		// Exercise a warning change without changing the component identity.
		const v = render(
			<I18nextProvider i18n={i18n}>
				<ContentWarningOverlay warnings={["Violence"]}>
					<img src="/art.png" alt="Artwork" />
				</ContentWarningOverlay>
			</I18nextProvider>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Show" }));
		v.rerender(
			<I18nextProvider i18n={i18n}>
				<ContentWarningOverlay warnings={["Flashing"]}>
					<img src="/art.png" alt="Artwork" />
				</ContentWarningOverlay>
			</I18nextProvider>,
		);
		expect(screen.queryByRole("img", { name: "Artwork" })).toBeNull();
		expect(screen.getByText("Flashing")).toBeDefined();
	});
});
describe("editing post warnings", () => {
	it("preserves ordinary tags while saving selected warnings for an existing post", async () => {
		const close = vi.fn();
		const post = normalizePortfolioPost({
			id: "old",
			tags: [{ id: "general", name: "Fantasy", hasContentWarning: false }],
		});
		await show(<PostWarningsDialog post={post} onOpenChange={close} />);
		fireEvent.click(await screen.findByRole("checkbox", { name: "Violence" }));
		fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
		await waitFor(() =>
			expect(state.update.mock.calls[0]?.[0]).toEqual({
				postId: "old",
				data: { tagIds: ["general", "warning"] },
			}),
		);
		expect(close).toHaveBeenCalledWith(false);
	});
	it("can remove warnings without removing ordinary tags", async () => {
		const post = normalizePortfolioPost({
			id: "old",
			tags: [{ id: "general", name: "Fantasy", hasContentWarning: false }, tag],
		});
		await show(<PostWarningsDialog post={post} onOpenChange={vi.fn()} />);
		fireEvent.click(await screen.findByRole("checkbox", { name: "Violence" }));
		fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
		await waitFor(() =>
			expect(state.update.mock.calls[0]?.[0]).toEqual({
				postId: "old",
				data: { tagIds: ["general"] },
			}),
		);
	});
	it("retains a failed selection for retry and localizes the dialog", async () => {
		state.update.mockRejectedValueOnce(new Error("Unavailable"));
		const close = vi.fn();
		await show(
			<PostWarningsDialog
				post={{ id: "old", tagIds: [] }}
				onOpenChange={close}
			/>,
			"pl",
		);
		fireEvent.click(await screen.findByRole("checkbox", { name: "Violence" }));
		fireEvent.click(screen.getByRole("button", { name: "Zapisz zmiany" }));
		expect(await screen.findByRole("alert")).toBeDefined();
		expect(
			screen
				.getByRole("checkbox", { name: "Violence" })
				.getAttribute("aria-checked"),
		).toBe("true");
		expect(close).not.toHaveBeenCalled();
	});

	it("blocks duplicate saves and dismissal while warnings are being saved", async () => {
		let finish!: () => void;
		state.update.mockImplementationOnce(
			() =>
				new Promise<void>((resolve) => {
					finish = resolve;
				}),
		);
		const close = vi.fn();
		await show(
			<PostWarningsDialog
				post={{ id: "old", tagIds: [] }}
				onOpenChange={close}
			/>,
		);
		fireEvent.click(await screen.findByRole("checkbox", { name: "Violence" }));
		fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
		await waitFor(() =>
			expect(
				(screen.getByRole("button", { name: "Close" }) as HTMLButtonElement)
					.disabled,
			).toBe(true),
		);
		fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
		fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
		expect(state.update).toHaveBeenCalledTimes(1);
		expect(close).not.toHaveBeenCalled();
		await act(async () => finish());
		await waitFor(() => expect(close).toHaveBeenCalledWith(false));
	});
});
