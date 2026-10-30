import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";
import type { TFunction } from "i18next";
import {
	CircleAlert,
	Inbox,
	type LucideIcon,
	MessageCircle,
	Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyPage } from "@/components/layout/empty-page";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ChatSidebarList } from "./chat-sidebar-list";
import { BONEYARD_PRIMARY_12 } from "./constants";
import { createSidebarLayoutConversations } from "./helpers";
import type { ChatSidebarProps } from "./types";

type ChatSidebarTab = "direct" | "requests";
type ChatSidebarConversation = ChatSidebarProps["conversations"][number];

function isRequestConversation(conversation: ChatSidebarConversation) {
	return Boolean(conversation.commissionRequestId);
}

function getConversationTab(
	conversation: ChatSidebarConversation | undefined,
): ChatSidebarTab {
	return conversation && isRequestConversation(conversation)
		? "requests"
		: "direct";
}

function filterConversations(
	conversations: ChatSidebarConversation[],
	searchQuery: string,
) {
	const query = searchQuery.trim().toLowerCase();

	if (!query) {
		return conversations;
	}

	return conversations.filter((conversation) => {
		const title = conversation.otherParticipant.displayName.toLowerCase();
		const username = conversation.otherParticipant.username.toLowerCase();
		const lastMessage = (conversation.lastMessagePreview ?? "").toLowerCase();

		return (
			title.includes(query) ||
			username.includes(query) ||
			lastMessage.includes(query)
		);
	});
}

function getEmptyState(tab: ChatSidebarTab, searchQuery: string, t: TFunction) {
	const hasSearch = searchQuery.trim().length > 0;
	if (hasSearch) {
		return {
			title: t("ui.no_conversations_found", "No matching conversations"),
			description: t("ui.try_a_different_search", "Try a different search."),
		};
	}

	if (tab === "requests") {
		return {
			title: t("ui.no_request_chats_found", "No inquiries yet"),
			description: t(
				"ui.request_conversations_will_show_up_here",
				"Request conversations will show up here.",
			),
		};
	}

	return {
		title: t("ui.no_direct_messages_found", "No conversations yet"),
		description: t(
			"ui.start_a_new_conversation",
			"Start a conversation from someone’s profile.",
		),
	};
}

function SidebarConversationScroller({
	activeConversationId,
	conversations,
	emptyDescription,
	emptyTitle,
	emptyIcon,
	error,
	isPending,
	onSelectConversation,
}: {
	activeConversationId: string | null;
	conversations: ChatSidebarConversation[];
	emptyDescription: string;
	emptyTitle: string;
	emptyIcon: LucideIcon;
	error: Error | null;
	isPending: boolean;
	onSelectConversation: (conversationId: string) => void;
}) {
	const { t } = useTranslation();
	const visibleConversations =
		isPending && conversations.length === 0
			? createSidebarLayoutConversations()
			: conversations;

	return (
		<ScrollArea className="h-full min-h-0">
			<BoneyardSkeleton
				name="chat-sidebar-items"
				loading={isPending}
				color={BONEYARD_PRIMARY_12}
				darkColor={BONEYARD_PRIMARY_12}
				animate="solid"
				stagger={35}
				transition={180}
				fixture={
					<div className="flex flex-col gap-1 p-3">
						<ChatSidebarList
							conversations={visibleConversations}
							activeConversationId={activeConversationId}
							onSelectConversation={onSelectConversation}
						/>
					</div>
				}
				snapshotConfig={{
					excludeSelectors: ["svg", "[data-no-skeleton]"],
					leafTags: ["span", "p"],
					captureRoundedBorders: true,
				}}
			>
				{error ? (
					<div className="flex flex-col gap-1 p-3">
						<EmptyPage
							className="px-2 py-8"
							iconContainerClassName="size-10 rounded-lg"
							titleClassName="text-base! leading-snug!"
							descriptionClassName="text-sm! leading-relaxed!"
							title={t(
								"ui.could_not_load_conversations",
								"Could not load conversations.",
							)}
							icon={CircleAlert}
							description={t(
								"ui.check_console_for_more_details",
								"Check console for more details.",
							)}
						/>
					</div>
				) : !isPending && conversations.length === 0 ? (
					<div className="flex flex-col gap-1 p-3">
						<EmptyPage
							className="px-2 py-8"
							iconContainerClassName="size-10 rounded-lg"
							titleClassName="text-base! leading-snug!"
							descriptionClassName="text-sm! leading-relaxed!"
							title={emptyTitle}
							icon={emptyIcon}
							description={emptyDescription}
						/>
					</div>
				) : (
					<div className="flex flex-col gap-1 p-3">
						<ChatSidebarList
							conversations={visibleConversations}
							activeConversationId={activeConversationId}
							onSelectConversation={onSelectConversation}
						/>
					</div>
				)}
			</BoneyardSkeleton>
		</ScrollArea>
	);
}

export function ChatSidebar({
	conversations,
	activeConversationId,
	searchQuery,
	isPending,
	error,
	onSearchChange,
	onSelectConversation,
}: ChatSidebarProps) {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<ChatSidebarTab>("direct");

	const activeConversation = useMemo(() => {
		return conversations.find(
			(conversation) => conversation.id === activeConversationId,
		);
	}, [activeConversationId, conversations]);

	useEffect(() => {
		if (!activeConversation) return;

		setActiveTab(getConversationTab(activeConversation));
	}, [activeConversation]);

	const directConversations = useMemo(() => {
		return conversations.filter(
			(conversation) => !isRequestConversation(conversation),
		);
	}, [conversations]);

	const requestConversations = useMemo(() => {
		return conversations.filter(isRequestConversation);
	}, [conversations]);

	const filteredDirectConversations = useMemo(() => {
		return filterConversations(directConversations, searchQuery);
	}, [directConversations, searchQuery]);

	const filteredRequestConversations = useMemo(() => {
		return filterConversations(requestConversations, searchQuery);
	}, [requestConversations, searchQuery]);

	const chatSidebarTabs = [
		{
			value: "direct",
			label: t("ui.dms", "DMs"),
			title: t("ui.direct_messages", "Direct messages"),
		},
		{
			value: "requests",
			label: t("ui.requests", "Requests"),
			title: t("ui.requests", "Requests"),
		},
	] satisfies { value: ChatSidebarTab; label: string; title: string }[];
	const directEmptyState = getEmptyState("direct", searchQuery, t);
	const requestEmptyState = getEmptyState("requests", searchQuery, t);

	if (error) console.error(error);

	return (
		<aside
			className={cn(
				"flex min-h-0 w-full shrink-0 flex-col md:w-72 md:border-r lg:w-96",
				activeConversationId ? "hidden md:flex" : "flex",
			)}
		>
			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as ChatSidebarTab)}
				className="min-h-0 flex-1 gap-0"
			>
				{/* Concentric corners: 24px shell - 12px inset = 12px controls; 4px tab padding leaves 8px buttons. */}
				<div className="flex flex-col gap-3 p-3 pb-0">
					<InputGroup className="h-11 rounded-xl">
						<InputGroupAddon align="inline-start">
							<Search />
						</InputGroupAddon>

						<InputGroupInput
							value={searchQuery}
							onChange={(event) => onSearchChange(event.target.value)}
							placeholder={t("ui.search_messages", "Search messages...")}
						/>
					</InputGroup>

					<TabsList className="grid h-13 w-full grid-cols-2 rounded-xl p-1">
						{chatSidebarTabs.map((tab) => {
							const count =
								tab.value === "requests"
									? requestConversations.length
									: directConversations.length;

							return (
								<TabsTrigger
									key={tab.value}
									value={tab.value}
									title={tab.title}
									aria-label={`${tab.title} (${count})`}
									className="h-11 min-w-0 gap-1.5 rounded-lg px-2 text-sm whitespace-nowrap"
								>
									<span className="min-w-0 truncate">{tab.label}</span>
									<span
										aria-hidden="true"
										className="shrink-0 rounded-full bg-background/60 px-1.5 text-[11px] leading-5 text-muted-foreground tabular-nums"
									>
										{count}
									</span>
								</TabsTrigger>
							);
						})}
					</TabsList>
				</div>

				<TabsContent
					value="direct"
					className="min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
				>
					<SidebarConversationScroller
						activeConversationId={activeConversationId}
						conversations={filteredDirectConversations}
						emptyTitle={directEmptyState.title}
						emptyIcon={searchQuery.trim() ? Search : MessageCircle}
						emptyDescription={directEmptyState.description}
						error={error}
						isPending={isPending}
						onSelectConversation={onSelectConversation}
					/>
				</TabsContent>

				<TabsContent
					value="requests"
					className="min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
				>
					<SidebarConversationScroller
						activeConversationId={activeConversationId}
						conversations={filteredRequestConversations}
						emptyTitle={requestEmptyState.title}
						emptyIcon={searchQuery.trim() ? Search : Inbox}
						emptyDescription={requestEmptyState.description}
						error={error}
						isPending={isPending}
						onSelectConversation={onSelectConversation}
					/>
				</TabsContent>
			</Tabs>
		</aside>
	);
}
