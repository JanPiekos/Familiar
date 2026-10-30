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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccessibilitySettings } from "@/components/layout/modal/profile/settings/accessibility-settings";
import en from "@/i18n/en";
import pl from "@/i18n/pl";
import {
	ACCESSIBILITY_KEY,
	DEFAULT_ACCESSIBILITY,
	initializeAccessibility,
	parseAccessibility,
	saveAccessibility,
	useAccessibility,
} from "@/lib/accessibility";
import { MotionProvider } from "@/providers/motion";
const motion = vi.hoisted(() => ({ system: false, value: "" }));
vi.mock("framer-motion", () => ({
	useReducedMotion: () => motion.system,
	MotionConfig: ({ children, reducedMotion }: any) => {
		motion.value = reducedMotion;
		return children;
	},
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), info: vi.fn() } }));
let stop: () => void;
beforeEach(() => {
	localStorage.clear();
	stop = initializeAccessibility();
	motion.system = false;
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
	stop();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});
async function show() {
	const i18n = createInstance();
	await i18n.init({
		lng: "en",
		resources: { en: { translation: en }, pl: { translation: pl } },
	});
	return render(
		<I18nextProvider i18n={i18n}>
			<AccessibilitySettings />
			<button form="accessibility-settings-form" type="submit">
				Save changes
			</button>
		</I18nextProvider>,
	);
}
describe("accessibility preferences", () => {
	it("accepts supported values and rejects malformed stored preferences", () => {
		expect(
			parseAccessibility({
				font: "url(javascript:bad)",
				textSize: 500,
				colorVision: "simulate",
				highContrast: "true",
				reduceMotion: true,
			}),
		).toEqual({ ...DEFAULT_ACCESSIBILITY, reduceMotion: true });
		expect(parseAccessibility(null)).toEqual(DEFAULT_ACCESSIBILITY);
		expect(
			parseAccessibility({
				font: "dyslexic",
				textSize: 125,
				colorVision: "red-green",
			}),
		).toMatchObject({
			font: "dyslexic",
			textSize: 125,
			colorVision: "red-green",
		});
	});
	it("loads saved preferences and safely recovers from invalid JSON", () => {
		stop();
		localStorage.setItem(
			ACCESSIBILITY_KEY,
			JSON.stringify({
				...DEFAULT_ACCESSIBILITY,
				font: "dyslexic",
				textSize: 125,
			}),
		);
		stop = initializeAccessibility();
		expect(document.documentElement.dataset.a11yFont).toBe("dyslexic");
		expect(document.documentElement.dataset.a11yTextSize).toBe("125");
		stop();
		localStorage.setItem(ACCESSIBILITY_KEY, "{broken");
		stop = initializeAccessibility();
		expect(document.documentElement.dataset.a11yFont).toBe("default");
	});
	it("synchronizes across tabs and resets when storage is cleared", () => {
		window.dispatchEvent(
			new StorageEvent("storage", {
				key: ACCESSIBILITY_KEY,
				newValue: JSON.stringify({
					...DEFAULT_ACCESSIBILITY,
					colorVision: "blue-yellow",
				}),
			}),
		);
		expect(document.documentElement.dataset.a11yColorVision).toBe(
			"blue-yellow",
		);
		window.dispatchEvent(
			new StorageEvent("storage", { key: null, newValue: null }),
		);
		expect(document.documentElement.dataset.a11yColorVision).toBe("default");
	});
	it("keeps draft changes unapplied until Save and restores them after remount", async () => {
		const view = await show();
		fireEvent.click(screen.getByRole("switch", { name: "Higher contrast" }));
		expect(document.documentElement.dataset.a11yHighContrast).toBe("false");
		fireEvent.click(screen.getByText("Save changes"));
		await waitFor(() =>
			expect(document.documentElement.dataset.a11yHighContrast).toBe("true"),
		);
		expect(
			JSON.parse(localStorage.getItem(ACCESSIBILITY_KEY)!).highContrast,
		).toBe(true);
		view.unmount();
		await show();
		expect(
			screen
				.getByRole("switch", { name: "Higher contrast" })
				.getAttribute("aria-checked"),
		).toBe("true");
		fireEvent.click(screen.getByText("Restore defaults"));
		expect(document.documentElement.dataset.a11yHighContrast).toBe("true");
		fireEvent.click(screen.getByText("Save changes"));
		await waitFor(() =>
			expect(document.documentElement.dataset.a11yHighContrast).toBe("false"),
		);
	});
	it("does not save abandoned edits", async () => {
		const view = await show();
		fireEvent.click(screen.getByRole("switch", { name: "Underline links" }));
		view.unmount();
		expect(localStorage.getItem(ACCESSIBILITY_KEY)).toBeNull();
		expect(document.documentElement.dataset.a11yUnderlineLinks).toBe("false");
	});
	it("applies session preferences even if browser storage fails", () => {
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw Error("blocked");
		});
		expect(
			saveAccessibility({
				...DEFAULT_ACCESSIBILITY,
				font: "system",
				highContrast: true,
			}),
		).toBe(false);
		expect(document.documentElement.dataset.a11yFont).toBe("system");
		expect(document.documentElement.dataset.a11yHighContrast).toBe("true");
	});
	it("honors both system and application reduced-motion preferences", () => {
		motion.system = true;
		const view = render(<MotionProvider>Content</MotionProvider>);
		expect(motion.value).toBe("always");
		motion.system = false;
		act(() => {
			saveAccessibility({ ...DEFAULT_ACCESSIBILITY, reduceMotion: true });
		});
		expect(motion.value).toBe("always");
		act(() => {
			saveAccessibility({ ...DEFAULT_ACCESSIBILITY, reduceMotion: false });
		});
		view.rerender(<MotionProvider>Content</MotionProvider>);
		expect(motion.value).toBe("user");
	});
	it("provides matching English and Polish control labels", () => {
		expect(Object.keys(en.accessibility).sort()).toEqual(
			Object.keys(pl.accessibility).sort(),
		);
	});
});
