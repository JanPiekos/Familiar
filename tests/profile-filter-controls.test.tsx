import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { createInstance } from "i18next";
import { Tag } from "lucide-react";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	FilterBar,
	type FilterGroup,
	type ManagedFilterValue,
} from "@/components/layout/filter-bar";
import en from "@/i18n/en";
import pl from "@/i18n/pl";

vi.mock("@/hooks/ui/use-mobile", () => ({ useIsMobile: () => false }));
const change = vi.fn();
const rows = [{ tags: ["horror"] }];
const groups: FilterGroup<(typeof rows)[number]>[] = [
	{
		id: "tags",
		label: "Tags",
		type: "multiselect",
		icon: Tag,
		getItemValue: (row) => row.tags,
		options: [
			{ id: "horror", label: "Horror" },
			{ id: "fantasy", label: "Fantasy" },
		],
	},
];
beforeEach(() => {
	change.mockReset();
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	);
	HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});
function Controls() {
	const [values, setValues] = useState<Record<string, ManagedFilterValue>>({
		tags: { value: ["horror"], operator: "include" },
	});
	return (
		<FilterBar
			data={rows}
			groups={groups}
			values={values}
			onFilterChange={(id, value, operator) => {
				change(id, value, operator);
				setValues((current) => ({ ...current, [id]: { value, operator } }));
			}}
			searchPlaceholder="Search portfolio"
		/>
	);
}
async function app(locale: string) {
	const i18n = createInstance();
	await i18n.init({
		lng: locale,
		fallbackLng: "en",
		resources: { en: { translation: en }, pl: { translation: pl } },
		interpolation: { escapeValue: false },
	});
	render(
		<I18nextProvider i18n={i18n}>
			<Controls />
		</I18nextProvider>,
	);
	return i18n;
}
describe("filter control translations", () => {
	it.each(["en", "pl"])(
		"translates and searches operator labels while preserving their API values in %s",
		async (locale) => {
			await app(locale);
			const include = locale === "pl" ? "zawiera" : "includes";
			const exclude = locale === "pl" ? "nie zawiera" : "excludes";
			const search = locale === "pl" ? "Szukaj..." : "Search...";
			fireEvent.click(screen.getByRole("button", { name: include }));
			expect(
				screen.getByText(locale === "pl" ? "Operatory" : "Operators"),
			).toBeDefined();
			fireEvent.change(screen.getByPlaceholderText(search), {
				target: { value: exclude },
			});
			fireEvent.click(await screen.findByRole("option", { name: exclude }));
			await waitFor(() => expect(screen.queryByRole("option")).toBeNull());
			expect(change).toHaveBeenLastCalledWith("tags", ["horror"], "exclude");
			expect(screen.getByRole("button", { name: exclude })).toBeDefined();
			fireEvent.click(
				screen.getByRole("button", {
					name: locale === "pl" ? "Filtr" : "Filter",
				}),
			);
			expect(await screen.findByPlaceholderText(search)).toBeDefined();
			fireEvent.keyDown(screen.getByPlaceholderText(search), { key: "Escape" });
			await waitFor(() =>
				expect(screen.queryByPlaceholderText(search)).toBeNull(),
			);
			fireEvent.click(
				screen.getByRole("button", {
					name: locale === "pl" ? "Wyczyść" : "Clear",
				}),
			);
			await waitFor(() =>
				expect(screen.queryByRole("button", { name: exclude })).toBeNull(),
			);
			expect(change).toHaveBeenLastCalledWith("tags", [], undefined);
		},
	);
	it("updates active operators and menu labels when the app language changes", async () => {
		const i18n = await app("en");
		expect(screen.getByRole("button", { name: "includes" })).toBeDefined();
		await act(async () => {
			await i18n.changeLanguage("pl");
		});
		expect(screen.queryByRole("button", { name: "includes" })).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "zawiera" }));
		expect(screen.getByText("Operatory")).toBeDefined();
		expect(screen.getByPlaceholderText("Szukaj...")).toBeDefined();
		expect(screen.getByRole("option", { name: "nie zawiera" })).toBeDefined();
		expect(change).not.toHaveBeenCalled();
	});
});
