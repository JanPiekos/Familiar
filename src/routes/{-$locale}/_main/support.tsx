import { createFileRoute } from "@tanstack/react-router";

import { SupportPage } from "@/components/layout/support/support-page";

export const Route = createFileRoute("/{-$locale}/_main/support")({
	component: SupportRoute,
});

function SupportRoute() {
	return <SupportPage />;
}
