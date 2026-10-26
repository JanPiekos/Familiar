import i18n, { resolveLocale } from "@/lib/i18n";
import { getSeoLinks, seo } from "@/lib/seo";
import type { Meta } from "@/types/seo";

export const ROUTE_SEO = {
	"/{-$locale}/_main": { key: "home" },
	"/{-$locale}/_main/": { key: "home" },
	"/{-$locale}/_main/auth": { key: "auth", private: true },
	"/{-$locale}/_main/auth/login": { key: "login", private: true },
	"/{-$locale}/_main/auth/register": { key: "register", private: true },
	"/{-$locale}/_main/auth/forgot": { key: "forgot", private: true },
	"/{-$locale}/_main/auth/email-confirmed": {
		key: "email_confirmed",
		private: true,
	},
	"/{-$locale}/_main/auth/mollie/connect": {
		key: "payment_connect",
		private: true,
	},
	"/{-$locale}/_main/auth/mollie/callback": {
		key: "payment_callback",
		private: true,
	},
	"/{-$locale}/_main/logout": { key: "logout", private: true },
	"/{-$locale}/_main/basket": { key: "basket", private: true },
	"/{-$locale}/_main/my-requests": { key: "requests", private: true },
	"/{-$locale}/_main/settings/profile": { key: "settings", private: true },
	"/{-$locale}/_chat": { key: "chat", private: true },
	"/{-$locale}/_chat/chat": { key: "chat", private: true },
	"/{-$locale}/_chat/chat/conversation/$conversationId": {
		key: "chat",
		private: true,
	},
	"/{-$locale}/dashboard": { key: "dashboard", private: true },
	"/{-$locale}/dashboard/": { key: "dashboard", private: true },
	"/{-$locale}/dashboard/commissions_requests": {
		key: "dashboard_requests",
		private: true,
	},
	"/{-$locale}/dashboard/services": {
		key: "dashboard_services",
		private: true,
	},
	"/{-$locale}/dashboard/forms_templates": {
		key: "dashboard_forms",
		private: true,
	},
	"/{-$locale}/create": { key: "create", private: true },
	"/{-$locale}/create/": { key: "create", private: true },
	"/{-$locale}/create/post": { key: "create_post", private: true },
	"/{-$locale}/create/folder": { key: "create_folder", private: true },
	"/{-$locale}/_main/shop": { key: "shop" },
	"/{-$locale}/_main/shop/category/$slug": { key: "category" },
	"/{-$locale}/_main/shop/$id": { key: "shop_item" },
	"/{-$locale}/_main/privacy": { key: "privacy-policy" },
	"/{-$locale}/_main/tos": { key: "terms_of_service" },
	"/{-$locale}/_main/support": { key: "support" },
	"/{-$locale}/_main/roadmap": { key: "roadmap" },
	"/{-$locale}/_main/release-notes": { key: "release-notes" },
	"/{-$locale}/_main/user/$username": { key: "profile" },
	"/{-$locale}/_main/user/$username/$tab": { key: "portfolio" },
	"/{-$locale}/_main/user/$username/$tab/$postId": { key: "artist_post" },
	"/{-$locale}/_main/user/$username/$tab/folder/$folderSlug/": {
		key: "folder",
	},
	"/{-$locale}/_main/user/$username/$tab/folder/$folderSlug/$postId": {
		key: "artist_post",
	},
	"/{-$locale}/_main/post/$postId": { key: "post" },
} satisfies Record<string, { key: string; private?: boolean }>;

type SeoMatch = {
	routeId: string;
	pathname?: string;
	params?: Record<string, string | undefined>;
	loaderData?: unknown;
};
export type PageSeoData = Partial<Meta> & { canonicalPath?: string };
type ProfileSeoUser = {
	username?: string;
	bio?: string | null;
	coverPath?: string | null;
	avatarPath?: string | null;
};

export function seoText(value?: string | null, limit = 160) {
	const text =
		value
			?.replace(/<[^>]*>/g, " ")
			.replace(/\s+/g, " ")
			.trim() ?? "";
	const characters = Array.from(text);
	return characters.length > limit
		? `${characters.slice(0, limit - 1).join("")}…`
		: text;
}

/** One head owner prevents parent/child routes from publishing conflicting canonicals. */
export function getRouteSeo(matches: readonly SeoMatch[]) {
	const leaf = matches.at(-1);
	const params = leaf?.params ?? {};
	const locale = resolveLocale(params.locale);
	const t = i18n.getFixedT(locale);
	const recipe = ROUTE_SEO[leaf?.routeId as keyof typeof ROUTE_SEO];
	let key = recipe?.key ?? "defaults";
	const username = params.username ?? "";
	const profile = matches.find(
		(match) => match.routeId === "/{-$locale}/_main/user/$username",
	)?.loaderData as { user?: ProfileSeoUser } | undefined;
	const user = profile?.user;
	const isProfile = leaf?.routeId === "/{-$locale}/_main/user/$username";
	const isTab = leaf?.routeId === "/{-$locale}/_main/user/$username/$tab";
	if (isTab)
		key = [
			"portfolio",
			"commissions",
			"characters",
			"reviews",
			"liked",
		].includes(params.tab ?? "")
			? (params.tab ?? "profile")
			: "profile";
	if (params.postId && params.tab && params.tab !== "portfolio")
		key = "commission";
	const values = {
		username,
		category: seoText(params.slug?.replace(/[-_]+/g, " "), 60),
	};
	const loaded = (leaf?.loaderData as { seoMeta?: PageSeoData } | undefined)
		?.seoMeta;
	const path =
		loaded?.canonicalPath ??
		(isProfile
			? `/user/${encodeURIComponent(username)}/portfolio`
			: (leaf?.pathname ?? "/"));
	const title = loaded?.title || t(`seo.${key}.title`, values);
	const description =
		loaded?.description ||
		((isProfile || (isTab && key === "portfolio")) && seoText(user?.bio)) ||
		t(`seo.${key}.description`, values);
	const profileImage =
		isProfile || (isTab && key === "portfolio")
			? user?.coverPath || user?.avatarPath || undefined
			: undefined;
	const noIndex =
		(recipe && "private" in recipe && recipe.private) ||
		params.tab === "liked" ||
		loaded?.noIndex;
	return {
		meta: seo({
			title,
			description,
			pathname: path,
			locale,
			image: loaded?.image || profileImage,
			imageAlt:
				loaded?.imageAlt ||
				(profileImage ? t("seo.profile.title", { username }) : undefined),
			type: loaded?.type || (isProfile || isTab ? "profile" : "website"),
			noIndex: Boolean(noIndex),
			keywords: key === "shop" ? t("seo.shop.keywords") : undefined,
		}),
		links: getSeoLinks(path, locale),
	};
}
