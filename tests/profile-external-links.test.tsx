import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { createInstance } from "i18next";
import { createPortal } from "react-dom";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ExternalLinkGuard } from "@/components/layout/external-link-guard";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import en from "@/i18n/en";
import pl from "@/i18n/pl";

beforeEach(() => {
	vi.spyOn(window, "open").mockReturnValue(null);
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

async function mount(locale = "en", nested = false) {
	const i18n = createInstance();
	await i18n.init({
		lng: locale,
		resources: { en: { translation: en }, pl: { translation: pl } },
	});
	const onCardClick = vi.fn();
	const onParentClose = vi.fn();
	const view = render(
		<I18nextProvider i18n={i18n}>
			<ExternalLinkGuard />
			<div onClick={onCardClick}>
				<a href="https://outside.example/art?sort=new#gallery" target="_blank">
					<span>External website</span>
				</a>
			</div>
			{nested ? (
				<Dialog open onOpenChange={onParentClose}>
					<DialogContent>
						<DialogTitle>Profile details</DialogTitle>
						<DialogDescription>About this creator</DialogDescription>
						<a href="https://another.example/artist">Portal website</a>
					</DialogContent>
				</Dialog>
			) : (
				createPortal(
					<a href="https://another.example/artist">Portal website</a>,
					document.body,
				)
			)}
			<a href="/user/demo" onClick={(event) => event.preventDefault()}>
				Profile
			</a>
		</I18nextProvider>,
	);
	return { ...view, onCardClick, onParentClose };
}

it.each([
	["normal click", "click", {}],
	["Ctrl-click", "click", { ctrlKey: true }],
	["Cmd-click", "click", { metaKey: true }],
	["Shift-click", "click", { shiftKey: true }],
	["middle click", "auxclick", { button: 1 }],
] as const)(
	"guards %s without opening the site or activating the surrounding card",
	async (_name, type, options) => {
		const { onCardClick } = await mount();
		const event = new MouseEvent(type, {
			bubbles: true,
			cancelable: true,
			...options,
		});
		fireEvent(screen.getByText("External website"), event);
		expect(event.defaultPrevented).toBe(true);
		expect(onCardClick).not.toHaveBeenCalled();
		expect(window.open).not.toHaveBeenCalled();
		expect(
			screen.getByRole("alertdialog", { name: "You're leaving Familiar" }),
		).toBeTruthy();
		expect(screen.getByText("outside.example")).toBeTruthy();
		expect(
			screen.getByText("https://outside.example/art?sort=new#gallery"),
		).toBeTruthy();
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "Stay on Familiar" }),
		);
	},
);

it("only opens the reviewed destination after confirmation, without an opener or referrer", async () => {
	await mount();
	fireEvent.click(screen.getByRole("link", { name: "External website" }));
	fireEvent.click(screen.getByRole("button", { name: "Continue to website" }));
	expect(window.open).toHaveBeenCalledExactlyOnceWith(
		"https://outside.example/art?sort=new#gallery",
		"_blank",
		"noopener,noreferrer",
	);
	await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
});

it.each(["cancel", "Escape"])(
	"stays in the app and restores the source link on %s",
	async (action) => {
		await mount();
		const link = screen.getByRole("link", { name: "External website" });
		fireEvent.click(link);
		if (action === "cancel")
			fireEvent.click(screen.getByRole("button", { name: "Stay on Familiar" }));
		else fireEvent.keyDown(document, { key: "Escape" });
		await waitFor(() => expect(document.activeElement).toBe(link));
		expect(screen.queryByRole("alertdialog")).toBeNull();
		expect(window.open).not.toHaveBeenCalled();
	},
);

it("covers portal links and replaces a cancelled destination", async () => {
	await mount();
	fireEvent.click(screen.getByRole("link", { name: "External website" }));
	fireEvent.click(screen.getByRole("button", { name: "Stay on Familiar" }));
	await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
	fireEvent.click(screen.getByRole("link", { name: "Portal website" }));
	expect(screen.getByText("another.example")).toBeTruthy();
	fireEvent.click(screen.getByRole("button", { name: "Continue to website" }));
	expect(window.open).toHaveBeenCalledExactlyOnceWith(
		"https://another.example/artist",
		"_blank",
		"noopener,noreferrer",
	);
});

it.each([
	"/user/demo",
	`${window.location.origin}/user/demo`,
	"#bio",
	"mailto:hello@example.com",
	"tel:+48123456789",
	"blob:https://example.com/file",
])("preserves non-external navigation: %s", async (href) => {
	await mount();
	const link = screen.getByRole("link", { name: "Profile" });
	link.setAttribute("href", href);
	const activated = vi.fn((event: Event) => event.preventDefault());
	link.addEventListener("click", activated);
	fireEvent.click(link);
	expect(activated).toHaveBeenCalledOnce();
	expect(screen.queryByRole("alertdialog")).toBeNull();
});

it("preserves explicit downloads and cleans up the global listener on unmount", async () => {
	const { unmount } = await mount();
	const link = screen.getByRole("link", { name: "Profile" });
	link.setAttribute("href", "https://outside.example/art.png");
	link.setAttribute("download", "art.png");
	const activated = vi.fn((event: Event) => event.preventDefault());
	link.addEventListener("click", activated);
	fireEvent.click(link);
	expect(activated).toHaveBeenCalledOnce();
	expect(screen.queryByRole("alertdialog")).toBeNull();
	unmount();
	link.removeAttribute("download");
	document.body.append(link);
	fireEvent.click(link);
	expect(activated).toHaveBeenCalledTimes(2);
	link.remove();
});

it("shows the safety reminder and actions in Polish", async () => {
	await mount("pl");
	fireEvent.click(screen.getByRole("link", { name: "External website" }));
	expect(
		screen.getByRole("alertdialog", { name: "Opuszczasz Familiar" }),
	).toBeTruthy();
	expect(
		screen.getByText(
			/Zespół Familiar nigdy nie poprosi Cię o kontakt poza aplikacją/,
		),
	).toBeTruthy();
	expect(
		screen.getByRole("button", { name: "Zostań w Familiar" }),
	).toBeTruthy();
	expect(
		screen.getByRole("button", { name: "Przejdź do strony" }),
	).toBeTruthy();
});

it("returns to an existing dialog without dismissing it or releasing its scroll lock", async () => {
	const { onParentClose } = await mount("en", true);
	const link = screen.getByRole("link", { name: "Portal website" });
	fireEvent.click(link);
	expect(screen.getByRole("alertdialog")).toBeTruthy();
	fireEvent.click(screen.getByRole("button", { name: "Stay on Familiar" }));
	await waitFor(() => expect(document.activeElement).toBe(link));
	expect(screen.getByRole("dialog", { name: "Profile details" })).toBeTruthy();
	expect(document.body.hasAttribute("data-scroll-locked")).toBe(true);
	expect(onParentClose).not.toHaveBeenCalled();
});
