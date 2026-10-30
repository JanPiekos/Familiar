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
describe("folder warning covers", () => {
it("uses the warning flags belonging to the actual folder cover, including matching media IDs", async () => {
		await show(
			<ProfilePortfolio
				username="artist"
				posts={[safe, flagged]}
				folders={[
					{
						id: "flagged-folder",
						name: "Flagged folder",
						fullSize: { id: "flagged-media", path: "/signed/flagged.png" },
					},
					{
						id: "safe-folder",
						name: "Safe folder",
						fullSize: { id: "safe-media", path: "/safe.png" },
					},
					{
						id: "unknown-folder",
						name: "Unknown folder",
						fullSize: { id: "unknown", path: "/custom.png" },
					},
					{ id: "fallback-folder", name: "Fallback folder" },
				]}
			/>,
		);
		expect(
			await within(
				screen.getByRole("link", { name: /Flagged folder/ }),
			).findByRole("region", { name: "Content warning" }),
		).toBeDefined();
		expect(
			within(screen.getByRole("link", { name: /Safe folder/ })).queryByRole(
				"region",
				{ name: "Content warning" },
			),
		).toBeNull();
		expect(
			within(screen.getByRole("link", { name: /Unknown folder/ })).getByRole(
				"region",
				{ name: "Content warning" },
			),
		).toBeDefined();
		expect(
			within(screen.getByRole("link", { name: /Fallback folder/ })).queryByRole(
				"region",
				{ name: "Content warning" },
			),
		).toBeNull();
	});
});
