import { Link, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	OutlineLogout,
	OutlineSettings,
	OutlineUser,
} from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useIsMobile, useIsTablet } from "@/hooks/ui/use-mobile";
import { getLocaleParam, localizePath } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import type { UserIdentity } from "@/types/user";
import UserAvatar from "./avatar";

type UserButtonContentProps = {
	user: UserIdentity;
	showInfo?: boolean;
	showAvatar?: boolean;
	showUsername?: boolean;
	description?: ReactNode;
	avatarSize?: "sm" | "md" | "default" | "lg" | "xl";
	status?: string;
	isOnline?: boolean;
	avatarBadgeClassName?: string;
};

function UserButtonContent({
	user,
	showInfo = true,
	showAvatar = true,
	showUsername = true,
	description,
	avatarSize,
	status,
	isOnline,
	avatarBadgeClassName,
}: UserButtonContentProps) {
	const { t } = useTranslation();
	return (
		<>
			{showAvatar ? (
				<UserAvatar
					user={user}
					size={avatarSize}
					isOnline={isOnline}
					badgeClassName={avatarBadgeClassName}
				/>
			) : null}

			{showInfo ? (
				<div className="flex w-fit flex-col items-start text-left">
					<span
						className={cn(
							"w-full truncate text-sm font-medium",
							status === "active"
								? "text-accent-foreground"
								: "text-foreground",
						)}
					>
						{user.displayName || t("ui.unknown", "Unknown")}
					</span>

					{description ? (
						<span
							className={cn(
								"mt-0.5 w-full truncate text-xs",
								status === "active"
									? "text-accent-foreground/80"
									: "text-muted-foreground",
							)}
						>
							{description}
						</span>
					) : status ? (
						<span
							className={cn(
								"mt-0.5 w-full truncate text-xs",
								isOnline && status === "Online"
									? "font-medium text-green-500"
									: "text-muted-foreground",
							)}
						>
							{status}
						</span>
					) : showUsername ? (
						<span
							className={cn(
								"mt-0.5 w-full truncate text-xs",
								status === "active"
									? "text-accent-foreground/80"
									: "text-muted-foreground",
							)}
						>
							@{user.username || t("ui.unknown", "Unknown")}
						</span>
					) : null}
				</div>
			) : null}
		</>
	);
}

type UserProps = {
	user?: UserIdentity | null;
	showInfo?: boolean;
	showAvatar?: boolean;
	showUsername?: boolean;
	description?: ReactNode;
	avatarSize?: "sm" | "md" | "default" | "lg" | "xl";
	isDropdown?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	buttonClassName?: string;
	nonDropdownButtonClassName?: string;
	dropdownContentClassName?: string;
	drawerTitle?: string;
	mobileNavigation?: (close: () => void) => ReactNode;
	status?: string;
	isOnline?: boolean;
	avatarBadgeClassName?: string;
};

export default function User({
	user,
	showInfo = true,
	showAvatar = true,
	showUsername = true,
	description,
	avatarSize,
	isDropdown = false,
	open: openProp,
	onOpenChange,
	buttonClassName,
	nonDropdownButtonClassName,
	dropdownContentClassName,
	drawerTitle,
	mobileNavigation,
	status,
	isOnline,
	avatarBadgeClassName,
}: UserProps) {
	const { t } = useTranslation();
	const menuTitle = drawerTitle ?? t("ui.user_menu", "User Menu");
	const resolvedUser = user ?? {
		displayName: "Unknown",
		username: "unknown",
	};
	const { logout } = useAuth();
	const navigate = useNavigate();
	const isMobile = useIsMobile();
	const isTablet = useIsTablet();
	const [internalOpen, setInternalOpen] = useState(false);
	const locale = getLocaleParam(document.documentElement.lang);
	const open = openProp ?? internalOpen;
	const setOpen = onOpenChange ?? setInternalOpen;

	const handleOpenSettings = () => {
		setOpen(false);

		if (isMobile) {
			void navigate({
				to: "/{-$locale}/settings/profile",
				params: { locale },
			});
			return;
		}

		void navigate({
			to: ".",
			search: (previous) => ({
				...previous,
				settings: "profile",
			}),
			mask: {
				to: "/{-$locale}/settings/profile",
				params: { locale },
				unmaskOnReload: true,
			},
		});
	};

	const triggerClassName = cn(
		"flex items-center gap-2 p-0 hover:text-foreground",
		showInfo
			? "h-auto justify-start rounded-xl"
			: "size-10 justify-center rounded-full",
		isDropdown ? "hover:bg-secondary/80" : "hover:bg-transparent",
		!isDropdown && nonDropdownButtonClassName,
		buttonClassName,
	);

	const triggerContent = (
		<UserButtonContent
			user={resolvedUser}
			showInfo={showInfo}
			showAvatar={showAvatar}
			showUsername={showUsername}
			description={description}
			avatarSize={avatarSize}
			status={status}
			isOnline={isOnline}
			avatarBadgeClassName={avatarBadgeClassName}
		/>
	);

	const menuItems = [
		{
			label: t("ui.profile", "Profile"),
			icon: <OutlineUser />,
			to: localizePath(`/user/${resolvedUser.username || ""}`, locale),
		},
	];

	const menuItemsContent = (
		<nav
			aria-label={menuTitle}
			className="flex flex-col gap-1 px-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
		>
			{mobileNavigation?.(() => setOpen(false))}
			{menuItems.map((item) => (
				<Button
					key={item.label}
					variant="ghost"
					size="xl"
					className="w-full justify-start gap-3 rounded-xl px-3"
					asChild
				>
					<Link to={item.to} preload={false} onClick={() => setOpen(false)}>
						{item.icon}
						<span>{item.label}</span>
					</Link>
				</Button>
			))}
			<Button
				type="button"
				variant="ghost"
				size="xl"
				className="w-full justify-start gap-3 rounded-xl px-3"
				onClick={handleOpenSettings}
			>
				<OutlineSettings />
				<span>{t("ui.settings", "Settings")}</span>
			</Button>
			<Separator className="my-2" />
			<Button
				type="button"
				variant="ghost"
				size="xl"
				className="w-full justify-start gap-3 rounded-xl px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
				onClick={() => {
					logout();
					setOpen(false);
				}}
			>
				<OutlineLogout />
				<span>{t("ui.logout", "Logout")}</span>
			</Button>
		</nav>
	);

	if (!isDropdown) {
		return (
			<Button
				type="button"
				variant="ghost"
				aria-haspopup="true"
				className={triggerClassName}
			>
				{triggerContent}
			</Button>
		);
	}

	if (!isTablet) {
		return (
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>
					<Button type="button" variant="ghost" className={triggerClassName}>
						{triggerContent}
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					className={cn("w-56", dropdownContentClassName)}
					align="end"
				>
					<DropdownMenuGroup>
						{menuItems.map((item) => (
							<DropdownMenuItem key={item.label} asChild>
								<Link
									to={item.to}
									preload={false}
									className="w-full cursor-pointer"
									onClick={() => setOpen(false)}
								>
									{item.icon}
									{item.label}
								</Link>
							</DropdownMenuItem>
						))}
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					<DropdownMenuItem onSelect={handleOpenSettings}>
						<OutlineSettings />
						{t("ui.settings", "Settings")}
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem
						variant="destructive"
						onClick={() => {
							logout();
							setOpen(false);
						}}
					>
						<OutlineLogout />
						{t("ui.logout", "Logout")}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<>
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerTrigger asChild>
					<Button type="button" variant="ghost" className={triggerClassName}>
						{triggerContent}
					</Button>
				</DrawerTrigger>

				<DrawerContent
					className="max-h-[calc(100dvh-2rem)]! overflow-hidden"
					aria-describedby={undefined}
				>
					<DrawerHeader className="px-6 pt-4 pb-3 text-left!">
						<DrawerTitle>{menuTitle}</DrawerTitle>
					</DrawerHeader>
					<div className="min-h-0 overflow-y-auto overscroll-contain">
						{menuItemsContent}
					</div>
				</DrawerContent>
			</Drawer>
		</>
	);
}
