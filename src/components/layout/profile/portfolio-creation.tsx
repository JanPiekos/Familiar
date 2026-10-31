import { useLocation } from "@tanstack/react-router";
import { FolderPlus, ImagePlus, Plus } from "lucide-react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsTablet } from "@/hooks/ui/use-mobile";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import { TRoles } from "@/types/user/roles";

export type PortfolioCreationActions = {
	username: string;
	pathname: string;
	onCreatePost?: () => void;
	onCreateFolder?: () => void;
};
type CreationRegistration = { actions: PortfolioCreationActions };
const ActionsContext = createContext<CreationRegistration[]>([]);
const PublishContext = createContext<
	((actions: PortfolioCreationActions) => () => void) | null
>(null);

export function PortfolioCreationProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [registrations, setRegistrations] = useState<CreationRegistration[]>(
		[],
	);
	const publish = useCallback((actions: PortfolioCreationActions) => {
		const registration = { actions };
		setRegistrations((current) => [...current, registration]);
		// A departing route must not clear another route's creation actions.
		return () =>
			setRegistrations((current) =>
				current.filter((entry) => entry !== registration),
			);
	}, []);
	return (
		<PublishContext.Provider value={publish}>
			<ActionsContext.Provider value={registrations}>
				{children}
			</ActionsContext.Provider>
		</PublishContext.Provider>
	);
}

/** Register only the actions supported by the currently rendered portfolio. */
export function usePublishPortfolioCreation(
	actions: PortfolioCreationActions | null,
) {
	const publish = useContext(PublishContext);
	useEffect(() => {
		if (actions) return publish?.(actions);
	}, [actions, publish]);
}

export function PortfolioCreationMenu() {
	const registrations = useContext(ActionsContext);
	const { user, isPending } = useAuth();
	const pathname = useLocation({ select: (location) => location.pathname });
	const actions = registrations.findLast(
		(entry) => entry.actions.pathname === pathname,
	)?.actions;
	const compact = useIsTablet();
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const owner =
		user &&
		actions &&
		user.username.toLowerCase() === actions.username.toLowerCase();
	if (
		!actions ||
		!user ||
		!owner ||
		isPending ||
		!user.roles?.includes(TRoles.Artist) ||
		pathname !== actions.pathname
	)
		return null;
	const createLabel = t("ui.add_to_portfolio", "Add to portfolio");
	const select = (action?: () => void) => {
		setOpen(false);
		action?.();
	};
	return (
		<div className="pointer-events-auto flex shrink-0 items-center rounded-full border border-border/60 bg-background/95 p-1 shadow-lg backdrop-blur-xl lg:border-transparent lg:bg-background lg:shadow-none">
			<DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						size="icon-xl"
						className="size-10 shrink-0"
						aria-label={createLabel}
					>
						<Plus
							aria-hidden="true"
							className={cn(
								"size-5 transition-transform duration-150 motion-reduce:transition-none",
								open && "rotate-45",
							)}
						/>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					side={compact ? "top" : "bottom"}
					align="end"
					sideOffset={12}
					collisionPadding={16}
					aria-label={createLabel}
					className="w-56 max-w-[calc(100vw-2rem)]"
				>
					{actions.onCreatePost && (
						<DropdownMenuItem onSelect={() => select(actions.onCreatePost)}>
							<ImagePlus aria-hidden="true" />
							{t("components.profile.actions.add_post", "Create post")}
						</DropdownMenuItem>
					)}
					{actions.onCreateFolder && (
						<DropdownMenuItem onSelect={() => select(actions.onCreateFolder)}>
							<FolderPlus aria-hidden="true" />
							{t("ui.create_folder", "Create folder")}
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export function PortfolioEmptyActions({
	onCreatePost,
	onCreateFolder,
}: Pick<PortfolioCreationActions, "onCreatePost" | "onCreateFolder">) {
	const { t } = useTranslation();
	return (
		<div className="flex w-full flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
			{onCreatePost && (
				<Button type="button" size="xl" onClick={onCreatePost}>
					<ImagePlus aria-hidden="true" className="size-4" />
					{t("components.profile.actions.add_post", "Create post")}
				</Button>
			)}
			{onCreateFolder && (
				<Button
					type="button"
					size="xl"
					variant="outline"
					onClick={onCreateFolder}
				>
					<FolderPlus aria-hidden="true" className="size-4" />
					{t("ui.create_folder", "Create folder")}
				</Button>
			)}
		</div>
	);
}
