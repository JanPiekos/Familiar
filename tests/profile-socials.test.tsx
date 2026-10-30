import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { ProfileSocials } from "@/components/layout/profile/socials";
import type { UserSocials } from "@/types/user";
import en from "@/i18n/en";
import pl from "@/i18n/pl";

beforeEach(() => {
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	);
});
afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

async function show(socials: UserSocials, locale = "en") {
	const i18n = createInstance();
	await i18n.init({
		lng: locale,
		fallbackLng: "en",
		resources: { en: { translation: en }, pl: { translation: pl } },
		interpolation: { escapeValue: false },
	});
	const view = render(
		<I18nextProvider i18n={i18n}>
			<ProfileSocials socials={socials} />
		</I18nextProvider>,
	);
	return { ...view, i18n };
}

describe("profile social links", () => {
	it("preserves handles, full URLs, and website paths as external links", async () => {
		await show([
			{ platform: "TWITTER", value: "@artist" },
			{ platform: "INSTAGRAM", value: "https://instagram.com/artist" },
			{
				platform: "WEBSITE_1",
				value: "portfolio.example/art?sort=latest#gallery",
			},
		]);
		const expected = [
			"https://x.com/artist",
			"https://instagram.com/artist",
			"https://portfolio.example/art?sort=latest#gallery",
		];
		const links = screen.getAllByRole("link");
		expect(links.map((link) => link.getAttribute("href"))).toEqual(expected);
		for (const link of links) {
			expect(link.getAttribute("target")).toBe("_blank");
			expect(link.getAttribute("rel")).toBe("noopener noreferrer");
		}
	});

	it("accepts a pasted platform URL without adding its host a second time", async () => {
		await show([{ platform: "TWITTER", value: "x.com/artist" }]);
		expect(screen.getByRole("link").getAttribute("href")).toBe(
			"https://x.com/artist",
		);
	});

	it("keeps dots in Instagram handles and supports bare social domains", async () => {
		await show([
			{ platform: "INSTAGRAM", value: "artist.name" },
			{ platform: "TWITTER", value: "twitter.com" },
			{ platform: "WEBSITE", value: "//portfolio.example/art" },
		]);
		expect(
			screen.getAllByRole("link").map((link) => link.getAttribute("href")),
		).toEqual([
			"https://instagram.com/artist.name",
			"https://twitter.com/",
			"https://portfolio.example/art",
		]);
	});

	it("shows the complete destination on hover with an emphasized domain", async () => {
		const href = "https://portfolio.example/art?sort=latest#gallery";
		await show([{ platform: "WEBSITE", value: href }]);
		fireEvent.pointerMove(screen.getByRole("link"), {
			pointerType: "mouse",
			clientX: 10,
			clientY: 10,
		});
		const tooltip = await screen.findByRole("tooltip");
		expect(tooltip.textContent).toBe(href);
		expect(
			document.querySelector('[data-slot="tooltip-content"] strong')
				?.textContent,
		).toBe("portfolio.example");
	});

	it("shows the URL on keyboard focus and dismisses it with Escape", async () => {
		const href = "https://x.com/artist";
		await show([{ platform: "TWITTER", value: "artist" }]);
		const link = screen.getByRole("link");
		act(() => link.focus());
		expect(document.activeElement).toBe(link);
		expect((await screen.findByRole("tooltip")).textContent).toBe(href);
		fireEvent.keyDown(link, { key: "Escape" });
		expect(screen.queryByRole("tooltip")).toBeNull();
	});

	it("updates the website label when the language changes", async () => {
		const { i18n } = await show([
			{ platform: "WEBSITE_1", value: "portfolio.example" },
		]);
		expect(screen.getByRole("link", { name: /^Website:/ })).toBeDefined();
		await act(async () => i18n.changeLanguage("pl"));
		expect(
			screen.getByRole("link", { name: /^Strona internetowa:/ }),
		).toBeDefined();
	});

	it("omits invalid or non-web destinations", async () => {
		await show(
			[
				"javascript:alert(1)",
				"data:text/html,test",
				"ftp://files.example",
				"https://user:password@example.com",
				"https://",
				"",
			].map((value) => ({ platform: "WEBSITE", value })),
		);
		expect(screen.queryByRole("link")).toBeNull();
	});

	it("loads the destination favicon without exposing the profile path or query", async () => {
		const { container } = await show([
			{
				platform: "WEBSITE",
				value: "https://portfolio.example/art?private=value#work",
			},
		]);
		const image = container.querySelector("img");
		expect(image).not.toBeNull();
		const source = new URL(image!.src);
		expect(source.searchParams.get("domain")).toBe("portfolio.example");
		expect(source.href).not.toContain("private");
		expect(image!.getAttribute("referrerpolicy")).toBe("no-referrer");
		expect(image!.getAttribute("loading")).toBe("lazy");
	});

	it("falls back on favicon errors and retries when the destination changes", async () => {
		const { container, rerender, i18n } = await show([
			{ platform: "WEBSITE", value: "https://one.example/art" },
		]);
		fireEvent.error(container.querySelector("img")!);
		expect(container.querySelector("img")).toBeNull();
		expect(screen.getByRole("link").getAttribute("href")).toBe(
			"https://one.example/art",
		);
		rerender(
			<I18nextProvider i18n={i18n}>
				<ProfileSocials
					socials={[{ platform: "WEBSITE", value: "https://two.example/art" }]}
				/>
			</I18nextProvider>,
		);
		expect(
			new URL(container.querySelector("img")!.src).searchParams.get("domain"),
		).toBe("two.example");
	});

	it("recognizes donation pages by exact hostname rather than a misleading lookalike", async () => {
		await show([
			{ platform: "WEBSITE_1", value: "https://www.ko-fi.com/artist" },
			{ platform: "WEBSITE_2", value: "https://ko-fi.com.evil.example/artist" },
			{
				platform: "WEBSITE",
				value: "https://paypal.com/donate?hosted_button_id=artist",
			},
			{ platform: "WEBSITE", value: "https://paypal.com/help" },
		]);
		expect(
			screen.getByRole("link", { name: /^Ko-fi:/ }).getAttribute("href"),
		).toBe("https://www.ko-fi.com/artist");
		expect(
			screen.getByRole("link", { name: /^PayPal:/ }).getAttribute("href"),
		).toContain("/donate?");
		expect(
			screen
				.getAllByRole("link", { name: /^Website:/ })
				.map((link) => link.getAttribute("href")),
		).toEqual([
			"https://ko-fi.com.evil.example/artist",
			"https://paypal.com/help",
		]);
	});
	it("renders no empty wrapper when there are no links", async () => {
		const { container } = await show([]);
		expect(container.firstChild).toBeNull();
	});
});
