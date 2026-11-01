import { Surface } from "@heroui/react";
import {
	createFileRoute,
	Link,
	Outlet,
	useLocation,
} from "@tanstack/react-router";
import { Home, LockKeyhole } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AccountNavigation } from "@/components/layout/account-navigation";
import { DashboardSidebar } from "@/components/layout/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	detectLocaleFromPathOrParams,
	localizePath,
	setSSRLanguage,
	stripLocaleFromPathname,
} from "@/lib/i18n";
import { useAuth } from "@/providers/auth";
import { TRoles } from "@/types/user/roles";

export const Route = createFileRoute("/{-$locale}/dashboard")({
	beforeLoad: async ({ params, location }) => {
		await setSSRLanguage(
			detectLocaleFromPathOrParams(params, location.pathname),
		);
	},
	component: DashboardLayout,
});

export function DashboardLayout() {
	const { user, isPending } = useAuth();
	const { t, i18n } = useTranslation();
	const path = stripLocaleFromPathname(useLocation().pathname).replace(
		/\/$/,
		"",
	);
	const overview = path === "/dashboard";
	const allowed = overview || user?.roles.includes(TRoles.Artist);
	return (
		<div className="mobile-dock-layout mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 lg:px-8">
			<header className="sticky top-0 z-40 flex h-0 shrink-0 items-center justify-between bg-background lg:mb-6 lg:h-16">
				<Button
					asChild
					variant="outline"
					size="xl"
					className="hidden h-10 lg:inline-flex"
				>
					<Link to={localizePath("/", i18n.language)}>
						<Home aria-hidden="true" />
						{t("header.navigation.home")}
					</Link>
				</Button>
				<AccountNavigation />
			</header>
			{isPending ? (
				<div
					role="status"
					aria-label={t("dashboard_workspace.loading")}
					className="grid gap-6 py-4 lg:grid-cols-[14rem_minmax(0,1fr)]"
				>
					<Skeleton className="h-48 rounded-3xl" />
					<div className="space-y-4">
						<Skeleton className="h-60 rounded-3xl" />
						<Skeleton className="h-40 rounded-3xl" />
					</div>
				</div>
			) : !user ? (
				<Surface className="m-auto w-full max-w-md space-y-4 rounded-3xl border p-8 text-center">
					<LockKeyhole
						aria-hidden="true"
						className="mx-auto size-8 text-muted-foreground"
					/>
					<h1 className="text-2xl font-semibold">
						{t("dashboard_workspace.sign_in_title")}
					</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						{t("dashboard_workspace.sign_in_description")}
					</p>
					<Button asChild size="2xl">
						<Link to={localizePath("/auth/login", i18n.language)}>
							{t("auth.login.cta")}
						</Link>
					</Button>
				</Surface>
			) : (
				<div className="grid min-w-0 flex-1 content-start gap-4 py-4 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-6 lg:py-0">
					<DashboardSidebar />
					<div className="mb-6 min-w-0 overflow-hidden rounded-3xl border bg-surface">
						{allowed ? (
							<Outlet />
						) : (
							<Surface className="space-y-4 p-8 text-center">
								<LockKeyhole
									aria-hidden="true"
									className="mx-auto size-8 text-muted-foreground"
								/>
								<h1 className="text-xl font-semibold">
									{t("dashboard_workspace.creator_only")}
								</h1>
								<p className="text-sm text-muted-foreground">
									{t("dashboard_workspace.creator_only_description")}
								</p>
								<Button asChild size="xl">
									<Link to={localizePath("/dashboard", i18n.language)}>
										{t("dashboard_workspace.overview")}
									</Link>
								</Button>
							</Surface>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
