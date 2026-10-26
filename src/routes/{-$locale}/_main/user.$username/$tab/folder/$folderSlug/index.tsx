import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ProfilePortfolio } from "@/components/layout/profile/feed/portfolio";
import {
	hasArtistPortfolio,
	PortfolioUnavailable,
} from "@/components/layout/profile/feed/portfolio-unavailable";
import { TabContentSkeleton } from "@/components/layout/profile/profile";
import { useProfileContent } from "@/hooks/user/use-profile-content";
import { useUserByUsername } from "@/hooks/user/use-user";
import { loadFolderSeo } from "@/lib/content-seo";
import type { TUserProfile } from "@/types/user";

export const Route = createFileRoute(
	"/{-$locale}/_main/user/$username/$tab/folder/$folderSlug/",
)({
	loader: ({ params, context }) => loadFolderSeo(context.queryClient, params),
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation();
	const { username, tab, folderSlug } = Route.useParams();
	const { user } = useUserByUsername(username);

	if (!user) {
		return <div>{t("ui.user_not_found", "User not found")}</div>;
	}

	return (
		<FolderContent
			user={user as TUserProfile}
			tab={tab}
			folderSlug={folderSlug}
		/>
	);
}

export function FolderContent({
	user,
	tab,
	folderSlug,
}: {
	user: TUserProfile;
	tab: string;
	folderSlug: string;
}) {
	const { t } = useTranslation();
	const portfolioUnavailable = tab === "portfolio" && !hasArtistPortfolio(user);
	const {
		data: content,
		isPending,
		isCurrentUser,
	} = useProfileContent(user.username, user.userId, tab, !portfolioUnavailable);

	if (portfolioUnavailable) {
		return <PortfolioUnavailable />;
	}

	if (isPending) {
		return <TabContentSkeleton tab={tab} />;
	}

	if (tab === "portfolio" && content?.hasPortfolio === false) {
		return <PortfolioUnavailable />;
	}

	if (tab !== "portfolio") {
		return (
			<div className="p-4 text-center text-muted-foreground">
				{t("ui.folder_not_found_for_tab", "Folder not found for tab")} {tab}
			</div>
		);
	}

	const posts = content?.portfolioPosts ?? [];
	const folders = content?.folders ?? [];

	// The link currently passes folder.id as folderSlug.
	const currentFolder = folders.find((folder) => folder.id === folderSlug);

	if (!currentFolder) {
		return (
			<div className="p-4 text-center text-muted-foreground">
				{t("ui.portfolio_folder_not_found", "Portfolio folder not found")}
			</div>
		);
	}

	return (
		<ProfilePortfolio
			posts={posts}
			currentFolder={currentFolder}
			folderId={currentFolder.id}
			username={user.username}
			folders={folders}
			canManageCatalogs={isCurrentUser}
		/>
	);
}
