import { Link, useLocation } from "@tanstack/react-router";
import {
	BriefcaseBusiness,
	FileText,
	Images,
	Inbox,
	LayoutDashboard,
	Settings,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { localizePath, stripLocaleFromPathname } from "@/lib/i18n";
import { useAuth } from "@/providers/auth";
import type { TUserResponse } from "@/types/user";
import { TRoles } from "@/types/user/roles";

export function DashboardSidebar() {
	const { user } = useAuth();
	const { pathname } = useLocation();
	return <DashboardNavigation user={user} pathname={pathname} />;
}

export function DashboardNavigation({
	user,
	pathname,
}: {
	user: TUserResponse | null;
	pathname: string;
}) {
	const { t, i18n } = useTranslation();
	const path = stripLocaleFromPathname(pathname).replace(/\/$/, "");
	const links = [
		{
			path: "/dashboard",
			label: t("dashboard_workspace.overview"),
			icon: LayoutDashboard,
		},
		...(user?.roles.includes(TRoles.Artist)
			? [
					{
						path: "/dashboard/commissions_requests",
						label: t("ui.commissions_requests"),
						icon: Inbox,
					},
					{
						path: "/dashboard/services",
						label: t("ui.services"),
						icon: BriefcaseBusiness,
					},
					{
						path: "/dashboard/forms_templates",
						label: t("ui.forms"),
						icon: FileText,
					},
				]
			: []),
	];
	return (
		<aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
			<p className="mb-3 hidden px-3 text-xs font-medium uppercase tracking-widest text-muted-foreground lg:block">
				{t("dashboard_workspace.workspace")}
			</p>
			<nav
				aria-label={t("dashboard_workspace.navigation")}
				className="flex gap-1 overflow-x-auto rounded-3xl border bg-surface p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-col"
			>
				{links.map(({ path: to, label, icon: Icon }) => (
					<Button
						asChild
						key={to}
						variant={path === to ? "default" : "ghost"}
						size="xl"
						className="h-10 shrink-0 justify-start rounded-2xl lg:w-full"
					>
						<Link
							to={localizePath(to, i18n.language)}
							aria-current={path === to ? "page" : undefined}
						>
							<Icon aria-hidden="true" />
							{label}
						</Link>
					</Button>
				))}
			</nav>
			<nav
				aria-label={t("dashboard_workspace.account")}
				className="mt-4 hidden flex-col gap-1 p-2 lg:flex"
			>
				{user?.username && (
					<Button
						asChild
						variant="ghost"
						size="xl"
						className="justify-start rounded-2xl"
					>
						<Link to={localizePath(`/user/${user.username}`, i18n.language)}>
							<Images aria-hidden="true" />
							{t("ui.portfolio")}
						</Link>
					</Button>
				)}
				<Button
					asChild
					variant="ghost"
					size="xl"
					className="justify-start rounded-2xl"
				>
					<Link to={localizePath("/settings/profile", i18n.language)}>
						<Settings aria-hidden="true" />
						{t("dashboard_workspace.settings")}
					</Link>
				</Button>
			</nav>
		</aside>
	);
}
