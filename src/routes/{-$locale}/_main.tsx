import { createFileRoute, Outlet, useMatch } from "@tanstack/react-router";
import { Container } from "@/components/layout/container";
import FloatingToolbar from "@/components/layout/floating-toolbar";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { PortfolioCreationProvider } from "@/components/layout/profile/portfolio-creation";
import { detectLocaleFromPathOrParams, setSSRLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/{-$locale}/_main")({
	beforeLoad: async ({ params, location }) => {
		const localeToSet = detectLocaleFromPathOrParams(params, location.pathname);
		await setSSRLanguage(localeToSet);
	},
	component: MainLayout,
});

function MainLayout() {
	const isAuthPage = Boolean(
		useMatch({
			from: "/{-$locale}/_main/auth",
			shouldThrow: false,
			select: (match) => match.id,
		}),
	);
	return (
		<PortfolioCreationProvider>
			<div className="mobile-dock-layout flex min-h-dvh flex-col">
				<Container className="flex h-full flex-1 flex-col">
					<Header />
					<main
						className={
							"flex h-full min-h-[calc(100dvh-var(--mobile-dock-space,0px))] lg:min-h-[calc(100dvh-4rem)] flex-1 flex-col lg:px-4 lg:pt-2 lg:pb-4"
						}
					>
						<Outlet />
					</main>
					<FloatingToolbar />
					{!isAuthPage && <Footer />}
				</Container>
			</div>
		</PortfolioCreationProvider>
	);
}
