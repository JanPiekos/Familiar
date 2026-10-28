import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPolicy } from "@/components/layout/privacy-policy";

export const Route = createFileRoute("/{-$locale}/_main/privacy")({
	component: RouteComponent,
});

function RouteComponent() {
	return <PrivacyPolicy />;
}
