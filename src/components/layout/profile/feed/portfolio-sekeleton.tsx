import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { MENU_SEARCH_HEIGHT_CLASS_NAME } from "@/components/ui/menu-styles";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { useBento } from "@/hooks/ui/use-bento";
import { type PlacedTile, packAppend, type Tile } from "@/lib/bento";
import { cn, createStaticList } from "@/lib/utils";
import { FolderCardArtwork } from "./folder-artwork";

const FOLDERS = createStaticList("portfolio-folder-skeleton", 5);
function tile(
	id: string,
	widthUnit: Tile["widthUnit"],
	heightUnit: Tile["heightUnit"],
): Tile {
	return {
		id,
		widthUnit,
		heightUnit,
		cover: {
			path: "",
			width: widthUnit * 100,
			height: heightUnit * 100,
			alt: "",
		},
	};
}
const TILES: Tile[] = [
	tile("portrait", 2, 3),
	tile("square-1", 1, 1),
	tile("square-2", 1, 1),
	tile("wide-1", 2, 1),
	tile("tall-1", 1, 2),
	tile("square-3", 1, 1),
	tile("square-4", 1, 1),
	tile("wide-2", 2, 1),
];
export function PortfolioFolderCardSkeleton() {
	return (
		<article className="flex h-full w-40 min-w-0 shrink-0 flex-col gap-3">
			<FolderCardArtwork>
				<Skeleton className="size-full rounded-none" />
				<Badge
					size="sm"
					className="absolute right-2 bottom-2 z-20 shrink-0 border border-border/60 bg-background/90 text-foreground tabular-nums shadow-sm backdrop-blur-md"
				>
					<span className="invisible">0</span>
				</Badge>
			</FolderCardArtwork>
			<div className="min-w-0 space-y-1 px-0.5">
				<h3 className="text-sm leading-snug font-semibold">
					<SkeletonText className="w-24" />
				</h3>
				<p className="text-xs leading-relaxed">
					<SkeletonText className="w-16" />
				</p>
			</div>
		</article>
	);
}
function BentoSkeletonGrid({
	className,
	cols,
	placed,
}: {
	className: string;
	cols: number;
	placed: PlacedTile[];
}) {
	return (
		<div
			className={cn("w-full gap-px overflow-hidden", className)}
			style={{
				gridTemplateColumns: `repeat(${cols},minmax(0,1fr))`,
				gridAutoRows: `calc((100cqw - ${cols - 1}px) / ${cols})`,
			}}
		>
			{placed.map((item) => (
				<Skeleton
					key={item.tile.id}
					className="min-w-0 rounded-none"
					style={{
						gridColumn: `${item.x + 1} / span ${item.widthUnit}`,
						gridRow: `${item.y + 1} / span ${item.heightUnit}`,
					}}
				/>
			))}
		</div>
	);
}
function FolderHeaderSkeleton({ isOwner }: { isOwner: boolean }) {
	return (
		<div className="px-4 lg:px-0 xl:px-4">
			<div className="flex min-w-0 flex-wrap items-start gap-x-3 gap-y-2 sm:flex-nowrap">
				<Skeleton className="order-1 -ml-2 size-10 rounded-full" />
				<div className="order-3 w-full min-w-0 basis-full sm:order-2 sm:w-auto sm:flex-1 sm:basis-auto sm:pt-1.5">
					<div className="flex h-7 items-center gap-3">
						<Skeleton className="h-5 w-40 max-w-[70%]" />
						<Skeleton className="h-3 w-10" />
					</div>
					<div className="mt-1 flex h-5 items-center">
						<Skeleton className="h-3 w-48 max-w-full" />
					</div>
				</div>
				{isOwner && (
					<div className="order-2 ml-auto flex shrink-0 gap-1 sm:order-3">
						<Skeleton className="h-10 w-28 rounded-full" />
						<Skeleton className="size-10 rounded-full" />
					</div>
				)}
			</div>
		</div>
	);
}
export function PortfolioContentSkeleton({
	variant = "portfolio",
	isOwner = false,
}: {
	variant?: "portfolio" | "folder";
	isOwner?: boolean;
} = {}) {
	const mobileTiles = useMemo(
		() =>
			TILES.map((item) =>
				item.heightUnit > item.widthUnit
					? { ...item, widthUnit: 2 as const, heightUnit: 3 as const }
					: item,
			),
		[],
	);
	const tabletTiles = useMemo(
		() =>
			TILES.map((item) =>
				item.heightUnit > item.widthUnit
					? { ...item, widthUnit: 1 as const, heightUnit: 2 as const }
					: item,
			),
		[],
	);
	const mobilePlaced = useMemo(
		() => packAppend([], mobileTiles, 2, "balanced"),
		[mobileTiles],
	);
	const tabletPlaced = useMemo(
		() => packAppend([], tabletTiles, 3, "fit"),
		[tabletTiles],
	);
	const { cols, placed } = useBento(TILES, "balanced");
	return (
		<div
			aria-hidden="true"
			className={cn(
				"flex min-h-0 w-full min-w-0 flex-1 flex-col",
				variant === "folder" ? "gap-5" : "gap-6",
			)}
		>
			<div className="flex items-center gap-2 px-4 sm:gap-3 lg:px-0 xl:px-4">
				<Skeleton
					className={cn(
						MENU_SEARCH_HEIGHT_CLASS_NAME,
						"min-w-0 flex-1 rounded-full",
					)}
				/>
				<Skeleton
					className={cn(
						MENU_SEARCH_HEIGHT_CLASS_NAME,
						"w-10 shrink-0 rounded-full md:w-21.5",
					)}
				/>
			</div>
			{variant === "folder" ? (
				<FolderHeaderSkeleton isOwner={isOwner} />
			) : (
				<section className="min-w-0 lg:px-0 xl:px-4">
					<div className="flex w-full min-w-0 gap-4 overflow-hidden px-3 pt-2 pb-3 lg:px-0 xl:px-3">
						{FOLDERS.map((item) => (
							<PortfolioFolderCardSkeleton key={item.id} />
						))}
					</div>
				</section>
			)}
			<div
				className={cn(
					"@container w-auto min-w-0 max-w-full",
					variant === "folder" ? "mx-4 lg:mx-0 xl:mx-4" : "lg:mx-0 xl:mx-4",
				)}
			>
				<BentoSkeletonGrid
					className="grid md:hidden"
					cols={2}
					placed={mobilePlaced}
				/>
				<BentoSkeletonGrid
					className="hidden md:grid xl:hidden"
					cols={3}
					placed={tabletPlaced}
				/>
				<BentoSkeletonGrid
					className="hidden xl:grid"
					cols={cols}
					placed={placed}
				/>
			</div>
		</div>
	);
}
