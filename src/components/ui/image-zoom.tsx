import { Dialog as DialogPrimitive } from "radix-ui";
import {
	type CSSProperties,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { OutlineClose } from "@/components/icons/icons";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
	Dialog,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
} from "./dialog";
import "./image-zoom.css";

function measureFrame(
	button: HTMLButtonElement,
	circle: boolean,
	loadedImage?: HTMLImageElement,
) {
	const image = button.querySelector("img");
	const intrinsicImage = loadedImage?.naturalWidth ? loadedImage : image;
	const bounds = (image ?? button).getBoundingClientRect();
	let { x, y, width, height } = bounds;
	const ratio = circle
		? 1
		: intrinsicImage?.naturalWidth && intrinsicImage.naturalHeight
			? intrinsicImage.naturalWidth / intrinsicImage.naturalHeight
			: Math.max(1, width) / Math.max(1, height);
	// An object-contain image's element includes the surrounding letterbox space.
	if (image && getComputedStyle(image).objectFit === "contain") {
		const fittedWidth = Math.min(width, height * ratio);
		const fittedHeight = fittedWidth / ratio;
		x += (width - fittedWidth) / 2;
		y += (height - fittedHeight) / 2;
		width = fittedWidth;
		height = fittedHeight;
	}
	const targetWidth = Math.max(
		1,
		Math.min(
			window.innerWidth - 32,
			Math.max(1, window.innerHeight - 112) * ratio,
			circle ? 512 : Infinity,
		),
	);
	const targetHeight = targetWidth / ratio;
	return {
		ratio,
		style: {
			"--zoom-translate-x": `${x + width / 2 - window.innerWidth / 2}px`,
			"--zoom-translate-y": `${y + height / 2 - window.innerHeight / 2}px`,
			// Uniform scaling keeps cropped covers from stretching as they open.
			"--zoom-scale": Math.max(
				0.001,
				Math.min(width / targetWidth, height / targetHeight),
			),
			"--zoom-x": `${(window.innerWidth - targetWidth) / 2}px`,
			"--zoom-y": `${(window.innerHeight - targetHeight) / 2}px`,
			"--zoom-width": `${targetWidth}px`,
			"--zoom-height": `${targetHeight}px`,
			"--zoom-radius": circle ? "50%" : "0px",
		} as CSSProperties,
	};
}

/** Enlarges the displayed image from its actual on-screen frame and back. */
export function ImageZoom({
	src,
	alt,
	children,
	className,
	circle = false,
}: {
	src?: string | null;
	alt: string;
	children: ReactNode;
	className?: string;
	circle?: boolean;
}) {
	const { t } = useTranslation();
	const trigger = useRef<HTMLButtonElement>(null);
	const enlargedImage = useRef<HTMLImageElement>(null);
	const [open, setOpen] = useState(false);
	const [failed, setFailed] = useState(false);
	const [frame, setFrame] = useState<CSSProperties>();
	const frameRatio = useRef(0);
	const updateFrame = useCallback(
		(loadedImage?: HTMLImageElement) => {
			if (!trigger.current) return;
			const nextFrame = measureFrame(
				trigger.current,
				circle,
				loadedImage ?? enlargedImage.current ?? undefined,
			);
			frameRatio.current = nextFrame.ratio;
			setFrame(nextFrame.style);
		},
		[circle],
	);
	const onOpenChange = (next: boolean) => {
		updateFrame();
		if (next) setFailed(false);
		setOpen(next);
	};
	useEffect(() => {
		if (!open) return;
		let pendingFrame = 0;
		const resize = () => {
			if (pendingFrame) return;
			pendingFrame = requestAnimationFrame(() => {
				pendingFrame = 0;
				updateFrame();
			});
		};
		window.addEventListener("resize", resize);
		return () => {
			window.removeEventListener("resize", resize);
			cancelAnimationFrame(pendingFrame);
		};
	}, [open, updateFrame]);

	if (!src) return <>{children}</>;
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<button
					ref={trigger}
					type="button"
					aria-label={t("ui.image_zoom.open", { image: alt })}
					className={cn(
						"inline-flex cursor-zoom-in border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
						circle && "rounded-full",
						className,
					)}
				>
					{children}
				</button>
			</DialogTrigger>
			<DialogPortal>
				<DialogOverlay
					data-image-zoom-overlay=""
					className="z-90 bg-black/85 duration-200 motion-reduce:animate-none"
				/>
				<DialogPrimitive.Content
					data-slot="dialog-content"
					data-image-zoom=""
					aria-describedby={undefined}
					className="image-zoom-content fixed z-100 outline-none"
					style={frame}
					onClick={(event) => event.stopPropagation()}
				>
					<DialogTitle className="sr-only">{alt}</DialogTitle>
					<DialogPrimitive.Close asChild>
						<Button
							type="button"
							variant="ghost"
							size="icon-xl"
							aria-label={t("ui.close")}
							className="image-zoom-close fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-10 size-11 bg-black/60 text-white hover:bg-white/15 hover:text-white lg:size-10"
						>
							<OutlineClose aria-hidden="true" />
						</Button>
					</DialogPrimitive.Close>
					<DialogPrimitive.Close asChild>
						<button
							type="button"
							aria-label={t("ui.image_zoom.close_image")}
							className={cn(
								"image-zoom-media flex size-full cursor-zoom-out items-center justify-center overflow-hidden rounded-[inherit] border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
								circle && "bg-background",
							)}
						>
							{failed ? (
								<span
									role="alert"
									className={cn(
										"px-6",
										circle ? "text-foreground" : "text-white",
									)}
								>
									{t("ui.image_zoom.unavailable")}
								</span>
							) : (
								<img
									ref={enlargedImage}
									src={src}
									alt={alt}
									decoding="async"
									draggable={false}
									className="block size-full object-cover"
									onLoad={(event) => {
										const image = event.currentTarget;
										const ratio = circle
											? 1
											: image.naturalWidth / image.naturalHeight;
										if (
											ratio > 0 &&
											Math.abs(ratio - frameRatio.current) > 0.001
										)
											updateFrame(image);
									}}
									onError={() => setFailed(true)}
								/>
							)}
						</button>
					</DialogPrimitive.Close>
				</DialogPrimitive.Content>
			</DialogPortal>
		</Dialog>
	);
}
