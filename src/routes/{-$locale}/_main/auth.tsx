import {
	createFileRoute,
	Link,
	Outlet,
	useLocation,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SolidLogo } from "@/components/icons/assets/logo/logo";
import { cn } from "@/lib/utils";
import {
	AuthArtworkImage,
	AuthArtworkProvider,
	useAuthArtwork,
} from "@/components/layout/auth/artwork";

export const Route = createFileRoute("/{-$locale}/_main/auth")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<AuthArtworkProvider>
			<AuthPageLayout />
		</AuthArtworkProvider>
	);
}

function AuthPageLayout() {
	const { artwork } = useAuthArtwork();
	const { locale } = Route.useParams();
	const { t } = useTranslation();
	const pathname = useLocation({ select: (location) => location.pathname });
	const isLogin = pathname.endsWith("/auth/login");
	const isRegister = pathname.endsWith("/auth/register");

	return (
		<div className="mx-auto my-auto flex w-full max-w-6xl min-w-0 flex-col px-4 py-6 sm:px-6 lg:px-0 lg:py-4">
			<div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
				<SolidLogo size={28} aria-hidden="true" />
				<span className="text-sm font-bold tracking-wider">FAMILIAR</span>
			</div>
			<div className="grid min-w-0 lg:min-h-[clamp(44rem,calc(100dvh-8rem),52rem)] lg:grid-cols-2 lg:overflow-hidden lg:rounded-4xl lg:border lg:bg-card lg:shadow-sm">
				<section
					aria-labelledby="auth-page-title"
					className="flex min-h-0 min-w-0 flex-col lg:p-6"
				>
					<div className="flex min-h-0 flex-1 flex-col lg:items-center lg:justify-center">
						<div className="flex min-h-0 min-w-0 w-full flex-1 flex-col lg:max-w-md">
							{(isLogin || isRegister) && (
								<nav
									aria-label={t("auth.navigation")}
									className="mb-4 grid shrink-0 grid-cols-2 gap-1 rounded-full bg-secondary/60 p-1"
								>
									{(
										[
											{
												to: "/{-$locale}/auth/login",
												label: t("auth.login.cta"),
												active: isLogin,
											},
											{
												to: "/{-$locale}/auth/register",
												label: t("auth.create_account.cta"),
												active: isRegister,
											},
										] as const
									).map((item) => (
										<Link
											key={item.to}
											to={item.to}
											params={{ locale }}
											aria-current={item.active ? "page" : undefined}
											className={cn(
												"flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-center text-sm font-medium transition-colors lg:min-h-9",
												item.active
													? "bg-background text-foreground shadow-sm"
													: "text-muted-foreground hover:text-foreground",
											)}
										>
											{item.label}
										</Link>
									))}
								</nav>
							)}
							<div className="min-w-0 flex-1 px-1 py-1">
								<Outlet />
							</div>
						</div>
					</div>
				</section>

				<aside
					aria-hidden="true"
					className="relative isolate hidden min-w-0 flex-col overflow-hidden border-l bg-linear-to-br from-secondary/80 via-secondary/30 to-background p-10 lg:flex xl:p-12"
				>
					<div className="absolute -right-28 -top-28 -z-10 size-96 rounded-full border border-border/60" />
					<div className="absolute -bottom-40 -left-24 -z-10 size-96 rounded-full border border-border/60" />
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
						Familiar
					</p>
					<AuthArtworkImage artwork={artwork} className="my-6 min-h-0 flex-1" />
					<div className="relative">
						<p className="max-w-sm text-3xl font-semibold leading-tight tracking-tight text-foreground xl:text-4xl">
							{t("auth.brand.title")}
						</p>
						<p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
							{t("auth.brand.description")}
						</p>
					</div>
				</aside>
			</div>
		</div>
	);
}
