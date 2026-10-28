import { createFileRoute } from "@tanstack/react-router";
import { Roadmap } from "@/components/layout/roadmap";

export const Route = createFileRoute("/{-$locale}/_main/roadmap")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Roadmap />;
}
