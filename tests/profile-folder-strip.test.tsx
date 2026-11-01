import { afterEach, beforeEach, expect, it, vi } from "vitest";
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
	vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
		setTimeout(() => callback(0), 0),
	);
	vi.stubGlobal("cancelAnimationFrame", clearTimeout);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

it("fades only the hidden edges after scrolling, resizing, and filtering folders", async () => {
	function Folders({ count }: { count: number }) {
		return (
			<PortfolioFolderStrip>
				{Array.from({ length: count }, (_, index) => (
					<a key={index} href={`/folder/${index}`}>
						Folder {index + 1}
					</a>
				))}
			</PortfolioFolderStrip>
		);
	}
	const { container, rerender } = render(<Folders count={6} />);
	const row = container.querySelector<HTMLDivElement>(
		'[data-slot="scroll-shadow"]',
	)!;
	let width = 800;
	let contentWidth = 1240;
	Object.defineProperties(row, {
		clientWidth: { get: () => width },
		scrollWidth: { get: () => contentWidth },
	});
	act(() => resize([], {} as ResizeObserver));
	await waitFor(() => {
		expect(row.dataset.rightScroll).toBe("true");
		expect(row.dataset.leftScroll).toBe("false");
	});
	// These measured fades must also work when CSS scroll animations are disabled.
	expect(row.dataset.scrollShadowMode).toBe("manual");
	row.scrollLeft = 208;
	fireEvent.scroll(row);
	await waitFor(() => expect(row.dataset.leftRightScroll).toBe("true"));

	row.scrollLeft = contentWidth - width;
	fireEvent.scroll(row);
	await waitFor(() => {
		expect(row.dataset.leftScroll).toBe("true");
		expect(row.dataset.rightScroll).toBe("false");
		expect(row.dataset.leftRightScroll).toBeUndefined();
	});

	width = contentWidth;
	row.scrollLeft = 0;
	act(() => resize([], {} as ResizeObserver));
	await waitFor(() => {
		expect(row.dataset.leftScroll).toBe("false");
		expect(row.dataset.rightScroll).toBe("false");
	});
	width = 390;
	act(() => resize([], {} as ResizeObserver));
	await waitFor(() => expect(row.dataset.rightScroll).toBe("true"));

	contentWidth = 192;
	rerender(<Folders count={1} />);
	await waitFor(() => expect(row.dataset.rightScroll).toBe("false"));
	expect(
		screen.getByRole("link", { name: "Folder 1" }).getAttribute("href"),
	).toBe("/folder/0");
});
