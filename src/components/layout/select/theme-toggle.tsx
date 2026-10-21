import React from "react";
import { useTranslation } from "react-i18next";
import { Sun as SunOutline } from "@keyline-icons/react"
import { Moon as MoonOutline } from "@keyline-icons/react"
import { Monitor as MonitorOutline } from "@keyline-icons/react"
import { ChevronDown as ChevronDownOutline } from "@keyline-icons/react"
import { Check as CheckOutline } from "@keyline-icons/react"
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/theme";

export default function ThemeToggle() {
	const { t } = useTranslation();
	const { userTheme, setTheme } = useTheme();
	const [open, setOpen] = React.useState(false);

	const themes = [
		{
			value: "light",
			label: t("components.theme_switcher.light", "Light"),
			icon: SunOutline,
		},
		{
			value: "dark",
			label: t("components.theme_switcher.dark", "Dark"),
			icon: MoonOutline,
		},
		{
			value: "oled",
			label: t("components.theme_switcher.oled", "OLED"),
			icon: MoonOutline,
		},
		{
			value: "system",
			label: t("components.theme_switcher.system", "System"),
			icon: MonitorOutline,
		},
	] as const;

	const selectedTheme = themes.find((theme) => theme.value === userTheme);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					role="combobox"
					variant={"secondary"}
					aria-controls="theme-options"
					className="w-fit"
					aria-expanded={open}
					size={"xl"}
				>
					{selectedTheme ? (
						<>
							<selectedTheme.icon className="size-4" />
							<span className="hidden sm:inline-block">
								{selectedTheme.label}
							</span>
						</>
					) : (
						t("components.theme_switcher.toggle", "Toggle theme")
					)}
					<ChevronDownOutline className="ml-auto size-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-37.5 p-0 overflow-hidden">
				<Command>
					<CommandList id="theme-options">
						<CommandGroup>
							{themes.map((theme) => (
								<CommandItem
									key={theme.value}
									value={theme.value}
									onSelect={() => {
										setTheme(theme.value);
										setOpen(false);
									}}
								>
									<theme.icon />
									{theme.label}
									<CheckOutline
										className={cn(
											"ml-auto size-4",
											userTheme === theme.value ? "opacity-100" : "opacity-0",
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
