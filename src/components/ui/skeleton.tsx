import type React from "react";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn(
				"animate-none! rounded-md bg-input shadow-none! transition-none! bg-none! before:hidden after:hidden",
				className,
			)}
			{...props}
		/>
	);
}

function SkeletonText({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			aria-hidden="true"
			className={cn("relative block", className)}
			{...props}
		>
			<span className="invisible">{"\u00a0"}</span>
			<span
				data-slot="skeleton"
				className="absolute inset-x-0 top-1/2 h-[0.75em] -translate-y-1/2 rounded-md bg-input"
			/>
		</span>
	);
}

export { Skeleton, SkeletonText };
