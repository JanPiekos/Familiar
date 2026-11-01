import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { MouseEvent } from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { PortfolioFolderStrip } from "@/components/layout/profile/feed/folder-strip";

let resize: ResizeObserverCallback;
beforeEach(() => {
	vi.stubGlobal(
		"ResizeObserver",
		class {
			constructor(callback: ResizeObserverCallback) {
				resize = callback;
			}
			observe() {}
			disconnect() {}
		},
	);
	vi.stubGlobal(
		"PointerEvent",
		class extends MouseEvent {
			pointerId: number;
			pointerType: string;
			constructor(type: string, options: PointerEventInit = {}) {
				super(type, options);
				this.pointerId = options.pointerId ?? 1;
				this.pointerType = options.pointerType ?? "mouse";
			}
		},
	);
	vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
		setTimeout(() => callback(0), 0),
	);
	vi.stubGlobal("cancelAnimationFrame", clearTimeout);
});
afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function setup() {
	const open = vi.fn((event: MouseEvent) => event.preventDefault());
	const { container, rerender } = render(
		<PortfolioFolderStrip>
			<a href="/folder/1" onClick={open}>
				Folder 1
			</a>
		</PortfolioFolderStrip>,
	);
	const row = container.querySelector<HTMLDivElement>(
		'[data-slot="portfolio-folder-strip"]',
	)!;
	const metrics = { width: 800, contentWidth: 1208 };
	Object.defineProperties(row, {
		clientWidth: { get: () => metrics.width },
		scrollWidth: { get: () => metrics.contentWidth },
	});
	// jsdom rejects mask gradients with calc(); real browser checks cover CSS parsing.
	Object.defineProperties(row.style, {
		maskImage: { value: "none", writable: true },
		webkitMaskImage: { value: "none", writable: true },
	});
	row.setPointerCapture = vi.fn();
	row.releasePointerCapture = vi.fn();
	row.hasPointerCapture = () => true;
	act(() => resize([], {} as ResizeObserver));
	const scroll = (left: number) => {
		row.scrollLeft = left;
		fireEvent.scroll(row);
	};
	const fades = () =>
		(row.style.maskImage.match(/[\d.]+px/g) ?? []).map(parseFloat);
	return {
		row,
		link: screen.getByRole("link"),
		open,
		metrics,
		scroll,
		fades,
		rerender,
	};
}

it("grows each fade only as far as the hidden content and clears it at the reached edge", async () => {
	const { row, scroll, fades } = setup();
	await waitFor(() => expect(fades()).toEqual([0, 32]));
	scroll(2);
	await waitFor(() => expect(fades()).toEqual([2, 32]));
	scroll(200);
	await waitFor(() => expect(fades()).toEqual([32, 32]));
	scroll(406);
	await waitFor(() => expect(fades()).toEqual([32, 2]));
	scroll(408);
	await waitFor(() => expect(fades()).toEqual([32, 0]));
	// Browser overscroll and fractional pixels must not leave a stale fade.
	scroll(420);
	await waitFor(() => expect(fades()).toEqual([32, 0]));
	scroll(-0.5);
	await waitFor(() => expect(fades()).toEqual([0, 32]));
	scroll(-20);
	await waitFor(() => expect(fades()).toEqual([0, 32]));
	expect(row.style.webkitMaskImage).toBe(row.style.maskImage);
});

it("refreshes fades when the viewport or folder content resizes", async () => {
	const { row, metrics, scroll, fades, rerender } = setup();
	await waitFor(() => expect(fades()).toEqual([0, 32]));
	metrics.width = 1208;
	act(() => resize([], {} as ResizeObserver));
	await waitFor(() => expect(row.style.maskImage).toBe("none"));
	metrics.width = 390;
	act(() => resize([], {} as ResizeObserver));
	await waitFor(() => expect(fades()).toEqual([0, 32]));
	scroll(818);
	metrics.contentWidth = 184;
	scroll(0);
	rerender(
		<PortfolioFolderStrip>
			<a href="/folder/1">Folder 1</a>
		</PortfolioFolderStrip>,
	);
	act(() => resize([], {} as ResizeObserver));
	await waitFor(() => expect(row.style.maskImage).toBe("none"));
	expect(row.dataset.overflow).toBe("false");
});

it("drags with a mouse, releases capture, and suppresses only the click caused by dragging", () => {
	const { row, link, open } = setup();
	fireEvent.pointerDown(link, { clientX: 500, clientY: 100, button: 0 });
	fireEvent.pointerMove(row, { clientX: 260, clientY: 102 });
	expect(row.scrollLeft).toBe(240);
	expect(row.dataset.dragging).toBe("true");
	expect(row.setPointerCapture).toHaveBeenCalledWith(1);
	fireEvent.pointerUp(row);
	expect(row.dataset.dragging).toBeUndefined();
	expect(row.releasePointerCapture).toHaveBeenCalledWith(1);
	fireEvent.click(link, { detail: 1 });
	expect(open).not.toHaveBeenCalled();
	// A small hand movement remains a regular folder click.
	fireEvent.pointerDown(link, { clientX: 300, clientY: 100, button: 0 });
	fireEvent.pointerMove(row, { clientX: 297, clientY: 102 });
	fireEvent.pointerUp(link);
	fireEvent.click(link, { detail: 1 });
	expect(open).toHaveBeenCalledTimes(1);
});

it("cleans up cancelled drags without blocking keyboard activation", () => {
	const { row, link, open } = setup();
	fireEvent.pointerDown(link, { clientX: 500, clientY: 100 });
	fireEvent.pointerMove(row, { clientX: 260, clientY: 100 });
	fireEvent.pointerCancel(row);
	expect(row.dataset.dragging).toBeUndefined();
	fireEvent.click(link, { detail: 0 });
	expect(open).toHaveBeenCalledTimes(1);
});

it("preserves native touch scrolling, vertical gestures, and secondary clicks", () => {
	const { row, link } = setup();
	for (const options of [
		{ pointerType: "touch", button: 0 },
		{ pointerType: "mouse", button: 2 },
	]) {
		fireEvent.pointerDown(link, { ...options, clientX: 500, clientY: 100 });
		expect(
			fireEvent.pointerMove(row, { ...options, clientX: 260, clientY: 100 }),
		).toBe(true);
		fireEvent.pointerUp(row, options);
	}
	fireEvent.pointerDown(link, { clientX: 500, clientY: 100 });
	fireEvent.pointerMove(row, { clientX: 490, clientY: 180 });
	fireEvent.pointerUp(row);
	expect(row.scrollLeft).toBe(0);
	expect(row.setPointerCapture).not.toHaveBeenCalled();
});
