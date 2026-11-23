import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { useState } from "react";

vi.mock("react-i18next", async (importOriginal) => ({
	...(await importOriginal<typeof import("react-i18next")>()),
	useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
vi.mock("@/providers/auth", () => ({
	useAuth: () => ({ user: { username: "artist", displayName: "Demo artist" } }),
}));
vi.mock("@/hooks/user/use-update-profile", () => ({
	useUpdateProfile: () => ({ isPending: false }),
}));
vi.mock("@/hooks/ui/use-mobile", () => ({ useIsMobile: () => false }));
vi.mock("@/components/layout/profile/settings-profile-editor", () => ({
	SettingsProfileEditor: () => (
		<form id="profile-settings-form">
			<label htmlFor="bio">Bio</label>
			<textarea id="bio" />
		</form>
	),
}));

import { UserSettingsModal } from "@/components/layout/modal/profile/settings/settings-modal";

beforeEach(() => {
	const getStyle = globalThis.getComputedStyle;
	vi.stubGlobal("CSS", { escape: (value: string) => value });
	vi.spyOn(globalThis, "getComputedStyle").mockImplementation(
		(element, pseudo) => {
			const style = getStyle(element, pseudo);
			if (!element.classList.contains("settings-dialog")) return style;
			return new Proxy(style, {
				get: (target, key) =>
					key === "animationName"
						? `settings-${element.getAttribute("data-state") === "closed" ? "exit" : "enter"}`
						: Reflect.get(target, key, target),
			});
		},
	);
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

function endExit(element: HTMLElement) {
	const event = new Event("animationend", { bubbles: true });
	Object.defineProperty(event, "animationName", { value: "settings-exit" });
	fireEvent(element, event);
}
function mount(onClose = vi.fn()) {
	function View() {
		const [open, setOpen] = useState(false);
		return (
			<>
				<button type="button" onClick={() => setOpen(true)}>
					Open settings
				</button>
				<UserSettingsModal
					open={open}
					onOpenChange={(next) => {
						onClose(next);
						setOpen(next);
					}}
				/>
			</>
		);
	}
	const view = render(<View />);
	const launcher = screen.getByRole("button", { name: "Open settings" });
	launcher.focus();
	fireEvent.click(launcher);
	return { ...view, launcher, onClose };
}

it.each(["Close settings dialog", "Cancel"])(
	"keeps settings mounted through exit when dismissed with %s",
	async (name) => {
		const { launcher, onClose } = mount();
		const dialog = screen.getByRole("dialog", { name: "User settings" });
		expect(document.activeElement).toBe(dialog);
		expect(
			screen
				.getByRole("button", { name: "Close settings dialog" })
				.closest("header"),
		).toBeTruthy();
		expect(screen.getByLabelText("Bio")).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name }));
		expect(dialog.getAttribute("data-state")).toBe("closed");
		expect(onClose).not.toHaveBeenCalled();
		endExit(screen.getByLabelText("Bio"));
		expect(onClose).not.toHaveBeenCalled();
		endExit(dialog);
		await waitFor(() => expect(onClose).toHaveBeenCalledExactlyOnceWith(false));
		expect(document.activeElement).toBe(launcher);
	},
);

it("allows Escape to finish the same exit before notifying the route", async () => {
	const { onClose } = mount();
	const dialog = screen.getByRole("dialog", { name: "User settings" });
	fireEvent.keyDown(document, { key: "Escape" });
	expect(dialog.getAttribute("data-state")).toBe("closed");
	expect(onClose).not.toHaveBeenCalled();
	endExit(dialog);
	await waitFor(() => expect(onClose).toHaveBeenCalledExactlyOnceWith(false));
});

it("does not navigate back from an old settings dialog after another route unmounts it", async () => {
	const { onClose, unmount } = mount();
	fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
	unmount();
	await new Promise((resolve) => setTimeout(resolve, 0));
	expect(onClose).not.toHaveBeenCalled();
});
