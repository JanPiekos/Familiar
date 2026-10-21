import { useNavigate, useParams } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks/ui/use-mobile";

export function useOpenProfileSettings() {
	const navigate = useNavigate();
	const { locale } = useParams({ strict: false }) as { locale?: string };
	const isMobile = useIsMobile();

	return () => {
		if (isMobile) {
			void navigate({ to: "/{-$locale}/settings/profile", params: { locale } });
			return;
		}
		void navigate({
			to: ".",
			search: (previous) => ({ ...previous, settings: "profile" }),
			mask: { to: "/{-$locale}/settings/profile", params: { locale } },
		});
	};
}
