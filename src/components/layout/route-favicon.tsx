import { useMatch } from "@tanstack/react-router";
import { APP_FAVICON } from "@/lib/favicon";
import { AvatarFavicon } from "./profile/avatar-favicon";
import { FacehashFavicon } from "./profile/facehash-favicon";

/** The sole owner of the tab icon, for both server rendering and navigation. */
export function RouteFavicon() {
	const profile = useMatch({
		from: "/{-$locale}/_main/user/$username",
		shouldThrow: false,
		select: (match) =>
			match.status === "success" ? match.loaderData : undefined,
	});
	if (!profile) return <link {...APP_FAVICON} />;
	if (profile.user.avatarPath) {
		return <AvatarFavicon key={profile.faviconUrl} src={profile.faviconUrl} />;
	}
	return (
		<FacehashFavicon
			key={profile.faviconUrl}
			fallbackHref={profile.faviconUrl}
			name={
				profile.user.displayName?.trim() ||
				profile.user.username?.trim() ||
				profile.user.userId ||
				profile.username
			}
			backgroundColor={profile.user.accentColor}
		/>
	);
}
