import { ApiFetchError, apiFetch } from "@/lib/fetch";
import type { TPagableQuery } from "@/types/pagable";

import type {
	TChatConversation,
	TChatConversationPage,
	TChatMessage,
	TChatMessagePage,
	TSendChatMessageRequest,
} from "./chat-types";

export async function getChatConversations(params: TPagableQuery) {
	return apiFetch<TChatConversationPage>("chat/conversations", {
		params,
	});
}

export async function getChatMessages(
	conversationId: string,
	params: TPagableQuery,
) {
	return apiFetch<TChatMessagePage>(
		`chat/conversations/${conversationId}/messages`,
		{
			params,
		},
	);
}

export function postChatMessage(
	conversationId: string,
	data: TSendChatMessageRequest,
) {
	return apiFetch<TChatMessage>(
		`chat/conversations/${conversationId}/messages`,
		{
			method: "POST",
			body: JSON.stringify({
				body: data.body,
				...(data.jobIds?.length ? { jobIds: data.jobIds } : null),
			}),
		},
	);
}

export async function getChatMessagesSince(
	conversationId: string,
	after: Date,
) {
	return apiFetch<TChatMessagePage>(
		`chat/conversations/${conversationId}/messages/since`,
		{
			params: {
				after: after.toISOString(),
			},
		},
	);
}

export async function postConversationRead(conversationId: string) {
	return apiFetch<void>(`chat/conversations/${conversationId}/read`, {
		method: "POST",
	});
}

async function findDirectConversation(otherUserId: string) {
	for (let page = 0; ; page += 1) {
		const conversations = await getChatConversations({ page, size: 100 });
		const match = conversations.content.find(
			(conversation) =>
				conversation.id &&
				conversation.commissionRequestId == null &&
				conversation.otherParticipant.userId.toLowerCase() === otherUserId,
		);
		if (match) return match;
		if (
			conversations.last ||
			conversations.content.length === 0 ||
			page + 1 >= conversations.totalPages
		)
			return null;
	}
}

export async function postConversationDirect(otherUserId: string) {
	const recipientId = otherUserId?.trim().toLowerCase();
	if (
		!recipientId ||
		!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
			recipientId,
		)
	) {
		throw new Error(
			"A valid recipient user ID is required to start a conversation.",
		);
	}

	// Opening an existing chat does not require the third-party create endpoint.
	try {
		const existing = await findDirectConversation(recipientId);
		if (existing) return existing;
	} catch (error) {
		if (
			error instanceof ApiFetchError &&
			(error.status === 401 || error.status === 403)
		)
			throw error;
		// A failed list request must not prevent the normal create request.
	}

	try {
		return await apiFetch<TChatConversation>("chat/conversations/direct", {
			method: "POST",
			body: JSON.stringify({ otherUserId: recipientId }),
		});
	} catch (error) {
		if (error instanceof ApiFetchError && error.status >= 500) {
			// Creation may have committed before response serialization failed. Read back
			// once, without retrying the POST and risking a duplicate conversation.
			const created = await findDirectConversation(recipientId).catch(
				() => null,
			);
			if (created) return created;
		}
		throw error;
	}
}

export async function postOpenConversationForRequest(
	commissionRequestId: string,
) {
	return apiFetch<TChatConversation>(
		`chat/conversations/for-request/${commissionRequestId}`,
		{
			method: "POST",
		},
	);
}
