import {
	useLocation,
	useNavigate,
	useParams,
	useSearch,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { useAuth } from "@/providers/auth";
import { UserSettingsModal } from "./settings-modal";

/** Own the settings overlay once, independently of how many user cards are on screen. */
export function RoutedUserSettings() {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as { settings?: string };
	const { locale } = useParams({ strict: false }) as { locale?: string };
	const { user } = useAuth();
	const isMobile = useIsMobile();
	const pathname = useLocation({ select: (location) => location.pathname });
	const isSettingsPage = /\/settings\/profile\/?$/.test(pathname);
	const open =
		Boolean(user) && search.settings === "profile" && !isSettingsPage;

	useEffect(() => {
		if (open && isMobile) {
			void navigate({
				to: "/{-$locale}/settings/profile",
				params: { locale },
				search: {},
				replace: true,
			});
		}
	}, [open, isMobile, locale, navigate]);

	const close = () => {
		void navigate({
			to: ".",
			search: (previous) => ({ ...previous, settings: undefined }),
			replace: true,
		});
	};

	if (!open || isMobile) return null;
	return (
		<UserSettingsModal
			open
			onOpenChange={(nextOpen) => {
				if (!nextOpen) close();
			}}
			onSave={close}
		/>
	);
}
