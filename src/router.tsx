import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { RouteErrorPage } from "@/components/layout/error-page";
import { getQueryClient } from "@/providers/query-client";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const queryClient = getQueryClient();
	const router = createTanStackRouter({
		routeTree,
		context: {
			queryClient,
		},
		trailingSlash: "preserve",
		scrollRestoration: true,
		defaultErrorComponent: RouteErrorPage,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
	});

	setupRouterSsrQueryIntegration({ router, queryClient });

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
