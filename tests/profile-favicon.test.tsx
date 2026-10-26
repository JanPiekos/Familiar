import { afterEach, describe, expect, it, vi } from "vitest";
import { createUploadedAvatarSvg } from "@/lib/avatar-favicon.server";

const source = "https://pub-7a6afd837dd4448eaf606c16c006f585.r2.dev/media/avatar.webp";
afterEach(() => vi.unstubAllGlobals());

describe("uploaded avatar favicons", () => {
    it("embeds the image with a circular clip, opaque background, and centered crop", async () => {
        const bytes = new Uint8Array([1, 2, 3]);
        const fetchImage = vi.fn().mockResolvedValue(new Response(bytes, { headers: { "Content-Type": "image/webp" } }));
        vi.stubGlobal("fetch", fetchImage);
        const svg = new DOMParser().parseFromString(await createUploadedAvatarSvg(source, 64), "image/svg+xml");
        expect(svg.querySelector("parsererror")).toBeNull();
        expect(svg.querySelector("g")?.getAttribute("clip-path")).toBe("url(#avatar-circle)");
        expect(svg.querySelector("clipPath circle")?.getAttribute("r")).toBe("32");
        expect(svg.querySelector("g")?.firstElementChild?.getAttribute("fill")).toBe("#ffffff");
        expect(svg.querySelector("image")?.getAttribute("href")).toBe("data:image/webp;base64,AQID");
        expect(svg.querySelector("image")?.getAttribute("preserveAspectRatio")).toBe("xMidYMid slice");
        expect(fetchImage).toHaveBeenCalledWith(new URL(source), expect.objectContaining({ redirect: "error" }));
    });

    it.each(["http://127.0.0.1/private", "https://evil.example/media/avatar.png", "https://pub-7a6afd837dd4448eaf606c16c006f585.r2.dev/other/file", "https://user:pass@pub-7a6afd837dd4448eaf606c16c006f585.r2.dev/media/a.png"])("rejects an unapproved image URL: %s", async (url) => {
        const fetchImage = vi.fn();
        vi.stubGlobal("fetch", fetchImage);
        await expect(createUploadedAvatarSvg(url, 64)).rejects.toThrow("Unsupported avatar source");
        expect(fetchImage).not.toHaveBeenCalled();
    });

    it.each(["text/html", "image/svg+xml"])("rejects active content: %s", async (type) => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<script/>", { headers: { "Content-Type": type } })));
        await expect(createUploadedAvatarSvg(source, 64)).rejects.toThrow("Unsupported avatar image");
    });

    it("bounds image downloads even when Content-Length is absent", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Uint8Array(5 * 1024 * 1024 + 1), { headers: { "Content-Type": "image/png" } })));
        await expect(createUploadedAvatarSvg(source, 64)).rejects.toThrow("Avatar image too large");
    });
});
