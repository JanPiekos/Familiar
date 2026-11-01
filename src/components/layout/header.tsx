import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SolidLogo } from "@/components/icons/assets/logo/logo";
import { localizePath } from "@/lib/i18n";
import { AccountNavigation } from "./account-navigation";

export default function Header() {
	const { t, i18n } = useTranslation();
	return (
		<header className="sticky top-0 z-50 px-4 lg:px-8">
			<div className="flex h-0 items-center justify-between gap-4 lg:h-16">
				<Link
					to={localizePath("/", i18n.language)}
					aria-label={t("header.title")}
					className="hidden size-[50px] shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex"
				>
					<SolidLogo size={40} aria-hidden="true" />
				</Link>
				<AccountNavigation />
			</div>
		</header>
	);
}
