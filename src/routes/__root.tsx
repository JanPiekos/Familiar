import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Analytics } from "@vercel/analytics/react";
import { RoutedUserSettings } from "@/components/layout/modal/profile/settings/routed-user-settings";
import { RouteFavicon } from "@/components/layout/route-favicon";
import { Toaster } from "@/components/ui/sonner";
import { useIsTablet } from "@/hooks/ui/use-mobile";
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools";
import i18n, { setSSRLanguage } from "@/lib/i18n";
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
	beforeLoad: async () => {
		await setSSRLanguage();
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
	component: RootDocument,
});

function RootDocument() {
	const isCompact = useIsTablet();
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
				<AuthProvider>
					<MotionProvider>
						<AbilityProvider>
							<ThemeProvider>
								<CurrencyProvider>
									<Toaster />
									<Outlet />
									<RoutedUserSettings />
									{!isCompact && (
										<TanStackDevtools
											config={{
												position: "bottom-right",
											}}
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
							</ThemeProvider>
						</AbilityProvider>
					</MotionProvider>
				</AuthProvider>
				<Analytics />
				<Scripts />
			</body>
		</html>
	);
}
