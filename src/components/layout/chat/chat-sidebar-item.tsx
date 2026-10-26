import { Calligraph } from "calligraph";
import UserAvatar from "@/components/layout/profile/avatar";
import { cn } from "@/lib/utils";
import { formatMessageTime, getConversationUser } from "./helpers";
import type { ChatSidebarItemProps } from "./types";

export function ChatSidebarItem({
	conversation,
	isActive,
	onSelect,
}: ChatSidebarItemProps) {
	const user = getConversationUser(conversation);
	const unreadCount = conversation.unreadCount;
	const lastMessage = conversation.lastMessagePreview ?? "No messages yet";
	const updatedAt = conversation.lastMessageAt ?? conversation.createdAt;

	return (
		<button
			type="button"
			tabIndex={0}
			onClick={onSelect}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onSelect();
				}
			}}
			aria-current={isActive ? "true" : undefined}
			aria-label={`${user.displayName || user.username}, ${unreadCount} unread messages`}
			title={user.displayName || user.username}
			className={cn(
				"group/user-btn relative flex w-full cursor-pointer items-center gap-3 rounded-2xl p-3 md:p-2 lg:p-3 text-left transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
				isActive
					? "bg-accent text-accent-foreground"
					: "text-foreground hover:bg-accent/12",
			)}
		>
			<div className="pointer-events-none flex w-full justify-between gap-3">
				<UserAvatar user={user} size="lg" />
				<div className="min-w-0 flex-1 self-center md:hidden lg:block">
					<p className="truncate text-sm font-medium">
						{user.displayName || user.username}
					</p>
					<p
						className={cn(
							"mt-0.5 truncate text-xs",
							isActive ? "text-accent-foreground/80" : "text-muted-foreground",
						)}
					>
						{lastMessage}
					</p>
				</div>
				<div className="flex shrink-0 flex-col items-end justify-between py-1.5 md:absolute md:right-0 md:top-0 md:py-0 lg:static lg:py-1.5">
					<span
						className={cn(
							"text-xs md:hidden lg:inline",
							isActive ? "text-accent-foreground/80" : "text-muted-foreground",
						)}
					>
						{formatMessageTime(updatedAt)}
					</span>

					{unreadCount > 0 && (
						<Calligraph
							className={cn(
								"flex size-5 items-center justify-center rounded-full text-[10px] font-medium",
								isActive
									? "bg-accent-foreground text-accent"
									: "bg-primary text-primary-foreground",
							)}
						>
							{unreadCount}
						</Calligraph>
					)}
				</div>
			</div>
		</button>
	);
}
