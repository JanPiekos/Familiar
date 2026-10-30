export type CreationSearch = { returnTo?: string };

declare module "@tanstack/react-router" {
	interface HistoryState {
		portfolioCreationFrom?: string;
		isModal?: boolean;
	}
}

export function validateCreationSearch(
	search: Record<string, unknown>,
): CreationSearch {
	return {
		returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
	};
}

/** Return only to an internal portfolio URL; ignore external or malformed links. */
export function getCreationReturnPath(value: unknown, fallback: string) {
	if (
		typeof value !== "string" ||
		!/^\/(?:[a-z]{2}\/)?user\/[^/]+\/portfolio(?:[/?#]|$)/.test(value) ||
		Array.from(value).some(
			(character) => character.charCodeAt(0) <= 32 || character === "\\",
		)
	)
		return fallback;
	const url = new URL(value, "https://familiar.invalid");
	return url.origin === "https://familiar.invalid" &&
		/^\/(?:[a-z]{2}\/)?user\/[^/]+\/portfolio(?:\/|$)/.test(url.pathname)
		? url.pathname + url.search + url.hash
		: fallback;
}
