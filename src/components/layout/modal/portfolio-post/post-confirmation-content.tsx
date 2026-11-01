import { Surface } from "@heroui/react";
import type { ComponentProps, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

/** Keep viewer and portfolio-card confirmations on the same surfaces and controls. */
export function PostConfirmationContent({
	title,
	description,
	postTitle,
	icon,
	error,
	confirmText,
	disabled,
	confirmDisabled,
	onConfirm,
	className,
	...props
}: Omit<ComponentProps<typeof AlertDialogContent>, "title" | "children"> & {
	title: string;
	description: ReactNode;
	postTitle?: string | null;
	icon: ReactNode;
	error?: ReactNode;
	confirmText: string;
	disabled: boolean;
	confirmDisabled?: boolean;
	onConfirm: () => void;
}) {
	const { t } = useTranslation();
	return (
		<AlertDialogContent
			className={cn(
				"flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-3xl bg-background p-0 outline-none data-[size=default]:sm:max-w-md",
				className,
			)}
			{...props}
		>
			<Surface className="min-h-0 overflow-y-auto p-5 text-left sm:p-6">
				<div
					className="mb-4 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive"
					aria-hidden="true"
				>
					{icon}
				</div>
				<AlertDialogTitle className="text-xl leading-snug text-foreground">
					{title}
				</AlertDialogTitle>
				<AlertDialogDescription className="mt-2 text-pretty leading-relaxed text-foreground/70">
					{description}
				</AlertDialogDescription>
				{postTitle && (
					<Surface
						variant="secondary"
						className="mt-4 rounded-2xl border border-border px-4 py-3"
					>
						<p className="line-clamp-2 break-words text-sm font-medium text-foreground">
							{postTitle}
						</p>
					</Surface>
				)}
				{error && <div className="mt-4">{error}</div>}
			</Surface>
			<Surface className="shrink-0">
				<AlertDialogFooter className="flex-row p-4 sm:px-6">
					<AlertDialogCancel
						size="2xl"
						className="flex-1 sm:flex-none"
						disabled={disabled}
					>
						{t("ui.cancel")}
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						size="2xl"
						disabled={disabled || confirmDisabled}
						className="flex-1 sm:flex-none"
						onClick={(event) => {
							event.preventDefault();
							onConfirm();
						}}
					>
						{confirmText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</Surface>
		</AlertDialogContent>
	);
}
