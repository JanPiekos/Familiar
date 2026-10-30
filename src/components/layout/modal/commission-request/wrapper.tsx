import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface RequestFieldBlockShellProps {
	label?: string;
	description?: string;
	required?: boolean;
	children: ReactNode;
}

export function RequestFieldBlockShell({
	label,
	description,
	required,
	children,
}: RequestFieldBlockShellProps) {
	const { t } = useTranslation();
	return (
		<div className="space-y-3">
			{label ? (
				<div className="space-y-1">
					<div className="flex items-center justify-between gap-4">
						<Label className="font-medium text-base">{label}</Label>
						{required ? (
							<span className="text-destructive text-sm">
								{t("ui.required", "Required *")}
							</span>
						) : null}
					</div>
					{description ? (
						<p className="text-muted-foreground text-sm">{description}</p>
					) : null}
				</div>
			) : null}
			{children}
		</div>
	);
}
