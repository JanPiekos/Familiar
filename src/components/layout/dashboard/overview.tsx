import { Surface } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import {
	ArrowUpRight,
	BriefcaseBusiness,
	FileText,
	Images,
	Inbox,
	Settings,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { localizePath } from "@/lib/i18n";
import { useAuth } from "@/providers/auth";
import type { TUserResponse } from "@/types/user";
import { TRoles } from "@/types/user/roles";
import UserAvatar from "../profile/avatar";
import { DashboardHeader } from "./header";

export function DashboardOverview() {
	const { user } = useAuth();
	if (!user) return null;
	return <DashboardOverviewContent user={user} />;
}

export function DashboardOverviewContent({ user }: { user: TUserResponse }) {
	const { t, i18n } = useTranslation();
	const creator = user.roles.includes(TRoles.Artist);
	const cards = creator
		? [
				{
					title: t("ui.commissions_requests"),
					description: t("dashboard_workspace.requests_description"),
					path: "/dashboard/commissions_requests",
					icon: Inbox,
				},
				{
					title: t("ui.services"),
					description: t("dashboard_workspace.services_description"),
					path: "/dashboard/services",
					icon: BriefcaseBusiness,
				},
				{
					title: t("ui.forms"),
					description: t("dashboard_workspace.forms_description"),
					path: "/dashboard/forms_templates",
					icon: FileText,
				},
			]
		: [
				{
					title: t("dashboard_workspace.settings"),
					description: t("dashboard_workspace.settings_description"),
					path: "/settings/profile",
					icon: Settings,
				},
			];
	return (
		<>
			<DashboardHeader title={t("dashboard_workspace.overview")} />
			<main className="space-y-7 p-5 sm:p-6">
				<section className="space-y-3">
					<p className="text-sm text-muted-foreground">
						{t("dashboard_workspace.workspace")}
					</p>
					<h1 className="break-words text-3xl font-semibold tracking-tight text-foreground [overflow-wrap:anywhere]">
						{t("dashboard_workspace.welcome", {
							name: user.displayName || user.username,
						})}
					</h1>
					<p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
						{t("dashboard_workspace.description")}
					</p>
				</section>
				<Surface
					variant="secondary"
					className="flex flex-wrap items-center justify-between gap-5 rounded-3xl border p-5 sm:p-6"
				>
					<div className="flex min-w-0 items-center gap-4">
						<UserAvatar user={user} size="xl" />
						<div className="min-w-0">
							<h2 className="break-words text-lg font-semibold text-foreground [overflow-wrap:anywhere]">
								{user.displayName || user.username}
							</h2>
							<p className="text-sm text-muted-foreground">@{user.username}</p>
						</div>
					</div>
					<div className="flex flex-wrap gap-2">
						{user.username && (
							<Button asChild size="xl">
								<Link
									to={localizePath(`/user/${user.username}`, i18n.language)}
								>
									<Images aria-hidden="true" />
									{t("dashboard_workspace.open_portfolio")}
								</Link>
							</Button>
						)}
						<Button asChild variant="outline" size="xl">
							<Link to={localizePath("/settings/profile", i18n.language)}>
								{t("dashboard_workspace.edit_profile")}
							</Link>
						</Button>
					</div>
				</Surface>
				<section className="space-y-3">
					<h2 className="text-lg font-semibold text-foreground">
						{t(
							creator
								? "dashboard_workspace.manage_work"
								: "dashboard_workspace.account",
						)}
					</h2>
					<div className="grid gap-3 md:grid-cols-3">
						{cards.map(({ title, description, path, icon: Icon }) => (
							<Link
								key={path}
								to={localizePath(path, i18n.language)}
								className="group flex flex-col gap-4 rounded-3xl border p-5 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<div className="flex items-center justify-between">
									<div className="flex size-10 items-center justify-center rounded-2xl bg-muted">
										<Icon
											aria-hidden="true"
											className="size-5 text-foreground"
										/>
									</div>
									<ArrowUpRight
										aria-hidden="true"
										className="size-4 text-muted-foreground"
									/>
								</div>
								<div>
									<h3 className="font-semibold text-foreground">{title}</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
										{description}
									</p>
								</div>
							</Link>
						))}
					</div>
				</section>
			</main>
		</>
	);
}
