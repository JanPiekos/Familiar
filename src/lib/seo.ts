import i18n, {
	defaultLocale,
	getCurrentLocale,
	languages,
	localizePath,
	resolveLocale,
} from "@/lib/i18n";
import type { Meta } from "@/types/seo";

const siteUrl =
	(import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/+$/, "") ||
	"https://www.familiar.art";
const localeTags: Record<string, string> = { en: "en_US", pl: "pl_PL" };

export const getMetaDefaults = (locale?: string): Meta => {
	const t = i18n.getFixedT(resolveLocale(locale ?? getCurrentLocale()));
	return {
		title: t("seo.defaults.title"),
		description: t("seo.defaults.description"),
		keywords: t("seo.defaults.keywords"),
		image: `${siteUrl}/og-image.png`,
		imageAlt: "Familiar",
	};
};

export function getLocalizedUrl(pathname: string, locale?: string) {
	// Tracking, filters, authentication tokens and anchors never belong in canonicals.
	const path = pathname.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
	return `${siteUrl}${localizePath(path, resolveLocale(locale))}`;
}

export function getSeoLinks(pathname: string, locale?: string) {
	return [
		{ rel: "canonical" as const, href: getLocalizedUrl(pathname, locale) },
		...languages.map((language) => ({
			rel: "alternate" as const,
			hrefLang: language.value,
			href: getLocalizedUrl(pathname, language.value),
		})),
		{
			rel: "alternate" as const,
			hrefLang: "x-default",
			href: getLocalizedUrl(pathname, defaultLocale),
		},
	];
}

export function seo({
	title,
	description,
	keywords,
	image,
	imageAlt,
	url,
	pathname,
	locale,
	type = "website",
	noIndex,
}: Meta) {
	const currentLang = resolveLocale(locale ?? getCurrentLocale());
	const defaults = getMetaDefaults(currentLang);
	const pageTitle = title.trim() || defaults.title;
	const mergedTitle =
		pageTitle === defaults.title || pageTitle.endsWith(` | ${defaults.title}`)
			? pageTitle
			: `${pageTitle} | ${defaults.title}`;
	const mergedImage = image || defaults.image;
	const resolvedDescription = description?.trim() || defaults.description;
	const resolvedUrl =
		url || (pathname ? getLocalizedUrl(pathname, currentLang) : undefined);
	return [
		{ title: mergedTitle },
		{ name: "description", content: resolvedDescription },
		{ name: "keywords", content: keywords || defaults.keywords },
		{ name: "twitter:title", content: mergedTitle },
		{ name: "twitter:description", content: resolvedDescription },
		{
			name: "twitter:card",
			content: mergedImage ? "summary_large_image" : "summary",
		},
		{ property: "og:type", content: type },
		{ property: "og:site_name", content: defaults.title },
		{ property: "og:title", content: mergedTitle },
		{ property: "og:description", content: resolvedDescription },
		{ property: "og:locale", content: localeTags[currentLang] ?? currentLang },
		...languages
			.filter((language) => language.value !== currentLang)
			.map((language) => ({
				property: "og:locale:alternate",
				content: localeTags[language.value] ?? language.value,
			})),
		...(mergedImage
			? [
					{ name: "twitter:image", content: mergedImage },
					{ name: "twitter:image:alt", content: imageAlt || defaults.imageAlt },
					{ property: "og:image", content: mergedImage },
					{ property: "og:image:alt", content: imageAlt || defaults.imageAlt },
					...(!image
						? [
								{ property: "og:image:type", content: "image/png" },
								{ property: "og:image:width", content: "1200" },
								{ property: "og:image:height", content: "630" },
							]
						: []),
				]
			: []),
		...(resolvedUrl
			? [
					{ property: "og:url", content: resolvedUrl },
					{ name: "twitter:url", content: resolvedUrl },
				]
			: []),
		...(noIndex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
	];
}
