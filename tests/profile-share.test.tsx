import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { toast } from "sonner";
import en from "@/i18n/en";
import pl from "@/i18n/pl";
import { useShareProfile } from "@/hooks/user/use-share-profile";
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const shareDescriptor = Object.getOwnPropertyDescriptor(navigator, "share");
const clipboardDescriptor = Object.getOwnPropertyDescriptor(
	navigator,
	"clipboard",
);
const nativeShare = vi.fn(),
	copy = vi.fn();
beforeEach(() => {
	nativeShare.mockReset().mockResolvedValue(undefined);
	copy.mockReset().mockResolvedValue(undefined);
	vi.clearAllMocks();
	Object.defineProperty(navigator, "share", {
		configurable: true,
		value: undefined,
	});
	Object.defineProperty(navigator, "clipboard", {
		configurable: true,
		value: { writeText: copy },
	});
});
afterEach(() => {
	cleanup();
	for (const [key, descriptor] of [
		["share", shareDescriptor],
		["clipboard", clipboardDescriptor],
	] as const) {
		if (descriptor) Object.defineProperty(navigator, key, descriptor);
		else Reflect.deleteProperty(navigator, key);
	}
});
async function mount({
	locale,
	username = "artist",
	language = "en",
}: {
	locale?: string;
	username?: string;
	language?: string;
} = {}) {
	const i18n = createInstance();
	await i18n.init({
		lng: language,
		resources: { en: { translation: en }, pl: { translation: pl } },
	});
	function Control() {
		const { shareProfile, isSharing } = useShareProfile({
			username,
			displayName: "Demo artist",
			locale,
		});
		return (
			<button
				disabled={isSharing}
				onClick={() => {
					void shareProfile();
				}}
			>
				Share profile
			</button>
		);
	}
	render(
		<I18nextProvider i18n={i18n}>
			<Control />
		</I18nextProvider>,
	);
	return screen.getByRole("button", { name: "Share profile" });
}
it("copies the profile's actual origin, encoded username, and locale without folder or settings state", async () => {
	const button = await mount({ locale: "pl", username: "a/b" });
	fireEvent.click(button);
	await waitFor(() =>
		expect(copy).toHaveBeenCalledWith(
			window.location.origin + "/pl/user/a%2Fb",
		),
	);
	await waitFor(() => expect(toast.success).toHaveBeenCalledOnce());
	expect(nativeShare).not.toHaveBeenCalled();
});
it("opens native sharing with the profile identity and URL when supported", async () => {
	Object.defineProperty(navigator, "share", {
		configurable: true,
		value: nativeShare,
	});
	fireEvent.click(await mount());
	await waitFor(() =>
		expect(nativeShare).toHaveBeenCalledWith({
			title: "Demo artist",
			url: window.location.origin + "/user/artist",
		}),
	);
	await waitFor(() =>
		expect(screen.getByRole("button").hasAttribute("disabled")).toBe(false),
	);
	expect(copy).not.toHaveBeenCalled();
	expect(toast.success).not.toHaveBeenCalled();
});
it("treats cancelling the native share sheet as cancellation", async () => {
	nativeShare.mockRejectedValue(new DOMException("Cancelled", "AbortError"));
	Object.defineProperty(navigator, "share", {
		configurable: true,
		value: nativeShare,
	});
	fireEvent.click(await mount());
	await waitFor(() =>
		expect(screen.getByRole("button").hasAttribute("disabled")).toBe(false),
	);
	expect(copy).not.toHaveBeenCalled();
	expect(toast.error).not.toHaveBeenCalled();
	expect(toast.success).not.toHaveBeenCalled();
});
it("falls back to copying when native sharing fails", async () => {
	nativeShare.mockRejectedValue(new Error("Unavailable"));
	Object.defineProperty(navigator, "share", {
		configurable: true,
		value: nativeShare,
	});
	fireEvent.click(await mount());
	await waitFor(() =>
		expect(copy).toHaveBeenCalledWith(window.location.origin + "/user/artist"),
	);
	await waitFor(() => expect(toast.success).toHaveBeenCalledOnce());
});
it("reports clipboard failures in the current language without claiming success", async () => {
	copy.mockRejectedValue(new Error("Denied"));
	fireEvent.click(await mount({ language: "pl" }));
	await waitFor(() =>
		expect(toast.error).toHaveBeenCalledWith(
			"Nie udało się udostępnić profilu. Spróbuj ponownie.",
		),
	);
	expect(toast.success).not.toHaveBeenCalled();
});
it("prevents duplicate native share requests while the share sheet is open", async () => {
	let finish!: () => void;
	nativeShare.mockImplementation(
		() =>
			new Promise<void>((resolve) => {
				finish = resolve;
			}),
	);
	Object.defineProperty(navigator, "share", {
		configurable: true,
		value: nativeShare,
	});
	const button = await mount();
	fireEvent.click(button);
	fireEvent.click(button);
	expect(button.hasAttribute("disabled")).toBe(true);
	expect(nativeShare).toHaveBeenCalledOnce();
	await act(async () => {
		finish();
	});
	expect(button.hasAttribute("disabled")).toBe(false);
});
