import {
	createFileRoute,
	Link,
	Outlet,
	useParams,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { EmptyPage } from "@/components/layout/empty-page";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { detectLocaleFromPathOrParams, setSSRLanguage } from "@/lib/i18n";
import { validateCreationSearch } from "@/lib/portfolio-creation";
import { useAuth } from "@/providers/auth";
import { TRoles } from "@/types/user/roles";

export const Route = createFileRoute("/{-$locale}/create")({
	validateSearch: validateCreationSearch,
	beforeLoad: async ({ params, location }) => {
		await setSSRLanguage(
			detectLocaleFromPathOrParams(params, location.pathname),
		);
	},
	component: CreationLayout,
});

export function CreationLayout() {
	const { user, isPending } = useAuth();
	const { locale } = useParams({ strict: false });
	const { t } = useTranslation();
	if (isPending || user === undefined)
		return (
			<div className="flex min-h-dvh items-center justify-center" role="status">
				<Spinner />
				<span className="sr-only">{t("ui.loading", "Loading...")}</span>
			</div>
		);
	if (!user || !user.roles?.includes(TRoles.Artist)) {
		return (
			<div className="flex min-h-dvh items-center justify-center px-4">
				<EmptyPage
					description={
						user
							? t("components.profile.private_content.description")
							: t("ui.sign_in_to_share_your_work_and_follow_creators")
					}
					title={t(
						"ui.portfolio_creation_unavailable",
						"Portfolio creation is available to artist accounts.",
					)}
				>
					<Button asChild size="xl">
						<Link
							to={
								user
									? "/{-$locale}/user/$username/$tab"
									: "/{-$locale}/auth/login"
							}
							params={{
								locale,
								username: user?.username ?? "",
								tab: "portfolio",
							}}
						>
							{user
								? t("components.portfolio.folder.back", "Back to portfolio")
								: t("auth.login.cta")}
						</Link>
					</Button>
				</EmptyPage>
			</div>
		);
	}
	return <Outlet />;
}
