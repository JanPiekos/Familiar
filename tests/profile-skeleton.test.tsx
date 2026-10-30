import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { PortfolioContentSkeleton } from "@/components/layout/profile/feed/portfolio-sekeleton";

describe("portfolio loading", () => {
	it("includes artwork placeholders in the server output before browser measurements", () => {
		const html = renderToString(<PortfolioContentSkeleton />);
		const document = new DOMParser().parseFromString(html, "text/html");
		const grids = document.querySelectorAll('[style*="grid-template-columns"]');
		expect(grids.length).toBeGreaterThan(0);
		for (const grid of grids)
			expect(grid.querySelector('[data-slot="skeleton"]')).not.toBeNull();
	});
});
