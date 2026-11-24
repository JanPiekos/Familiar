import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { saveAccessibility, useAccessibility } from "@/lib/accessibility";

export function ReadingGuide() {
	const preferences = useAccessibility();
	const exit = useCallback(() => {
		saveAccessibility({ ...preferences, readingGuide: false });
	}, [preferences]);
	return preferences.readingGuide ? (
		<ActiveReadingGuide height={preferences.guideHeight} onExit={exit} />
	) : null;
}
function ActiveReadingGuide({
	height,
	onExit,
}: {
	height: number;
	onExit: () => void;
}) {
	const { t } = useTranslation();
	const [position, setPosition] = useState(() => window.innerHeight / 2);
	const latest = useRef(position);
	useEffect(() => {
		let frame = 0;
		const move = (y: number | (() => number)) => {
			if (frame) cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				const half = Math.min(height, window.innerHeight) / 2;
				latest.current = Math.max(
					half,
					Math.min(
						window.innerHeight - half,
						typeof y === "function" ? y() : y,
					),
				);
				setPosition(latest.current);
				frame = 0;
			});
		};
		const pointer = (event: PointerEvent) => move(event.clientY);
		const focus = (event: FocusEvent) => {
			if (!(event.target instanceof HTMLElement)) return;
			const target = event.target;
			move(() => {
				const rect = target.getBoundingClientRect();
				return rect.top + Math.min(rect.height / 2, height / 2);
			});
		};
		const key = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !event.defaultPrevented) onExit();
		};
		const resize = () => move(latest.current);
		window.addEventListener("pointermove", pointer, { passive: true });
		window.addEventListener("pointerdown", pointer, { passive: true });
		document.addEventListener("focusin", focus);
		document.addEventListener("keydown", key);
		window.addEventListener("resize", resize);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("pointermove", pointer);
			window.removeEventListener("pointerdown", pointer);
			document.removeEventListener("focusin", focus);
			document.removeEventListener("keydown", key);
			window.removeEventListener("resize", resize);
		};
	}, [height, onExit]);
	return (
		<div
			data-reading-guide
			className="pointer-events-none fixed inset-0 z-[2147483000]"
		>
			<div
				aria-hidden="true"
				data-guide-shade="top"
				className="absolute inset-x-0 top-0 bg-black/85"
				style={{ height: Math.max(0, position - height / 2) }}
			/>
			<div
				aria-hidden="true"
				data-guide-shade="bottom"
				className="absolute inset-x-0 bottom-0 border-t border-white/30 bg-black/85"
				style={{ top: Math.max(0, position + height / 2) }}
			/>
			<Button
				type="button"
				variant="outline"
				className="pointer-events-auto absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] min-h-10 h-auto max-w-[calc(100vw-1.5rem)] gap-2 whitespace-normal border-white/50! bg-black! px-4 py-2 text-sm text-white! shadow-lg lg:min-h-9"
				aria-label={t("accessibility.guide_exit")}
				onClick={onExit}
			>
				<X className="size-4" />
				{t("accessibility.guide_exit")}
				<span className="hidden text-xs text-white/70 sm:inline">Esc</span>
			</Button>
		</div>
	);
}
