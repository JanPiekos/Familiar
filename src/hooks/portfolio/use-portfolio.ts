import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { waitForMediaJob } from "@/api/media/media";
import {
	assignCatalogCover,
	createCatalog,
	deleteCatalog,
	getArtistCatalogs,
	getMyCatalogs,
	reorderMyCatalogs,
	updateCatalog,
} from "@/api/portfolio/catalogs/catalog";
import type {
	AssignCoverRequest,
	CreateCatalogRequest,
	ReorderCatalogsRequest,
	UpdateCatalogRequest,
} from "@/api/portfolio/catalogs/catalog-types";
import {
	addPortfolioPostToCatalog,
	createPortfolioPost,
	deletePortfolioPost,
	deletePortfolioPostImage,
	getArtistCatalogPosts,
	getArtistPortfolioPost,
	getArtistPortfolioPosts,
	getMyPortfolioPosts,
	getPortfolioPost,
	removePortfolioPostFromCatalog,
	reorderMyPortfolioPosts,
	reorderPortfolioPostImages,
	updatePortfolioPost,
	uploadPortfolioPostMedia,
} from "@/api/portfolio/posts/post";
import type {
	CreatePortfolioPostRequest,
	PostPageableParams,
	ReorderPostImagesRequest,
	ReorderRequest,
	UpdatePortfolioPostRequest,
} from "@/api/portfolio/posts/post-types";

function invalidatePortfolio(queryClient: ReturnType<typeof useQueryClient>) {
	return Promise.all([
		queryClient.invalidateQueries({ queryKey: ["portfolio"] }),
		queryClient.invalidateQueries({ queryKey: ["profile-content"] }),
	]);
}

// ------------------------------------------------------------------
// Portfolio Posts Queries
// ------------------------------------------------------------------

export function myPortfolioPostsQueryOptions(params?: PostPageableParams) {
	return queryOptions({
		queryKey: ["portfolio", "me", "posts", params],
		queryFn: () => getMyPortfolioPosts(params),
	});
}

export function useMyPortfolioPosts(params?: PostPageableParams) {
	return useQuery(myPortfolioPostsQueryOptions(params));
}

export function artistPortfolioPostsQueryOptions(
	username: string,
	params?: PostPageableParams,
) {
	return queryOptions({
		queryKey: ["portfolio", "artist", username, "posts", params],
		queryFn: () => getArtistPortfolioPosts(username, params),
		enabled: !!username,
	});
}

export function useArtistPortfolioPosts(
	username: string,
	params?: PostPageableParams,
) {
	return useQuery(artistPortfolioPostsQueryOptions(username, params));
}

type PortfolioPostViewer = { userId: string; username: string };

export function artistPortfolioPostQueryOptions(
	username: string,
	postId: string,
	viewer?: PortfolioPostViewer | null,
) {
	const owner =
		viewer?.userId && viewer.username.toLowerCase() === username.toLowerCase()
			? viewer
			: null;
	return queryOptions({
		// Never reuse an owner's private details in the public/SEO query or another account.
		queryKey: [
			"portfolio",
			"artist",
			username,
			"post",
			postId,
			...(owner ? ["owner", owner.userId] : []),
		],
		queryFn: () => getArtistPortfolioPost(username, postId, owner?.username),
		enabled: !!username && !!postId,
	});
}

export function useArtistPortfolioPost(
	username: string,
	postId: string,
	{ viewer, enabled = true }: {
		viewer?: PortfolioPostViewer | null;
		enabled?: boolean;
	} = {},
) {
	const options = artistPortfolioPostQueryOptions(
		username,
		postId,
		enabled ? viewer : undefined,
	);
	return useQuery({ ...options, enabled: enabled && options.enabled });
}

export function portfolioPostQueryOptions(postId: string) {
	return queryOptions({
		queryKey: ["portfolio", "post", postId],
		queryFn: () => getPortfolioPost(postId),
		enabled: !!postId,
	});
}

export function usePortfolioPost(postId: string) {
	return useQuery(portfolioPostQueryOptions(postId));
}

export function artistCatalogPostsQueryOptions(
	username: string,
	catalogId: string,
	params?: PostPageableParams,
) {
	return queryOptions({
		queryKey: [
			"portfolio",
			"artist",
			username,
			"catalog",
			catalogId,
			"posts",
			params,
		],
		queryFn: () => getArtistCatalogPosts(username, catalogId, params),
		enabled: !!username && !!catalogId,
	});
}

export function useArtistCatalogPosts(
	username: string,
	catalogId: string,
	params?: PostPageableParams,
) {
	return useQuery(artistCatalogPostsQueryOptions(username, catalogId, params));
}

// ------------------------------------------------------------------
// Portfolio Catalogs Queries
// ------------------------------------------------------------------

export function myCatalogsQueryOptions() {
	return queryOptions({
		queryKey: ["portfolio", "me", "catalogs"],
		queryFn: () => getMyCatalogs(),
	});
}

export function useMyCatalogs() {
	return useQuery(myCatalogsQueryOptions());
}

export function artistCatalogsQueryOptions(username: string) {
	return queryOptions({
		queryKey: ["portfolio", "artist", username, "catalogs"],
		queryFn: () => getArtistCatalogs(username),
		enabled: !!username,
	});
}

export function useArtistCatalogs(username: string) {
	return useQuery(artistCatalogsQueryOptions(username));
}

// ------------------------------------------------------------------
// Portfolio Posts Mutations
// ------------------------------------------------------------------

export function useCreatePortfolioPost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreatePortfolioPostRequest) => createPortfolioPost(data),
		onSuccess: () => invalidatePortfolio(queryClient),
	});
}

export function useUpdatePortfolioPost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			postId,
			data,
		}: {
			postId: string;
			data: UpdatePortfolioPostRequest;
		}) => updatePortfolioPost(postId, data),
		onSuccess: () => invalidatePortfolio(queryClient),
	});
}

export function useDeletePortfolioPost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (postId: string) => deletePortfolioPost(postId),
		onSuccess: () => invalidatePortfolio(queryClient),
	});
}

export function useReorderMyPortfolioPosts() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: ReorderRequest) => reorderMyPortfolioPosts(data),
		onSuccess: () => invalidatePortfolio(queryClient),
	});
}

export function useUploadPortfolioPostMedia() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ postId, file }: { postId: string; file: File }) => {
			const job = await uploadPortfolioPostMedia(postId, file);
			if (job.jobId) {
				await waitForMediaJob(job.jobId);
			}
			return job;
		},
		onSuccess: () => invalidatePortfolio(queryClient),
	});
}

export function useDeletePortfolioPostImage() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ postId, imageId }: { postId: string; imageId: string }) =>
			deletePortfolioPostImage(postId, imageId),
		onSuccess: () => invalidatePortfolio(queryClient),
	});
}

export function useReorderPortfolioPostImages() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			postId,
			data,
		}: {
			postId: string;
			data: ReorderPostImagesRequest;
		}) => reorderPortfolioPostImages(postId, data),
		onSuccess: () => invalidatePortfolio(queryClient),
	});
}

export function useAddPortfolioPostToCatalog() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			postId,
			catalogId,
		}: {
			postId: string;
			catalogId: string;
		}) => addPortfolioPostToCatalog(postId, catalogId),
		onSuccess: () => invalidatePortfolio(queryClient),
	});
}

export function useRemovePortfolioPostFromCatalog() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			postId,
			catalogId,
		}: {
			postId: string;
			catalogId: string;
		}) => removePortfolioPostFromCatalog(postId, catalogId),
		onSuccess: () => invalidatePortfolio(queryClient),
	});
}

// ------------------------------------------------------------------
// Portfolio Catalogs Mutations
// ------------------------------------------------------------------

export function useCreateCatalog() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateCatalogRequest) => createCatalog(data),
		onSuccess: () => invalidatePortfolio(queryClient),
	});
}

export function useUpdateCatalog() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			catalogId,
			data,
		}: {
			catalogId: string;
			data: UpdateCatalogRequest;
		}) => updateCatalog(catalogId, data),
		onSuccess: () => invalidatePortfolio(queryClient),
	});
}

export function useDeleteCatalog() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (catalogId: string) => deleteCatalog(catalogId),
		onSuccess: () => invalidatePortfolio(queryClient),
	});
}

export function useReorderMyCatalogs() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: ReorderCatalogsRequest) => reorderMyCatalogs(data),
		onSuccess: () => invalidatePortfolio(queryClient),
	});
}

export function useAssignCatalogCover() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			catalogId,
			data,
		}: {
			catalogId: string;
			data: AssignCoverRequest;
		}) => assignCatalogCover(catalogId, data),
		onSuccess: () => invalidatePortfolio(queryClient),
	});
}
