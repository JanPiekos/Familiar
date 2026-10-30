import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/{-$locale}/dashboard/")({
	component: DashboardIndexRedirect,
});

function DashboardIndexRedirect() {
	const navigate = useNavigate();
	const { locale } = Route.useParams();

	useEffect(() => {
		navigate({
			to: "/{-$locale}/dashboard/commissions_requests",
			params: { locale },
			replace: true,
		});
	}, [navigate, locale]);

	return null;
}
