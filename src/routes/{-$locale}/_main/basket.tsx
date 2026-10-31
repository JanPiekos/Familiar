import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBasket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyPage } from "@/components/layout/empty-page";

export const Route = createFileRoute("/{-$locale}/_main/basket")({
	component: BasketPage,
});

function BasketPage() {
	const { t } = useTranslation();
	return (
		<EmptyPage
			icon={ShoppingBasket}
			title={t("ui.my_basket")}
			description={t("states.empty.under_construction")}
		/>
	);
}
