import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	REGISTER_ARTWORK_BY_STAGE,
	useSetAuthArtwork,
} from "@/components/layout/auth/artwork";
import { AuthLegalFooter } from "@/components/layout/auth/footer";
import RegisterForm from "@/components/layout/auth/form/register";
import type { RegisterStage } from "@/types/auth/form/register";

export const Route = createFileRoute("/{-$locale}/_main/auth/register")({
	component: RegisterPage,
});

function RegisterPage() {
	const { locale } = Route.useParams();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [stage, setStage] = useState<RegisterStage>("account");

	useSetAuthArtwork(REGISTER_ARTWORK_BY_STAGE[stage]);

	return (
		<article className="flex min-w-0 flex-1 flex-col [&_footer]:pt-3">
			<header className={stage === "verify" ? "sr-only" : "flex flex-col py-1"}>
				<h1
					id="auth-page-title"
					className="text-3xl font-semibold tracking-tight text-foreground"
				>
					{t("auth.register.title", "Register")}
				</h1>

				<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
					{t("auth.register.description", "Register to Familiar")}
				</p>
			</header>

			<section
				aria-labelledby="auth-page-title"
				className="mt-2 flex min-w-0 flex-1 flex-col"
			>
				<RegisterForm
					onStageChange={setStage}
					onSuccess={() => navigate({ to: "/{-$locale}", params: { locale } })}
					onModeChange={() =>
						navigate({ to: "/{-$locale}/auth/login", params: { locale } })
					}
				/>
			</section>

			<AuthLegalFooter />
		</article>
	);
}
