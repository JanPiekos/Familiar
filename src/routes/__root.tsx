import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	notFound,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Analytics } from "@vercel/analytics/react";
import type { ReactNode } from "react";
import {
	RouteErrorPage,
	RouteNotFoundPage,
} from "@/components/layout/error-page";
import { RoutedUserSettings } from "@/components/layout/modal/profile/settings/routed-user-settings";
import { RouteFavicon } from "@/components/layout/route-favicon";
import { Toaster } from "@/components/ui/sonner";
import { useIsTablet } from "@/hooks/ui/use-mobile";
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools";
import i18n, { isSupportedLocale, setSSRLanguage } from "@/lib/i18n";
import { getRouteSeo } from "@/lib/route-seo";
import { AbilityProvider } from "@/providers/ability";
import { AuthProvider } from "@/providers/auth";
import { CurrencyProvider } from "@/providers/currency";
// import "@/bones/registry";
import { MotionProvider } from "@/providers/motion";
import { ThemeProvider } from "@/providers/theme";
import appCss from "../styles.css?url";

/**
 * TODO: for multiple language SEO, we need to make Domain/{language}/routes, where default is Domain/routes (EN)
 * https://tanstack.com/router/latest/docs/guide/internationalization-i18n
 *
 * TODO: UI
 * replace all heroUI <ScrollShadow> components with scroll-fade https://ui.shadcn.com/docs/utils/scroll-fade
 */

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	beforeLoad: async ({ matches }) => {
		const locale = (matches.at(-1)?.params as { locale?: string } | undefined)
			?.locale;
		await setSSRLanguage(
			locale && isSupportedLocale(locale) ? locale : undefined,
		);
		if (locale && !isSupportedLocale(locale)) throw notFound();
	},
	head: ({ matches }) => {
		const page = getRouteSeo(matches);
		return {
			meta: [
				{
					charSet: "utf-8",
				},
				{
					name: "viewport",
					content: "width=device-width, initial-scale=1",
				},
				{
					name: "robots",
					content: "noindex, nofollow",
				},
				...page.meta,
			],
			links: [
				...page.links,
				{
					rel: "stylesheet",
					href: appCss,
				},
			],
		};
	},
	component: RootApp,
	shellComponent: RootDocument,
	errorComponent: RouteErrorPage,
	notFoundComponent: RouteNotFoundPage,
});

function RootApp() {
	const isCompact = useIsTablet();
	return (
		<AuthProvider>
			<MotionProvider>
				<AbilityProvider>
					<CurrencyProvider>
						<Toaster />
						<Outlet />
						<RoutedUserSettings />
						{!isCompact && (
							<TanStackDevtools
								config={{ position: "bottom-right" }}
								plugins={[
									{
										name: "Tanstack Router",
										render: <TanStackRouterDevtoolsPanel />,
									},
									TanStackQueryDevtools,
								]}
							/>
						)}
					</CurrencyProvider>
				</AbilityProvider>
			</MotionProvider>
		</AuthProvider>
	);
}

/** Keep the document, stylesheet and theme available even if the root route fails. */
function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang={i18n.language || "en"} suppressHydrationWarning>
			<head>
				<HeadContent />
				<RouteFavicon />
				{import.meta.env.DEV && (
					<script
						defer
						crossOrigin="anonymous"
						src="//unpkg.com/react-scan/dist/auto.global.js"
					/>
				)}
			</head>
			<body>
				<ThemeProvider>{children}</ThemeProvider>
				<Analytics />
				<Scripts />
			</body>
		</html>
	);
}
