import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type VerificationStatus = "verified" | "pending" | "sign_in_required";

function matchesEmail(user: User | null | undefined, email: string) {
	return user?.email?.trim().toLowerCase() === email;
}

function isConfirmed(user: User | null | undefined, email: string) {
	return (
		matchesEmail(user, email) &&
		Boolean(user?.email_confirmed_at ?? user?.confirmed_at)
	);
}

export async function checkRegistrationVerification({
	email,
	password,
}: {
	email: string;
	password?: string;
}): Promise<VerificationStatus> {
	const normalizedEmail = email.trim().toLowerCase();
	if (!normalizedEmail) return "pending";
	const { data, error } = await supabase.auth.getSession();
	if (error) throw error;
	if (data.session) {
		// Do not replace a different account that signed in in another tab.
		if (!matchesEmail(data.session.user, normalizedEmail))
			return "sign_in_required";
		const latest = await supabase.auth.getUser();
		if (latest.error) throw latest.error;
		if (!matchesEmail(latest.data.user, normalizedEmail))
			return "sign_in_required";
		if (!isConfirmed(latest.data.user, normalizedEmail)) return "pending";
		if (isConfirmed(data.session.user, normalizedEmail)) return "verified";
		// Refresh the cached user and notify the auth provider of the confirmation.
		const refreshed = await supabase.auth.refreshSession();
		if (refreshed.error) throw refreshed.error;
		return isConfirmed(refreshed.data.session?.user, normalizedEmail)
			? "verified"
			: "sign_in_required";
	}
	// Passive checks never retry a password. Only the explicit check button may
	// use the registration form's existing in-memory password on this origin.
	if (!password) return "pending";
	const signedIn = await supabase.auth.signInWithPassword({
		email: normalizedEmail,
		password,
	});
	if (signedIn.error?.code === "email_not_confirmed") return "pending";
	if (signedIn.error?.code === "invalid_credentials") return "sign_in_required";
	if (signedIn.error) throw signedIn.error;
	return isConfirmed(signedIn.data.session?.user, normalizedEmail)
		? "verified"
		: "pending";
}
