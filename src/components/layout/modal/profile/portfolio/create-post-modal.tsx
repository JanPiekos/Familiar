import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ImagePlus, X } from "lucide-react";
import {
	type FormEvent,
	type ReactNode,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getTags } from "@/api/commisions/index";
import type { CatalogResponse } from "@/api/portfolio/catalogs/catalog-types";
import type {
	CreatePortfolioPostRequest,
	PortfolioPostResponse,
} from "@/api/portfolio/posts/post-types";
import { OutlineClose, OutlinePlus } from "@/components/icons/icons";
import { CreationDialogLayout } from "@/components/layout/creation-dialog-layout";
import { CreationPageLayout } from "@/components/layout/creation-page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	InputGroup,
	InputGroupInput,
	InputGroupTextArea,
} from "@/components/ui/input-group";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useUploadPortfolioPostMedia } from "@/hooks/portfolio/use-portfolio";
import { cn } from "@/lib/utils";

function MultiSelectPopover({
	title,
	options,
	selected,
	onChange,
	placeholder,
	emptyText,
	chipClassName,
}: {
	title: string;
	options: { label: string; value: string }[];
	selected: string[];
	onChange: (values: string[]) => void;
	placeholder: string;
	emptyText: string;
	chipClassName?: string;
}) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	const toggleOption = (value: string) => {
		const newSelected = selected.includes(value)
			? selected.filter((v) => v !== value)
			: [...selected, value];
		onChange(newSelected);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					role="combobox"
					aria-label={title}
					aria-expanded={open}
					className="border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex min-h-12 w-full items-center justify-between gap-2 rounded-full border bg-transparent px-3 py-2 text-sm text-primary transition-[color] outline-none hover:bg-transparent focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
				>
					<div className="flex min-w-0 flex-wrap items-center gap-1.5">
						{selected.length > 0 ? (
							selected.map((val) => {
								const label =
									options.find((opt) => opt.value === val)?.label || val;
								return (
									<Badge
										key={val}
										variant="secondary"
										className={cn(chipClassName)}
										onClick={(e) => {
											e.stopPropagation();
											toggleOption(val);
										}}
									>
										{label}
										<OutlineClose className="size-3 hover:text-foreground/80 cursor-pointer" />
									</Badge>
								);
							})
						) : (
							<span className="text-muted-foreground">{placeholder}</span>
						)}
					</div>
					<ChevronDown className="size-4 shrink-0 opacity-50" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-(--radix-popover-trigger-width) p-0"
				align="start"
			>
				<Command>
					<CommandInput
						placeholder={t("ui.search_value0", {
							defaultValue: "Search {{value0}}...",
							value0: title.toLowerCase(),
						})}
					/>
					<CommandEmpty>{emptyText}</CommandEmpty>
					<CommandList>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = selected.includes(option.value);
								return (
									<CommandItem
										key={option.value}
										value={option.value}
										onSelect={() => toggleOption(option.value)}
										className="cursor-pointer flex items-center gap-2 group"
									>
										<Checkbox
											checked={isSelected}
											className={cn(
												"opacity-0 border-primary/12 transition-opacity",
												isSelected && "opacity-100",
												"group-hover:opacity-100",
											)}
										/>
										<span>{option.label}</span>
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

interface CreatePostModalProps {
	layout?: "dialog" | "page";
	onBusyChange?: (busy: boolean) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreatePost: (
		data: CreatePortfolioPostRequest,
	) => Promise<PortfolioPostResponse | void>;
	isCreating: boolean;
	catalogs: CatalogResponse[];
}

export function CreatePostModal({
	layout = "dialog",
	onBusyChange,
	open,
	onOpenChange,
	onCreatePost,
	isCreating,
	catalogs,
}: CreatePostModalProps) {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const titleDescriptionId = useId();
	const formId = useId();
	const submitLock = useRef(false);
	const previewUrls = useRef(new Set<string>());
	const fileInput = useRef<HTMLInputElement>(null);
	const isPage = layout === "page";
	const submitErrorId = useId();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [selectedContentWarnings, setSelectedContentWarnings] = useState<
		string[]
	>([]);
	const [selectedCatalogs, setSelectedCatalogs] = useState<string[]>([]);

	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

	const [submitted, setSubmitted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const isBusy = isCreating || isSubmitting;
	useEffect(() => {
		onBusyChange?.(isBusy);
		return () => onBusyChange?.(false);
	}, [isBusy, onBusyChange]);
	const handleOpenChange = (nextOpen: boolean) => {
		if (!isBusy) onOpenChange(nextOpen);
	};
	const trimmedTitle = title.trim();
	const titleInvalid = submitted && trimmedTitle.length === 0;

	// Fetch tags from API
	const { data: allTags = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: () => getTags(true),
	});

	const availableTags = allTags.filter((tag) => !tag.hasContentWarning);
	const availableCWs = allTags.filter((tag) => tag.hasContentWarning);

	useEffect(() => {
		if (!open) {
			for (const url of previewUrls.current) URL.revokeObjectURL(url);
			previewUrls.current.clear();
			setTitle("");
			setDescription("");
			setVisibility("PUBLIC");
			setSelectedTags([]);
			setSelectedContentWarnings([]);
			setSelectedCatalogs([]);
			setImageFiles([]);
			setImagePreviewUrls([]);
			setSubmitted(false);
			setSubmitError(null);
		}
	}, [open]);

	useEffect(
		() => () => {
			for (const url of previewUrls.current) URL.revokeObjectURL(url);
			previewUrls.current.clear();
		},
		[],
	);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (isBusy) return;
		if (e.target.files && e.target.files.length > 0) {
			const newFiles = Array.from(e.target.files);
			const newUrls = newFiles.map((file) => {
				const url = URL.createObjectURL(file);
				previewUrls.current.add(url);
				return url;
			});
			setImageFiles((prev) => [...prev, ...newFiles]);
			setImagePreviewUrls((prev) => [...prev, ...newUrls]);
			e.target.value = "";
		}
	};

	const removeImage = (indexToRemove: number) => {
		if (isBusy) return;
		setImageFiles((prev) => {
			const updated = [...prev];
			updated.splice(indexToRemove, 1);
			return updated;
		});
		setImagePreviewUrls((prev) => {
			const updated = [...prev];
			URL.revokeObjectURL(updated[indexToRemove]);
			previewUrls.current.delete(updated[indexToRemove]);
			updated.splice(indexToRemove, 1);
			return updated;
		});
	};

	const uploadMediaMutation = useUploadPortfolioPostMedia();

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isBusy || submitLock.current) return;
		setSubmitted(true);
		setSubmitError(null);

		if (!trimmedTitle) {
			return;
		}

		submitLock.current = true;
		setIsSubmitting(true);
		try {
			const createdPost = await onCreatePost({
				title: trimmedTitle,
				description: description.trim() || undefined,
				visibility,
				tagIds: Array.from(
					new Set([...selectedTags, ...selectedContentWarnings]),
				),
				catalogIds: selectedCatalogs,
			});

			const postId = createdPost?.id;

			if (postId && imageFiles.length > 0) {
				// Upload all selected images
				await Promise.all(
					imageFiles.map((file) =>
						uploadMediaMutation.mutateAsync({ postId, file }),
					),
				);

				// Invalidate portfolio so the newly uploaded images appear in the grid
				await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
				await queryClient.invalidateQueries({ queryKey: ["profile-content"] });
			}

			toast.success(
				t(
					"components.portfolio.post.create.success",
					"Post created successfully!",
				),
			);
			onOpenChange(false);
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: t(
							"components.portfolio.post.create.error",
							"Failed to create post.",
						),
			);
			toast.error(
				t("components.portfolio.post.create.error", "Failed to create post."),
			);
		} finally {
			submitLock.current = false;
			setIsSubmitting(false);
		}
	}

	const mediaContent = (
		<section
			className={cn(
				"flex min-h-0 flex-col gap-4",
				isPage ? "p-4" : "p-5 sm:p-6 md:h-full",
			)}
		>
			<div className="flex shrink-0 items-center justify-between gap-3">
				<div className="min-w-0">
					<h2 className="text-sm font-semibold">
						{t("components.portfolio.post.create.media.title", "Images")}
					</h2>
					{imageFiles.length > 0 && (
						<p
							className="mt-1 text-xs text-muted-foreground"
							aria-live="polite"
						>
							{t("components.portfolio.post.create.media.selected", {
								count: imageFiles.length,
							})}
						</p>
					)}
				</div>
				<Button
					type="button"
					variant="secondary"
					size="xl"
					disabled={isBusy}
					onClick={() => fileInput.current?.click()}
				>
					<OutlinePlus aria-hidden="true" />
					{t("components.portfolio.post.create.media.upload", "Add images")}
				</Button>
				<input
					ref={fileInput}
					type="file"
					disabled={isBusy}
					className="hidden"
					tabIndex={-1}
					aria-label={t(
						"components.portfolio.post.create.media.upload",
						"Add images",
					)}
					accept="image/*"
					multiple
					onChange={handleImageChange}
				/>
			</div>
			<div className={cn("min-h-0", !isPage && "flex-1")}>
				<EditorScrollArea
					page={isPage}
					className={cn("flex flex-col", !isPage && "size-full")}
				>
					{imagePreviewUrls.length === 0 ? (
						<button
							type="button"
							disabled={isBusy}
							onClick={() => fileInput.current?.click()}
							className={cn(
								"flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-muted-foreground/30 bg-background px-6 py-10 text-center transition-colors hover:bg-secondary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50",
								!isPage && "flex-1",
							)}
						>
							<span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
								<ImagePlus aria-hidden="true" className="size-6" />
							</span>
							<span className="text-sm font-medium">
								{t(
									"components.portfolio.post.create.media.choose",
									"Choose images",
								)}
							</span>
							<span className="max-w-64 text-sm leading-relaxed text-muted-foreground">
								{t(
									"components.portfolio.post.create.media.hint",
									"Select one or more images to include in your post.",
								)}
							</span>
						</button>
					) : (
						<div
							className={cn(
								"grid w-full shrink-0 gap-3",
								imagePreviewUrls.length === 1
									? "grid-cols-1"
									: "grid-cols-2 xl:grid-cols-3",
							)}
						>
							{imagePreviewUrls.map((url, idx) => (
								<div
									key={url}
									className="min-w-0 rounded-2xl border bg-background p-2"
								>
									<div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
										<img
											src={url}
											alt={t("ui.preview_value0", {
												defaultValue: "Preview {{value0}}",
												value0: idx + 1,
											})}
											className="size-full object-contain"
										/>
										<span
											aria-hidden="true"
											className="absolute top-2 left-2 flex size-6 items-center justify-center rounded-full bg-black/60 text-xs font-medium text-white"
										>
											{idx + 1}
										</span>
									</div>
									<div className="mt-1 flex min-w-0 items-center gap-1">
										<p
											className="min-w-0 flex-1 truncate pl-1 text-xs text-muted-foreground"
											title={imageFiles[idx]?.name}
										>
											{imageFiles[idx]?.name}
										</p>
										<Button
											type="button"
											variant="ghost"
											size="icon-xl"
											disabled={isBusy}
											onClick={() => removeImage(idx)}
											aria-label={t(
												"components.portfolio.post.create.media.remove",
												"Remove image",
											)}
											className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
										>
											<X aria-hidden="true" className="size-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</EditorScrollArea>
			</div>
		</section>
	);
	const detailsContent = (
		<form
			id={formId}
			aria-busy={isBusy}
			className={cn("flex min-h-0 flex-col", !isPage && "h-full")}
			onSubmit={handleSubmit}
		>
			<fieldset disabled={isBusy} className="contents">
				<div className="min-h-0 flex-1">
					<EditorScrollArea
						page={isPage}
						className={isPage ? "p-4" : "h-full p-5 sm:p-6"}
					>
						<div className="flex flex-col gap-6">
							<FieldGroup>
								<Field data-invalid={titleInvalid || undefined}>
									<FieldLabel htmlFor="post-title">
										{t(
											"components.portfolio.post.create.fields.title",
											"TITLE *",
										)}
									</FieldLabel>

									<InputGroup
										className="h-12"
										data-invalid={titleInvalid || undefined}
									>
										<InputGroupInput
											id="post-title"
											value={title}
											maxLength={100}
											required
											aria-invalid={titleInvalid || undefined}
											aria-describedby={titleDescriptionId}
											placeholder={t(
												"components.portfolio.post.create.placeholders.title",
												"e.g. Character portrait",
											)}
											onChange={(event) => setTitle(event.target.value)}
										/>
									</InputGroup>

									<FieldDescription id={titleDescriptionId}>
										{titleInvalid
											? t(
													"components.portfolio.post.create.errors.title_required",
													"Title is required.",
												)
											: t(
													"components.portfolio.post.create.hints.title_length",
													"Maximum 100 characters.",
												)}
									</FieldDescription>
								</Field>

								<Field>
									<FieldLabel htmlFor="post-description">
										{t(
											"components.portfolio.post.create.fields.description",
											"DESCRIPTION",
										)}
									</FieldLabel>

									<InputGroup className="rounded-xl">
										<InputGroupTextArea
											className="min-h-28 resize-y"
											id="post-description"
											value={description}
											rows={5}
											placeholder={t(
												"components.portfolio.post.create.placeholders.description",
												"Optional description...",
											)}
											onChange={(event) => setDescription(event.target.value)}
										/>
									</InputGroup>
								</Field>

								<Field>
									<FieldLabel htmlFor="post-visibility">
										{t(
											"components.portfolio.post.create.fields.visibility",
											"VISIBILITY",
										)}
									</FieldLabel>
									<Select
										value={visibility}
										onValueChange={(value: "PUBLIC" | "PRIVATE") =>
											setVisibility(value)
										}
									>
										<SelectTrigger
											id="post-visibility"
											size="xl"
											className="w-full"
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="PUBLIC">
												{t(
													"components.portfolio.post.create.visibility.public",
													"Public",
												)}
											</SelectItem>
											<SelectItem value="PRIVATE">
												{t(
													"components.portfolio.post.create.visibility.private",
													"Private",
												)}
											</SelectItem>
										</SelectContent>
									</Select>
								</Field>

								<Field>
									<FieldLabel>
										{t(
											"components.portfolio.post.create.fields.categories",
											"CATEGORIES (TAGS)",
										)}
									</FieldLabel>
									<MultiSelectPopover
										title={t("ui.tags", "Tags")}
										options={availableTags.map((c) => ({
											label: c.name,
											value: c.id,
										}))}
										selected={selectedTags}
										onChange={setSelectedTags}
										placeholder={t(
											"components.portfolio.post.create.placeholders.tags",
											"Select tags...",
										)}
										emptyText={t(
											"components.portfolio.post.create.no_tags",
											"No tags found.",
										)}
									/>
									<FieldDescription>
										{t(
											"components.portfolio.post.create.hints.categories",
											"Select from available categories.",
										)}
									</FieldDescription>
								</Field>

								<Field>
									<FieldLabel>
										{t(
											"components.portfolio.post.create.fields.cws",
											"CONTENT WARNINGS",
										)}
									</FieldLabel>
									<MultiSelectPopover
										title={t("ui.warnings", "Warnings")}
										options={availableCWs.map((cw) => ({
											label: cw.name,
											value: cw.id,
										}))}
										selected={selectedContentWarnings}
										onChange={setSelectedContentWarnings}
										placeholder={t("ui.select_warnings", "Select warnings...")}
										emptyText={t("ui.no_warnings_found", "No warnings found.")}
										chipClassName="bg-destructive/10 text-destructive hover:bg-destructive/20"
									/>
									<FieldDescription>
										{t(
											"components.portfolio.post.create.hints.cws",
											"Select applicable content warnings.",
										)}
									</FieldDescription>
								</Field>

								<Field>
									<FieldLabel>
										{t(
											"components.portfolio.post.create.fields.catalogs",
											"ADD TO CATALOGS",
										)}
									</FieldLabel>
									<MultiSelectPopover
										title={t("ui.catalogs", "Folders")}
										options={catalogs.map((c) => ({
											label: c.name,
											value: c.id,
										}))}
										selected={selectedCatalogs}
										onChange={setSelectedCatalogs}
										placeholder={t("ui.select_catalogs", "Select folders...")}
										emptyText={t("ui.no_folders_found", "No folders found.")}
									/>
								</Field>
							</FieldGroup>

							{submitError && (
								<p
									id={submitErrorId}
									role="alert"
									className="text-sm text-destructive"
								>
									{submitError}
								</p>
							)}
						</div>
					</EditorScrollArea>
				</div>
			</fieldset>
		</form>
	);
	const footerContent = (
		<div className="flex items-center justify-end gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
			<Button
				type="button"
				size={"xl"}
				variant="outline"
				disabled={isBusy}
				onClick={() => handleOpenChange(false)}
			>
				{t("components.portfolio.post.create.actions.cancel", "Cancel")}
			</Button>

			<Button
				type="submit"
				form={formId}
				size={"xl"}
				disabled={isBusy || !trimmedTitle}
				aria-describedby={submitError ? submitErrorId : undefined}
			>
				{isSubmitting ? (
					<Spinner data-icon="inline-start" />
				) : (
					<span aria-hidden="true" data-icon="inline-start">
						<OutlinePlus data-icon="inline-start" aria-hidden="true" />
					</span>
				)}

				{isSubmitting
					? t(
							"components.portfolio.post.create.actions.creating",
							"Creating...",
						)
					: t("components.portfolio.post.create.actions.create", "Create")}
			</Button>
		</div>
	);
	const editorTitle = t(
		"components.portfolio.post.create.title",
		"Create post",
	);
	const editorDescription = t("components.portfolio.post.create.description");
	if (isPage)
		return open ? (
			<CreationPageLayout
				title={editorTitle}
				description={editorDescription}
				onBack={() => handleOpenChange(false)}
				isBusy={isBusy}
				footer={footerContent}
			>
				{mediaContent}
				{detailsContent}
			</CreationPageLayout>
		) : null;

	return (
		<CreationDialogLayout
			open={open}
			onOpenChange={handleOpenChange}
			title={editorTitle}
			description={editorDescription}
			isBusy={isBusy}
			className="h-[min(52rem,calc(100dvh-2rem))] max-w-6xl sm:max-w-6xl"
			bodyClassName="grid flex-1 md:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] md:overflow-hidden"
			footer={footerContent}
		>
			<div className="min-h-0 border-b bg-surface-1 md:border-r md:border-b-0">
				{mediaContent}
			</div>
			<div className="min-h-0">{detailsContent}</div>
		</CreationDialogLayout>
	);
}

function EditorScrollArea({
	page,
	className,
	children,
}: {
	page: boolean;
	className: string;
	children: ReactNode;
}) {
	return (
		<div
			className={cn(!page && "overflow-y-auto overscroll-contain", className)}
		>
			{children}
		</div>
	);
}
