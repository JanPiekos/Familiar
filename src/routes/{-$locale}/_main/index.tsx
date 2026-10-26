import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { OutlineHome } from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";

export const Route = createFileRoute("/{-$locale}/_main/")({
	component: App,
});

function App() {
	const { t } = useTranslation();

	return (
		<EmptyPage
			icon={OutlineHome}
			title={t("pages.home.title")}
			description={t("pages.home.description")}
		/>
	);
}
