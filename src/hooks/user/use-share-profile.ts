import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useShareProfile({
	username,
	displayName,
	locale,
}: {
	username: string;
	displayName?: string | null;
	locale?: string;
}) {
	const { t } = useTranslation();
	const pending = useRef(false);
	const [isSharing, setIsSharing] = useState(false);

	const shareProfile = async () => {
		if (pending.current) return;
		pending.current = true;
		setIsSharing(true);
		try {
			const path = `/${locale ? `${encodeURIComponent(locale)}/` : ""}user/${encodeURIComponent(username)}`;
			const url = new URL(path, window.location.origin).href;
			if (navigator.share) {
				try {
					await navigator.share({ title: displayName || `@${username}`, url });
					return;
				} catch (error) {
					// Closing the native share sheet is an intentional cancellation.
					if (
						typeof error === "object" &&
						error !== null &&
						"name" in error &&
						error.name === "AbortError"
					)
						return;
				}
			}
			await navigator.clipboard.writeText(url);
			toast.success(
				t(
					"ui.successfully_copied_profile_link",
					"Successfully copied profile link",
				),
			);
		} catch {
			toast.error(
				t(
					"components.profile.actions.share_failed",
					"Could not share this profile. Please try again.",
				),
			);
		} finally {
			pending.current = false;
			setIsSharing(false);
		}
	};
	return { shareProfile, isSharing };
}
