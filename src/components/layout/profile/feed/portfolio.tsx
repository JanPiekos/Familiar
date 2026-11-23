import {
	PortfolioEmptyActions,
	usePublishPortfolioCreation,
} from "@/components/layout/profile/portfolio-creation";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Edit2, Folder, MoreHorizontal, Tag, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
	CatalogResponse,
	CreateCatalogRequest,
} from "@/api/portfolio/catalogs/catalog-types";
import type {
	CreatePortfolioPostRequest,
	PortfolioPostResponse,
} from "@/api/portfolio/posts/post-types";
import {
	FilterBar,
	type FilterGroup,
	type FilterValue,
	type ManagedFilterValue,
} from "@/components/layout/filter-bar";
import { CreatePostModal } from "@/components/layout/modal/profile/portfolio/create-post-modal";
import {
	PostManagementDialog,
	type PostManagementAction,
} from "@/components/layout/modal/portfolio-post/post-management-dialog";
import { AddFolderPostsModal } from "@/components/layout/modal/profile/portfolio/add-folder-posts-modal";
import {
	CreateCatalogModal,
	RenameCatalogModal,
} from "@/components/layout/modal/profile/portfolio/portfolio";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	useAddPortfolioPostToCatalog,
	useDeleteCatalog,
	useUpdateCatalog,
} from "@/hooks/portfolio/use-portfolio";
import { useIsTablet } from "@/hooks/ui/use-mobile";
import { getLocaleParam } from "@/lib/i18n";
import { FolderCard } from "./folder-card";
import { PortfolioFolderView } from "./folder-view";
import { ProfileFeed } from "./profile-feed";

interface ProfilePortfolioProps {
	posts: PortfolioPostResponse[];
	folderId?: string;
	username?: string;
	folders: CatalogResponse[];
	currentFolder?: CatalogResponse;

	canManageCatalogs?: boolean;
	canCreatePosts?: boolean;

	onCreateCatalog?: (data: CreateCatalogRequest) => Promise<CatalogResponse>;
	isCreatingCatalog?: boolean;

	onCreatePost?: (
		data: CreatePortfolioPostRequest,
	) => Promise<PortfolioPostResponse | void>;
	isCreatingPost?: boolean;
}

type ManagedFiltersState = Record<string, ManagedFilterValue>;

const INITIAL_FILTER_STATE: ManagedFiltersState = {
	tags: { value: [] },
	folders: { value: [] },
};

function getStringFilterValues(value: FilterValue | undefined): string[] {
	if (typeof value === "string") {
		return value ? [value] : [];
	}

	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter((item): item is string => typeof item === "string");
}

function normalizeMultiOptionOperator(
	operator: ManagedFilterValue["operator"] | undefined,
): string {
	return String(operator ?? "")
		.trim()
		.replace(/([a-z\d])([A-Z])/g, "$1 $2")
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ")
		.toLowerCase();
}

/**
 * Applies the operators emitted by the Bazza multi-option filter. It accepts
 * both its internal camelCase keys and the translated labels rendered by the
 * filter bar so changing locale or adapter shape does not invert the result.
 */
function matchesMultiOptionFilter(
	itemValues: readonly string[],
	selectedValues: readonly string[],
	operator: ManagedFilterValue["operator"] | undefined,
): boolean {
	if (selectedValues.length === 0) return true;

	const values = new Set(itemValues);
	const includesAny = selectedValues.some((value) => values.has(value));
	const includesAll = selectedValues.every((value) => values.has(value));

	switch (normalizeMultiOptionOperator(operator)) {
		case "exclude":
		case "excludes":
		case "exclude all of":
		case "excludes all of":
		case "exclude if any of":
		case "excludes if any of":
		case "does not contain":
		case "is not":
		case "is none of":
			return !includesAny;

		case "exclude if all":
		case "excludes if all":
			return !includesAll;

		case "include all of":
		case "includes all of":
		case "contains":
		case "is all of":
			return includesAll;

		case "include":
		case "includes":
		case "include any of":
		case "includes any of":
		case "is":
		case "is any of":
		default:
			return includesAny;
	}
}

interface FolderPreview {
	coverSrc?: string;
	contentWarnings: string[];
}

function getFolderPreview(
	folder: CatalogResponse,
	posts: PortfolioPostResponse[],
): FolderPreview {
	const folderCoverPaths = new Set(
		[folder.fullSize?.path, folder.thumbnail?.path].filter(
			(path): path is string => Boolean(path),
		),
	);

	const folderCoverIds = new Set(
		[folder.fullSize?.id, folder.thumbnail?.id].filter(Boolean),
	);
	const postMatchingFolderCover = posts.find((post) =>
		(post.images ?? []).some(
			(image) =>
				[image.fullSize?.id, image.thumbnail?.id].some(
					(id) => id && folderCoverIds.has(id),
				) ||
				[image.fullSize?.path, image.thumbnail?.path].some((path) =>
					Boolean(path && folderCoverPaths.has(path)),
				),
		),
	);

	const previewPost =
		postMatchingFolderCover ??
		posts.find((post) =>
			(post.images ?? []).some(
				(image) => image.fullSize?.path || image.thumbnail?.path,
			),
		);

	const previewImage = [...(previewPost?.images ?? [])]
		.sort(
			(a, b) =>
				(a.position ?? Number.MAX_SAFE_INTEGER) -
				(b.position ?? Number.MAX_SAFE_INTEGER),
		)
		.find((image) => image.fullSize?.path || image.thumbnail?.path);

	return {
		coverSrc:
			folder.fullSize?.path ??
			folder.thumbnail?.path ??
			previewImage?.fullSize?.path ??
			previewImage?.thumbnail?.path,
		contentWarnings:
			(folder.fullSize?.path || folder.thumbnail?.path) &&
			!postMatchingFolderCover
				? Array.from(
						new Set(posts.flatMap((post) => post.contentWarnings ?? [])),
					)
				: (previewPost?.contentWarnings ?? []),
	};
}

export function ProfilePortfolio({
	posts,
	folderId,
	username,
	folders,
	currentFolder: propCurrentFolder,
	canManageCatalogs = false,
	canCreatePosts = false,
	onCreateCatalog,
	isCreatingCatalog = false,
	onCreatePost,
	isCreatingPost = false,
}: ProfilePortfolioProps) {
	const locale = RouteLocale();
	const isCompact = useIsTablet();
	const location = useLocation();
	const navigate = useNavigate();
	const { t } = useTranslation();

	const [filters, setFilters] =
		useState<ManagedFiltersState>(INITIAL_FILTER_STATE);
	const [searchQuery, setSearchQuery] = useState("");
	const [createCatalogOpen, setCreateCatalogOpen] = useState(false);
	const [createPostOpen, setCreatePostOpen] = useState(false);
	const [renameCatalogOpen, setRenameCatalogOpen] = useState(false);
	const [deleteCatalogOpen, setDeleteCatalogOpen] = useState(false);
	const [addPostsOpen, setAddPostsOpen] = useState(false);
	const [management, setManagement] = useState<{
		post: PortfolioPostResponse;
		action: PostManagementAction;
		folder?: CatalogResponse;
	} | null>(null);
	const managePost = useCallback(
		(post: PortfolioPostResponse, action: PostManagementAction) => {
			if (canManageCatalogs && post.id) setManagement({ post, action });
		},
		[canManageCatalogs],
	);
	// Keep the dialog mounted if a refetch removes the last visible post.
	const managementDialog =
		canManageCatalogs && management ? (
			<PostManagementDialog
				key={`${management.post.id}-${management.action}`}
				{...management}
				folders={folders}
				onClose={() => setManagement(null)}
			/>
		) : null;

	const updateCatalogMutation = useUpdateCatalog();
	const deleteCatalogMutation = useDeleteCatalog();
	const addPostMutation = useAddPortfolioPostToCatalog();

	const canCreateCatalog = canManageCatalogs && Boolean(onCreateCatalog);
	const canCreatePost = canCreatePosts && Boolean(onCreatePost);
	const hasCreateActions = canCreateCatalog || canCreatePost;
	const openCreation = useCallback(
		(kind: "post" | "folder") => {
			if (!isCompact) {
				if (kind === "post") setCreatePostOpen(true);
				else setCreateCatalogOpen(true);
				return;
			}
			const returnTo = location.href;
			void navigate({
				to:
					kind === "post"
						? "/{-$locale}/create/post"
						: "/{-$locale}/create/folder",
				params: { locale },
				search: { returnTo },
				state: { portfolioCreationFrom: returnTo },
			});
		},
		[isCompact, locale, location.href, navigate],
	);
	const creationActions = useMemo(
		() =>
			hasCreateActions && username
				? {
						username,
						pathname: location.pathname,
						onCreatePost: canCreatePost
							? () => openCreation("post")
							: undefined,
						onCreateFolder: canCreateCatalog
							? () => openCreation("folder")
							: undefined,
					}
				: null,
		[
			hasCreateActions,
			username,
			location.pathname,
			canCreatePost,
			canCreateCatalog,
			openCreation,
		],
	);
	usePublishPortfolioCreation(creationActions);

	const postsByCatalogId = useMemo(() => {
		const result = new Map<string, PortfolioPostResponse[]>();

		for (const post of posts) {
			for (const catalogId of post.catalogIds ?? []) {
				const catalogPosts = result.get(catalogId);

				if (catalogPosts) {
					catalogPosts.push(post);
				} else {
					result.set(catalogId, [post]);
				}
			}
		}

		return result;
	}, [posts]);

	const currentFolder =
		propCurrentFolder ??
		(folderId ? folders.find((folder) => folder.id === folderId) : undefined);

	const currentFolderPosts = useMemo(
		() => (currentFolder ? (postsByCatalogId.get(currentFolder.id) ?? []) : []),
		[currentFolder, postsByCatalogId],
	);

	const filterSourcePosts =
		folderId && currentFolder ? currentFolderPosts : posts;
	const folderFilterOptions = useMemo(() => {
		const folderNames = folders.map((folder) =>
			folder.name.trim().replace(/\s+/g, " "),
		);
		const totalByName = new Map<string, number>();

		for (const name of folderNames) {
			const key = name.toLocaleLowerCase();
			totalByName.set(key, (totalByName.get(key) ?? 0) + 1);
		}

		const occurrenceByName = new Map<string, number>();

		return folders.map((folder, index) => {
			const name = folderNames[index] || folder.name;
			const key = name.toLocaleLowerCase();
			const occurrence = (occurrenceByName.get(key) ?? 0) + 1;
			const total = totalByName.get(key) ?? 1;

			occurrenceByName.set(key, occurrence);

			return {
				id: folder.id,
				label: total > 1 ? `${name} (${occurrence})` : name,
			};
		});
	}, [folders]);

	useEffect(() => {
		setFilters(INITIAL_FILTER_STATE);
		setSearchQuery("");
	}, [folderId]);

	const handleRenameCatalog = async (catalogId: string, data: any) => {
		return updateCatalogMutation.mutateAsync({
			catalogId,
			data,
		});
	};

	const handleDeleteCatalog = async () => {
		if (!currentFolder) return;

		await deleteCatalogMutation.mutateAsync(currentFolder.id);
		setDeleteCatalogOpen(false);

		navigate({
			to: "/{-$locale}/user/$username/$tab",
			params: {
				locale,
				username: username ?? "",
				tab: "portfolio",
			},
		});
	};

	const handleRemovePostFromCatalog = (postId: string) => {
		const post = posts.find((item) => item.id === postId);
		if (!canManageCatalogs || !currentFolder || !post) return;
		setManagement({ post, action: "remove", folder: currentFolder });
	};

	const availableTags = useMemo(
		() =>
			Array.from(
				new Set(filterSourcePosts.flatMap((post) => post.tags ?? [])),
			).sort((a, b) => a.localeCompare(b)),
		[filterSourcePosts],
	);

	const filterGroups = useMemo<FilterGroup<PortfolioPostResponse>[]>(() => {
		const groups: FilterGroup<PortfolioPostResponse>[] = [];

		if (availableTags.length > 0) {
			groups.push({
				id: "tags",
				label: t("components.portfolio.filters.tags", "Tags"),
				type: "multiselect",
				icon: Tag,
				getItemValue: (post) => post.tags ?? [],
				options: availableTags.map((tag) => ({
					id: tag,
					label: tag,
				})),
			});
		}

		if (!folderId && folderFilterOptions.length > 0) {
			groups.push({
				id: "folders",
				label: t("components.portfolio.filters.folders", "Folders"),
				type: "multiselect",
				icon: Folder,
				getItemValue: (post) => post.catalogIds ?? [],
				options: folderFilterOptions,
			});
		}

		return groups;
	}, [availableTags, folderFilterOptions, folderId, t]);

	const filteredPosts = useMemo(() => {
		let result = [...filterSourcePosts];
		const query = searchQuery.trim().toLowerCase();

		if (query) {
			result = result.filter((post) => {
				const titleMatches = post.title?.toLowerCase().includes(query);
				const descriptionMatches = post.description
					?.toLowerCase()
					.includes(query);
				const tagMatches = post.tags?.some((tag) =>
					tag.toLowerCase().includes(query),
				);

				return Boolean(titleMatches || descriptionMatches || tagMatches);
			});
		}

		const selectedTags = getStringFilterValues(filters.tags?.value);

		if (selectedTags.length > 0) {
			result = result.filter((post) =>
				matchesMultiOptionFilter(
					post.tags ?? [],
					selectedTags,
					filters.tags?.operator,
				),
			);
		}

		const selectedFolderIds = getStringFilterValues(filters.folders?.value);

		if (selectedFolderIds.length > 0) {
			result = result.filter((post) =>
				matchesMultiOptionFilter(
					post.catalogIds ?? [],
					selectedFolderIds,
					filters.folders?.operator,
				),
			);
		}

		return result;
	}, [filterSourcePosts, filters, searchQuery]);

	const handleFilterChange = (
		groupId: string,
		value: FilterValue,
		operator?: ManagedFilterValue["operator"],
	) => {
		setFilters((previous) => ({
			...previous,
			[groupId]: {
				value,
				operator,
			},
		}));
	};

	const handleClearAll = () => {
		setFilters(INITIAL_FILTER_STATE);
		setSearchQuery("");
	};

	const hasSearchOrFilters =
		Boolean(searchQuery.trim()) ||
		Object.values(filters).some(
			(filter) => getStringFilterValues(filter.value).length > 0,
		);
	const emptyActions =
		!hasSearchOrFilters && filterSourcePosts.length === 0 && creationActions ? (
			<PortfolioEmptyActions
				onCreatePost={creationActions.onCreatePost}
				onCreateFolder={creationActions.onCreateFolder}
			/>
		) : undefined;
	const emptyDescription = emptyActions
		? t(
				"ui.empty_portfolio_owner_description",
				"Share your first artwork or organize your portfolio with a folder.",
			)
		: undefined;

	const handlePostClick = (post: PortfolioPostResponse) => {
		if (!post.id) return;

		if (folderId) {
			navigate({
				to: "/{-$locale}/user/$username/$tab/folder/$folderSlug/$postId",
				params: {
					locale,
					username: username ?? "",
					tab: "portfolio",
					folderSlug: folderId,
					postId: post.id,
				},
				state: {
					isModal: true,
				},
				resetScroll: false,
			});
		} else {
			navigate({
				to: "/{-$locale}/user/$username/$tab/$postId",
				params: {
					locale,
					username: username ?? "",
					tab: "portfolio",
					postId: post.id,
				},
				state: {
					isModal: true,
				},
				resetScroll: false,
			});
		}
	};

	if (folderId && currentFolder) {
		const folderActions = canManageCatalogs ? (
			<div className="flex shrink-0 items-center">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon-xl">
							<MoreHorizontal className="size-5" />
							<span className="sr-only">
								{t("ui.manage_folder", "Manage folder")}
							</span>
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => setRenameCatalogOpen(true)}>
							<Edit2 />
							{t("components.portfolio.folder.manage.rename", "Rename folder")}
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							variant="destructive"
							onClick={() => setDeleteCatalogOpen(true)}
						>
							<Trash2 />
							{t("components.portfolio.folder.manage.delete", "Delete folder")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<AddFolderPostsModal
					open={addPostsOpen}
					onOpenChange={setAddPostsOpen}
					folderId={currentFolder.id}
					posts={posts}
					onAddPost={(postId) =>
						addPostMutation.mutateAsync({ postId, catalogId: currentFolder.id })
					}
				/>
				<RenameCatalogModal
					open={renameCatalogOpen}
					onOpenChange={setRenameCatalogOpen}
					catalog={currentFolder}
					onRenameCatalog={handleRenameCatalog}
					isRenaming={updateCatalogMutation.isPending}
				/>

				<AlertDialog
					open={deleteCatalogOpen}
					onOpenChange={setDeleteCatalogOpen}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								{t(
									"components.portfolio.folder.delete.title",
									"Delete folder?",
								)}
							</AlertDialogTitle>

							<AlertDialogDescription>
								{t(
									"components.portfolio.folder.delete.description",
									"Are you sure you want to delete this folder? Posts inside it will not be deleted.",
								)}
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>
								{t("components.portfolio.folder.delete.cancel", "Cancel")}
							</AlertDialogCancel>

							<AlertDialogAction
								onClick={(event) => {
									event.preventDefault();
									void handleDeleteCatalog();
								}}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								{deleteCatalogMutation.isPending
									? t(
											"components.portfolio.folder.delete.deleting",
											"Deleting...",
										)
									: t("components.portfolio.folder.delete.confirm", "Delete")}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		) : undefined;

		return (
			<>
				<PortfolioFolderView
					folder={currentFolder}
					username={username ?? ""}
					locale={locale}
					postCount={currentFolderPosts.length}
					isOwner={canManageCatalogs}
					actions={folderActions}
					isFiltered={hasSearchOrFilters}
					onClearFilters={handleClearAll}
					onAddPosts={
						canManageCatalogs &&
						posts.some(
							(post) => post.id && !post.catalogIds?.includes(currentFolder.id),
						)
							? () => setAddPostsOpen(true)
							: undefined
					}
					toolbar={
						<FilterBar
							data={currentFolderPosts}
							groups={filterGroups}
							values={filters}
							onFilterChange={handleFilterChange}
							searchQuery={searchQuery}
							onSearchChange={setSearchQuery}
							onClearAll={handleClearAll}
							searchPlaceholder={t(
								"components.portfolio.folder.filters.search_placeholder",
								"Search this folder...",
							)}
						/>
					}
				>
					{filteredPosts.length > 0 ? (
						<ProfileFeed
							posts={filteredPosts}
							onPostClick={handlePostClick}
							variant="portfolio"
							isOwner={canManageCatalogs}
							onManagePost={managePost}
							onRemoveFromCatalog={
								canManageCatalogs ? handleRemovePostFromCatalog : undefined
							}
						/>
					) : undefined}
				</PortfolioFolderView>
				{managementDialog}
			</>
		);
	}

	const normalizedSearchQuery = searchQuery.trim().toLowerCase();

	const filteredFolders = folders.filter((folder) =>
		folder.name.toLowerCase().includes(normalizedSearchQuery),
	);

	const selectedTags = getStringFilterValues(filters.tags?.value);
	const selectedFolderIds = getStringFilterValues(filters.folders?.value);
	const hasActiveFilters =
		selectedTags.length > 0 || selectedFolderIds.length > 0;
	const showFolders = !hasActiveFilters && !folderId;

	return (
		<>
			<div className="flex min-h-0 flex-1 flex-col gap-6">
				<FilterBar
					className="px-4 lg:px-0 xl:px-4"
					data={posts}
					groups={filterGroups}
					values={filters}
					onFilterChange={handleFilterChange}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					onClearAll={handleClearAll}
					searchPlaceholder={t(
						"components.portfolio.filters.search_placeholder",
						"Search portfolio...",
					)}
				/>

				{showFolders && filteredFolders.length > 0 && (
					<section
						aria-label={t(
							"components.portfolio.folder.catalogs",
							"Portfolio folders",
						)}
						className="lg:px-0 xl:px-4"
					>
						<div className="relative flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-3 scroll-fade-x scroll-fade-4 px-3 pt-2 pb-3 lg:scroll-px-0 lg:px-0 xl:scroll-px-3 xl:px-3">
							{filteredFolders.map((folder) => {
								const catalogPosts = postsByCatalogId.get(folder.id) ?? [];
								const preview = getFolderPreview(folder, catalogPosts);

								return (
									<Link
										key={folder.id}
										to="/{-$locale}/user/$username/$tab/folder/$folderSlug"
										params={{
											locale,
											username: username ?? "",
											tab: "portfolio",
											folderSlug: folder.id,
										}}
										className="w-40 shrink-0 snap-start rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									>
										<FolderCard
											folder={folder}
											fallbackCoverSrc={preview.coverSrc}
											contentWarnings={preview.contentWarnings}
											itemCount={catalogPosts.length}
										/>
									</Link>
								);
							})}
						</div>
					</section>
				)}

				<ProfileFeed
					posts={filteredPosts}
					emptyActions={emptyActions}
					emptyDescription={emptyDescription}
					onPostClick={handlePostClick}
					variant="portfolio"
					isOwner={canManageCatalogs}
					onManagePost={managePost}
					className="lg:mx-0 xl:mx-4"
				/>
			</div>

			{canManageCatalogs && onCreateCatalog && (
				<CreateCatalogModal
					open={createCatalogOpen}
					onOpenChange={setCreateCatalogOpen}
					onCreateCatalog={onCreateCatalog}
					isCreating={isCreatingCatalog}
				/>
			)}

			{canCreatePosts && onCreatePost && (
				<CreatePostModal
					open={createPostOpen}
					onOpenChange={setCreatePostOpen}
					onCreatePost={onCreatePost}
					isCreating={isCreatingPost}
					catalogs={folders}
				/>
			)}
			{managementDialog}
		</>
	);
}

function RouteLocale() {
	return getLocaleParam(document.documentElement.lang);
}
