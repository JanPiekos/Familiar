import type {
	PortfolioPostApiResponse,
	PortfolioPostResponse,
	PortfolioPostTag,
} from "./post-types";

/** Convert the API's tag metadata into the labels used by the UI. */
export function normalizePortfolioPost(
	post: PortfolioPostApiResponse,
): PortfolioPostResponse {
	const tags = post.tags ?? [];
	const details = Array.from(
		new Map(
			[
				...(post.tagDetails ?? []),
				...tags.filter(
					(tag): tag is PortfolioPostTag =>
						typeof tag === "object" && tag !== null,
				),
			].map((tag) => [tag.id, tag]),
		).values(),
	);
	return {
		...post,
		tags: Array.from(
			new Set(
				tags
					.map((tag) => (typeof tag === "string" ? tag : tag.name))
					.filter(Boolean),
			),
		),
		tagDetails: details,
		tagIds: Array.from(
			new Set(
				[...(post.tagIds ?? []), ...details.map((tag) => tag.id)].filter(
					Boolean,
				),
			),
		),
		contentWarnings: Array.from(
			new Set(
				[
					...(post.contentWarnings ?? []),
					...details
						.filter((tag) => tag.hasContentWarning)
						.map((tag) => tag.name || tag.id),
				].filter((warning) => typeof warning === "string" && warning.trim()),
			),
		),
	};
}
