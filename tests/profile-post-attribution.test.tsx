import {beforeEach, describe, expect, it, vi} from "vitest";
const fetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/fetch", () => ({ apiFetch: fetchMock }));
import {getArtistPortfolioPost} from "@/api/portfolio/posts/post";
beforeEach(() => fetchMock.mockReset());
describe("artist post attribution", () => {
 it("rejects a mismatched artist before loading misleading post details", async () => {
  fetchMock.mockResolvedValueOnce({ content: [{id: "someone-elses-post"}], last: true });
  await expect(getArtistPortfolioPost("wrong-artist", "post-1")).rejects.toThrow("Post not found");
  expect(fetchMock).toHaveBeenCalledTimes(1);
 });
 it("finds older posts across pages and then loads their details", async () => {
  fetchMock.mockResolvedValueOnce({content:[{id:"newer-post"}],last:false,totalPages:2})
   .mockResolvedValueOnce({content:[{id:"post-1"}],last:true,totalPages:2})
   .mockResolvedValueOnce({id:"post-1", title:"Verified artwork"});
  await expect(getArtistPortfolioPost("real-artist", "post-1")).resolves.toMatchObject({title:"Verified artwork"});
  expect(fetchMock).toHaveBeenNthCalledWith(2,"portfolio/artists/real-artist/posts?page=1&size=100");
  expect(fetchMock).toHaveBeenLastCalledWith("portfolio/artists/real-artist/posts/post-1");
 });
});
