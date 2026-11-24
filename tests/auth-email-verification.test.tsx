import type { Session, User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkRegistrationVerification } from "@/lib/registration-verification";

const auth = vi.hoisted(() => ({
	getSession: vi.fn(),
	getUser: vi.fn(),
	refreshSession: vi.fn(),
	signInWithPassword: vi.fn(),
}));
vi.mock("@/lib/supabase", () => ({ supabase: { auth } }));
const email = "signup@example.test";
const user = (confirmed = false, address = email) =>
	({
		id: "signup-user",
		email: address,
		email_confirmed_at: confirmed ? "2026-10-31T10:00:00Z" : null,
	}) as User;
const session = (confirmed = false, address = email) =>
	({ user: user(confirmed, address) }) as Session;

beforeEach(() => {
	vi.resetAllMocks();
	auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
	auth.signInWithPassword.mockResolvedValue({
		data: { session: session(true) },
		error: null,
	});
});

describe("registration confirmation on this origin", () => {
	it("does not make password attempts during passive checks without a local session", async () => {
		expect(await checkRegistrationVerification({ email })).toBe("pending");
		expect(auth.signInWithPassword).not.toHaveBeenCalled();
		expect(auth.getUser).not.toHaveBeenCalled();
	});
	it("establishes the local verified session after confirmation on another origin", async () => {
		expect(
			await checkRegistrationVerification({
				email: ` ${email.toUpperCase()} `,
				password: "test-only-password",
			}),
		).toBe("verified");
		expect(auth.signInWithPassword).toHaveBeenCalledWith({
			email,
			password: "test-only-password",
		});
	});
	it.each(["email_not_confirmed", "invalid_credentials"])(
		"handles %s without claiming confirmation",
		async (code) => {
			auth.signInWithPassword.mockResolvedValue({ data: {}, error: { code } });
			expect(
				await checkRegistrationVerification({
					email,
					password: "test-only-password",
				}),
			).toBe(code === "email_not_confirmed" ? "pending" : "sign_in_required");
		},
	);
	it("refreshes an unconfirmed cached session after checking the server user", async () => {
		auth.getSession.mockResolvedValue({
			data: { session: session() },
			error: null,
		});
		auth.getUser.mockResolvedValue({ data: { user: user(true) }, error: null });
		auth.refreshSession.mockResolvedValue({
			data: { session: session(true) },
			error: null,
		});
		expect(await checkRegistrationVerification({ email })).toBe("verified");
		expect(auth.refreshSession).toHaveBeenCalledTimes(1);
		expect(auth.signInWithPassword).not.toHaveBeenCalled();
	});
	it("does not trust a cached confirmed flag over the server", async () => {
		auth.getSession.mockResolvedValue({
			data: { session: session(true) },
			error: null,
		});
		auth.getUser.mockResolvedValue({ data: { user: user() }, error: null });
		expect(await checkRegistrationVerification({ email })).toBe("pending");
		expect(auth.refreshSession).not.toHaveBeenCalled();
	});
	it("does not replace another account signed in on this origin", async () => {
		auth.getSession.mockResolvedValue({
			data: { session: session(true, "other@example.test") },
			error: null,
		});
		expect(
			await checkRegistrationVerification({
				email,
				password: "test-only-password",
			}),
		).toBe("sign_in_required");
		expect(auth.signInWithPassword).not.toHaveBeenCalled();
	});
	it("never reports completion without a confirmed local session", async () => {
		auth.signInWithPassword.mockResolvedValue({
			data: { session: null, user: user(true) },
			error: null,
		});
		expect(
			await checkRegistrationVerification({
				email,
				password: "test-only-password",
			}),
		).toBe("pending");
	});
	it("does not accept a session for a different email", async () => {
		auth.signInWithPassword.mockResolvedValue({
			data: { session: session(true, "other@example.test") },
			error: null,
		});
		expect(
			await checkRegistrationVerification({
				email,
				password: "test-only-password",
			}),
		).toBe("pending");
	});
	it("passes temporary provider errors to the retry UI", async () => {
		const error = { status: 429 };
		auth.signInWithPassword.mockResolvedValue({ data: {}, error });
		await expect(
			checkRegistrationVerification({ email, password: "test-only-password" }),
		).rejects.toBe(error);
	});
});
