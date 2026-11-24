import { localizePath } from "@/lib/i18n";
import { getPasswordRecoveryAuth } from "@/lib/supabase";

export async function requestPasswordReset(email: string, locale: string) {
	const { error } = await getPasswordRecoveryAuth().resetPasswordForEmail(
		email.trim().toLowerCase(),
		{
			redirectTo: new URL(
				localizePath("/auth/reset-password", locale),
				window.location.origin,
			).href,
		},
	);
	if (error) throw error;
}

export async function verifyRecoveryLink(url: URL) {
	const query = url.searchParams;
	const fragment = new URLSearchParams(url.hash.slice(1));
	if (
		[query, fragment].some(
			(params) =>
				["error", "error_code", "error_description"].some((key) =>
					params.has(key),
				) ||
				(params.has("type") && params.get("type") !== "recovery"),
		)
	)
		return null;

	const code = query.get("code");
	const hash = query.get("token_hash");
	if (
		fragment.has("access_token") ||
		fragment.has("refresh_token") ||
		Boolean(code) === Boolean(hash)
	)
		return null;
	const auth = getPasswordRecoveryAuth();
	if (code) {
		// The SDK binds this exchange to the verifier from resetPasswordForEmail.
		const { data, error } = await auth.exchangeCodeForSession(code, {
			flowId: query.get("sb_flow_id") ?? undefined,
		});
		if (error || !data.session) return null;
		const verified = await auth.getClaims(data.session.access_token);
		const claims = verified.data?.claims;
		return !verified.error &&
			claims?.sub === data.session.user.id &&
			claims.amr?.some(
				(entry) =>
					(typeof entry === "string" ? entry : entry.method) === "recovery",
			)
			? data.session.user
			: null;
	}
	if (hash && query.get("type") === "recovery") {
		const { data, error } = await auth.verifyOtp({
			token_hash: hash,
			type: "recovery",
		});
		return !error ? data.session?.user : null;
	}
	return null;
}

export function passwordErrorKey(error: unknown) {
	const value = error as { code?: string; status?: number } | null;
	if (value?.status === 429) return "auth.errors.rate_limit";
	if (value?.code === "same_password") return "auth.reset.same_password";
	if (value?.code === "weak_password") return "auth.reset.weak_password";
	if (value?.code === "reauthentication_not_valid")
		return "auth.reset.invalid_code";
	if (
		value?.code === "invalid_credentials" ||
		value?.code === "current_password_mismatch"
	)
		return "auth.reset.incorrect_current";
	return "auth.reset.failed";
}
