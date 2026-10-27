import type { CatalogResponse } from "@/api/portfolio/catalogs/catalog-types";
import { OutlineFolder } from "@/components/icons/icons";
import { ContentWarningOverlay } from "@/components/layout/content-warning-overlay";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FolderCardArtwork } from "./folder-artwork";

interface FolderCardProps {
	folder: CatalogResponse;
	className?: string;
	fallbackCoverSrc?: string;
	itemCount?: number;
	/** Warnings for the displayed cover, or folder warnings when its source is unknown. */
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
			<FolderCardArtwork>
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
						<div className="flex size-full items-center justify-center bg-linear-to-br from-background/70 to-transparent">
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
			</FolderCardArtwork>
			<div className="min-w-0 space-y-1 px-0.5">
				<h3 className="line-clamp-2 wrap-break-word text-sm leading-snug font-semibold text-foreground">
					{name}
				</h3>
				{description ? (
					<p className="line-clamp-2 wrap-break-word text-xs leading-relaxed text-muted-foreground">
						{description}
					</p>
				) : null}
			</div>
		</article>
	);
}
