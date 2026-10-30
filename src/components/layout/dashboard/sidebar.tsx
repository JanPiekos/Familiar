import type { AnyRoute, LinkProps } from "@tanstack/react-router";
import { Link, useLocation } from "@tanstack/react-router";
import {
	Briefcase,
	Wallet,
	Target,
	Sparkles,
	Settings,
	FileText,
	ShieldCheck,
	Clock,
	ShoppingBag,
	ExternalLink,
	User as UserIcon,
} from "lucide-react";
import { OutlineListBoxes } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth";
import type { FileRoutesByTo } from "@/routeTree.gen";
import { useTranslation } from "react-i18next";
import appI18n from "@/lib/i18n";

type ValidRoute = keyof FileRoutesByTo;

interface NavItem {
	title: string;
	url: ValidRoute | `#${string}` | `http${string}`;
	icon: React.ElementType;
	badge?: string;
}

const topNav: NavItem[] = [
	{
		get title() {
			return appI18n.t("ui.portfolio", "Portfolio");
		},
		url: "#",
		icon: Briefcase,
		get badge() {
			return appI18n.t("ui.coming_soon", "Coming soon");
		},
	},
	{
		get title() {
			return appI18n.t("ui.wallet", "Wallet");
		},
		url: "#",
		icon: Wallet,
		get badge() {
			return appI18n.t("ui.coming_soon", "Coming soon");
		},
	},
	{
		get title() {
			return appI18n.t("ui.quests", "Quests");
		},
		url: "#",
		icon: Target,
		get badge() {
			return appI18n.t("ui.coming_soon", "Coming soon");
		},
	},
];

const commissionsNav: NavItem[] = [
	{
		get title() {
			return appI18n.t("ui.commissions_requests", "Commissions Requests");
		},
		url: "/dashboard/commissions_requests",
		icon: OutlineListBoxes,
	},
	{
		get title() {
			return appI18n.t("ui.services", "Services");
		},
		url: "/dashboard/services",
		icon: Settings,
	},
	{
		get title() {
			return appI18n.t("ui.forms", "Forms");
		},
		url: "/dashboard/forms_templates",
		icon: FileText,
	},
	{
		get title() {
			return appI18n.t("ui.policies", "Policies");
		},
		url: "#",
		icon: ShieldCheck,
		get badge() {
			return appI18n.t("ui.coming_soon", "Coming soon");
		},
	},
];

const pipelineNav: NavItem[] = [
	{
		get title() {
			return appI18n.t("ui.queue", "Queue");
		},
		url: "#",
		icon: Clock,
		get badge() {
			return appI18n.t("ui.coming_soon", "Coming soon");
		},
	},
	{
		get title() {
			return appI18n.t("ui.shop", "Shop");
		},
		url: "#",
		icon: ShoppingBag,
		get badge() {
			return appI18n.t("ui.coming_soon", "Coming soon");
		},
	},
];

export function DashboardSidebar() {
	const { t } = useTranslation();
	const location = useLocation();
	const { user } = useAuth();

	return (
		<Sidebar variant="inset">
			<SidebarHeader className="p-4">
				<div className="flex items-center gap-2 font-bold text-xl text-primary">
					{t("ui.dashboard", "Dashboard")}
				</div>
			</SidebarHeader>

			<SidebarContent>
				<div className="px-4 py-2">
					<Button asChild size={"xl"} className="w-full">
						<Link to={`/user/${user?.username}` as string}>
							{t("ui.go_to_my_profile", "Go to my profile")}
						</Link>
					</Button>
				</div>

				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{topNav.map((item) => {
								const isActive = location.pathname.startsWith(
									item.url as string,
								);

								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											className={item.badge ? "opacity-70" : ""}
										>
											<Link
												to={item.badge ? "#" : (item.url as any)}
												className={`flex items-center justify-between ${item.badge ? "pointer-events-none" : ""}`}
											>
												<div className="flex items-center gap-2">
													<item.icon className="size-4" />
													<span>{item.title}</span>
												</div>
												{item.badge && (
													<span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
														{item.badge}
													</span>
												)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>
						{t("ui.commissions", "Commissions")}
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{commissionsNav.map((item) => {
								const isActive = location.pathname.startsWith(
									item.url as string,
								);

								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											className={item.badge ? "opacity-70" : ""}
										>
											<Link
												to={item.badge ? "#" : (item.url as any)}
												className={`relative flex items-center justify-between ${item.badge ? "pointer-events-none" : ""}`}
											>
												<div className="flex items-center gap-2">
													<item.icon className="size-4" />
													{item.title}
												</div>
												{item.badge && (
													<span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
														{item.badge}
													</span>
												)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>{t("ui.pipeline", "Pipeline")}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{pipelineNav.map((item) => {
								const isActive = location.pathname.startsWith(item.url);

								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											className={item.badge ? "opacity-70" : ""}
										>
											<Link
												to={item.badge ? "#" : (item.url as any)}
												className={`flex items-center justify-between ${item.badge ? "pointer-events-none" : ""}`}
											>
												<div className="flex items-center gap-2">
													<item.icon className="size-4" />
													{item.title}
												</div>
												{item.badge && (
													<span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
														{item.badge}
													</span>
												)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
