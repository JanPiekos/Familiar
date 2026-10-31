import { Badge } from "@/components/ui/badge";
import { MENU_SEARCH_HEIGHT_CLASS_NAME } from "@/components/ui/menu-styles";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { cn, createStaticList } from "@/lib/utils";
import { FolderCardArtwork } from "./folder-artwork";

const FOLDERS = createStaticList("portfolio-folder-skeleton", 5);
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
export function PortfolioGridSkeleton({
	className,
}: {
	className?: string;
} = {}) {
	return (
		<div
			aria-hidden="true"
			data-slot="portfolio-grid-skeleton"
			className={cn(
				"w-auto min-w-0 max-w-full overflow-clip rounded-none lg:rounded-3xl",
				className,
			)}
		>
			<div className="grid aspect-square grid-cols-2 grid-rows-2 gap-px md:aspect-3/1 md:grid-cols-3 md:grid-rows-1 xl:aspect-4/1 xl:grid-cols-4">
				<Skeleton className="col-span-2 min-h-0 min-w-0 rounded-none" />
				<Skeleton className="min-h-0 min-w-0 rounded-none" />
				<Skeleton className="min-h-0 min-w-0 rounded-none md:hidden xl:block" />
			</div>
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
			<PortfolioGridSkeleton
				className={cn(
					variant === "folder" ? "mx-4 lg:mx-0 xl:mx-4" : "lg:mx-0 xl:mx-4",
				)}
			/>
		</div>
	);
}
