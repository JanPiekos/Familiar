import { Link, useLocation } from "@tanstack/react-router";
import { CircleUserRound, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { OutlineChat, SolidChat } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { localizePath, stripLocaleFromPathname } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import { TRoles } from "@/types/user/roles";
import { PortfolioCreationMenu } from "./profile/portfolio-creation";
import User from "./profile/user";
import { SiteNavigationLinks } from "./site-navigation";

export function AccountNavigation({ className }: { className?: string }) {
	const { t, i18n } = useTranslation();
	const { user, isPending } = useAuth();
	const location = useLocation();
	const pathname = stripLocaleFromPathname(location.pathname);
	const isChat = pathname === "/chat" || pathname.startsWith("/chat/");
	const isDashboard =
		pathname === "/dashboard" || pathname.startsWith("/dashboard/");

	return (
		<div
			className={cn(
				"pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:pointer-events-auto lg:static lg:shrink-0 lg:gap-1 lg:p-0",
				className,
			)}
		>
			<nav
				aria-label={t("header.navigation.account", "Account navigation")}
				aria-busy={isPending}
				className="pointer-events-auto flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-border/60 bg-background/95 p-1 shadow-lg backdrop-blur-xl lg:gap-1 lg:border-transparent lg:bg-background lg:p-1 lg:shadow-none"
			>
				<Button
					variant={isChat ? "default" : "secondary"}
					size="icon-xl"
					className="size-10"
					asChild
				>
					<Link
						to={localizePath("/chat", i18n.language)}
						aria-label={t("header.navigation.messages", "Messages")}
						aria-current={isChat ? "page" : undefined}
					>
						{isChat ? (
							<SolidChat aria-hidden="true" />
						) : (
							<OutlineChat aria-hidden="true" />
						)}
					</Link>
				</Button>
				{isPending ? (
					<div aria-hidden="true" className="flex items-center gap-2">
						<Skeleton className="h-10 w-24 rounded-full" />
						<Skeleton className="size-10 shrink-0 rounded-full" />
					</div>
				) : user ? (
					<>
						{user.roles?.includes(TRoles.Artist) && (
							<Button size="xl" className="h-10 min-w-0 shrink" asChild>
								<Link
									to={localizePath("/dashboard", i18n.language)}
									aria-current={isDashboard ? "page" : undefined}
								>
									<LayoutDashboard
										aria-hidden="true"
										className="size-5 lg:hidden"
									/>
									<span className="truncate">
										{t("header.artist-dashboard", "Dashboard")}
									</span>
								</Link>
							</Button>
						)}
						<User
							user={user}
							showInfo={false}
							avatarSize="md"
							isDropdown
							buttonClassName="size-10"
							mobileNavigation={(close) => (
								<>
									<SiteNavigationLinks
										includeDashboard={user.roles?.includes(TRoles.Artist)}
										includeRequests
										onNavigate={close}
									/>
									<Separator className="my-2" />
								</>
							)}
						/>
					</>
				) : (
					<div className="flex items-center gap-2">
						<Button asChild variant="secondary" size="xl" className="h-10">
							<Link to={localizePath("/auth/login", i18n.language)}>
								{t("auth.login.cta")}
							</Link>
						</Button>
						<Button asChild size="xl" className="h-10">
							<Link to={localizePath("/auth/register", i18n.language)}>
								{t("auth.register.cta")}
							</Link>
						</Button>
						<GuestNavigationMenu />
					</div>
				)}
			</nav>
			<PortfolioCreationMenu />
		</div>
	);
}

function GuestNavigationMenu() {
	const { t, i18n } = useTranslation();
	const [open, setOpen] = useState(false);
	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<Button
					type="button"
					variant="secondary"
					size="icon-xl"
					className="lg:hidden"
					aria-label={t("header.navigation.account", "Account navigation")}
				>
					<CircleUserRound aria-hidden="true" className="size-6" />
				</Button>
			</DrawerTrigger>
			<DrawerContent
				className="max-h-[calc(100dvh-2rem)]! overflow-hidden"
				aria-describedby={undefined}
			>
				<DrawerHeader className="px-6 pt-4 pb-3 text-left!">
					<DrawerTitle>{t("header.title")}</DrawerTitle>
				</DrawerHeader>
				<nav
					aria-label={t("header.navigation.account", "Account navigation")}
					className="flex min-h-0 flex-col gap-1 overflow-y-auto overscroll-contain px-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
				>
					<SiteNavigationLinks onNavigate={() => setOpen(false)} />
					<Separator className="my-2" />
					<Button
						asChild
						variant="ghost"
						size="xl"
						className="w-full justify-start rounded-xl px-3"
					>
						<Link
							to={localizePath("/auth/login", i18n.language)}
							onClick={() => setOpen(false)}
						>
							{t("auth.login.cta")}
						</Link>
					</Button>
					<Button
						asChild
						size="xl"
						className="w-full justify-start rounded-xl px-3"
					>
						<Link
							to={localizePath("/auth/register", i18n.language)}
							onClick={() => setOpen(false)}
						>
							{t("auth.register.cta")}
						</Link>
					</Button>
				</nav>
			</DrawerContent>
		</Drawer>
	);
}
