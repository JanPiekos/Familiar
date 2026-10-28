import { Link, useLocation } from "@tanstack/react-router";
import { FileText, ListChecks, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
	OutlineHome,
	OutlineReceipt,
	SolidHome,
	SolidReceipt,
} from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { localizePath, stripLocaleFromPathname } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type NavigationItem = { path: string; label: string; icon: ReactNode };

export function SiteNavigationLinks({
	layout = "menu",
	includeDashboard = false,
	includeRequests = false,
	onNavigate,
}: {
	layout?: "header" | "menu";
	includeDashboard?: boolean;
	includeRequests?: boolean;
	onNavigate?: () => void;
}) {
	const { t, i18n } = useTranslation();
	const location = useLocation();
	const pathname = stripLocaleFromPathname(location.pathname);
	const isActive = (path: string) =>
		pathname === path || (path !== "/" && pathname.startsWith(`${path}/`));
	const primary: NavigationItem[] = [
		{
			path: "/",
			label: t("header.navigation.home", "Home"),
			icon: isActive("/") ? (
				<SolidHome aria-hidden="true" />
			) : (
				<OutlineHome aria-hidden="true" />
			),
		},
		{
			path: "/shop",
			label: t("header.navigation.shop", "Shop"),
			icon: isActive("/shop") ? (
				<SolidReceipt aria-hidden="true" />
			) : (
				<OutlineReceipt aria-hidden="true" />
			),
		},
	];
	if (includeRequests)
		primary.push({
			path: "/my-requests",
			label: t("ui.requests", "Requests"),
			icon: <ListChecks aria-hidden="true" />,
		});
	const dashboard: NavigationItem[] = [
		{
			path: "/dashboard/commissions_requests",
			label: t("ui.commissions_requests", "Commissions Requests"),
			icon: <ListChecks aria-hidden="true" />,
		},
		{
			path: "/dashboard/services",
			label: t("ui.services", "Services"),
			icon: <Settings aria-hidden="true" />,
		},
		{
			path: "/dashboard/forms_templates",
			label: t("ui.forms", "Forms"),
			icon: <FileText aria-hidden="true" />,
		},
	];
	const renderLinks = (items: NavigationItem[]) =>
		items.map((item) => (
			<Button
				key={item.path}
				asChild
				size="xl"
				variant={
					isActive(item.path)
						? layout === "header"
							? "default"
							: "secondary"
						: "ghost"
				}
				className={cn(
					"justify-start",
					layout === "menu" && "w-full gap-3 rounded-xl px-3",
				)}
			>
				<Link
					to={localizePath(item.path, i18n.language)}
					preload={false}
					aria-current={isActive(item.path) ? "page" : undefined}
					onClick={onNavigate}
				>
					<span aria-hidden="true" className="inline-flex shrink-0">
						{item.icon}
					</span>
					<span>{item.label}</span>
				</Link>
			</Button>
		));
	return (
		<>
			{renderLinks(primary)}
			{includeDashboard && (
				<>
					<Separator className="my-2" />
					<p className="px-3 py-1 text-xs font-medium text-muted-foreground">
						{t("header.artist-dashboard", "Dashboard")}
					</p>
					{renderLinks(dashboard)}
				</>
			)}
		</>
	);
}
