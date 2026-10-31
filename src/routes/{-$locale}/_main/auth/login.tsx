import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import LoginForm from "@/components/layout/auth/form/login";

export const Route = createFileRoute("/{-$locale}/_main/auth/login")({
	component: LoginPage,
});

function LoginPage() {
	const { locale } = Route.useParams();
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<article className="flex min-h-0 min-w-0 flex-1 flex-col">
			<header className="flex flex-col py-3">
				<h1
					id="auth-page-title"
					className="text-3xl font-semibold tracking-tight text-foreground"
				>
					{t("auth.login.title", "Login")}
				</h1>
				<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
					{t("auth.login.description", "Login to Familiar")}
				</p>
			</header>

			<section
				aria-labelledby="auth-page-title"
				className="mt-4 flex min-h-0 min-w-0 flex-1 flex-col"
			>
				<LoginForm
					onSuccess={() => navigate({ to: "/{-$locale}", params: { locale } })}
					onModeChange={() =>
						navigate({ to: "/{-$locale}/auth/register", params: { locale } })
					}
					onForgot={() =>
						navigate({ to: "/{-$locale}/auth/forgot", params: { locale } })
					}
				/>
			</section>

		</article>
	);
}
