import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { createInstance } from "i18next";
import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContentWarningOverlay } from "@/components/layout/content-warning-overlay";
import { PostViewerLayout } from "@/components/layout/modal/portfolio-post/post-viewer-layout";
import { ImageZoom } from "@/components/ui/image-zoom";
import en from "@/i18n/en";
import pl from "@/i18n/pl";

afterEach(cleanup);
async function mount(children: ReactNode, locale = "en") {
	const i18n = createInstance();
	await i18n.init({
		lng: locale,
		resources: { en: { translation: en }, pl: { translation: pl } },
		interpolation: { escapeValue: false },
	});
	return render(<I18nextProvider i18n={i18n}>{children}</I18nextProvider>);
}
function Artwork({ src = "/art.png" }: { src?: string | null }) {
	return (
		<ImageZoom src={src} alt="Artwork">
			<img src={src || undefined} alt="Artwork" />
		</ImageZoom>
	);
}

describe("animated image viewer", () => {
	it.each(["en", "pl"])(
		"opens by keyboard, closes with Escape, and returns focus in %s",
		async (locale) => {
			await mount(<Artwork />, locale);
			const trigger = screen.getByRole("button", {
				name: locale === "en" ? "Enlarge Artwork" : "Powiększ Artwork",
			});
			trigger.focus();
			fireEvent.keyDown(trigger, { key: "Enter" });
			// Native buttons dispatch click for Enter; jsdom does not synthesize it.
			fireEvent.click(trigger);
			const dialog = await screen.findByRole("dialog", { name: "Artwork" });
			expect(within(dialog).getByRole("img").getAttribute("src")).toBe(
				"/art.png",
			);
			expect(
				within(dialog).getByRole("button", {
					name: locale === "en" ? "Close" : "Zamknij",
				}),
			).toBe(document.activeElement);
			fireEvent.keyDown(dialog, { key: "Escape" });
			await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
			await waitFor(() => expect(document.activeElement).toBe(trigger));
		},
	);
	it("does not turn a missing avatar into an empty image viewer", async () => {
		await mount(
			<ImageZoom src={null} alt="Avatar">
				<span>Avatar fallback</span>
			</ImageZoom>,
		);
		expect(screen.getByText("Avatar fallback")).toBeTruthy();
		expect(screen.queryByRole("button")).toBeNull();
	});
	it("keeps a failed enlarged image dismissible", async () => {
		await mount(<Artwork />);
		fireEvent.click(screen.getByRole("button", { name: "Enlarge Artwork" }));
		const dialog = await screen.findByRole("dialog", { name: "Artwork" });
		fireEvent.error(within(dialog).getByRole("img"));
		expect(within(dialog).getByRole("alert").textContent).toBe(
			"This image couldn't be loaded.",
		);
		fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});
	it("fits the full artwork when it finishes loading after opening", async () => {
		await mount(<Artwork />);
		const source = screen.getByRole("img");
		fireEvent.click(screen.getByRole("button", { name: "Enlarge Artwork" }));
		const dialog = await screen.findByRole("dialog", { name: "Artwork" });
		Object.defineProperties(source, {
			naturalWidth: { value: 3000 },
			naturalHeight: { value: 1000 },
		});
		fireEvent.load(within(dialog).getByRole("img"));
		const width = parseFloat(dialog.style.getPropertyValue("--zoom-width"));
		const height = parseFloat(dialog.style.getPropertyValue("--zoom-height"));
		expect(width / height).toBeCloseTo(3);
		expect(width).toBeLessThan(window.innerWidth);
		expect(height).toBeLessThan(window.innerHeight);
	});
	it("requires revealing warnings and closes only the enlarged layer above a post", async () => {
		const closePost = vi.fn();
		await mount(
			<PostViewerLayout
				title="Post"
				open
				onOpenChange={closePost}
				mediaContent={
					<ContentWarningOverlay warnings={["Horror"]}>
						<Artwork />
					</ContentWarningOverlay>
				}
				detailsContent={<p>Post details</p>}
			/>,
		);
		expect(
			screen.queryByRole("button", { name: "Enlarge Artwork" }),
		).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Show" }));
		const trigger = screen.getByRole("button", { name: "Enlarge Artwork" });
		fireEvent.click(trigger);
		const enlarged = await screen.findByRole("dialog", { name: "Artwork" });
		fireEvent.keyDown(enlarged, { key: "Escape" });
		await waitFor(() =>
			expect(screen.queryByRole("dialog", { name: "Artwork" })).toBeNull(),
		);
		expect(screen.getByRole("dialog", { name: "Post" })).toBeTruthy();
		expect(closePost).not.toHaveBeenCalled();
		await waitFor(() => expect(document.activeElement).toBe(trigger));
		fireEvent.click(
			screen.getByRole("button", { name: "Hide sensitive content" }),
		);
		expect(
			screen.queryByRole("button", { name: "Enlarge Artwork" }),
		).toBeNull();
	});
});
