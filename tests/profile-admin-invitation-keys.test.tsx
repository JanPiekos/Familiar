import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createInstance } from "i18next";
import type { ComponentProps } from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ApiFetchError } from "@/lib/fetch";
import { TRoles } from "@/types/user/roles";
import en from "@/i18n/en";
import pl from "@/i18n/pl";
const state = vi.hoisted(() => ({
	user: { userId: "admin-1", roles: ["ADMIN"] } as {
		userId: string;
		roles: string[];
	} | null,
	pending: false,
	page: vi.fn(),
	stats: vi.fn(),
	generate: vi.fn(),
	copy: vi.fn(),
}));
vi.mock("@/providers/auth", () => ({
	useAuth: () => ({ user: state.user, isPending: state.pending }),
}));
vi.mock("@/api/admin/invitation-keys", async (importOriginal) => ({
	...(await importOriginal<typeof import("@/api/admin/invitation-keys")>()),
	getAdminInvitationKeys: state.page,
	getAdminInvitationKeyStats: state.stats,
	generateAdminInvitationKeys: state.generate,
}));
vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, ...props }: ComponentProps<"a"> & { to: string }) => (
		<a href={to} {...props} />
	),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
import { AdminDashboard } from "@/components/layout/admin/admin-dashboard";
import { invitationUsedFilter } from "@/components/layout/admin/invitation-key-filters";
const key = {
	id: "key-1",
	code: "FAM-TEST-KEYS-001",
	isUsed: false,
	createdAt: "2026-11-01T10:00:00Z",
	ownerUserId: null,
};
const clients: QueryClient[] = [];
async function mount(locale = "en") {
	const i18n = createInstance();
	await i18n.init({
		lng: locale,
		fallbackLng: "en",
		resources: { en: { translation: en }, pl: { translation: pl } },
		interpolation: { escapeValue: false },
	});
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	clients.push(client);
	const view = render(<AdminDashboard />, {
		wrapper: ({ children }) => (
			<QueryClientProvider client={client}>
				<I18nextProvider i18n={i18n}>{children}</I18nextProvider>
			</QueryClientProvider>
		),
	});
	return { ...view, client };
}
beforeEach(() => {
	window.matchMedia = vi.fn().mockReturnValue({
		matches: false,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
	});
	HTMLElement.prototype.scrollIntoView = vi.fn();
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	);
	state.user = { userId: "admin-1", roles: [TRoles.Admin] };
	state.pending = false;
	state.page.mockReset().mockImplementation(async ({ page }) => ({
		content: [
			{
				...key,
				id: `key-${page}`,
				code: page ? "FAM-TEST-KEYS-002" : key.code,
			},
		],
		totalElements: 21,
		totalPages: 2,
		number: page,
	}));
	state.stats.mockReset().mockResolvedValue({ activeCount: 16, usedCount: 5 });
	state.generate
		.mockReset()
		.mockResolvedValue([{ ...key, id: "new-key", code: "FAM-NEW1-KEYS-003" }]);
	state.copy.mockReset().mockResolvedValue(undefined);
	Object.defineProperty(navigator, "clipboard", {
		configurable: true,
		value: { writeText: state.copy },
	});
	HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
	cleanup();
	clients.forEach((client) => client.clear());
	clients.length = 0;
	vi.restoreAllMocks();
});

it.each([null, TRoles.User, TRoles.Artist, TRoles.Moderator])(
	"never requests key data for unauthorized role %s",
	async (role) => {
		state.user = role ? { userId: "not-admin", roles: [role] } : null;
		await mount();
		expect(
			screen.getByRole("heading", { name: "Admin dashboard" }),
		).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Generate keys" })).toBeNull();
		expect(state.page).not.toHaveBeenCalled();
		expect(state.stats).not.toHaveBeenCalled();
		expect(state.generate).not.toHaveBeenCalled();
	},
);
it("waits for auth and preserves localized sign-in links", async () => {
	state.pending = true;
	const view = await mount("pl");
	expect(screen.getByRole("status").textContent).toContain("Ładowanie");
	expect(state.page).not.toHaveBeenCalled();
	state.pending = false;
	state.user = null;
	view.rerender(<AdminDashboard />);
	expect(
		screen.getByRole("link", { name: "Zaloguj się" }).getAttribute("href"),
	).toBe("/pl/auth/login");
});
it("paginates on the server, resets pages for status filters, and keeps totals global", async () => {
	await mount();
	await screen.findByText(key.code);
	fireEvent.click(screen.getByRole("button", { name: "Next page" }));
	await screen.findByText("FAM-TEST-KEYS-002");
	expect(state.page.mock.calls.at(-1)?.[0].page).toBe(1);
	fireEvent.click(screen.getByRole("button", { name: "Filter" }));
	fireEvent.click(await screen.findByRole("option", { name: /Key status/ }));
	fireEvent.click(await screen.findByRole("option", { name: /^Available/ }));
	await waitFor(() =>
		expect(state.page.mock.calls.at(-1)?.[0]).toEqual({
			page: 0,
			used: false,
			ownerUserId: undefined,
		}),
	);
	expect(state.stats).toHaveBeenCalledTimes(1);
});
it("validates owner IDs before applying the server filter", async () => {
	await mount();
	await screen.findByText(key.code);
	fireEvent.click(screen.getByRole("button", { name: "Owner" }));
	const input = screen.getByRole("textbox", { name: "Filter by owner ID" });
	fireEvent.change(input, { target: { value: "invalid" } });
	fireEvent.click(screen.getByRole("button", { name: "Apply" }));
	expect(screen.getByRole("alert").textContent).toContain("UUID");
	expect(state.page).toHaveBeenCalledTimes(1);
	const owner = "11111111-1111-4111-8111-111111111111";
	fireEvent.change(input, { target: { value: ` ${owner} ` } });
	fireEvent.click(screen.getByRole("button", { name: "Apply" }));
	await waitFor(() =>
		expect(state.page.mock.calls.at(-1)?.[0].ownerUserId).toBe(owner),
	);
});
it("searches only the displayed page and copies a key on request", async () => {
	await mount();
	await screen.findByText(key.code);
	fireEvent.click(screen.getByRole("button", { name: `Copy ${key.code}` }));
	await waitFor(() =>
		expect(state.copy).toHaveBeenCalledExactlyOnceWith(key.code),
	);
	fireEvent.change(
		screen.getByRole("textbox", { name: "Search keys on this page" }),
		{ target: { value: "unmatched" } },
	);
	expect(screen.getByText("No matching keys on this page")).toBeTruthy();
	expect(state.page).toHaveBeenCalledTimes(1);
	fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
	expect(screen.getByText(key.code)).toBeTruthy();
});
it("rejects invalid quantities and prevents duplicate generation while pending", async () => {
	let finish!: (value: (typeof key)[]) => void;
	state.generate.mockImplementation(
		() =>
			new Promise((resolve) => {
				finish = resolve;
			}),
	);
	await mount();
	await screen.findByText(key.code);
	fireEvent.click(screen.getByRole("button", { name: "Generate keys" }));
	const dialog = screen.getByRole("dialog", { name: "Generate keys" });
	const input = within(dialog).getByRole("spinbutton", {
		name: "Number of keys",
	});
	for (const value of ["0", "101", ""]) {
		fireEvent.change(input, { target: { value } });
		expect(
			(
				within(dialog).getByRole("button", {
					name: "Generate keys",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	}
	fireEvent.change(input, { target: { value: "10" } });
	const form = input.closest("form")!;
	fireEvent.submit(form);
	fireEvent.submit(form);
	await waitFor(() => expect(state.generate).toHaveBeenCalledTimes(1));
	expect(state.generate.mock.calls[0][0]).toBe(10);
	expect(
		(
			within(dialog).getByRole("button", {
				name: "Cancel",
			}) as HTMLButtonElement
		).disabled,
	).toBe(true);
	await act(async () =>
		finish([{ ...key, id: "generated", code: "FAM-NEW1-KEYS-003" }]),
	);
	const result = screen.getByRole("dialog", { name: "New invitation keys" });
	expect(within(result).getByText("FAM-NEW1-KEYS-003")).toBeTruthy();
	fireEvent.click(
		within(result).getByRole("button", { name: "Copy all keys" }),
	);
	await waitFor(() =>
		expect(state.copy).toHaveBeenCalledWith("FAM-NEW1-KEYS-003"),
	);
	await waitFor(() => expect(state.stats).toHaveBeenCalledTimes(2));
});
it("shows permission failures without retrying or exposing key rows", async () => {
	state.page.mockRejectedValue(
		new ApiFetchError(
			new Response(null, { status: 403 }),
			"private server detail",
		),
	);
	await mount();
	expect((await screen.findByRole("alert")).textContent).toContain(
		"administrator account",
	);
	expect(state.page).toHaveBeenCalledTimes(1);
	expect(screen.queryByText(key.code)).toBeNull();
	expect(screen.queryByText("private server detail")).toBeNull();
	expect(
		(screen.getByRole("button", { name: "Generate keys" }) as HTMLButtonElement)
			.disabled,
	).toBe(true);
});

it("leaves an unconfirmed generation open without automatically repeating it", async () => {
	state.generate.mockRejectedValueOnce(new Error("Unavailable"));
	await mount();
	await screen.findByText(key.code);
	fireEvent.click(screen.getByRole("button", { name: "Generate keys" }));
	const dialog = screen.getByRole("dialog");
	fireEvent.click(
		within(dialog).getByRole("button", { name: "Generate keys" }),
	);
	expect((await within(dialog).findByRole("alert")).textContent).toContain(
		"Refresh the key list",
	);
	expect(state.generate).toHaveBeenCalledTimes(1);
	expect(
		(within(dialog).getByRole("spinbutton") as HTMLInputElement).value,
	).toBe("10");
	fireEvent.click(
		within(dialog).getByRole("button", { name: "Generate keys" }),
	);
	await screen.findByRole("dialog", { name: "New invitation keys" });
	expect(state.generate).toHaveBeenCalledTimes(2);
});
it("does not carry a generated batch into another account or a signed-out session", async () => {
	const view = await mount();
	await screen.findByText(key.code);
	fireEvent.click(screen.getByRole("button", { name: "Generate keys" }));
	fireEvent.click(
		within(screen.getByRole("dialog")).getByRole("button", {
			name: "Generate keys",
		}),
	);
	await screen.findByRole("dialog", { name: "New invitation keys" });
	state.user = null;
	view.rerender(<AdminDashboard />);
	expect(screen.queryByRole("dialog")).toBeNull();
	expect(screen.queryByText("FAM-NEW1-KEYS-003")).toBeNull();
	state.user = { userId: "admin-2", roles: [TRoles.Admin] };
	view.rerender(<AdminDashboard />);
	await screen.findByText(key.code);
	expect(
		view.client
			.getQueryCache()
			.find({ queryKey: ["invitation-keys", "admin", "admin-2", "stats"] }),
	).toBeTruthy();
	expect(screen.queryByRole("dialog")).toBeNull();
});

it.each([
	[[], "is", undefined],
	[["false"], "is", false],
	[["true"], "is", true],
	[["false"], "is not", true],
	[["true"], "is none of", false],
	[["true", "false"], "is any of", undefined],
	[["true", "false"], "is none of", null],
] as const)(
	"maps status %j with %s to the server filter",
	(value, operator, expected) => {
		expect(invitationUsedFilter({ value: [...value], operator })).toBe(
			expected,
		);
	},
);

it("uses the shared numeric steppers and preset quantities", async () => {
	await mount();
	await screen.findByText(key.code);
	fireEvent.click(screen.getByRole("button", { name: "Generate keys" }));
	const dialog = screen.getByRole("dialog");
	fireEvent.click(within(dialog).getByRole("button", { name: "25" }));
	fireEvent.click(
		within(dialog).getByRole("button", { name: "Increase value" }),
	);
	expect(
		(within(dialog).getByRole("spinbutton") as HTMLInputElement).value,
	).toBe("26");
	fireEvent.click(
		within(dialog).getByRole("button", { name: "Decrease value" }),
	);
	fireEvent.click(
		within(dialog).getByRole("button", { name: "Generate keys" }),
	);
	await waitFor(() => expect(state.generate).toHaveBeenCalledTimes(1));
	expect(state.generate.mock.calls[0][0]).toBe(25);
});
