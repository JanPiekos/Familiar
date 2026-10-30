import type { QueryClient } from "@tanstack/react-query";
import {
	artistCatalogsQueryOptions,
	artistPortfolioPostQueryOptions,
	portfolioPostQueryOptions,
} from "@/hooks/portfolio/use-portfolio";
import i18n, { resolveLocale } from "@/lib/i18n";
import { type PageSeoData, seoText } from "@/lib/route-seo";

type ContentParams = {
	locale?: string;
	username?: string;
	postId?: string;
	folderSlug?: string;
	tab?: string;
};

export async function loadPostSeo(
	queryClient: QueryClient,
	params: ContentParams,
): Promise<{ seoMeta?: PageSeoData }> {
	if (!params.postId || (params.tab && params.tab !== "portfolio")) return {};
	const t = i18n.getFixedT(resolveLocale(params.locale));
	const fallback: PageSeoData = {
		title: t("seo.post.title"),
		description: t("seo.post.description"),
		noIndex: true,
	};
	try {
		const options = params.username
			? artistPortfolioPostQueryOptions(params.username, params.postId)
			: portfolioPostQueryOptions(params.postId);
		const post = await queryClient.ensureQueryData({
			...options,
			retry: false,
		});
		// Do not put private or content-warned titles, descriptions or images into previews.
		if (post.visibility !== "PUBLIC" || post.contentWarnings?.length)
			return { seoMeta: fallback };
		const canonicalPath = params.username
			? `/user/${encodeURIComponent(params.username)}/portfolio/${encodeURIComponent(params.postId)}`
			: `/post/${encodeURIComponent(params.postId)}`;
		const image =
			post.images?.[0]?.fullSize?.path || post.images?.[0]?.thumbnail?.path;
		return {
			seoMeta: {
				title: seoText(post.title, 90) || fallback.title,
				description: seoText(post.description) || fallback.description,
				image,
				imageAlt: image
					? seoText(post.title, 120) || fallback.title
					: undefined,
				canonicalPath,
				type: "article",
			},
		};
	} catch {
		return { seoMeta: fallback };
	}
}

export async function loadFolderSeo(
	queryClient: QueryClient,
	params: ContentParams,
): Promise<{ seoMeta?: PageSeoData }> {
	if (!params.username || !params.folderSlug || params.tab !== "portfolio")
		return {};
	try {
		const folders = await queryClient.ensureQueryData({
			...artistCatalogsQueryOptions(params.username),
			retry: false,
		});
		const folder = folders.find((item) => item.id === params.folderSlug);
		if (!folder) return { seoMeta: { noIndex: true } };
		return {
			seoMeta: {
				title: `${seoText(folder.name, 70)} — @${params.username}`,
				description: seoText(folder.description) || undefined,
			},
		};
	} catch {
		return { seoMeta: { noIndex: true } };
	}
}
