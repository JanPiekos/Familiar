import { OutlineChat } from "@/components/icons/assets/communication/chat";
import { EmptyPage } from "@/components/layout/empty-page";
import { cn } from "@/lib/utils";
// import { ChatCommissionPin } from "./-chat-commission-pin";
import { ChatHeader } from "./chat-header";
import { ChatPanelState } from "./chat-panel-state";
import { MessageComposer } from "./message-composer";
import { MessageList } from "./message-list";
import type { ChatPanelProps } from "./types";
import { useTranslation } from "react-i18next";

export function ChatPanel({
	conversation,
	conversationId,
	messages,
	isPending,
	error,
	onBack,
}: ChatPanelProps) {
	const { t } = useTranslation();
	return (
		<section
			className={cn(
				"min-h-0 min-w-0 flex-1 flex-col",
				conversationId ? "flex" : "hidden md:flex",
			)}
		>
			{!conversationId || !conversation ? (
				<div className="flex flex-1 items-center justify-center p-8">
					<EmptyPage
						icon={OutlineChat}
						title={t("ui.your_messages", "Your Messages")}
						description={t(
							"ui.select_a_conversation_to_start_chatting",
							"Select a conversation to start chatting.",
						)}
					/>
				</div>
			) : (
				<>
					<ChatHeader conversation={conversation} onBack={onBack} />
					{/* <ChatCommissionPin
						commissionRequestId={conversation.commissionRequestId}
					/> */}

					{isPending ? (
						<ChatPanelState text="Loading messages..." />
					) : error ? (
						<ChatPanelState text="Could not load messages." />
					) : messages.length === 0 ? (
						<ChatPanelState text="No messages yet." />
					) : (
						<MessageList
							messages={messages}
							unreadCount={conversation.unreadCount}
						/>
					)}

					<MessageComposer conversationId={conversationId} />
				</>
			)}
		</section>
	);
}
