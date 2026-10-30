/** Stable app icon restored when a profile-specific icon is removed. */
export const APP_FAVICON = {
	rel: "icon",
	href: "/favicon.svg?brand=a",
	type: "image/svg+xml",
	sizes: "any",
} as const;

/** Keep all app icon variants under the same route owner as profile avatars. */
export const APP_FAVICONS = [
	{
		rel: "icon",
		href: "/favicon.ico?brand=a",
		type: "image/x-icon",
		sizes: "16x16 32x32 48x48 64x64",
		media: "(prefers-color-scheme: light)",
	},
	{
		rel: "icon",
		href: "/favicon-dark.ico?brand=a",
		type: "image/x-icon",
		sizes: "16x16 32x32 48x48 64x64",
		media: "(prefers-color-scheme: dark)",
	},
	APP_FAVICON,
] as const;
