import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";

const state = vi.hoisted(() => ({ mobile: false }));
vi.mock("@/providers/auth", () => ({ useAuth: () => ({ user: { userId: "me" } }) }));
vi.mock("@/hooks/ui/use-mobile", () => ({ useIsMobile: () => state.mobile }));
vi.mock("@/components/layout/modal/profile/settings/settings-modal", async () => {
	const { Dialog } = await import("radix-ui");
	return { UserSettingsModal: ({ open, onOpenChange }: any) => (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal><Dialog.Overlay /><Dialog.Content>
				<Dialog.Title>Profile settings</Dialog.Title>
				<Dialog.Description>Edit your profile</Dialog.Description>
				<input aria-label="Display name" />
				<Dialog.Close>Close settings</Dialog.Close>
			</Dialog.Content></Dialog.Portal>
		</Dialog.Root>
	) };
});

import { RoutedUserSettings } from "@/components/layout/modal/profile/settings/routed-user-settings";

function renderSettings() {
	const root = createRootRoute({
		component: () => <><Outlet /><RoutedUserSettings /></>,
		validateSearch: (search: Record<string, unknown>) => search,
	});
	const profile = createRoute({ getParentRoute: () => root, path: "/user/$username", component: () => <input aria-label="Page input" /> });
	const settings = createRoute({ getParentRoute: () => root, path: "/settings/profile", component: () => <h1>Full page settings</h1> });
	const router = createRouter({ routeTree: root.addChildren([profile, settings]), history: createMemoryHistory({ initialEntries: ["/user/me?settings=profile&view=saved"] }), defaultPendingMinMs: 0 });
	window.scrollTo = vi.fn();
	return { router, ...render(<RouterProvider router={router as any} />) };
}

beforeEach(() => { state.mobile = false; });
afterEach(cleanup);

describe("settings overlay lifecycle", () => {
	it("closes one overlay and restores page interaction without losing other search state", async () => {
		const { router } = renderSettings();
		await screen.findByRole("dialog");
		expect(screen.getAllByRole("dialog")).toHaveLength(1);
		fireEvent.click(screen.getByRole("button", { name: "Close settings" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		await waitFor(() => expect(document.body.style.pointerEvents).not.toBe("none"));
		expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
		expect(router.state.location.search).toEqual({ view: "saved" });
		const input = screen.getByRole("textbox", { name: "Page input" });
		input.focus();
		expect(document.activeElement).toBe(input);
	});
	it("uses full page settings on mobile and leaves no modal scroll lock", async () => {
		state.mobile = true;
		const { router } = renderSettings();
		await screen.findByText("Full page settings");
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(router.state.location.pathname).toBe("/settings/profile");
		expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
	});
});
