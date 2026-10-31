import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PasswordUpdateForm } from "@/components/layout/auth/form/password";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/{-$locale}/_main/auth/reset-password")({
	component: ResetPasswordPage,
});

export function ResetPasswordPage() {
	const { locale } = Route.useParams();
	const { t } = useTranslation();
	const [state, setState] = useState<
		"checking" | "ready" | "invalid" | "complete"
	>("checking");
	useEffect(() => {
		let active = true;
		let signedOut = false;
		const url = new URL(window.location.href);
		const fragment = new URLSearchParams(url.hash.slice(1));
		const linkError =
			url.searchParams.has("error") ||
			url.searchParams.has("error_code") ||
			fragment.has("error") ||
			fragment.has("error_code");
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event) => {
			if (active && event === "SIGNED_OUT") {
				signedOut = true;
				setState("invalid");
			}
		});
		void (async () => {
			try {
				const { data, error } = await supabase.auth.getSession();
				if (linkError || error || !data.session) {
					if (active) setState("invalid");
					return;
				}
				const verified = await supabase.auth.getUser();
				if (active && !signedOut)
					setState(!verified.error && verified.data.user ? "ready" : "invalid");
			} catch {
				if (active) setState("invalid");
			} finally {
				if (active) {
					// The SDK consumes the session before credentials are removed from the address.
					["code", "error", "error_code", "error_description"].forEach((key) =>
						url.searchParams.delete(key),
					);
					window.history.replaceState(
						window.history.state,
						"",
						url.pathname + url.search,
					);
				}
			}
		})();
		return () => {
			active = false;
			subscription.unsubscribe();
		};
	}, []);
	return (
		<article className="flex min-w-0 flex-1 flex-col gap-6 py-3">
			<header>
				{state === "complete" ? (
					<CheckCircle2 aria-hidden="true" className="mb-5 size-10" />
				) : (
					<KeyRound aria-hidden="true" className="mb-5 size-10" />
				)}
				<h1
					id="auth-page-title"
					className="text-3xl font-semibold tracking-tight text-foreground"
				>
					{t(
						state === "invalid"
							? "auth.reset.invalid_title"
							: state === "complete"
								? "auth.reset.success_title"
								: "auth.reset.title",
					)}
				</h1>
				<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
					{t(
						state === "invalid"
							? "auth.reset.invalid_description"
							: state === "complete"
								? "auth.reset.success"
								: "auth.reset.description",
					)}
				</p>
			</header>
			{state === "checking" && (
				<div role="status" className="flex items-center gap-3 text-sm">
					<Spinner />
					{t("auth.reset.checking")}
				</div>
			)}
			{state === "ready" && (
				<PasswordUpdateForm onSuccess={() => setState("complete")} />
			)}
			{state === "invalid" && (
				<Button asChild size="2xl" className="mt-auto">
					<Link to="/{-$locale}/auth/forgot" params={{ locale }}>
						{t("auth.reset.request_link")}
					</Link>
				</Button>
			)}
			{state === "complete" && (
				<Button asChild size="2xl" className="mt-auto">
					<Link to="/{-$locale}/auth/login" params={{ locale }}>
						{t("auth.forgot.back_to_login")}
					</Link>
				</Button>
			)}
		</article>
	);
}
