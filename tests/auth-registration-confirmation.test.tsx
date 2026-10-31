import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RegisterForm from "@/components/layout/auth/form/register";
import i18n from "@/lib/i18n";

const mocks = vi.hoisted(() => ({
	register: vi.fn(),
	verify: vi.fn(),
	mode: vi.fn(),
}));
vi.mock("@/providers/auth", () => ({
	RegistrationError: class extends Error {},
	useAuth: () => ({
		authEmail: null,
		isEmailVerified: false,
		isPending: false,
		register: mocks.register,
	}),
}));
vi.mock("@/lib/registration-verification", () => ({
	checkRegistrationVerification: mocks.verify,
}));
vi.mock("@/components/layout/auth/form/register/step/profile", () => ({
	RegisterStepProfile: () => null,
}));
vi.mock("@/components/layout/auth/form/register/step/socials", () => ({
	RegisterStepSocials: () => null,
}));
vi.mock("@/hooks/form/use-form-validation", async (original) => {
	const actual =
		await original<typeof import("@/hooks/form/use-form-validation")>();
	return {
		default: (props: Parameters<typeof actual.default>[0]) =>
			actual.default({
				...props,
				initialData: {
					...props.initialData,
					email: "signup@example.test",
					password: "test-only-password",
					confirm_password: "test-only-password",
					invite_key: "FAM-ABCD-EFGH-123",
					display_name: "Test User",
					username: "testuser",
				},
			}),
	};
});
beforeEach(async () => {
	vi.resetAllMocks();
	await i18n.changeLanguage("en");
	mocks.register.mockResolvedValue({ user: { email_confirmed_at: null } });
	mocks.verify.mockResolvedValue("pending");
});
afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

async function pendingRegistration() {
	render(
		<I18nextProvider i18n={i18n}>
			<RegisterForm onSuccess={vi.fn()} onModeChange={mocks.mode} />
		</I18nextProvider>,
	);
	fireEvent.click(screen.getByRole("button", { name: "Continue" }));
	await waitFor(() =>
		expect(
			screen
				.getByRole("tab", { name: "Profile" })
				.getAttribute("aria-selected"),
		).toBe("true"),
	);
	fireEvent.click(screen.getByRole("button", { name: "Continue" }));
	await waitFor(() =>
		expect(
			screen.getByRole("tab", { name: "Links" }).getAttribute("aria-selected"),
		).toBe("true"),
	);
	fireEvent.click(
		screen.getByRole("button", { name: i18n.t("auth.register.submit") }),
	);
	await screen.findByRole("heading", { name: "Please verify your email" });
}

describe("registration confirmation controls", () => {
	it("uses the in-memory registration password only for an explicit check", async () => {
		await pendingRegistration();
		mocks.verify.mockResolvedValue("verified");
		fireEvent.click(screen.getByRole("button", { name: "Check again" }));
		await screen.findByRole("heading", { name: "Email confirmed" });
		expect(mocks.verify).toHaveBeenCalledWith({
			email: "signup@example.test",
			password: "test-only-password",
		});
		expect(screen.queryByRole("button", { name: "Check again" })).toBeNull();
	});
	it("keeps passive focus checks free of password attempts", async () => {
		await pendingRegistration();
		await act(async () => {
			window.dispatchEvent(new Event("focus"));
		});
		expect(mocks.verify).toHaveBeenCalledWith({
			email: "signup@example.test",
			password: undefined,
		});
	});
	it("prevents duplicate checks and gives a safe error with retry", async () => {
		await pendingRegistration();
		let reject!: (reason: unknown) => void;
		mocks.verify.mockImplementationOnce(
			() =>
				new Promise((_resolve, fail) => {
					reject = fail;
				}),
		);
		fireEvent.click(screen.getByRole("button", { name: "Check again" }));
		fireEvent.click(screen.getByRole("button", { name: "Check again" }));
		expect(mocks.verify).toHaveBeenCalledTimes(1);
		await act(async () =>
			reject(new Error("provider detail must stay private")),
		);
		expect((await screen.findByRole("alert")).textContent).toBe(
			i18n.t("auth.register.verify.check_failed"),
		);
		mocks.verify.mockResolvedValue("verified");
		fireEvent.click(screen.getByRole("button", { name: "Check again" }));
		await screen.findByRole("heading", { name: "Email confirmed" });
	});
	it("offers a normal sign-in fallback", async () => {
		await pendingRegistration();
		fireEvent.click(
			screen.getByRole("button", { name: "Already confirmed? Sign in here" }),
		);
		expect(mocks.mode).toHaveBeenCalledWith("login");
	});
});
