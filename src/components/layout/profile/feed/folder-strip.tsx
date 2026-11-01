import {
	type PointerEvent,
	type ReactNode,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
	OutlineChevronLeft,
	OutlineChevronRight,
} from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import "./folder-strip.css";

type FolderDrag = {
	id: number;
	x: number;
	y: number;
	scroll: number;
	active: boolean;
};

export function PortfolioFolderStrip({
	children,
	showControls = true,
}: {
	children: ReactNode;
	showControls?: boolean;
}) {
	const { t } = useTranslation();
	const id = useId();
	const viewportRef = useRef<HTMLDivElement>(null);
	const rowRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const leftButtonRef = useRef<HTMLButtonElement>(null);
	const rightButtonRef = useRef<HTMLButtonElement>(null);
	const [canScroll, setCanScroll] = useState({ left: false, right: false });
	const drag = useRef<FolderDrag | null>(null);
	const suppressClick = useRef(false);

	useLayoutEffect(() => {
		const viewport = viewportRef.current;
		const row = rowRef.current;
		const content = contentRef.current;
		if (!viewport || !row || !content) return;
		let frame: number | undefined;
		let previousEdges = "";
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
			viewport.style.setProperty("--folder-fade-left", `${left}px`);
			viewport.style.setProperty("--folder-fade-right", `${right}px`);
			const edges = `${left > 0}:${right > 0}`;
			if (edges !== previousEdges) {
				previousEdges = edges;
				if (!left && document.activeElement === leftButtonRef.current) {
					(
						content.children[
							rtl ? content.children.length - 1 : 0
						] as HTMLElement
					)?.focus({ preventScroll: true });
				}
				if (!right && document.activeElement === rightButtonRef.current) {
					(
						content.children[
							rtl ? 0 : content.children.length - 1
						] as HTMLElement
					)?.focus({ preventScroll: true });
				}
				setCanScroll({ left: left > 0, right: right > 0 });
			}
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

	function scrollFolder(direction: -1 | 1) {
		const row = rowRef.current;
		const content = contentRef.current;
		const first = content?.firstElementChild;
		if (!row || !content || !first) return;
		const step =
			first.getBoundingClientRect().width +
			(parseFloat(getComputedStyle(content).columnGap) || 0);
		const reducedMotion =
			window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
			document.documentElement.dataset.a11yReduceMotion === "true";
		row.scrollBy({
			left: direction * step,
			behavior: reducedMotion ? "instant" : "smooth",
		});
	}

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
		<div
			ref={viewportRef}
			className="relative isolate w-full min-w-0"
			style={{ maskImage: "none", WebkitMaskImage: "none" }}
		>
			{/* biome-ignore lint/a11y/useSemanticElements: This groups folder links rather than form fields. */}
			<div
				ref={rowRef}
				id={id}
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
			<div
				aria-hidden="true"
				data-slot="folder-edge-fade"
				data-edge="left"
				className="pointer-events-none absolute inset-y-0 left-0 z-30 w-[var(--folder-fade-left,0px)] bg-linear-to-r from-background to-transparent"
			/>
			<div
				aria-hidden="true"
				data-slot="folder-edge-fade"
				data-edge="right"
				className="pointer-events-none absolute inset-y-0 right-0 z-30 w-[var(--folder-fade-right,0px)] bg-linear-to-l from-background to-transparent"
			/>
			<div className="pointer-events-none absolute inset-x-0 top-1/2 z-40 flex -translate-y-1/2 items-center justify-between lg:-inset-x-3">
				{showControls && (
					<div
						className="portfolio-folder-arrow"
						data-visible={canScroll.left}
						aria-hidden={!canScroll.left}
					>
						<Button
							ref={leftButtonRef}
							type="button"
							variant="outline"
							size="icon-xl"
							disabled={!canScroll.left}
							tabIndex={canScroll.left ? 0 : -1}
							className="pointer-events-auto bg-background shadow-sm hover:bg-muted focus-visible:bg-muted active:translate-y-0! disabled:opacity-100 lg:size-9 dark:bg-background dark:hover:bg-muted"
							aria-label={t(
								"components.portfolio.folder.scroll_left",
								"Scroll folders left",
							)}
							aria-controls={id}
							onClick={() => scrollFolder(-1)}
						>
							<OutlineChevronLeft aria-hidden="true" />
						</Button>
					</div>
				)}
				{showControls && (
					<div
						className="portfolio-folder-arrow ml-auto"
						data-visible={canScroll.right}
						aria-hidden={!canScroll.right}
					>
						<Button
							ref={rightButtonRef}
							type="button"
							variant="outline"
							size="icon-xl"
							disabled={!canScroll.right}
							tabIndex={canScroll.right ? 0 : -1}
							className="pointer-events-auto bg-background shadow-sm hover:bg-muted focus-visible:bg-muted active:translate-y-0! disabled:opacity-100 lg:size-9 dark:bg-background dark:hover:bg-muted"
							aria-label={t(
								"components.portfolio.folder.scroll_right",
								"Scroll folders right",
							)}
							aria-controls={id}
							onClick={() => scrollFolder(1)}
						>
							<OutlineChevronRight aria-hidden="true" />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
