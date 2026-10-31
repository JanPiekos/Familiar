import { localizePath } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

export async function requestPasswordReset(email: string, locale: string) {
	const { error } = await supabase.auth.resetPasswordForEmail(
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

export function passwordErrorKey(error: unknown) {
	const value = error as { code?: string; status?: number } | null;
	if (value?.status === 429) return "auth.errors.rate_limit";
	if (value?.code === "same_password") return "auth.reset.same_password";
	if (value?.code === "weak_password") return "auth.reset.weak_password";
	if (value?.code === "reauthentication_not_valid")
		return "auth.reset.invalid_code";
	if (value?.code === "invalid_credentials")
		return "auth.reset.incorrect_current";
	return "auth.reset.failed";
}
