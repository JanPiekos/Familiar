import { beforeEach, expect, it, vi } from "vitest";
const fetchApi = vi.hoisted(() => vi.fn());
vi.mock("@/lib/fetch", () => ({ apiFetch: fetchApi }));
import {
	generateAdminInvitationKeys,
	getAdminInvitationKeys,
	getAdminInvitationKeyStats,
} from "@/api/admin/invitation-keys";
const key = { id: "test-key", code: "FAM-TEST-KEYS-001", isUsed: false };
beforeEach(() => fetchApi.mockReset());
it("uses the documented v1 list endpoint with server pagination and explicit unused filtering", async () => {
	const page = { content: [key], totalElements: 21, totalPages: 2, number: 1 };
	fetchApi.mockResolvedValue(page);
	const controller = new AbortController();
	expect(
		await getAdminInvitationKeys(
			{ page: 1, used: false, ownerUserId: "owner-id" },
			controller.signal,
		),
	).toEqual(page);
	expect(fetchApi).toHaveBeenCalledExactlyOnceWith(
		"/admin/artist-invite-keys",
		{
			apiVersion: "v1",
			signal: controller.signal,
			params: {
				page: 1,
				size: 20,
				sort: "createdAt,desc",
				used: false,
				ownerUserId: "owner-id",
			},
		},
	);
});
it("requests global statistics separately from list filters", async () => {
	fetchApi.mockResolvedValue({ activeCount: 10, usedCount: 20 });
	expect(await getAdminInvitationKeyStats()).toEqual({
		activeCount: 10,
		usedCount: 20,
	});
	expect(fetchApi).toHaveBeenCalledExactlyOnceWith(
		"/admin/artist-invite-keys/stats",
		{ apiVersion: "v1", signal: undefined },
	);
});
it("generates keys using only the documented count payload and authenticated API defaults", async () => {
	fetchApi.mockResolvedValue([key]);
	expect(await generateAdminInvitationKeys(10)).toEqual([key]);
	expect(fetchApi).toHaveBeenCalledExactlyOnceWith(
		"/admin/artist-invite-keys",
		{ apiVersion: "v1", method: "POST", body: '{"count":10}' },
	);
});
it.each([0, -1, 101, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
	"rejects invalid generation count %s before making a request",
	async (count) => {
		await expect(generateAdminInvitationKeys(count)).rejects.toBeInstanceOf(
			RangeError,
		);
		expect(fetchApi).not.toHaveBeenCalled();
	},
);
it("does not interpret malformed server data as an empty or successful result", async () => {
	fetchApi
		.mockResolvedValueOnce({ content: "invalid" })
		.mockResolvedValueOnce({ activeCount: -1, usedCount: 0 })
		.mockResolvedValueOnce([{ id: "no-code" }]);
	await expect(getAdminInvitationKeys({ page: 0 })).rejects.toThrow(
		"Invalid invitation-key page",
	);
	await expect(getAdminInvitationKeyStats()).rejects.toThrow(
		"Invalid invitation-key statistics",
	);
	await expect(generateAdminInvitationKeys(1)).rejects.toThrow(
		"Invalid generated invitation keys",
	);
});
