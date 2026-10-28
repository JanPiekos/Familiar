import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/i18n/en";
import pl from "@/i18n/pl";
import {
	COVER_GUIDES,
	coverGuideBounds,
	cropProfileImage,
	isAnimatedImage,
} from "@/lib/image-crop";
import { ProfileImageCropDialog } from "@/components/layout/profile/profile-image-crop-dialog";
import { SettingsProfileEditor } from "@/components/layout/profile/settings-profile-editor";
import { ProfileEditor } from "@/components/layout/profile/profile-editor";
import { RegisterStepProfile } from "@/components/layout/auth/form/register/step/profile";
import type { RegisterData } from "@/types/auth/schema/register";

const state = vi.hoisted(() => ({ props: null as any }));
vi.mock("react-easy-crop", () => ({
	default: (props: any) => {
		state.props = props;
		useEffect(() => {
			props.onCropSizeChange({ width: 300, height: 300 / props.aspect });
			props.onCropAreaChange(
				{},
				{ x: 200, y: 100, width: 900, height: 900 / props.aspect },
			);
			props.onMediaLoaded({ naturalWidth: 2000, naturalHeight: 1200 });
		}, []);
		return <div data-testid="crop-surface" />;
	},
}));
vi.mock("@/components/layout/profile/avatar", () => ({
	default: ({ user }: any) => (
		<img alt="Avatar draft" src={user.avatarPath || undefined} />
	),
}));
vi.mock("sonner", () => ({
	toast: { loading: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const initial = {
	username: "artist",
	display_name: "Artist",
	bio: "Keep this draft",
	avatar_url: "https://example.com/before.png",
	cover_url: "",
	accent_color: "",
};
let toBlob: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
	vi.stubGlobal(
		"Image",
		class {
			naturalWidth = 2000;
			naturalHeight = 1200;
			src = "";
			decode = () => Promise.resolve();
		},
	);
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe() {}
			disconnect() {}
			unobserve() {}
		},
	);
	vi.stubGlobal(
		"URL",
		Object.assign(URL, {
			createObjectURL: vi.fn(() => "blob:crop-test"),
			revokeObjectURL: vi.fn(),
		}),
	);
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
		scale: vi.fn(),
		translate: vi.fn(),
		rotate: vi.fn(),
		drawImage: vi.fn(),
	} as any);
	toBlob = vi
		.spyOn(HTMLCanvasElement.prototype, "toBlob")
		.mockImplementation((callback) =>
			callback(new Blob(["cropped-pixels"], { type: "image/png" })),
		);
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});
async function show(content: React.ReactNode, locale = "en") {
	const i18n = createInstance();
	await i18n.init({
		lng: locale,
		fallbackLng: "en",
		resources: { en: { translation: en }, pl: { translation: pl } },
		interpolation: { escapeValue: false },
	});
	return render(<I18nextProvider i18n={i18n}>{content}</I18nextProvider>);
}
const file = () =>
	new File(["original-image"], "artwork.png", { type: "image/png" });
function RegistrationHarness() {
	const form = useForm<RegisterData>({
		defaultValues: {
			username: "artist",
			display_name: "Artist",
			bio: "Registration draft",
			avatar: null,
			cover: null,
		},
	});
	const avatar = form.watch("avatar");
	return (
		<FormProvider {...form}>
			<RegisterStepProfile />
			<output aria-label="Selected file">
				{avatar ? `${avatar.name}: ${avatar.type}` : "none"}
			</output>
		</FormProvider>
	);
}
function ProfileHarness() {
	const form = useForm({ defaultValues: initial });
	return (
		<FormProvider {...form}>
			<ProfileEditor />
			<output aria-label="Draft image">{form.watch("avatar_url")}</output>
			<output aria-label="Edited">{String(form.formState.isDirty)}</output>
		</FormProvider>
	);
}

describe("profile image cropping", () => {
	it("keeps registration's File contract and retains its text draft", async () => {
		const view = await show(<RegistrationHarness />);
		fireEvent.change(
			view.container.querySelector('input[type="file"][id$="-avatar"]')!,
			{ target: { files: [file()] } },
		);
		expect(screen.getByLabelText("Selected file").textContent).toBe("none");
		fireEvent.click(await screen.findByRole("button", { name: "Apply crop" }));
		await waitFor(() =>
			expect(screen.getByLabelText("Selected file").textContent).toBe(
				"artwork-cropped.png: image/png",
			),
		);
		expect(screen.getByDisplayValue("Registration draft")).toBeTruthy();
	});

	it("marks a cropped image dirty in the React Hook Form profile editor", async () => {
		const view = await show(<ProfileHarness />);
		fireEvent.change(
			view.container.querySelector('input[type="file"][id$="-avatar"]')!,
			{ target: { files: [file()] } },
		);
		fireEvent.click(await screen.findByRole("button", { name: "Apply crop" }));
		await waitFor(() =>
			expect(screen.getByLabelText("Draft image").textContent).toMatch(
				/^data:image\/png/,
			),
		);
		expect(screen.getByLabelText("Edited").textContent).toBe("true");
	});
	it("keeps the prior avatar and text when cropping is cancelled, then saves only the existing draft", async () => {
		const submit = vi.fn().mockResolvedValue(undefined);
		const view = await show(
			<>
				<SettingsProfileEditor initialValues={initial} onSubmit={submit} />
				<button type="submit" form="profile-settings-form">
					Save profile
				</button>
			</>,
		);
		fireEvent.change(
			view.container.querySelector('input[type="file"][id$="-avatar"]')!,
			{ target: { files: [file()] } },
		);
		expect(
			await screen.findByRole("dialog", { name: "Crop profile picture" }),
		).toBeTruthy();
		expect(screen.getByAltText("Avatar draft").getAttribute("src")).toBe(
			initial.avatar_url,
		);
		expect(submit).not.toHaveBeenCalled();
		fireEvent.click(
			screen.getByRole("button", { name: "Cancel", exact: true }),
		);
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(screen.getByRole("textbox", { name: "Bio" })).toHaveProperty(
			"value",
			initial.bio,
		);
		fireEvent.click(screen.getByText("Save profile"));
		await waitFor(() => expect(submit).toHaveBeenCalledWith(initial, initial));
		expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:crop-test");
	});

	it("applies a PNG crop to the draft without saving the profile until Save is clicked", async () => {
		const submit = vi.fn().mockResolvedValue(undefined);
		const view = await show(
			<>
				<SettingsProfileEditor initialValues={initial} onSubmit={submit} />
				<button type="submit" form="profile-settings-form">
					Save profile
				</button>
			</>,
		);
		fireEvent.change(
			view.container.querySelector('input[type="file"][id$="-avatar"]')!,
			{ target: { files: [file()] } },
		);
		fireEvent.click(await screen.findByRole("button", { name: "Apply crop" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		const result = screen.getByAltText("Avatar draft").getAttribute("src");
		expect(result).toMatch(/^data:image\/png;base64,/);
		expect(submit).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText("Save profile"));
		await waitFor(() =>
			expect(submit).toHaveBeenCalledWith(
				{ ...initial, avatar_url: result },
				initial,
			),
		);
	});

	it("shows responsive cover guides, localizes controls, and resets zoom and rotation", async () => {
		await show(
			<ProfileImageCropDialog
				file={file()}
				kind="cover"
				onApply={vi.fn()}
				onCancel={vi.fn()}
			/>,
			"pl",
		);
		const mobile = await screen.findByRole("button", { name: "Telefon" });
		expect(mobile.getAttribute("aria-pressed")).toBe("true");
		const slider = screen.getByRole("slider", { name: "Zbliżenie" });
		fireEvent.keyDown(slider, { key: "ArrowRight" });
		expect(state.props.zoom).toBe(1.01);
		expect(slider.getAttribute("aria-valuetext")).toBe("101%");
		fireEvent.click(screen.getByRole("button", { name: "Obróć" }));
		expect(state.props.rotation).toBe(90);
		fireEvent.click(screen.getByRole("button", { name: "Resetuj" }));
		expect(state.props.zoom).toBe(1);
		expect(state.props.rotation).toBe(0);
		const desktop = screen.getByRole("button", { name: "Komputer" });
		fireEvent.click(desktop);
		expect(desktop.getAttribute("aria-pressed")).toBe("true");
		expect(mobile.getAttribute("aria-pressed")).toBe("false");
		expect(document.querySelectorAll("[data-crop-guide]")).toHaveLength(1);
		expect(document.querySelector('[data-crop-guide="desktop"]')).toBeTruthy();
		fireEvent.click(desktop);
		expect(document.querySelector("[data-crop-guide]")).toBeNull();
	});

	it("blocks dismissal and duplicate exports while applying a crop", async () => {
		let finish!: BlobCallback;
		toBlob.mockImplementation((callback: BlobCallback) => {
			finish = callback;
		});
		const cancel = vi.fn(),
			apply = vi.fn();
		await show(
			<ProfileImageCropDialog
				file={file()}
				kind="avatar"
				onApply={apply}
				onCancel={cancel}
			/>,
		);
		fireEvent.click(await screen.findByRole("button", { name: "Apply crop" }));
		await waitFor(() => expect(toBlob).toHaveBeenCalledTimes(1));
		expect(
			screen.getByRole("button", { name: "Cancel", exact: true }),
		).toHaveProperty("disabled", true);
		fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
		fireEvent.click(screen.getByRole("button", { name: "Apply crop" }));
		expect(cancel).not.toHaveBeenCalled();
		expect(toBlob).toHaveBeenCalledTimes(1);
		await act(async () => finish(new Blob(["pixels"], { type: "image/png" })));
		await waitFor(() => expect(apply).toHaveBeenCalledTimes(1));
	});

	it("retains the crop after an export failure and supports retry", async () => {
		toBlob.mockImplementationOnce((callback: BlobCallback) => callback(null));
		const apply = vi.fn();
		await show(
			<ProfileImageCropDialog
				file={file()}
				kind="avatar"
				onApply={apply}
				onCancel={vi.fn()}
			/>,
		);
		fireEvent.click(await screen.findByRole("button", { name: "Apply crop" }));
		expect((await screen.findByRole("alert")).textContent).toContain(
			"couldn't crop",
		);
		expect(apply).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Apply crop" }));
		await waitFor(() => expect(apply).toHaveBeenCalledTimes(1));
	});

	it("can keep an animated original without rasterizing it", async () => {
		const original = new File(["GIF89a"], "animated.gif", {
			type: "image/gif",
		});
		const apply = vi.fn();
		await show(
			<ProfileImageCropDialog
				file={original}
				kind="avatar"
				onApply={apply}
				onCancel={vi.fn()}
			/>,
		);
		fireEvent.click(
			await screen.findByRole("button", { name: "Use original" }),
		);
		await waitFor(() => expect(apply).toHaveBeenCalled());
		expect(apply.mock.calls[0][0].file).toBe(original);
		expect(apply.mock.calls[0][0].dataUrl).toMatch(/^data:image\/gif/);
		expect(toBlob).not.toHaveBeenCalled();
	});

	it("exports the selected rotated region as a size-limited PNG without filling transparent pixels", async () => {
		const result = await cropProfileImage(
			"blob:test",
			{ x: 100, y: 200, width: 1800, height: 600 },
			180,
			"cover",
			"picture.jpg",
		);
		const canvas = toBlob.mock.instances[0] as HTMLCanvasElement;
		expect([canvas.width, canvas.height]).toEqual([1500, 500]);
		expect(result.file.name).toBe("picture-cropped.png");
		expect(result.file.type).toBe("image/png");
		expect(result.dataUrl).toMatch(/^data:image\/png/);
		await expect(
			cropProfileImage(
				"blob:test",
				{ x: 0, y: 0, width: 0, height: 10 },
				0,
				"avatar",
				"bad.png",
			),
		).rejects.toThrow();
	});

	it("places screen guides at the centered object-cover bounds used by the profile cover", () => {
		const desktop = coverGuideBounds(COVER_GUIDES[0].aspect);
		const mobile = coverGuideBounds(COVER_GUIDES[2].aspect);
		expect(desktop.width).toBe(1);
		expect(desktop.height).toBeCloseTo(0.675);
		expect(mobile.height).toBe(1);
		expect(mobile.width).toBeCloseTo(0.6770833);
		expect(mobile.left * 2 + mobile.width).toBeCloseTo(1);
	});

	it("detects animated WebP and APNG headers as well as GIFs", async () => {
		expect(
			await isAnimatedImage(
				new File(["RIFF----WEBPANIM"], "a.webp", { type: "image/webp" }),
			),
		).toBe(true);
		expect(
			await isAnimatedImage(
				new File(["PNG----acTL"], "a.png", { type: "image/png" }),
			),
		).toBe(true);
		expect(
			await isAnimatedImage(
				new File(["RIFF----WEBPVP8 "], "a.webp", { type: "image/webp" }),
			),
		).toBe(false);
	});
});
