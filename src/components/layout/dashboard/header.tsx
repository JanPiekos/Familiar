import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export function DashboardHeader({
	title,
	actions,
}: {
	title: string;
	actions?: ReactNode;
}) {
	const { t } = useTranslation();
	return (
		<header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
			<p className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
				<span>{t("dashboard_workspace.title")}</span>
				<ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
				<span className="font-medium text-foreground">{title}</span>
			</p>
			{actions && (
				<div className="flex flex-wrap items-center gap-2">{actions}</div>
			)}
		</header>
	);
}
