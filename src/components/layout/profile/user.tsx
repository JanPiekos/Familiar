import { BracketArrowLeft as LogoutOutline, Settings as SettingsOutline, User as UserOutline } from "@keyline-icons/react"
import {
	Link,
} from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
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
import { useIsTablet } from "@/hooks/ui/use-mobile";
import { getLocaleParam, localizePath } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import type { UserIdentity } from "@/types/user";
import { useOpenProfileSettings } from "@/hooks/user/use-open-profile-settings";
import UserAvatar from "./avatar";

type UserButtonContentProps = {
	user: UserIdentity;
	showInfo?: boolean;
	showAvatar?: boolean;
	showUsername?: boolean;
	description?: ReactNode;
	avatarSize?: "sm" | "default" | "lg" | "xl";
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
						{user.displayName || "Unknown"}
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
							@{user.username || "Unknown"}
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
	avatarSize?: "sm" | "default" | "lg" | "xl";
	isDropdown?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	buttonClassName?: string;
	nonDropdownButtonClassName?: string;
	dropdownContentClassName?: string;
	drawerTitle?: string;
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
	drawerTitle = "User Menu",
	status,
	isOnline,
	avatarBadgeClassName,
}: UserProps) {
	const resolvedUser = user ?? {
		displayName: "Unknown",
		username: "unknown",
	};
	const { logout } = useAuth();
	const openProfileSettings = useOpenProfileSettings();
	const isTablet = useIsTablet();
	const [internalOpen, setInternalOpen] = useState(false);
	const locale = getLocaleParam(document.documentElement.lang);
	const open = openProp ?? internalOpen;
	const setOpen = onOpenChange ?? setInternalOpen;

	const handleOpenSettings = () => {
		setOpen(false);
		openProfileSettings();
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
			label: "Profile",
			icon: <UserOutline />,
			to: localizePath(`/user/${resolvedUser.username || ""}`, locale),
		},
	];

	const menuItemsContent = (
		<>
			<div className="flex flex-col gap-1 p-1">
				{menuItems.map((item) => (
					<Button key={item.label} variant="ghost" size="xl" asChild>
						<Link
							to={item.to}
							preload={false}
							onClick={() => setOpen(false)}
						>
							{item.icon}
							<span>{item.label}</span>
						</Link>
					</Button>
				))}
			</div>

			<DropdownMenuSeparator />

			<div className="flex flex-col gap-1 p-1">
				<Button variant="ghost" size="xl" onClick={handleOpenSettings}>
					<SettingsOutline />
					<span>Settings</span>
				</Button>
			</div>

			<DropdownMenuSeparator />

			<div className="p-1">
				<Button
					variant="destructive"
					onClick={() => {
						logout();
						setOpen(false);
					}}
				>
					<LogoutOutline className="size-4" />
					<span>Logout</span>
				</Button>
			</div>
		</>
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
			<>
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
							<SettingsOutline />
							Settings
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							variant="destructive"
							onClick={() => {
								logout();
								setOpen(false);
							}}
						>
							<LogoutOutline />
							Logout
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

			</>
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

				<DrawerContent>
					<DrawerHeader className="text-left">
						<DrawerTitle>{drawerTitle}</DrawerTitle>
					</DrawerHeader>
					<div className="pb-4">{menuItemsContent}</div>
				</DrawerContent>
			</Drawer>

		</>
	);
}
