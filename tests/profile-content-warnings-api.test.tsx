import { beforeEach, describe, expect, it, vi } from "vitest";
const fetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/fetch", () => ({ apiFetch: fetchMock }));
import {
	createPortfolioPost,
	getMyPortfolioPosts,
	getArtistPortfolioPosts,
	getArtistCatalogPosts,
	getPortfolioPost,
	getArtistPortfolioPost,
	updatePortfolioPost,
} from "@/api/portfolio/posts/post";
import { normalizePortfolioPost } from "@/api/portfolio/posts/normalize-post";
const tags = [
	{ id: "general", name: "Fantasy", hasContentWarning: false },
	{ id: "warning", name: "Violence", hasContentWarning: true },
];
const raw = { id: "post-1", tags, images: [], catalogIds: ["folder-1"] };
beforeEach(() => fetchMock.mockReset());
describe("portfolio warning API mapping", () => {
	it.each([
		() => getMyPortfolioPosts(),
		() => getArtistPortfolioPosts("artist"),
		() => getArtistCatalogPosts("artist", "folder-1"),
	])(
		"derives warning labels from tag flags in list responses",
		async (read) => {
			fetchMock.mockResolvedValue({
				content: [raw],
				last: true,
				totalElements: 1,
			});
			const page = await read();
			expect(page.content?.[0]).toMatchObject({
				tags: ["Fantasy", "Violence"],
				tagIds: ["general", "warning"],
				contentWarnings: ["Violence"],
			});
			expect(page.last).toBe(true);
		},
	);
	it("normalizes single-post and verified artist detail responses", async () => {
		fetchMock.mockResolvedValueOnce(raw);
		expect(await getPortfolioPost("post-1")).toMatchObject({
			contentWarnings: ["Violence"],
		});
		fetchMock
			.mockResolvedValueOnce({ content: [raw], last: true })
			.mockResolvedValueOnce(raw);
		expect(await getArtistPortfolioPost("artist", "post-1")).toMatchObject({
			contentWarnings: ["Violence"],
		});
	});
	it("saves warning UUIDs through the supported tagIds field", async () => {
		fetchMock.mockResolvedValue(raw);
		const request = { title: "Artwork", tagIds: ["general", "warning"] };
		expect(await createPortfolioPost(request)).toMatchObject({
			contentWarnings: ["Violence"],
		});
		expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(request);
		expect(
			await updatePortfolioPost("post-1", { tagIds: ["general", "warning"] }),
		).toMatchObject({ contentWarnings: ["Violence"] });
		expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
			tagIds: ["general", "warning"],
		});
	});
	it("keeps legacy warnings and remains stable when normalized again", () => {
		const post = normalizePortfolioPost({
			...raw,
			contentWarnings: ["Violence", "Flashing"],
		});
		expect(post.contentWarnings).toEqual(["Violence", "Flashing"]);
		expect(normalizePortfolioPost(post)).toEqual(post);
	});
	it("keeps ordinary or missing tags unflagged", () => {
		expect(normalizePortfolioPost({ id: "empty" }).contentWarnings).toEqual([]);
		expect(
			normalizePortfolioPost({
				tags: [{ id: "general", name: "Fantasy", hasContentWarning: false }],
			}).contentWarnings,
		).toEqual([]);
	});
});
