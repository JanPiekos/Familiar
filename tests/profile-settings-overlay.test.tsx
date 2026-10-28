import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";

const state = vi.hoisted(() => ({ mobile: false }));
const user = { userId: "me", username: "hasira", displayName: "Hasira", bio: "Old bio", roles: [], socials: [], createdAt: "2026-01-01" };
vi.mock("@/providers/auth", () => ({ useAuth: () => ({ user: { userId: "me", username: "hasira", roles: [] }, logout: vi.fn() }) }));
vi.mock("@/hooks/ui/use-mobile", () => ({ useIsMobile: () => state.mobile, useIsTablet: () => state.mobile }));
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

vi.mock("@/hooks/chat/use-chat", () => ({ usePostConversationDirect: () => ({ mutate: vi.fn() }) }));
vi.mock("@/components/layout/profile/avatar", () => ({ default: () => null }));
vi.mock("@/components/layout/profile/socials", () => ({ ProfileSocials: () => null }));
vi.mock("@/components/layout/profile/bio", () => ({ ProfileBio: () => null }));
import User from "@/components/layout/profile/user";
import { UserProfileSidebar } from "@/components/layout/profile/profile";
import { RoutedUserSettings } from "@/components/layout/modal/profile/settings/routed-user-settings";

function renderSettings(path = "/user/me?settings=profile&view=saved", history = createMemoryHistory({ initialEntries: [path] })) {
	const root = createRootRoute({
		component: () => <><Outlet /><RoutedUserSettings /></>,
		validateSearch: (search: Record<string, unknown>) => search,
	});
	const profile = createRoute({ getParentRoute: () => root, path: "/user/$username", component: () => <><input aria-label="Page input" /><User user={user} isDropdown /><UserProfileSidebar user={user as any} isMe isSuspended={false} /></> });
	const settings = createRoute({ getParentRoute: () => root, path: "/settings/profile", component: () => <h1>Full page settings</h1> });
	const router = createRouter({ routeTree: root.addChildren([profile, settings]), history, defaultPendingMinMs: 0 });
	window.scrollTo = vi.fn();
	return { router, ...render(<RouterProvider router={router as any} />) };
}

beforeEach(() => { state.mobile = false; });
afterEach(cleanup);

describe("settings overlay lifecycle", () => {
 it("places the owner's share control beside Edit Profile without opening settings", async () => {
  const { router } = renderSettings("/user/me");
  const edit = await screen.findByRole("button", { name: /edit profile/i });
  const share = screen.getByRole("button", { name: /share profile/i });
  expect(share.parentElement).toBe(edit.parentElement);
  expect(share.textContent).toMatch(/share profile/i);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(router.state.location.pathname).toBe("/user/me");
 });

 it.each(["profile", "menu"])("keeps full-page settings after reloading a dialog opened from %s", async (entryPoint) => {
  const original = renderSettings("/user/me");
  await screen.findByRole("textbox", { name: "Page input" });
  if (entryPoint === "profile") {
   fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
  } else {
   fireEvent.pointerDown(screen.getByRole("button", { name: /Hasira\s*@hasira/ }), { button: 0, ctrlKey: false, pointerType: "mouse" });
   fireEvent.click(await screen.findByRole("menuitem", { name: /Settings/ }));
  }
  await screen.findByRole("dialog");
  expect(original.router.state.location.pathname).toBe("/user/me");
  expect(original.router.history.location.pathname).toBe("/settings/profile");
  const history = original.router.history;
  original.unmount();
  const reloaded = renderSettings("/settings/profile", history);
  await screen.findByText("Full page settings");
  expect(reloaded.router.state.location.pathname).toBe("/settings/profile");
  expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(0);
 });

 it("does not open another editor over the full-page settings route", async () => {
  renderSettings("/settings/profile?settings=profile");
  await screen.findByText("Full page settings");
  expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(0);
 });
	it("closes one overlay and restores page interaction without losing other search state", async () => {
		const { router } = renderSettings();
		await screen.findByRole("dialog");
		expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
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
