import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { AvatarFavicon } from "@/components/layout/profile/avatar-favicon";

const images: { src: string; onload: (() => void) | null }[] = [];
class FakeImage {
	src = "";
	onload: (() => void) | null = null;
	constructor() {
		images.push(this);
	}
}
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	images.length = 0;
});

it("replaces the current avatar, ignores stale loads, and removes its icon on unmount", async () => {
	vi.stubGlobal("Image", FakeImage);
	vi.stubGlobal(
		"fetch",
		vi
			.fn()
			.mockImplementation(
				async () =>
					new Response("<svg/>", {
						headers: { "Content-Type": "image/svg+xml" },
					}),
			),
	);
	vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:avatar");
	vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
	const drawImage = vi.fn();
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
		drawImage,
	} as never);
	vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
		"data:image/png;base64,AQID",
	);
	const view = render(<AvatarFavicon src="/api/avatar?name=One&image=first" />);
	const staleLoad = images[0].onload;
	view.rerender(<AvatarFavicon src="/api/avatar?name=Two&image=second" />);
	expect(
		document.head.querySelector('link[rel="icon"]')?.getAttribute("href"),
	).toBe("/api/avatar?name=Two&image=second");
	await act(async () => {
		staleLoad?.();
	});
	expect(drawImage).not.toHaveBeenCalled();
	await waitFor(() => expect(images[1].src).toBe("blob:avatar"));
	await act(async () => {
		images[1].onload?.();
	});
	expect(drawImage).toHaveBeenCalledWith(images[1], 0, 0, 64, 64);
	const icons =
		document.head.querySelectorAll<HTMLLinkElement>('link[rel="icon"]');
	expect(icons).toHaveLength(1);
	expect(icons[0].type).toBe("image/png");
	expect(icons[0].href).toBe("data:image/png;base64,AQID");
	view.unmount();
	expect(document.head.querySelector('link[rel="icon"]')).toBeNull();
});
