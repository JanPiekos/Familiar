import { useSyncExternalStore } from "react";

export const ACCESSIBILITY_KEY = "familiar-accessibility-v1";
export const FONT_OPTIONS = ["default", "dyslexic", "system"] as const;
export const COLOR_OPTIONS = ["default", "red-green", "blue-yellow"] as const;
export const TEXT_SIZES = [100, 112, 125, 150] as const;
export const GUIDE_HEIGHTS = [80, 120, 180, 240] as const;
export const DEFAULT_ACCESSIBILITY = {
	font: "default",
	colorVision: "default",
	textSize: 100,
	reduceMotion: false,
	highContrast: false,
	underlineLinks: false,
	spaciousText: false,
	readingGuide: false,
	guideHeight: 120,
} as const;
export type AccessibilityPreferences = {
	font: (typeof FONT_OPTIONS)[number];
	colorVision: (typeof COLOR_OPTIONS)[number];
	textSize: (typeof TEXT_SIZES)[number];
	reduceMotion: boolean;
	highContrast: boolean;
	underlineLinks: boolean;
	spaciousText: boolean;
	readingGuide: boolean;
	guideHeight: (typeof GUIDE_HEIGHTS)[number];
};
export function parseAccessibility(value: unknown): AccessibilityPreferences {
	const input =
		value && typeof value === "object"
			? (value as Record<string, unknown>)
			: {};
	const prefs: AccessibilityPreferences = { ...DEFAULT_ACCESSIBILITY };
	for (const key of [
		"reduceMotion",
		"highContrast",
		"underlineLinks",
		"spaciousText",
		"readingGuide",
	] as const)
		prefs[key] = input[key] === true;
	if (FONT_OPTIONS.includes(input.font as AccessibilityPreferences["font"]))
		prefs.font = input.font as AccessibilityPreferences["font"];
	if (
		COLOR_OPTIONS.includes(
			input.colorVision as AccessibilityPreferences["colorVision"],
		)
	)
		prefs.colorVision =
			input.colorVision as AccessibilityPreferences["colorVision"];
	if (
		TEXT_SIZES.includes(input.textSize as AccessibilityPreferences["textSize"])
	)
		prefs.textSize = input.textSize as AccessibilityPreferences["textSize"];
	if (
		GUIDE_HEIGHTS.includes(
			input.guideHeight as AccessibilityPreferences["guideHeight"],
		)
	)
		prefs.guideHeight =
			input.guideHeight as AccessibilityPreferences["guideHeight"];
	return prefs;
}
let current: AccessibilityPreferences = DEFAULT_ACCESSIBILITY;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
function apply(value: unknown) {
	current = parseAccessibility(value);
	const root = document.documentElement;
	for (const [name, setting] of Object.entries(current))
		root.setAttribute(
			`data-a11y-${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`,
			String(setting),
		);
	for (const listener of listeners) listener();
}
export function initializeAccessibility() {
	try {
		apply(JSON.parse(localStorage.getItem(ACCESSIBILITY_KEY) || "null"));
	} catch {
		apply(DEFAULT_ACCESSIBILITY);
	}
	const sync = (event: StorageEvent) => {
		if (event.key !== ACCESSIBILITY_KEY && event.key !== null) return;
		try {
			apply(JSON.parse(event.newValue || "null"));
		} catch {
			apply(DEFAULT_ACCESSIBILITY);
		}
	};
	window.addEventListener("storage", sync);
	return () => window.removeEventListener("storage", sync);
}
export function saveAccessibility(value: AccessibilityPreferences) {
	const next = parseAccessibility(value);
	let persisted = true;
	try {
		localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(next));
	} catch {
		persisted = false;
	}
	apply(next);
	return persisted;
}
export function useAccessibility() {
	return useSyncExternalStore(
		subscribe,
		() => current,
		() => DEFAULT_ACCESSIBILITY,
	);
}
