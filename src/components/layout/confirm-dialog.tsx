import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { OutlineClose } from "../icons/icons";
import appI18n from "@/lib/i18n";
import { useTranslation } from "react-i18next";

export interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: ReactNode;
	description: ReactNode;
	onConfirm: () => void;
	confirmText?: string;
	cancelText?: string;
	isPending?: boolean;
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	onConfirm,
	confirmText = appI18n.t("ui.confirm", "Confirm"),
	cancelText = appI18n.t("ui.cancel", "Cancel"),
	isPending = false,
	variant = "destructive",
}: ConfirmDialogProps) {
	const { t } = useTranslation();
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent
				className="rounded-3xl p-3 data-[size=default]:sm:max-w-md"
				onOpenAutoFocus={(event) => {
					if (isPending && event.target instanceof HTMLElement) {
						event.preventDefault();
						event.target.focus({ preventScroll: true });
					}
				}}
			>
				<AlertDialogHeader className="block space-y-2 text-left">
					<div className="flex items-center justify-between">
						<AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
						<AlertDialogCancel
							size={"icon-lg"}
							variant="ghost"
							aria-label={t("ui.close", "Close")}
							disabled={isPending}
						>
							<OutlineClose />
						</AlertDialogCancel>
					</div>
					<AlertDialogDescription className="text-base">
						{description}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="mt-4 gap-2">
					<AlertDialogCancel size="xl" variant="outline" disabled={isPending}>
						{cancelText}
					</AlertDialogCancel>
					<Button
						size="xl"
						variant={variant}
						onClick={onConfirm}
						disabled={isPending}
					>
						{isPending ? (
							<>
								<Loader2 className="animate-spin" />
								{confirmText}
							</>
						) : (
							confirmText
						)}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
