import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { useSessionProfile } from "@/hooks/user/use-user";

const fetchProfile = vi.hoisted(() => vi.fn());
vi.mock("@/lib/fetch", () => ({ apiFetch: fetchProfile }));
const clients: QueryClient[] = [];
function setup() {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	clients.push(client);
	return {
		client,
		wrapper: ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		),
	};
}
afterEach(() => {
	cleanup();
	clients.forEach((client) => client.clear());
	fetchProfile.mockReset();
});
it("loads own roles from the authenticated endpoint instead of public cached roles", async () => {
	const { client, wrapper } = setup();
	client.setQueryData(["users", "id", "admin-1"], {
		userId: "admin-1",
		roles: ["CLIENT"],
	});
	fetchProfile.mockResolvedValue({
		userId: "admin-1",
		roles: ["ADMIN"],
		socials: [],
	});
	const { result } = renderHook(() => useSessionProfile("admin-1"), {
		wrapper,
	});
	await waitFor(() => expect(result.current.user?.roles).toEqual(["ADMIN"]));
	expect(fetchProfile).toHaveBeenCalledWith("/users/me", {
		apiVersion: "v1",
		signal: expect.any(AbortSignal),
	});
	expect(client.getQueryData(["users", "id", "admin-1"])).toMatchObject({
		roles: ["CLIENT"],
	});
});
it("waits for the session and does not reuse another user's permissions", async () => {
	const { wrapper } = setup();
	fetchProfile.mockResolvedValueOnce({ userId: "admin-1", roles: ["ADMIN"] });
	const { result, rerender } = renderHook(
		({ id, enabled }) => useSessionProfile(id, enabled),
		{ wrapper, initialProps: { id: "", enabled: false } },
	);
	expect(fetchProfile).not.toHaveBeenCalled();
	rerender({ id: "admin-1", enabled: true });
	await waitFor(() => expect(result.current.user?.roles).toEqual(["ADMIN"]));
	fetchProfile.mockResolvedValueOnce({ userId: "client-2", roles: ["CLIENT"] });
	rerender({ id: "client-2", enabled: true });
	expect(result.current.user).toBeNull();
	await waitFor(() => expect(result.current.user?.roles).toEqual(["CLIENT"]));
	rerender({ id: "", enabled: false });
	expect(result.current.user).toBeNull();
});
it("rejects a response for a different session identity", async () => {
	const { wrapper } = setup();
	fetchProfile.mockResolvedValue({ userId: "other-user", roles: ["ADMIN"] });
	const { result } = renderHook(() => useSessionProfile("client-2"), {
		wrapper,
	});
	await waitFor(() => expect(result.current.isError).toBe(true));
	expect(result.current.user).toBeNull();
});
