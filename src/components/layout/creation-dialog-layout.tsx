import { type ReactNode, useRef } from "react";
import { useTranslation } from "react-i18next";
import { OutlineClose } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function CreationDialogLayout({
	open,
	onOpenChange,
	title,
	description,
	isBusy,
	children,
	footer,
	className,
	bodyClassName,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	isBusy: boolean;
	children: ReactNode;
	footer: ReactNode;
	className?: string;
	bodyClassName?: string;
}) {
	const { t } = useTranslation();
	const content = useRef<HTMLDivElement>(null);
	const changeOpen = (next: boolean) => {
		if (!isBusy) onOpenChange(next);
	};
	return (
		<Dialog open={open} onOpenChange={changeOpen}>
			<DialogContent
				ref={content}
				tabIndex={-1}
				showCloseButton={false}
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					content.current?.focus({ preventScroll: true });
				}}
				onEscapeKeyDown={(event) => {
					if (isBusy) event.preventDefault();
				}}
				onPointerDownOutside={(event) => {
					if (isBusy) event.preventDefault();
				}}
				className={cn(
					"flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-3xl bg-background p-0 sm:max-w-3xl",
					className,
				)}
			>
				<header className="flex shrink-0 items-start gap-4 border-b p-5 sm:p-6">
					<div className="min-w-0 flex-1 space-y-2">
						<DialogTitle className="leading-snug">{title}</DialogTitle>
						<DialogDescription className="text-pretty leading-relaxed">
							{description}
						</DialogDescription>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="icon-xl"
						className="-mt-1 -mr-2 shrink-0"
						disabled={isBusy}
						aria-label={t("ui.close", "Close")}
						onClick={() => changeOpen(false)}
					>
						<OutlineClose aria-hidden="true" />
					</Button>
				</header>
				<div
					className={cn(
						"min-h-0 overflow-y-auto overscroll-contain",
						bodyClassName,
					)}
				>
					{children}
				</div>
				<footer className="shrink-0 border-t bg-background">{footer}</footer>
			</DialogContent>
		</Dialog>
	);
}
