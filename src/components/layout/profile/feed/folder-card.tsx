import type { CatalogResponse } from "@/api/portfolio/catalogs/catalog-types";
import { OutlineFolder } from "@/components/icons/icons";
import { ContentWarningOverlay } from "@/components/layout/content-warning-overlay";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FolderCardProps {
	folder: CatalogResponse;
	className?: string;
	fallbackCoverSrc?: string;
	itemCount?: number;
	/** Content warnings from the exact post used as this folder's preview. */
	contentWarnings: string[];
}

export function FolderCard({
	folder,
	className,
	fallbackCoverSrc,
	itemCount,
	contentWarnings,
}: FolderCardProps) {
	const { name, description, thumbnail, fullSize } = folder;
	const coverSrc = fullSize?.path ?? thumbnail?.path ?? fallbackCoverSrc;

	return (
		<article
			className={cn("group flex h-full min-w-0 flex-col gap-3", className)}
		>
			<div className="relative isolate aspect-4/3 w-full transition-transform duration-200 motion-safe:group-hover:-translate-y-1">
				<svg
					aria-hidden="true"
					viewBox="0 0 360 270"
					preserveAspectRatio="none"
					className="absolute inset-0 size-full overflow-visible fill-input stroke-border/80"
				>
					<path
						d="M21 1H111a22 22 0 0 1 17 8l14 16h197a20 20 0 0 1 20 20v204a20 20 0 0 1-20 20H21a20 20 0 0 1-20-20V21A20 20 0 0 1 21 1Z"
						vectorEffect="non-scaling-stroke"
					/>
				</svg>
				<div
					aria-hidden="true"
					className="absolute inset-x-4 top-[14%] bottom-4 -rotate-2 rounded-xl border border-border/60 bg-background shadow-sm"
				/>
				<div className="absolute inset-x-0 top-[22%] bottom-0 overflow-hidden rounded-2xl border border-border/70 bg-muted shadow-sm">
					<ContentWarningOverlay
						warnings={contentWarnings}
						variant="folder"
						hasMedia={Boolean(coverSrc)}
						showHideButton={false}
						className="pointer-events-none size-full"
					>
						{coverSrc ? (
							<img
								src={coverSrc}
								alt=""
								loading="lazy"
								decoding="async"
								draggable={false}
								className="size-full object-cover"
							/>
						) : (
							<div className="flex size-full items-center justify-center bg-gradient-to-br from-background/70 to-transparent">
								<OutlineFolder
									aria-hidden="true"
									className="size-10 text-muted-foreground/60"
								/>
							</div>
						)}
					</ContentWarningOverlay>
					{typeof itemCount === "number" ? (
						<Badge
							size="sm"
							className="absolute right-2 bottom-2 z-20 shrink-0 border border-border/60 bg-background/90 text-foreground tabular-nums shadow-sm backdrop-blur-md"
						>
							{itemCount}
						</Badge>
					) : null}
				</div>
			</div>
			<div className="min-w-0 space-y-1 px-0.5">
				<h3 className="line-clamp-2 break-words text-sm leading-snug font-semibold text-foreground">
					{name}
				</h3>
				{description ? (
					<p className="line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground">
						{description}
					</p>
				) : null}
			</div>
		</article>
	);
}
