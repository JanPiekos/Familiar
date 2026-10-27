import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
export function FolderCardArtwork({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"@container relative isolate aspect-4/3 w-full transition-transform duration-200 motion-safe:group-hover:-translate-y-1",
				className,
			)}
		>
			<svg
				aria-hidden="true"
				viewBox="0 0 360 270"
				preserveAspectRatio="none"
				className="absolute inset-0 size-full overflow-visible fill-input stroke-border/80"
			>
				<path
					d="M37 1H111a22 22 0 0 1 17 8l14 16H323a36 36 0 0 1 36 36V233a36 36 0 0 1-36 36H37a36 36 0 0 1-36-36V37A36 36 0 0 1 37 1Z"
					vectorEffect="non-scaling-stroke"
				/>
			</svg>
			<div
				aria-hidden="true"
				className="absolute inset-x-4 top-[14%] bottom-4 -rotate-2 rounded-xl border border-border/60 bg-background shadow-sm"
			/>
			<div className="absolute inset-x-px top-[22%] bottom-px overflow-hidden rounded-[calc(10cqw-1px)] border border-border/70 bg-muted shadow-sm">
				{children}
			</div>
		</div>
	);
}
