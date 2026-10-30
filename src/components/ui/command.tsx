import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";
import type * as React from "react";
import { useTranslation } from "react-i18next";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "src/components/ui/dialog";
import { cn } from "src/lib/utils";
import appI18n from "@/lib/i18n";
import { surfaceClasses } from "@/lib/surface-classes";
import { useSurface } from "@/lib/surface-context";
import {
	MENU_ITEM_LAYOUT_CLASS_NAME,
	MENU_SEARCH_HEIGHT_CLASS_NAME,
} from "./menu-styles";

function Command({
	className,
	style,
	...props
}: React.ComponentProps<typeof CommandPrimitive>) {
	const substrate = useSurface();
	const level = Math.min(substrate + 2, 0);

	return (
		<CommandPrimitive
			data-slot="command"
			className={cn(
				"text-elevated-foreground flex h-full w-full flex-col overflow-hidden rounded-(--command-content-radius) group/command",
				className,
				surfaceClasses(level, 0),
			)}
			style={
				{
					"--command-content-radius": "1.25rem",
					"--command-content-padding": "0.25rem",
					...style,
				} as React.CSSProperties
			}
			{...props}
		/>
	);
}

function CommandDialog({
	title = appI18n.t("ui.command_palette", "Command Palette"),
	description = appI18n.t(
		"ui.search_for_a_command_to_run",
		"Search for a command to run...",
	),
	children,
	className,
	showCloseButton = true,
	...props
}: React.ComponentProps<typeof Dialog> & {
	title?: string;
	description?: string;
	className?: string;
	showCloseButton?: boolean;
}) {
	useTranslation();
	return (
		<Dialog {...props}>
			<DialogHeader className="sr-only">
				<DialogTitle>{title}</DialogTitle>
				<DialogDescription>{description}</DialogDescription>
			</DialogHeader>
			<DialogContent
				className={cn("overflow-hidden p-0", className)}
				showCloseButton={showCloseButton}
			>
				<Command>{children}</Command>
			</DialogContent>
		</Dialog>
	);
}

function CommandInput({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
	return (
		<div
			data-slot="command-input-wrapper"
			className={cn(
				"flex shrink-0 items-center gap-2 border-b px-4 peer",
				MENU_SEARCH_HEIGHT_CLASS_NAME,
			)}
		>
			<SearchIcon className="size-4 shrink-0 opacity-50" />
			<CommandPrimitive.Input
				data-slot="command-input"
				className={cn(
					"placeholder:text-muted-foreground flex h-full min-w-0 flex-1 rounded-lg bg-transparent py-0 text-sm leading-5 outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				{...props}
			/>
		</div>
	);
}

function CommandList({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
	return (
		<CommandPrimitive.List
			data-slot="command-list"
			className={cn(
				"max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto p-(--command-content-padding) group/list",

				// First item styling
				"[&_[cmdk-list-sizer]>:nth-child(1_of_:not([hidden],.hidden))]:rounded-t-[calc(var(--command-content-radius)-var(--command-content-padding))]!",
				"[&_[cmdk-list-sizer]>:nth-child(1_of_:not([hidden],.hidden))_[cmdk-group-items]>:nth-child(1_of_:not([hidden],.hidden))]:rounded-t-[calc(var(--command-content-radius)-var(--command-content-padding))]!",

				// Reset First item to Small Rounding if Command has Input
				"peer-data-[slot=command-input-wrapper]:[&_[cmdk-list-sizer]>:nth-child(1_of_:not([hidden],.hidden))]:rounded-t-lg!",
				"peer-data-[slot=command-input-wrapper]:[&_[cmdk-list-sizer]>:nth-child(1_of_:not([hidden],.hidden))_[cmdk-group-items]>:nth-child(1_of_:not([hidden],.hidden))]:rounded-t-lg!",

				// Last item styling
				"[&_[cmdk-list-sizer]>:nth-last-child(1_of_:not([hidden],.hidden))]:rounded-b-[calc(var(--command-content-radius)-var(--command-content-padding))]!",
				"[&_[cmdk-list-sizer]>:nth-last-child(1_of_:not([hidden],.hidden))_[cmdk-group-items]>:nth-last-child(1_of_:not([hidden],.hidden))]:rounded-b-[calc(var(--command-content-radius)-var(--command-content-padding))]!",

				className,
			)}
			{...props}
		/>
	);
}

function CommandEmpty({
	...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
	return (
		<CommandPrimitive.Empty
			data-slot="command-empty"
			className="py-6 text-center text-sm"
			{...props}
		/>
	);
}

function CommandGroup({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
	return (
		<CommandPrimitive.Group
			data-slot="command-group"
			className={cn(
				"text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium group/group",
				className,
			)}
			{...props}
		/>
	);
}

function CommandSeparator({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
	return (
		<CommandPrimitive.Separator
			data-slot="command-separator"
			className={cn("bg-border -mx-1 h-px", className)}
			{...props}
		/>
	);
}

function CommandItem({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
	return (
		<CommandPrimitive.Item
			data-slot="command-item"
			className={cn(
				MENU_ITEM_LAYOUT_CLASS_NAME,
				"data-[selected=true]:bg-black/6 dark:data-[selected=true]:bg-white/6",
				"data-[selected=true]:text-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center rounded-lg outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				"data-[selected=true]:shadow-none",
				className,
			)}
			{...props}
		/>
	);
}

function CommandShortcut({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="command-shortcut"
			className={cn(
				"text-muted-foreground ml-auto text-xs tracking-widest",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
};
