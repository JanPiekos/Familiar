import { createFileRoute } from "@tanstack/react-router";
import { TermsOfService } from "@/components/layout/terms-of-service";

export const Route = createFileRoute("/{-$locale}/_main/tos")({
	component: RouteComponent,
});

function RouteComponent() {
	return <TermsOfService />;
}
