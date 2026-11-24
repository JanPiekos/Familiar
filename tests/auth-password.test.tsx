import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { I18nextProvider } from "react-i18next";
import { StrictMode } from "react";
import i18n from "@/lib/i18n";
import { PasswordUpdateForm } from "@/components/layout/auth/form/password";
import ForgotForm from "@/components/layout/auth/form/forgot";
import { Route as ResetRoute } from "@/routes/{-$locale}/_main/auth/reset-password";
import { UserSettingsPanel } from "@/components/layout/modal/profile/settings/settings-modal";
import AuthModal from "@/components/layout/auth/modal";

const auth = vi.hoisted(() => ({
	updateUser: vi.fn(),
	reauthenticate: vi.fn(),
	getSession: vi.fn(),
	getUser: vi.fn(),
	onAuthStateChange: vi.fn(),
}));
const recovery = vi.hoisted(() => ({
	resetPasswordForEmail: vi.fn(),
	exchangeCodeForSession: vi.fn(),
	getClaims: vi.fn(),
	verifyOtp: vi.fn(),
	getUser: vi.fn(),
	signInWithPassword: vi.fn(),
	updateUser: vi.fn(),
	signOut: vi.fn(),
	onAuthStateChange: vi.fn(),
}));
vi.mock("@/lib/supabase", () => ({
	supabase: { auth },
	getPasswordRecoveryAuth: () => recovery,
}));
const recoveryUser = { id: "recovery-user", email: "owner@example.test" };
const recoverySession = {
	user: recoveryUser,
	access_token: "verified-session",
};
vi.mock("@/providers/auth", () => ({
	useAuth: () => ({
		user: null,
		authEmail: "me@example.test",
		isPending: false,
	}),
}));
vi.mock("@/hooks/user/use-update-profile", () => ({
	useUpdateProfile: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("@/components/layout/profile/settings-profile-editor", () => ({
	SettingsProfileEditor: () => null,
}));
vi.mock("@/hooks/ui/use-mobile", () => ({
	useIsMobile: () => false,
	useIsTablet: () => false,
}));
vi.mock("@/components/layout/auth/form/register", () => ({
	default: () => null,
}));
vi.mock("@/components/ui/animate-change-in-height", () => ({
	AnimateChangeInHeight: ({
		children,
	}: {
		children: import("react").ReactNode;
	}) => children,
}));

beforeEach(async () => {
	await i18n.changeLanguage("en");
	vi.clearAllMocks();
	auth.updateUser.mockResolvedValue({ data: { user: {} }, error: null });
	recovery.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
	recovery.exchangeCodeForSession.mockResolvedValue({
		data: { session: recoverySession },
		error: null,
	});
	recovery.verifyOtp.mockResolvedValue({
		data: { session: recoverySession },
		error: null,
	});
	recovery.getClaims.mockResolvedValue({
		data: { claims: { sub: recoveryUser.id, amr: [{ method: "recovery" }] } },
		error: null,
	});
	recovery.getUser.mockResolvedValue({
		data: { user: recoveryUser },
		error: null,
	});
	recovery.signInWithPassword.mockResolvedValue({
		data: { session: recoverySession },
		error: null,
	});
	recovery.updateUser.mockResolvedValue({ error: null });
	recovery.signOut.mockResolvedValue({ error: null });
	recovery.onAuthStateChange.mockReturnValue({
		data: { subscription: { unsubscribe: vi.fn() } },
	});
	auth.reauthenticate.mockResolvedValue({ error: null });
	auth.getSession.mockResolvedValue({
		data: { session: { user: { id: "test-user" } } },
		error: null,
	});
	auth.getUser.mockResolvedValue({
		data: { user: { id: "test-user" } },
		error: null,
	});
	auth.onAuthStateChange.mockReturnValue({
		data: { subscription: { unsubscribe: vi.fn() } },
	});
	window.scrollTo = vi.fn();
});
afterEach(() => {
	cleanup();
	window.history.replaceState({}, "", "/");
});

function form() {
	return render(
		<I18nextProvider i18n={i18n}>
			<PasswordUpdateForm />
		</I18nextProvider>,
	);
}
function fill(
	password = "test-only-new-password",
	confirmation = password,
	current = "test-only-old-password",
) {
	fireEvent.change(screen.getByLabelText("Current password"), {
		target: { value: current },
	});
	fireEvent.change(screen.getByLabelText("New password"), {
		target: { value: password },
	});
	fireEvent.change(screen.getByLabelText("Confirm password"), {
		target: { value: confirmation },
	});
}
function submit() {
	fireEvent.submit(screen.getByRole("form", { name: "Choose a new password" }));
}

async function route(path: string, settings = false) {
	window.history.replaceState({}, "", path);
	const root = createRootRoute({ component: Outlet });
	const page = settings
		? createRoute({
				getParentRoute: () => root,
				path: "/settings/profile",
				component: () => <UserSettingsPanel layout="page" />,
			})
		: ResetRoute.update({
				path: "/{-$locale}/auth/reset-password",
				getParentRoute: () => root,
			} as never);
	const router = createRouter({
		routeTree: root.addChildren([page]),
		history: createMemoryHistory({ initialEntries: [path] }),
		defaultPendingMinMs: 0,
	} as never);
	await router.load();
	render(
		<I18nextProvider i18n={i18n}>
			<StrictMode>
				<RouterProvider router={router as never} />
			</StrictMode>
		</I18nextProvider>,
	);
	return router;
}

describe("password update", () => {
	it("submits an authenticated change with the current password, then clears all secret fields", async () => {
		form();
		fill();
		submit();
		await screen.findByText(i18n.t("auth.reset.success"));
		expect(auth.updateUser).toHaveBeenCalledWith({
			password: "test-only-new-password",
			current_password: "test-only-old-password",
		});
		expect(
			(screen.getByLabelText("New password") as HTMLInputElement).value,
		).toBe("");
		expect(
			(screen.getByLabelText("Current password") as HTMLInputElement).value,
		).toBe("");
	});
	it.each([
		["short", "short", "Use at least 6 characters."],
		["long-password", "different-password", "The passwords don't match."],
	])("rejects invalid input %s", async (password, confirm, message) => {
		form();
		fill(password, confirm);
		submit();
		expect(await screen.findByRole("alert")).toHaveProperty(
			"textContent",
			message,
		);
		expect(auth.updateUser).not.toHaveBeenCalled();
	});
	it("requires the current password for account settings", async () => {
		form();
		fill(undefined, undefined, "");
		submit();
		expect(await screen.findByRole("alert")).toHaveProperty(
			"textContent",
			"Enter your current password.",
		);
		expect(auth.updateUser).not.toHaveBeenCalled();
	});
	it("blocks duplicate updates and keeps the draft when the provider fails", async () => {
		let finish!: (value: unknown) => void;
		auth.updateUser.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				}),
		);
		form();
		fill();
		submit();
		submit();
		expect(auth.updateUser).toHaveBeenCalledTimes(1);
		await act(async () => finish({ error: { code: "weak_password" } }));
		await screen.findByRole("alert");
		expect(
			(screen.getByLabelText("New password") as HTMLInputElement).value,
		).toBe("test-only-new-password");
		submit();
		await screen.findByText(i18n.t("auth.reset.success"));
	});
	it("completes the provider's email-code reauthentication challenge", async () => {
		auth.updateUser.mockResolvedValueOnce({
			error: { code: "reauthentication_needed" },
		});
		form();
		fill();
		submit();
		const code = await screen.findByLabelText("Verification code");
		expect(auth.reauthenticate).toHaveBeenCalledTimes(1);
		fireEvent.change(code, { target: { value: "123456" } });
		submit();
		await screen.findByText(i18n.t("auth.reset.success"));
		expect(auth.updateUser).toHaveBeenLastCalledWith({
			password: "test-only-new-password",
			current_password: "test-only-old-password",
			nonce: "123456",
		});
	});
});

describe("email recovery", () => {
	it("sends a normalized email with a localized callback and shows a neutral confirmation", async () => {
		await i18n.changeLanguage("pl");
		render(
			<I18nextProvider i18n={i18n}>
				<ForgotForm onModeChange={vi.fn()} />
			</I18nextProvider>,
		);
		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "Person@Example.test" },
		});
		fireEvent.submit(screen.getByRole("form"));
		await screen.findByText("Sprawdź skrzynkę odbiorczą");
		expect(recovery.resetPasswordForEmail).toHaveBeenCalledWith(
			"person@example.test",
			{ redirectTo: `${window.location.origin}/pl/auth/reset-password` },
		);
	});
	it("reports delivery failure and allows retry instead of pretending the email was sent", async () => {
		recovery.resetPasswordForEmail.mockResolvedValueOnce({
			error: { status: 503 },
		});
		render(
			<I18nextProvider i18n={i18n}>
				<ForgotForm onModeChange={vi.fn()} />
			</I18nextProvider>,
		);
		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "test@example.test" },
		});
		fireEvent.submit(screen.getByRole("form"));
		await screen.findByRole("alert");
		expect(screen.queryByText("Check your inbox")).toBeNull();
		fireEvent.submit(screen.getByRole("form"));
		await screen.findByText("Check your inbox");
	});
	it("redeems the email code once and verifies the current password for that account", async () => {
		await route(
			"/auth/reset-password?code=from-email&sb_flow_id=email-flow&keep=1",
		);
		await screen.findByLabelText("New password");
		expect(recovery.exchangeCodeForSession).toHaveBeenCalledExactlyOnceWith(
			"from-email",
			{ flowId: "email-flow" },
		);
		expect(recovery.getClaims).toHaveBeenCalledWith("verified-session");
		expect(window.location.search).toBe("?keep=1");
		fill();
		submit();
		await screen.findByRole("heading", { name: "Password updated" });
		expect(recovery.signInWithPassword).toHaveBeenCalledWith({
			email: recoveryUser.email,
			password: "test-only-old-password",
		});
		expect(recovery.updateUser).toHaveBeenCalledWith({
			password: "test-only-new-password",
			current_password: "test-only-old-password",
		});
		expect(auth.updateUser).not.toHaveBeenCalled();
	});
	it("requires a current password even after redeeming a recovery token hash", async () => {
		await route("/auth/reset-password?token_hash=from-email&type=recovery");
		await screen.findByLabelText("Current password");
		expect(recovery.verifyOtp).toHaveBeenCalledExactlyOnceWith({
			token_hash: "from-email",
			type: "recovery",
		});
		expect(window.location.search).toBe("");
		fill(undefined, undefined, "");
		submit();
		await screen.findByText("Enter your current password.");
		expect(recovery.signInWithPassword).not.toHaveBeenCalled();
		recovery.signInWithPassword.mockResolvedValueOnce({
			data: { session: null },
			error: { code: "invalid_credentials" },
		});
		fill();
		submit();
		await screen.findByText("Check your current password and try again.");
		expect(recovery.updateUser).not.toHaveBeenCalled();
	});
	it.each([
		"",
		"?type=recovery",
		"?token_hash=unused&type=signup",
		"#type=recovery&access_token=ordinary-session",
	])(
		"rejects direct or unrelated visits despite a signed-in session (%s)",
		async (suffix) => {
			await route(`/auth/reset-password${suffix}`);
			await screen.findByRole("link", { name: "Request a new link" });
			expect(screen.queryByLabelText("New password")).toBeNull();
			expect(recovery.exchangeCodeForSession).not.toHaveBeenCalled();
			expect(recovery.verifyOtp).not.toHaveBeenCalled();
			expect(auth.getSession).not.toHaveBeenCalled();
		},
	);
	it("shows a localized replacement link when the emailed token has expired", async () => {
		await i18n.changeLanguage("pl");
		recovery.verifyOtp.mockResolvedValueOnce({
			data: { session: null },
			error: { code: "otp_expired" },
		});
		await route("/pl/auth/reset-password?token_hash=expired&type=recovery");
		const link = await screen.findByRole("link", { name: "Wyślij nowy link" });
		expect(link.getAttribute("href")).toBe("/pl/auth/forgot");
		expect(screen.queryByLabelText("Nowe hasło")).toBeNull();
		expect(auth.updateUser).not.toHaveBeenCalled();
	});
	it("rejects an expired-link error even if another account session is already present", async () => {
		await route("/auth/reset-password?code=failed#error_code=otp_expired");
		await screen.findByRole("link", { name: "Request a new link" });
		expect(screen.queryByLabelText("New password")).toBeNull();
		expect(window.location.hash).toBe("");
	});
	it("keeps the reset form unavailable when verification fails", async () => {
		recovery.getClaims.mockResolvedValueOnce({
			data: { claims: { sub: recoveryUser.id, amr: [{ method: "password" }] } },
			error: null,
		});
		await route("/auth/reset-password?code=other-sign-in");
		await screen.findByRole("link", { name: "Request a new link" });
		expect(screen.queryByLabelText("New password")).toBeNull();
	});
	it("refuses a password change when the session no longer belongs to the recovered user", async () => {
		await route("/auth/reset-password?code=from-email");
		await screen.findByLabelText("New password");
		recovery.getUser.mockResolvedValueOnce({
			data: { user: { id: "another-user" } },
			error: null,
		});
		fill();
		submit();
		await screen.findByRole("alert");
		expect(recovery.signInWithPassword).not.toHaveBeenCalled();
		expect(recovery.updateUser).not.toHaveBeenCalled();
	});
	it("opens the working email-reset form from the desktop auth dialog", async () => {
		const root = createRootRoute({ component: AuthModal });
		const router = createRouter({
			routeTree: root,
			history: createMemoryHistory({ initialEntries: ["/"] }),
		} as never);
		await router.load();
		render(
			<I18nextProvider i18n={i18n}>
				<RouterProvider router={router as never} />
			</I18nextProvider>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
		fireEvent.click(
			await screen.findByRole("button", { name: "Forgot your password?" }),
		);
		await screen.findByRole("heading", { name: "Forgot password?" });
		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "test@example.test" },
		});
		fireEvent.submit(screen.getByRole("form"));
		await screen.findByText("Check your inbox");
		expect(recovery.resetPasswordForEmail).toHaveBeenCalled();
	});
	it("makes the settings account section usable and renders only supported controls", async () => {
		await route("/settings/profile", true);
		fireEvent.click(screen.getAllByRole("button", { name: /^Account/ })[0]);
		await screen.findByLabelText("Current password");
		expect(screen.getByText("me@example.test")).toBeDefined();
		expect(screen.queryByRole("button", { name: "Delete account" })).toBeNull();
	});
});
