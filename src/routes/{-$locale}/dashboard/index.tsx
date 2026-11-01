import { createFileRoute } from "@tanstack/react-router";
import { DashboardOverview } from "@/components/layout/dashboard/overview";

export const Route = createFileRoute("/{-$locale}/dashboard/")({
	component: DashboardOverview,
});
