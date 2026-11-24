import { beforeEach, describe, expect, it, vi } from "vitest";
const fetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/fetch", () => ({ apiFetch: fetchMock }));
import { getArtistPortfolioPost } from "@/api/portfolio/posts/post";
beforeEach(() => {
	fetchMock.mockReset();
});
describe("artist post attribution", () => {
	it("rejects a mismatched artist before loading misleading post details", async () => {
		fetchMock.mockResolvedValueOnce({
			content: [{ id: "someone-elses-post" }],
			last: true,
		});
		await expect(
			getArtistPortfolioPost("wrong-artist", "post-1"),
		).rejects.toThrow("Post not found");
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
	it("finds older posts across pages and then loads their details", async () => {
		fetchMock
			.mockResolvedValueOnce({
				content: [{ id: "newer-post" }],
				last: false,
				totalPages: 2,
			})
			.mockResolvedValueOnce({
				content: [{ id: "post-1" }],
				last: true,
				totalPages: 2,
			})
			.mockResolvedValueOnce({ id: "post-1", title: "Verified artwork" });
		await expect(
			getArtistPortfolioPost("real-artist", "post-1"),
		).resolves.toMatchObject({ title: "Verified artwork" });
		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			"portfolio/artists/real-artist/posts?page=1&size=100",
		);
		expect(fetchMock).toHaveBeenLastCalledWith(
			"portfolio/artists/real-artist/posts/post-1",
		);
	});
	it("opens an owner's private post using the authenticated list", async () => {
		fetchMock
			.mockResolvedValueOnce({
				content: [{ id: "post-1", visibility: "PRIVATE" }],
				last: true,
			})
			.mockResolvedValueOnce({
				id: "post-1",
				title: "Private artwork",
				visibility: "PRIVATE",
			});
		await expect(
			getArtistPortfolioPost("Artist", "post-1", "artist"),
		).resolves.toMatchObject({ visibility: "PRIVATE" });
		expect(fetchMock).toHaveBeenNthCalledWith(
			1,
			"portfolio/me/posts?page=0&size=100",
		);
		expect(fetchMock).toHaveBeenLastCalledWith(
			"portfolio/artists/Artist/posts/post-1",
		);
	});
	it("finds an older private post in the owner's later pages", async () => {
		fetchMock
			.mockResolvedValueOnce({
				content: [{ id: "newer-post" }],
				last: false,
				totalPages: 2,
			})
			.mockResolvedValueOnce({
				content: [{ id: "post-1", visibility: "PRIVATE" }],
				last: true,
				totalPages: 2,
			})
			.mockResolvedValueOnce({ id: "post-1", visibility: "PRIVATE" });
		await expect(
			getArtistPortfolioPost("artist", "post-1", "artist"),
		).resolves.toMatchObject({ visibility: "PRIVATE" });
		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			"portfolio/me/posts?page=1&size=100",
		);
	});
	it("does not attribute a visitor's private post to the requested artist", async () => {
		fetchMock.mockResolvedValueOnce({ content: [], last: true });
		await expect(
			getArtistPortfolioPost("other-artist", "post-1", "artist"),
		).rejects.toThrow("Post not found");
		expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
			"portfolio/artists/other-artist/posts?page=0&size=100",
		);
	});
	it("still rejects a post absent from the owner's portfolio", async () => {
		fetchMock.mockResolvedValueOnce({ content: [], last: true });
		await expect(
			getArtistPortfolioPost("artist", "post-1", "artist"),
		).rejects.toThrow("Post not found");
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
	it("preserves an API access denial without retrying a public endpoint", async () => {
		const forbidden = Object.assign(new Error("Forbidden"), { status: 403 });
		fetchMock
			.mockResolvedValueOnce({ content: [{ id: "post-1" }], last: true })
			.mockRejectedValueOnce(forbidden);
		await expect(
			getArtistPortfolioPost("artist", "post-1", "artist"),
		).rejects.toBe(forbidden);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});
