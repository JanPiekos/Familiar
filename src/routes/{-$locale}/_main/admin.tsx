import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/layout/admin/admin-dashboard";

export const Route = createFileRoute("/{-$locale}/_main/admin")({
	component: AdminDashboard,
});
