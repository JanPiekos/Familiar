import { ChevronRight, Languages, SunMoon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	DropdownMenuInput,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { MENU_ITEM_LAYOUT_CLASS_NAME } from "@/components/ui/menu-styles";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { languages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/theme";
import { useLanguageSelection } from "./select/language";
import { useThemeOptions } from "./select/theme-toggle";

function usePreferences(onLanguageChange?: () => void) {
	const { t } = useTranslation();
	const { userTheme, setTheme } = useTheme();
	const themes = useThemeOptions();
	const { selectedLanguage, handleLanguageChange } =
		useLanguageSelection(onLanguageChange);
	return [
		{
			id: "appearance",
			label: t("settings.navigation.appearance.title"),
			icon: SunMoon,
			value: userTheme,
			options: themes.map((theme) => ({
				value: theme.value,
				label: theme.label,
			})),
			onChange: (value: string) => {
				const theme = themes.find((option) => option.value === value);
				if (theme) setTheme(theme.value);
			},
		},
		{
			id: "language",
			label: t("settings.language.language.title"),
			icon: Languages,
			value: selectedLanguage?.value ?? "en",
			options: languages,
			onChange: (value: string) => {
				void handleLanguageChange(value);
			},
		},
	];
}

type Preference = ReturnType<typeof usePreferences>[number];
type PreferenceOption = { label: string; flag?: string };

function OptionLabel({ option }: { option?: PreferenceOption }) {
	return (
		<span className="inline-flex items-center gap-2">
			{option?.flag && <span aria-hidden="true">{option.flag}</span>}
			{option?.label}
		</span>
	);
}

function useLanguageSearch(preference: Preference) {
	const { t, i18n } = useTranslation();
	const [query, setQuery] = useState("");
	const normalize = (value: string) =>
		value
			.normalize("NFD")
			.replace(/\p{Diacritic}/gu, "")
			.toLowerCase();
	const names = new Intl.DisplayNames([i18n.language], { type: "language" });
	const options =
		preference.id === "language"
			? preference.options.filter((option) =>
					normalize(
						`${option.label} ${option.value} ${names.of(option.value) ?? ""}`,
					).includes(normalize(query.trim())),
				)
			: preference.options;
	return {
		query,
		setQuery,
		options,
		placeholder: t("components.language_select.search"),
		empty: t("components.language_select.no_results"),
	};
}

function PreferenceMenu({ preference }: { preference: Preference }) {
	const [open, setOpen] = useState(false);
	const search = useLanguageSearch(preference);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const searchable = preference.id === "language";
	useEffect(() => {
		if (!open || !searchable) return;
		const frame = requestAnimationFrame(() => inputRef.current?.focus());
		return () => cancelAnimationFrame(frame);
	}, [open, searchable]);
	return (
		<DropdownMenuSub
			open={open}
			onOpenChange={(value) => {
				setOpen(value);
				if (!value) search.setQuery("");
			}}
		>
			<DropdownMenuSubTrigger className="[&>svg:last-child]:ml-0">
				<preference.icon />
				{preference.label}
				<span className="ml-auto text-xs text-muted-foreground">
					<OptionLabel
						option={preference.options.find(
							(option) => option.value === preference.value,
						)}
					/>
				</span>
			</DropdownMenuSubTrigger>
			<DropdownMenuPortal>
				<DropdownMenuSubContent
					className={searchable ? "w-60" : "min-w-44"}
					collisionPadding={16}
				>
					{searchable && (
						<DropdownMenuInput
							ref={inputRef}
							aria-label={search.placeholder}
							placeholder={search.placeholder}
							value={search.query}
							onChange={(event) => search.setQuery(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Escape") return;
								// Keep menu typeahead and left/right navigation out of the input.
								event.stopPropagation();
								const items = listRef.current?.querySelectorAll<HTMLElement>(
									'[role="menuitemradio"]',
								);
								if (
									event.key === "ArrowDown" ||
									event.key === "ArrowUp" ||
									event.key === "Tab"
								) {
									event.preventDefault();
									const last = event.key === "ArrowUp" || event.shiftKey;
									items?.[last ? items.length - 1 : 0]?.focus();
								} else if (
									event.key === "Enter" &&
									!event.nativeEvent.isComposing
								) {
									event.preventDefault();
									items?.[0]?.click();
								}
							}}
						/>
					)}
					<DropdownMenuRadioGroup
						ref={listRef}
						value={preference.value}
						onValueChange={preference.onChange}
						aria-label={preference.label}
						className="max-h-64 overflow-y-auto overscroll-contain"
					>
						{(searchable ? search.options : preference.options).map(
							(option) => (
								<DropdownMenuRadioItem key={option.value} value={option.value}>
									<OptionLabel option={option} />
								</DropdownMenuRadioItem>
							),
						)}
					</DropdownMenuRadioGroup>
					{searchable && !search.options.length && (
						<p
							role="status"
							className="px-3 py-4 text-center text-sm text-muted-foreground"
						>
							{search.empty}
						</p>
					)}
				</DropdownMenuSubContent>
			</DropdownMenuPortal>
		</DropdownMenuSub>
	);
}

export function AccountPreferenceMenuItems({
	onLanguageChange,
}: {
	onLanguageChange?: () => void;
}) {
	const preferences = usePreferences(onLanguageChange);
	return (
		<>
			{preferences.map((preference) => (
				<PreferenceMenu key={preference.id} preference={preference} />
			))}
		</>
	);
}

export function AccountPreferenceControls({
	onLanguageChange,
}: {
	onLanguageChange?: () => void;
}) {
	const preferences = usePreferences(onLanguageChange);
	const language = preferences.find(
		(preference) => preference.id === "language",
	)!;
	const search = useLanguageSearch(language);
	return (
		<div className="space-y-1">
			{preferences.map((preference) => (
				<details key={preference.id} className="group/preference">
					<summary
						className={cn(
							MENU_ITEM_LAYOUT_CLASS_NAME,
							"flex cursor-pointer list-none items-center rounded-xl hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden",
						)}
					>
						<preference.icon className="size-4 text-muted-foreground" />
						{preference.label}
						<span className="ml-auto text-xs text-muted-foreground">
							<OptionLabel
								option={preference.options.find(
									(option) => option.value === preference.value,
								)}
							/>
						</span>
						<ChevronRight className="size-4 text-muted-foreground group-open/preference:rotate-90" />
					</summary>
					{preference.id === "language" && (
						<DropdownMenuInput
							data-vaul-no-drag
							aria-label={search.placeholder}
							placeholder={search.placeholder}
							value={search.query}
							onChange={(event) => search.setQuery(event.target.value)}
						/>
					)}
					<RadioGroup
						aria-label={preference.label}
						value={preference.value}
						onValueChange={preference.onChange}
						className="max-h-64 gap-0 overflow-y-auto overscroll-contain py-1 pl-6"
						data-vaul-no-drag
					>
						{(preference.id === "language"
							? search.options
							: preference.options
						).map((option) => (
							<label
								key={option.value}
								className={cn(
									MENU_ITEM_LAYOUT_CLASS_NAME,
									"flex cursor-pointer items-center rounded-xl hover:bg-muted",
								)}
							>
								<RadioGroupItem value={option.value} />
								<OptionLabel option={option} />
							</label>
						))}
					</RadioGroup>
					{preference.id === "language" && !search.options.length && (
						<p
							role="status"
							className="px-3 py-4 text-center text-sm text-muted-foreground"
						>
							{search.empty}
						</p>
					)}
				</details>
			))}
		</div>
	);
}
