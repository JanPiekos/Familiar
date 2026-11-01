import { AccountNavigation } from "./account-navigation";
import { SiteNavigationLinks } from "./site-navigation";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 px-4 lg:px-8">
			<div className="flex h-0 items-center justify-between gap-4 lg:h-16">
				<nav className="hidden shrink-0 rounded-full border border-border/60 bg-background p-1 lg:block">
					<SiteNavigationLinks layout="header" />
				</nav>
				<AccountNavigation />
			</div>
		</header>
	);
}
