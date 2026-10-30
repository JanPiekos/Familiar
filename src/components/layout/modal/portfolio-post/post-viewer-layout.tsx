import {
	type CSSProperties,
	type ReactNode,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { OutlineClose, OutlineMore } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostViewerLayoutProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	mediaContent: ReactNode;
	detailsContent: ReactNode;
	detailsHeaderContent?: ReactNode;
	detailsFooterContent?: ReactNode;
	moreMenuContent?: ReactNode;
}

/** Sizes the frame around the first artwork, keeping gallery navigation stable. */
export function PostViewerLayout({
	open,
	onOpenChange,
	title,
	mediaContent,
	detailsContent,
	detailsHeaderContent,
	detailsFooterContent,
	moreMenuContent,
}: PostViewerLayoutProps) {
	const { t } = useTranslation();
	const content = useRef<HTMLDivElement>(null);
	const media = useRef<HTMLElement>(null);
	const measured = useRef(false);
	const [ratio, setRatio] = useState(1);
	const measure = (width: number, height: number) => {
		if (
			measured.current ||
			!Number.isFinite(width) ||
			!Number.isFinite(height) ||
			width <= 0 ||
			height <= 0
		)
			return;
		measured.current = true;
		setRatio(Math.min(6, Math.max(0.12, width / height)));
	};

	// A cached image may already be loaded when the dialog's portal mounts.
	useLayoutEffect(() => {
		const image = media.current?.querySelector("img");
		if (image?.complete) measure(image.naturalWidth, image.naturalHeight);
		const video = media.current?.querySelector("video");
		if (video?.readyState) measure(video.videoWidth, video.videoHeight);
	});

	const sizing = {
		"--post-ratio": ratio,
		"--post-limit": "min(72rem, calc(100vw - 2rem))",
		"--post-details": "22rem",
		"--post-compact-height":
			"min(50dvh, max(12rem, calc((100vw - 2rem - 2px) / var(--post-ratio))))",
		"--post-height":
			"min(42rem, max(16rem, calc((var(--post-limit) - var(--post-details) - 2px) / var(--post-ratio))), calc(100dvh - 7rem))",
		"--post-width":
			"min(var(--post-limit), max(36rem, calc(var(--post-height) * var(--post-ratio) + var(--post-details) + 2px)))",
	} as CSSProperties;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				ref={content}
				tabIndex={-1}
				showCloseButton={false}
				style={sizing}
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					content.current?.focus({ preventScroll: true });
				}}
				onInteractOutside={(event) => {
					if (
						event.target instanceof Element &&
						event.target.closest(
							'[data-sonner-toast], [data-radix-menu-content], [data-slot="dialog-content"], [role="alertdialog"]',
						)
					)
						event.preventDefault();
				}}
				className="flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-6xl flex-col gap-0 overflow-hidden rounded-3xl bg-background p-0 sm:max-w-6xl lg:w-[var(--post-width)]"
			>
				<DialogTitle className="sr-only">{title}</DialogTitle>
				<DialogDescription className="sr-only">
					{t("ui.view_details", "View details")}
				</DialogDescription>
				<header className="flex min-h-18 shrink-0 items-center gap-3 border-b px-4 py-3">
					<div className="min-w-0 flex-1">{detailsHeaderContent}</div>
					{moreMenuContent && (
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<Button
									type="button"
									variant="ghost"
									size="icon-xl"
									aria-label={t("ui.more_options", "More options")}
								>
									<OutlineMore aria-hidden="true" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{moreMenuContent}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
					<Button
						type="button"
						variant="ghost"
						size="icon-xl"
						aria-label={t("ui.close", "Close")}
						onClick={() => onOpenChange(false)}
					>
						<OutlineClose aria-hidden="true" />
					</Button>
				</header>
				<div className="flex min-h-0 flex-col overflow-y-auto overscroll-contain lg:h-[var(--post-height)] lg:flex-row lg:overflow-hidden">
					<section
						ref={media}
						onLoadCapture={(event) => {
							if (event.target instanceof HTMLImageElement)
								measure(event.target.naturalWidth, event.target.naturalHeight);
						}}
						onLoadedMetadataCapture={(event) => {
							if (event.target instanceof HTMLVideoElement)
								measure(event.target.videoWidth, event.target.videoHeight);
						}}
						className="relative h-[var(--post-compact-height)] min-h-48 min-w-0 shrink-0 bg-muted/30 lg:h-full lg:min-h-0 lg:flex-1"
					>
						<div className="size-full overflow-hidden">{mediaContent}</div>
					</section>
					<aside className="flex min-h-0 min-w-0 shrink-0 flex-col border-t bg-background lg:w-[var(--post-details)] lg:border-t-0 lg:border-l">
						<div className="min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain">
							{detailsContent}
						</div>
						{detailsFooterContent && (
							<footer className="shrink-0 border-t">
								{detailsFooterContent}
							</footer>
						)}
					</aside>
				</div>
			</DialogContent>
		</Dialog>
	);
}
