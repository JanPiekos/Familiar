import { apiFetch } from "@/lib/fetch";
import { normalizePortfolioPost } from "./normalize-post";
import type {
	CreatePortfolioPostRequest,
	MediaJobResponse,
	PagePortfolioPostApiResponse,
	PortfolioPostApiResponse,
	PostPageableParams,
	ReorderPostImagesRequest,
	ReorderRequest,
	UpdatePortfolioPostRequest,
} from "./post-types";

async function fetchPortfolioPostPage(...args: Parameters<typeof apiFetch>) {
	const page = await apiFetch<PagePortfolioPostApiResponse>(...args);
	return { ...page, content: page.content?.map(normalizePortfolioPost) };
}
async function fetchPortfolioPost(...args: Parameters<typeof apiFetch>) {
	return normalizePortfolioPost(
		await apiFetch<PortfolioPostApiResponse>(...args),
	);
}

// Helper for generating query strings
function buildQueryString(params?: PostPageableParams): string {
	if (!params) return "";
	const query = new URLSearchParams();
	if (params.page !== undefined) query.append("page", params.page.toString());
	if (params.size !== undefined) query.append("size", params.size.toString());
	if (params.sort) {
		for (const s of params.sort) {
			query.append("sort", s);
		}
	}
	const q = query.toString();
	return q ? `?${q}` : "";
}

// ------------------------------------------------------------------
// Me Endpoints (Authenticated Artist)
// ------------------------------------------------------------------

export async function getMyPortfolioPosts(params?: PostPageableParams) {
	return fetchPortfolioPostPage(
		`portfolio/me/posts${buildQueryString(params)}`,
	);
}

export async function createPortfolioPost(data: CreatePortfolioPostRequest) {
	return fetchPortfolioPost("portfolio/me/posts", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export async function updatePortfolioPost(
	postId: string,
	data: UpdatePortfolioPostRequest,
) {
	return fetchPortfolioPost(`portfolio/me/posts/${postId}`, {
		method: "PATCH",
		body: JSON.stringify(data),
	});
}

export async function deletePortfolioPost(postId: string) {
	return apiFetch<void>(`portfolio/me/posts/${postId}`, {
		method: "DELETE",
	});
}

export async function reorderMyPortfolioPosts(data: ReorderRequest) {
	return apiFetch<void>("portfolio/me/posts/order", {
		method: "PUT",
		body: JSON.stringify(data),
	});
}

export async function uploadPortfolioPostMedia(postId: string, file: File) {
	const formData = new FormData();
	formData.append("file", file);

	return apiFetch<MediaJobResponse>(`portfolio/me/posts/${postId}/media`, {
		method: "POST",
		body: formData,
	});
}

export async function deletePortfolioPostImage(
	postId: string,
	imageId: string,
) {
	return apiFetch<void>(`portfolio/me/posts/${postId}/images/${imageId}`, {
		method: "DELETE",
	});
}

export async function reorderPortfolioPostImages(
	postId: string,
	data: ReorderPostImagesRequest,
) {
	return apiFetch<void>(`portfolio/me/posts/${postId}/images/order`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
}

export async function addPortfolioPostToCatalog(
	postId: string,
	catalogId: string,
) {
	return apiFetch<void>(`portfolio/me/posts/${postId}/catalogs/${catalogId}`, {
		method: "POST",
	});
}

export async function removePortfolioPostFromCatalog(
	postId: string,
	catalogId: string,
) {
	return apiFetch<void>(`portfolio/me/posts/${postId}/catalogs/${catalogId}`, {
		method: "DELETE",
	});
}

// ------------------------------------------------------------------
// Public / Artist Endpoints
// ------------------------------------------------------------------

export async function getArtistPortfolioPosts(
	username: string,
	params?: PostPageableParams,
) {
	return fetchPortfolioPostPage(
		`portfolio/artists/${encodeURIComponent(username)}/posts${buildQueryString(
			params,
		)}`,
	);
}

export async function getPortfolioPost(postId: string) {
	return fetchPortfolioPost(`portfolio/posts/${postId}`);
}

export async function getArtistPortfolioPost(
	username: string,
	postId: string,
	ownerUsername?: string,
) {
	// The detail response does not include an author and currently accepts unrelated
	// usernames. Verify membership before attributing a post to the requested artist.
	// The authenticated owner's list also includes posts omitted from the public list.
	const isOwner = Boolean(
		ownerUsername && ownerUsername.toLowerCase() === username.toLowerCase(),
	);
	let page = 0;
	while (true) {
		const posts = isOwner
			? await getMyPortfolioPosts({ page, size: 100 })
			: await getArtistPortfolioPosts(username, { page, size: 100 });
		if (posts.content?.some((post) => post.id === postId)) break;
		if (
			!posts.content?.length ||
			posts.last === true ||
			(posts.totalPages !== undefined && page + 1 >= posts.totalPages) ||
			(posts.last === undefined &&
				posts.totalPages === undefined &&
				posts.content.length < 100)
		) {
			throw new Error("Post not found in this artist's portfolio");
		}
		page += 1;
	}

	return fetchPortfolioPost(
		`portfolio/artists/${encodeURIComponent(username)}/posts/${postId}`,
	);
}

export async function getArtistCatalogPosts(
	username: string,
	catalogId: string,
	params?: PostPageableParams,
) {
	return fetchPortfolioPostPage(
		`portfolio/artists/${encodeURIComponent(
			username,
		)}/catalogs/${catalogId}/posts${buildQueryString(params)}`,
	);
}
