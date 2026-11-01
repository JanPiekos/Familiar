import {
	type PointerEvent,
	type ReactNode,
	useLayoutEffect,
	useRef,
} from "react";

type FolderDrag = {
	id: number;
	x: number;
	y: number;
	scroll: number;
	active: boolean;
};

export function PortfolioFolderStrip({ children }: { children: ReactNode }) {
	const viewportRef = useRef<HTMLDivElement>(null);
	const rowRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const drag = useRef<FolderDrag | null>(null);
	const suppressClick = useRef(false);

	useLayoutEffect(() => {
		const viewport = viewportRef.current;
		const row = rowRef.current;
		const content = contentRef.current;
		if (!viewport || !row || !content) return;
		let frame: number | undefined;
		const rtl = getComputedStyle(row).direction === "rtl";
		const update = () => {
			frame = undefined;
			const max = Math.max(0, row.scrollWidth - row.clientWidth);
			row.dataset.overflow = String(max > 1);
			const position = Math.min(
				max,
				Math.max(0, rtl ? -row.scrollLeft : row.scrollLeft),
			);
			const fade = (hidden: number) => (hidden <= 1 ? 0 : Math.min(32, hidden));
			const start = fade(position);
			const end = fade(max - position);
			const left = rtl ? end : start;
			const right = rtl ? start : end;
			const mask =
				left || right
					? `linear-gradient(to right, transparent, #000 ${left}px, #000 calc(100% - ${right}px), transparent)`
					: "none";
			viewport.style.maskImage = mask;
			viewport.style.webkitMaskImage = mask;
		};
		const schedule = () => {
			frame ??= requestAnimationFrame(update);
		};
		const observer = new ResizeObserver(schedule);
		observer.observe(row);
		observer.observe(content);
		row.addEventListener("scroll", schedule, { passive: true });
		update();
		return () => {
			observer.disconnect();
			row.removeEventListener("scroll", schedule);
			if (frame !== undefined) cancelAnimationFrame(frame);
		};
	}, []);

	function finishDrag(event: PointerEvent<HTMLDivElement>) {
		const current = drag.current;
		if (!current || current.id !== event.pointerId) return;
		drag.current = null;
		delete event.currentTarget.dataset.dragging;
		event.currentTarget.style.removeProperty("cursor");
		if (!current.active) return;
		suppressClick.current = true;
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	}

	return (
		<div ref={viewportRef} className="relative isolate w-full min-w-0">
			{/* biome-ignore lint/a11y/useSemanticElements: This groups folder links rather than form fields. */}
			<div
				ref={rowRef}
				role="group"
				data-slot="portfolio-folder-strip"
				className="relative w-full min-w-0 overflow-x-auto overscroll-x-contain scroll-px-3 scrollbar-none select-none [@media(hover:hover)]:data-[overflow=true]:cursor-grab lg:scroll-px-0 xl:scroll-px-3"
				onPointerDown={(event) => {
					suppressClick.current = false;
					if (event.pointerType !== "mouse" || event.button !== 0) return;
					if (
						event.currentTarget.scrollWidth <=
						event.currentTarget.clientWidth + 1
					)
						return;
					drag.current = {
						id: event.pointerId,
						x: event.clientX,
						y: event.clientY,
						scroll: event.currentTarget.scrollLeft,
						active: false,
					};
				}}
				onPointerMove={(event) => {
					const current = drag.current;
					if (!current || current.id !== event.pointerId) return;
					const dx = event.clientX - current.x;
					if (!current.active) {
						if (
							Math.abs(dx) < 6 ||
							Math.abs(dx) < Math.abs(event.clientY - current.y)
						)
							return;
						current.active = true;
						event.currentTarget.dataset.dragging = "true";
						event.currentTarget.style.cursor = "grabbing";
						event.currentTarget.setPointerCapture(event.pointerId);
					}
					event.preventDefault();
					event.currentTarget.scrollLeft = current.scroll - dx;
				}}
				onPointerUp={finishDrag}
				onPointerCancel={finishDrag}
				onLostPointerCapture={finishDrag}
				onPointerLeave={(event) => {
					if (!drag.current?.active) finishDrag(event);
				}}
				onDragStart={(event) => event.preventDefault()}
				onClickCapture={(event) => {
					if (suppressClick.current && event.detail > 0) {
						event.preventDefault();
						event.stopPropagation();
					}
					suppressClick.current = false;
				}}
			>
				<div
					ref={contentRef}
					className="flex w-max min-w-full gap-4 px-3 pt-2 pb-3 *:w-46 *:shrink-0 *:cursor-inherit! lg:px-0 xl:px-3"
				>
					{children}
				</div>
			</div>
		</div>
	);
}
