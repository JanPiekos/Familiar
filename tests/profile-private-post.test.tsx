import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/fetch", () => ({ apiFetch: fetchMock }));
import {
	artistPortfolioPostQueryOptions,
	useArtistPortfolioPost,
} from "@/hooks/portfolio/use-portfolio";

const owner = { userId: "owner-id", username: "artist" };
const privatePost = {
	id: "post-1",
	title: "Private artwork",
	visibility: "PRIVATE" as const,
};
const clients: QueryClient[] = [];

function setup() {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	clients.push(client);
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
	return { client, wrapper };
}

beforeEach(() => {
	fetchMock.mockReset();
});
afterEach(() => {
	cleanup();
	for (const client of clients) client.clear();
	clients.length = 0;
});

describe("private post queries", () => {
	it("waits for authentication before checking the owner's direct link", async () => {
		const { wrapper } = setup();
		fetchMock
			.mockResolvedValueOnce({ content: [privatePost], last: true })
			.mockResolvedValueOnce(privatePost);
		const { result, rerender } = renderHook(
			({ enabled }) =>
				useArtistPortfolioPost("artist", "post-1", { viewer: owner, enabled }),
			{ wrapper, initialProps: { enabled: false } },
		);
		expect(fetchMock).not.toHaveBeenCalled();
		rerender({ enabled: true });
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.visibility).toBe("PRIVATE");
		expect(fetchMock).toHaveBeenNthCalledWith(
			1,
			"portfolio/me/posts?page=0&size=100",
		);
	});

	it.each([
		["signing out", null],
		["switching accounts", { userId: "visitor-id", username: "visitor" }],
	])("does not reuse the private result after %s", async (_, viewer) => {
		const { client, wrapper } = setup();
		client.setQueryData(
			artistPortfolioPostQueryOptions("artist", "post-1", owner).queryKey,
			privatePost,
		);
		// The public list does not contain the private post.
		fetchMock.mockImplementation(async (path: string) => {
			if (path.startsWith("portfolio/me/posts?"))
				return { content: [privatePost], last: true };
			if (path.includes("/posts?")) return { content: [], last: true };
			return privatePost;
		});
		const { result, rerender } = renderHook(
			({ viewer }) => useArtistPortfolioPost("artist", "post-1", { viewer }),
			{ wrapper, initialProps: { viewer: owner as typeof owner | null } },
		);
		expect(result.current.data?.title).toBe("Private artwork");
		rerender({ viewer });
		expect(result.current.data).toBeUndefined();
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.data).toBeUndefined();
		expect(
			client.getQueryData(
				artistPortfolioPostQueryOptions("artist", "post-1").queryKey,
			),
		).toBeUndefined();
	});

	it("keeps separate owner caches for different account IDs", () => {
		const { client } = setup();
		client.setQueryData(
			artistPortfolioPostQueryOptions("artist", "post-1", owner).queryKey,
			privatePost,
		);
		const otherAccount = { ...owner, userId: "different-account-id" };
		expect(
			client.getQueryData(
				artistPortfolioPostQueryOptions("artist", "post-1", otherAccount)
					.queryKey,
			),
		).toBeUndefined();
	});

	it("does not expose cached owner data while authentication is pending", () => {
		const { client, wrapper } = setup();
		client.setQueryData(
			artistPortfolioPostQueryOptions("artist", "post-1", owner).queryKey,
			privatePost,
		);
		const { result } = renderHook(
			() =>
				useArtistPortfolioPost("artist", "post-1", {
					viewer: owner,
					enabled: false,
				}),
			{ wrapper },
		);
		expect(result.current.data).toBeUndefined();
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
