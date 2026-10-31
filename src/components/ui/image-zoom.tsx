import { Dialog as DialogPrimitive } from "radix-ui";
import {
	type CSSProperties,
	type ReactNode,
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

function measureFrame(button: HTMLButtonElement, circle: boolean) {
	const image = button.querySelector("img");
	const bounds = (image ?? button).getBoundingClientRect();
	let { x, y, width, height } = bounds;
	const ratio = circle
		? 1
		: image?.naturalWidth && image.naturalHeight
			? image.naturalWidth / image.naturalHeight
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
		"--zoom-from-x": `${x}px`,
		"--zoom-from-y": `${y}px`,
		"--zoom-from-width": `${width}px`,
		"--zoom-from-height": `${height}px`,
		"--zoom-from-radius": getComputedStyle(button).borderRadius,
		"--zoom-x": `${(window.innerWidth - targetWidth) / 2}px`,
		"--zoom-y": `${(window.innerHeight - targetHeight) / 2}px`,
		"--zoom-width": `${targetWidth}px`,
		"--zoom-height": `${targetHeight}px`,
		"--zoom-radius": circle ? "50%" : "0px",
	} as CSSProperties;
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
	const [open, setOpen] = useState(false);
	const [failed, setFailed] = useState(false);
	const [frame, setFrame] = useState<CSSProperties>();
	const onOpenChange = (next: boolean) => {
		if (trigger.current) setFrame(measureFrame(trigger.current, circle));
		if (next) setFailed(false);
		setOpen(next);
	};
	useEffect(() => {
		if (!open) return;
		const resize = () => {
			if (trigger.current) setFrame(measureFrame(trigger.current, circle));
		};
		window.addEventListener("resize", resize);
		return () => window.removeEventListener("resize", resize);
	}, [open, circle]);

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
					className="z-90 bg-black/85 duration-300 motion-reduce:animate-none"
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
								"flex size-full cursor-zoom-out items-center justify-center overflow-hidden rounded-[inherit] border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
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
									src={src}
									alt={alt}
									draggable={false}
									className="block size-full object-cover"
									onLoad={() => {
										if (trigger.current)
											setFrame(measureFrame(trigger.current, circle));
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
