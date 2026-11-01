import { apiFetch } from "@/lib/fetch";

export interface InvitationKey {
	id: string;
	code: string;
	isUsed: boolean;
	ownerUserId?: string | null;
	usedByUserId?: string | null;
	usedAt?: string | null;
	createdBy?: string | null;
	createdAt?: string | null;
}

export interface InvitationKeyPage {
	content: InvitationKey[];
	totalElements: number;
	totalPages: number;
	number: number;
}

export interface InvitationKeyStats {
	activeCount: number;
	usedCount: number;
}

export interface InvitationKeyFilters {
	page: number;
	used?: boolean;
	ownerUserId?: string;
}

const endpoint = "/admin/artist-invite-keys";
const isCount = (value: unknown): value is number =>
	typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const isKey = (value: InvitationKey) =>
	value &&
	typeof value.id === "string" &&
	typeof value.code === "string" &&
	value.code.trim().length > 0 &&
	typeof value.isUsed === "boolean";

export async function getAdminInvitationKeys(
	filters: InvitationKeyFilters,
	signal?: AbortSignal,
) {
	const page = await apiFetch<InvitationKeyPage>(endpoint, {
		apiVersion: "v1",
		signal,
		params: { ...filters, size: 20, sort: "createdAt,desc" },
	});
	if (
		!page ||
		!Array.isArray(page.content) ||
		!page.content.every(isKey) ||
		!isCount(page.totalElements) ||
		!isCount(page.totalPages)
	) {
		throw new Error("Invalid invitation-key page");
	}
	return page;
}

export async function getAdminInvitationKeyStats(signal?: AbortSignal) {
	const stats = await apiFetch<InvitationKeyStats>(`${endpoint}/stats`, {
		apiVersion: "v1",
		signal,
	});
	if (!stats || !isCount(stats.activeCount) || !isCount(stats.usedCount)) {
		throw new Error("Invalid invitation-key statistics");
	}
	return stats;
}

export function isInvitationKeyCount(count: number) {
	return Number.isSafeInteger(count) && count >= 1 && count <= 100;
}

export async function generateAdminInvitationKeys(count: number) {
	if (!isInvitationKeyCount(count))
		throw new RangeError("Generate between 1 and 100 keys");
	const keys = await apiFetch<InvitationKey[]>(endpoint, {
		apiVersion: "v1",
		method: "POST",
		body: JSON.stringify({ count }),
	});
	if (!Array.isArray(keys) || keys.length === 0 || !keys.every(isKey))
		throw new Error("Invalid generated invitation keys");
	return keys;
}
