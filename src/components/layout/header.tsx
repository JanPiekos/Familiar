import { Link } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { localizePath } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { AccountNavigation } from "./account-navigation";
import { SiteNavigationLinks } from "./site-navigation";

export default function Header() {
	const { t, i18n } = useTranslation();
	return (
		<header className="sticky top-0 z-50 px-4 lg:px-8">
			<div className="flex h-0 items-center justify-between gap-4 lg:h-16">
				<NavWrapper className="hidden lg:flex">
					<Link
						to={localizePath("/", i18n.language)}
						className="mr-2 ml-3 flex items-center gap-x-2"
					>
						<span className="text-sm font-bold tracking-wider text-primary uppercase">
							{t("header.title")}
						</span>
					</Link>
					<SiteNavigationLinks layout="header" />
				</NavWrapper>
				<AccountNavigation />
			</div>
		</header>
	);
}

function NavWrapper({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const [isScrolled, setIsScrolled] = useState(false);
	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 0);
		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);
	return (
		<nav
			className={cn(
				"flex items-center gap-1 rounded-full bg-background p-1 transition-shadow duration-200",
				isScrolled ? "shadow-lg" : "shadow-none",
				className,
			)}
		>
			{children}
		</nav>
	);
}
