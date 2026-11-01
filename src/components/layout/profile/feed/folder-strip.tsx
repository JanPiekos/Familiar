import { ScrollShadow } from "@heroui/react";
import type { ReactNode } from "react";

export function PortfolioFolderStrip({ children }: { children: ReactNode }) {
	return (
		<ScrollShadow
			orientation="horizontal"
			hideScrollBar
			size={32}
			// Keep measured edge fades active without scroll timelines or motion effects.
			data-scroll-shadow-mode="manual"
			className="flex w-full min-w-0 snap-x snap-mandatory gap-4 overscroll-x-contain scroll-px-3 px-3 pt-2 pb-3 *:w-48 *:shrink-0 *:snap-start lg:scroll-px-0 lg:px-0 xl:scroll-px-3 xl:px-3"
		>
			{children}
		</ScrollShadow>
	);
}
