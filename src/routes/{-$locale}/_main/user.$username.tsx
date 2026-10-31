import {
	createFileRoute,
	notFound,
	Outlet,
	redirect,
	useLocation,
	useMatch,
	useNavigate,
} from "@tanstack/react-router";

import { EmbeddedRouteNotFoundPage } from "@/components/layout/error-page";
import { ProfileCommissions } from "@/components/layout/profile/feed/commissions";
import { ProfilePortfolio } from "@/components/layout/profile/feed/portfolio";
import {
	hasArtistPortfolio,
	PortfolioUnavailable,
} from "@/components/layout/profile/feed/portfolio-unavailable";
import UserProfile, {
	TabContentSkeleton,
	UserProfileSkeleton,
} from "@/components/layout/profile/profile";
import { useProfileCommissions } from "@/hooks/commissions/use-commissions";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { useProfileContent } from "@/hooks/user/use-profile-content";
import { userByUsernameQueryOptions } from "@/hooks/user/use-user";
import i18n from "@/lib/i18n";
import { getErrorStatus } from "@/lib/page-error";

type ProfileFaviconUser = {
	avatarPath?: string | null;
	displayName?: string | null;
	username?: string | null;
	userId?: string | null;
	accentColor?: string | null;
};

function getProfileFaviconUrl(
	user: ProfileFaviconUser,
	fallbackUsername: string,
) {
	const search = new URLSearchParams({
		name:
			user.displayName?.trim() ||
			user.username?.trim() ||
			user.userId ||
			fallbackUsername,
		size: "64",
		// Change this whenever the generated SVG implementation changes.
		v: "facehash-5",
	});

	if (user.avatarPath) {
		search.set("image", user.avatarPath);
	}

	if (user.accentColor) {
		search.set("color", user.accentColor);
	}

	return `/api/avatar?${search.toString()}`;
}

export const Route = createFileRoute("/{-$locale}/_main/user/$username")({
	beforeLoad: ({ params, location }) => {
		const profilePath = `${params.locale ? `/${params.locale}` : ""}/user/${encodeURIComponent(params.username)}`;
		if (location.pathname.replace(/\/$/, "") === profilePath) {
			throw redirect({
				to: "/{-$locale}/user/$username/$tab",
				params: { ...params, tab: "portfolio" },
				search: location.search,
				replace: true,
			});
		}
	},
	loader: async ({ params, context }) => {
		const user = await context.queryClient
			.ensureQueryData(userByUsernameQueryOptions(params.username))
			.catch((error: unknown) => {
				if (getErrorStatus(error) === 404) throw notFound();
				throw error;
			});

		if (!user) {
			throw notFound();
		}

		const faviconUrl = getProfileFaviconUrl(user, params.username);

		return {
			user,
			username: params.username,
			faviconUrl,
			seo: {
				title: i18n.t("seo.profile.title", {
					username: params.username,
				}),
				description: i18n.t("seo.profile.description", {
					username: params.username,
				}),
			},
		};
	},

	pendingComponent: UserProfileSkeleton,
	notFoundComponent: EmbeddedRouteNotFoundPage,
	component: RouteComponent,
});

export function DefaultProfileTabContent({
	username: _username,
}: {
	username: string;
}) {
	const { user: artist } = Route.useLoaderData();
	const artistId = artist.userId ?? "";
	const { commissions, isPending: isCommissionsPending } =
		useProfileCommissions(artistId, 0, 24);

	if (isCommissionsPending) {
		return <TabContentSkeleton tab="commissions" />;
	}

	return <ProfileCommissions artist={artist} commissions={commissions} />;
}

export function DefaultPortfolioTabContent({ username }: { username: string }) {
	const { user: artist } = Route.useLoaderData();
	const artistId = artist.userId ?? "";
	const hasPortfolio = hasArtistPortfolio(artist);
	const { data: content, isPending: isContentPending } = useProfileContent(
		username,
		artistId,
		"portfolio",
		hasPortfolio,
	);

	if (!hasPortfolio) {
		return <PortfolioUnavailable />;
	}

	if (isContentPending) {
		return <TabContentSkeleton tab="portfolio" />;
	}

	if (content?.hasPortfolio === false) {
		return <PortfolioUnavailable />;
	}

	return (
		<ProfilePortfolio
			posts={content?.portfolioPosts ?? []}
			folders={content?.folders ?? []}
			username={username}
		/>
	);
}

// FIXME: when user is not logged in and opens a portfolio detail page,
// there is no creator information.
function RouteComponent() {
	const { user, username } = Route.useLoaderData();

	const navigate = useNavigate();
	const location = useLocation();
	const isMobile = useIsMobile();
	const params = Route.useParams();
	const routeTab = useMatch({
		from: "/{-$locale}/_main/user/$username/$tab",
		shouldThrow: false,
		select: (match) => match.params.tab,
	});

	const activeTab = routeTab ?? "portfolio";
	const hasPortfolio = hasArtistPortfolio(user);
	const pathParts = location.pathname.split("/").filter(Boolean);
	const isPostRoute =
		activeTab === "portfolio" &&
		pathParts[pathParts.length - 2] === "portfolio";
	const isFolderPostRoute =
		activeTab === "portfolio" && pathParts[pathParts.length - 3] === "folder";
	const isAnyPostRoute = hasPortfolio && (isPostRoute || isFolderPostRoute);
	const isModal =
		(location.state as { isModal?: boolean } | undefined)?.isModal === true;

	// Direct visits and mobile post pages use the dedicated route layout.
	if (isAnyPostRoute && (!isModal || isMobile)) {
		return <Outlet />;
	}

	return (
		<UserProfile
			user={user}
			activeTab={activeTab}
			onTabChange={(tab) => {
				if (tab === activeTab) return;

				void navigate({
					to: "/{-$locale}/user/$username/$tab",
					params: {
						locale: params.locale,
						username,
						tab,
					},
					replace: isModal,
				});
			}}
		>
			<Outlet />
		</UserProfile>
	);
}
