import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { createInstance } from "i18next";
import { createRef, type Ref, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import en from "@/i18n/en";

beforeEach(() => {
	vi.stubGlobal("PointerEvent", MouseEvent);
	vi.stubGlobal(
		"matchMedia",
		vi.fn(() => ({ matches: false })),
	);
});
afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.unstubAllGlobals();
	delete document.documentElement.dataset.a11yReduceMotion;
});

async function mount(
	kind: "alert" | "confirm" = "alert",
	pending = false,
	ref?: Ref<HTMLDivElement>,
) {
	const i18n = createInstance();
	await i18n.init({ lng: "en", resources: { en: { translation: en } } });
	const onChange = vi.fn();
	const onConfirm = vi.fn();
	function View() {
		const [open, setOpen] = useState(true);
		const change = (next: boolean) => {
			onChange(next);
			setOpen(next);
		};
		return kind === "confirm" ? (
			<ConfirmDialog
				open={open}
				onOpenChange={change}
				title="Confirm action"
				description="Choose an option to continue."
				isPending={pending}
				onConfirm={onConfirm}
				confirmText="Continue"
			/>
		) : (
			<AlertDialog open={open} onOpenChange={change}>
				<AlertDialogContent ref={ref}>
					<AlertDialogTitle>Confirm action</AlertDialogTitle>
					<AlertDialogDescription>
						Choose an option to continue.
					</AlertDialogDescription>
					<input aria-label="Draft" defaultValue="Saved draft" />
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
				</AlertDialogContent>
			</AlertDialog>
		);
	}
	const view = render(
		<I18nextProvider i18n={i18n}>
			<View />
		</I18nextProvider>,
	);
	const dialog = screen.getByRole("alertdialog", { name: "Confirm action" });
	const animate = vi.fn(
		(_frames: Keyframe[], _options: KeyframeAnimationOptions) =>
			({ cancel: vi.fn(), onfinish: null }) as unknown as Animation,
	);
	Object.defineProperty(dialog, "animate", {
		configurable: true,
		value: animate,
	});
	const outside = () =>
		fireEvent.pointerDown(
			document.querySelector('[data-slot="alert-dialog-overlay"]')!,
			{ button: 0 },
		);
	return { ...view, dialog, animate, outside, onChange, onConfirm };
}

it.each(["alert", "confirm"] as const)(
	"gives feedback and keeps a required %s dialog open after an outside click",
	async (kind) => {
		const { dialog, animate, outside, onChange, onConfirm } = await mount(kind);
		outside();
		expect(screen.getByRole("alertdialog")).toBe(dialog);
		expect(dialog.dataset.outsideFeedback).toBe("true");
		expect(animate).toHaveBeenCalledOnce();
		expect(animate.mock.calls[0][1]).toMatchObject({ composite: "add" });
		expect(onChange).not.toHaveBeenCalled();
		expect(onConfirm).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
		await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
	},
);

it("keeps typed content and focus instead of remounting the dialog", async () => {
	const { outside, dialog } = await mount();
	const input = screen.getByRole("textbox", {
		name: "Draft",
	}) as HTMLInputElement;
	fireEvent.change(input, { target: { value: "Unsaved edit" } });
	input.focus();
	outside();
	expect(screen.getByRole("alertdialog")).toBe(dialog);
	expect(screen.getByRole("textbox")).toBe(input);
	expect(input.value).toBe("Unsaved edit");
	expect(document.activeElement).toBe(input);
});

it("restarts feedback on repeated clicks and clears its highlight afterwards", async () => {
	const { outside, animate, dialog } = await mount();
	vi.useFakeTimers();
	outside();
	const first = animate.mock.results[0].value;
	act(() => vi.advanceTimersByTime(250));
	outside();
	expect(first.cancel).toHaveBeenCalledOnce();
	expect(animate).toHaveBeenCalledTimes(2);
	act(() => vi.advanceTimersByTime(399));
	expect(dialog.dataset.outsideFeedback).toBe("true");
	act(() => vi.advanceTimersByTime(1));
	expect(dialog.hasAttribute("data-outside-feedback")).toBe(false);
});

it.each(["system", "app"])(
	"highlights without shaking when reduced motion comes from %s settings",
	async (source) => {
		const { outside, animate, dialog } = await mount();
		if (source === "system")
			vi.stubGlobal(
				"matchMedia",
				vi.fn(() => ({ matches: true })),
			);
		else document.documentElement.dataset.a11yReduceMotion = "true";
		outside();
		expect(animate).not.toHaveBeenCalled();
		expect(dialog.dataset.outsideFeedback).toBe("true");
	},
);

it("does not shake for inside clicks and still allows Escape to cancel", async () => {
	const { dialog, animate, onConfirm } = await mount();
	fireEvent.pointerDown(dialog, { button: 0 });
	expect(animate).not.toHaveBeenCalled();
	fireEvent.keyDown(document, { key: "Escape" });
	await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
	expect(onConfirm).not.toHaveBeenCalled();
});

it("preserves caller refs and cancels running feedback when removed", async () => {
	const ref = createRef<HTMLDivElement>();
	const { dialog, outside, animate, unmount } = await mount(
		"alert",
		false,
		ref,
	);
	expect(ref.current).toBe(dialog);
	outside();
	const animation = animate.mock.results[0].value;
	unmount();
	expect(animation.cancel).toHaveBeenCalledOnce();
	expect(ref.current).toBeNull();
});

it("keeps the shared confirmation controlled by its caller when continuing", async () => {
	const { onConfirm, onChange } = await mount("confirm");
	fireEvent.click(screen.getByRole("button", { name: "Continue" }));
	expect(onConfirm).toHaveBeenCalledOnce();
	expect(onChange).not.toHaveBeenCalled();
	expect(screen.getByRole("alertdialog")).toBeTruthy();
});

it("keeps a pending confirmation focused and its actions disabled", async () => {
	const { dialog, outside, onChange } = await mount("confirm", true);
	expect(document.activeElement).toBe(dialog);
	outside();
	for (const button of screen.getAllByRole("button"))
		expect((button as HTMLButtonElement).disabled).toBe(true);
	expect(onChange).not.toHaveBeenCalled();
});
