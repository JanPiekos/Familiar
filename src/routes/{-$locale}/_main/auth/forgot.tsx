import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import ForgotForm from "@/components/layout/auth/form/forgot";

export const Route = createFileRoute("/{-$locale}/_main/auth/forgot")({
	component: ForgotPage,
});

function ForgotPage() {
	const { locale } = Route.useParams();
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<article className="flex h-full flex-1 flex-col">
			<header className="flex flex-col py-3">
				<h1
					id="auth-page-title"
					className="text-3xl font-semibold tracking-tight text-foreground"
				>
					{t("auth.forgot.title")}
				</h1>

				<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
					{t("auth.forgot.description")}
				</p>
			</header>

			<section aria-labelledby="auth-page-title" className="mt-4 h-full">
				<ForgotForm
					onModeChange={() =>
						navigate({ to: "/{-$locale}/auth/login", params: { locale } })
					}
				/>
			</section>
		</article>
	);
}
