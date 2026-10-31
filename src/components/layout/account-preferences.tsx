import { ChevronRight, Languages, SunMoon } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
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

export function AccountPreferenceMenuItems({
	onLanguageChange,
}: {
	onLanguageChange?: () => void;
}) {
	const preferences = usePreferences(onLanguageChange);
	return (
		<>
			{preferences.map((preference) => (
				<DropdownMenuSub key={preference.id}>
					<DropdownMenuSubTrigger className="[&>svg:last-child]:ml-0">
						<preference.icon />
						{preference.label}
						<span className="ml-auto text-xs text-muted-foreground">
							{
								preference.options.find(
									(option) => option.value === preference.value,
								)?.label
							}
						</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent className="min-w-44" collisionPadding={16}>
							<DropdownMenuRadioGroup
								value={preference.value}
								onValueChange={preference.onChange}
								aria-label={preference.label}
							>
								{preference.options.map((option) => (
									<DropdownMenuRadioItem
										key={option.value}
										value={option.value}
									>
										{option.label}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>
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
							{
								preference.options.find(
									(option) => option.value === preference.value,
								)?.label
							}
						</span>
						<ChevronRight className="size-4 text-muted-foreground group-open/preference:rotate-90" />
					</summary>
					<RadioGroup
						aria-label={preference.label}
						value={preference.value}
						onValueChange={preference.onChange}
						className="gap-0 py-1 pl-6"
					>
						{preference.options.map((option) => (
							<label
								key={option.value}
								className={cn(
									MENU_ITEM_LAYOUT_CLASS_NAME,
									"flex cursor-pointer items-center rounded-xl hover:bg-muted",
								)}
							>
								<RadioGroupItem value={option.value} />
								{option.label}
							</label>
						))}
					</RadioGroup>
				</details>
			))}
		</div>
	);
}
