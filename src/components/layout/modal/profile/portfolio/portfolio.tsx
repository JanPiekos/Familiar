import {
	type FormEvent,
	type ReactNode,
	useEffect,
	useId,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import type {
	CatalogResponse,
	CreateCatalogRequest,
	UpdateCatalogRequest,
} from "@/api/portfolio/catalogs/catalog-types";
import { OutlineFolder, OutlineFolderAddOuLc } from "@/components/icons/icons";
import { CreationDialogLayout } from "@/components/layout/creation-dialog-layout";
import { CreationPageLayout } from "@/components/layout/creation-page-layout";
import { FolderCard } from "@/components/layout/profile/feed/folder-card";
import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";

interface CreateCatalogModalProps {
	layout?: "dialog" | "page";
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateCatalog: (data: CreateCatalogRequest) => Promise<CatalogResponse>;
	isCreating: boolean;
}

export function CreateCatalogModal({
	layout = "dialog",
	open,
	onOpenChange,
	onCreateCatalog,
	isCreating,
}: CreateCatalogModalProps) {
	const { t } = useTranslation();
	const formId = useId();
	const nameInputId = useId();
	const descriptionInputId = useId();
	const nameDescriptionId = useId();
	const submitErrorId = useId();

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const trimmedName = name.trim();

	const nameInvalid = submitted && trimmedName.length === 0;

	useEffect(() => {
		if (!open) {
			setName("");
			setDescription("");
			setSubmitted(false);
			setSubmitError(null);
		}
	}, [open]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isCreating) {
			return;
		}

		setSubmitted(true);
		setSubmitError(null);

		if (!trimmedName) {
			return;
		}

		try {
			await onCreateCatalog({
				name: trimmedName,
				description: description.trim() || undefined,
			});

			onOpenChange(false);
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: t("ui.folder_create_failed", "The folder could not be created."),
			);
		}
	}

	return (
		<CatalogModalLayout
			layout={layout}
			open={open}
			onOpenChange={onOpenChange}
			title={t("ui.create_folder", "Create folder")}
			isBusy={isCreating}
			mediaContent={<CatalogPreview name={name} description={description} />}
			description={t(
				"ui.group_related_portfolio_posts_into_one_catalog",
				"Group related portfolio posts into one catalog.",
			)}
			detailsContent={
				<form
					id={formId}
					className="flex min-w-0 flex-col gap-6 p-5 sm:p-6"
					onSubmit={handleSubmit}
				>
					<FieldGroup>
						<Field data-invalid={nameInvalid || undefined}>
							<FieldLabel htmlFor={nameInputId}>
								{t("ui.folder_name", "Folder name *")}
							</FieldLabel>

							<InputGroup
								className="h-12"
								data-invalid={nameInvalid || undefined}
							>
								<InputGroupInput
									id={nameInputId}
									value={name}
									maxLength={100}
									required
									disabled={isCreating}
									aria-invalid={nameInvalid || undefined}
									aria-describedby={nameDescriptionId}
									placeholder={t(
										"ui.character_illustrations",
										"Character illustrations",
									)}
									onChange={(event) => setName(event.target.value)}
								/>
							</InputGroup>

							<FieldDescription id={nameDescriptionId}>
								{nameInvalid
									? t("ui.folder_name_is_required", "Folder name is required.")
									: t("ui.maximum_100_characters", "Maximum 100 characters.")}
							</FieldDescription>
						</Field>

						<Field>
							<FieldLabel htmlFor={descriptionInputId}>
								{t("ui.description", "Description")}
							</FieldLabel>

							<InputGroup className="rounded-xl">
								<InputGroupTextArea
									className="min-h-28 resize-y"
									id={descriptionInputId}
									value={description}
									rows={4}
									disabled={isCreating}
									placeholder={t(
										"ui.a_selected_collection_of_finished_character_artwork",
										"A selected collection of finished character artwork.",
									)}
									onChange={(event) => setDescription(event.target.value)}
								/>
							</InputGroup>

							<FieldDescription>
								{t(
									"ui.optional_you_can_edit_this_later",
									"Optional. You can edit this later.",
								)}
							</FieldDescription>
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
				</form>
			}
			detailsFooterContent={
				<div className="flex items-center justify-end gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
					<Button
						size="xl"
						type="button"
						variant="outline"
						disabled={isCreating}
						onClick={() => onOpenChange(false)}
					>
						{t("ui.cancel", "Cancel")}
					</Button>

					<Button
						size="xl"
						type="submit"
						form={formId}
						disabled={isCreating || !trimmedName}
						aria-describedby={submitError ? submitErrorId : undefined}
					>
						{isCreating ? (
							<Spinner data-icon="inline-start" />
						) : (
							<span aria-hidden="true" data-icon="inline-start">
								<OutlineFolderAddOuLc
									data-icon="inline-start"
									aria-hidden="true"
								/>
							</span>
						)}

						{isCreating
							? t("ui.creating", "Creating...")
							: t("ui.create_folder", "Create folder")}
					</Button>
				</div>
			}
		/>
	);
}

interface RenameCatalogModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	catalog: CatalogResponse;
	onRenameCatalog: (
		catalogId: string,
		data: UpdateCatalogRequest,
	) => Promise<CatalogResponse>;
	isRenaming: boolean;
}

export function RenameCatalogModal({
	open,
	onOpenChange,
	catalog,
	onRenameCatalog,
	isRenaming,
}: RenameCatalogModalProps) {
	const { t } = useTranslation();
	const formId = useId();
	const nameInputId = useId();
	const descriptionInputId = useId();
	const nameDescriptionId = useId();
	const submitErrorId = useId();

	const [name, setName] = useState(catalog.name);

	const [description, setDescription] = useState(catalog.description || "");

	const [submitted, setSubmitted] = useState(false);

	const [submitError, setSubmitError] = useState<string | null>(null);

	const trimmedName = name.trim();

	const nameInvalid = submitted && trimmedName.length === 0;

	// biome-ignore lint/correctness/useExhaustiveDependencies: Switching folders must reset the draft even when their saved text matches.
	useEffect(() => {
		if (!open) {
			return;
		}

		setName(catalog.name);
		setDescription(catalog.description || "");
		setSubmitted(false);
		setSubmitError(null);
	}, [open, catalog.id, catalog.name, catalog.description]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isRenaming) {
			return;
		}

		setSubmitted(true);
		setSubmitError(null);

		if (!trimmedName) {
			return;
		}

		try {
			await onRenameCatalog(catalog.id, {
				name: trimmedName,

				/*
				 * Keep an empty string so an existing description can
				 * be removed by the user.
				 */
				description: description.trim(),
			});

			onOpenChange(false);
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: t("ui.folder_rename_failed", "The folder could not be renamed."),
			);
		}
	}

	return (
		<CatalogModalLayout
			open={open}
			onOpenChange={onOpenChange}
			title={t("ui.rename_folder", "Rename folder")}
			isBusy={isRenaming}
			mediaContent={<CatalogPreview name={name} description={description} />}
			description={t(
				"ui.update_the_name_and_description_of_this_portfolio_catalog",
				"Update the name and description of this portfolio catalog.",
			)}
			detailsContent={
				<form
					id={formId}
					className="flex min-w-0 flex-col gap-6 p-5 sm:p-6"
					onSubmit={handleSubmit}
				>
					<FieldGroup>
						<Field data-invalid={nameInvalid || undefined}>
							<FieldLabel htmlFor={nameInputId}>
								{t("ui.folder_name_898add", "Folder name")}
							</FieldLabel>

							<InputGroup
								className="h-12"
								data-invalid={nameInvalid || undefined}
							>
								<InputGroupInput
									id={nameInputId}
									value={name}
									maxLength={100}
									required
									disabled={isRenaming}
									aria-invalid={nameInvalid || undefined}
									aria-describedby={nameDescriptionId}
									placeholder={t(
										"ui.character_illustrations",
										"Character illustrations",
									)}
									onChange={(event) => setName(event.target.value)}
								/>
							</InputGroup>

							<FieldDescription id={nameDescriptionId}>
								{nameInvalid
									? t("ui.folder_name_is_required", "Folder name is required.")
									: t("ui.maximum_100_characters", "Maximum 100 characters.")}
							</FieldDescription>
						</Field>

						<Field>
							<FieldLabel htmlFor={descriptionInputId}>
								{t("ui.description", "Description")}
							</FieldLabel>

							<InputGroup className="rounded-xl">
								<InputGroupTextArea
									className="min-h-28 resize-y"
									id={descriptionInputId}
									value={description}
									rows={4}
									disabled={isRenaming}
									placeholder={t(
										"ui.a_selected_collection_of_finished_character_artwork",
										"A selected collection of finished character artwork.",
									)}
									onChange={(event) => setDescription(event.target.value)}
								/>
							</InputGroup>

							<FieldDescription>
								{t(
									"ui.optional_leave_this_empty_to_remove_the_current_description",
									"Optional. Leave this empty to remove the current description.",
								)}
							</FieldDescription>
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
				</form>
			}
			detailsFooterContent={
				<div className="flex items-center justify-end gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
					<Button
						size="xl"
						type="button"
						variant="outline"
						disabled={isRenaming}
						onClick={() => onOpenChange(false)}
					>
						{t("ui.cancel", "Cancel")}
					</Button>

					<Button
						size="xl"
						type="submit"
						form={formId}
						disabled={isRenaming || !trimmedName}
						aria-describedby={submitError ? submitErrorId : undefined}
					>
						{isRenaming ? (
							<Spinner data-icon="inline-start" />
						) : (
							<span aria-hidden="true" data-icon="inline-start">
								<OutlineFolder data-icon="inline-start" aria-hidden="true" />
							</span>
						)}

						{isRenaming
							? t("ui.renaming", "Renaming...")
							: t("ui.save_changes", "Save changes")}
					</Button>
				</div>
			}
		/>
	);
}

interface CatalogPreviewProps {
	name: string;
	description: string;
}

function CatalogPreview({ name, description }: CatalogPreviewProps) {
	const { t } = useTranslation();
	return (
		<div className="mx-auto w-full max-w-40 sm:max-w-52">
			<p className="mb-4 text-xs font-medium tracking-wide text-muted-foreground">
				{t("ui.folder_preview", "Preview")}
			</p>
			<FolderCard
				folder={{
					id: "folder-preview",
					name:
						name.trim() || t("ui.new_portfolio_folder", "New portfolio folder"),
					description: description.trim() || undefined,
				}}
				contentWarnings={[]}
			/>
		</div>
	);
}

interface CatalogModalLayoutProps {
	layout?: "dialog" | "page";
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	isBusy: boolean;
	mediaContent: ReactNode;
	detailsContent: ReactNode;
	detailsFooterContent: ReactNode;
}

function CatalogModalLayout({
	layout = "dialog",
	open,
	onOpenChange,
	title,
	description,
	isBusy,
	mediaContent,
	detailsContent,
	detailsFooterContent,
}: CatalogModalLayoutProps) {
	const handleOpenChange = (nextOpen: boolean) => {
		if (!isBusy) onOpenChange(nextOpen);
	};
	if (layout === "page") {
		return open ? (
			<CreationPageLayout
				title={title}
				description={description}
				onBack={() => handleOpenChange(false)}
				isBusy={isBusy}
				footer={detailsFooterContent}
			>
				{detailsContent}
				<aside className="border-t bg-surface-1 px-4 py-5">
					{mediaContent}
				</aside>
			</CreationPageLayout>
		) : null;
	}
	return (
		<CreationDialogLayout
			open={open}
			onOpenChange={handleOpenChange}
			title={title}
			description={description}
			isBusy={isBusy}
			footer={detailsFooterContent}
			bodyClassName="sm:grid sm:grid-cols-[16rem_minmax(0,1fr)]"
		>
			<div className="border-b bg-surface-1 px-6 py-5 sm:flex sm:items-center sm:border-r sm:border-b-0 sm:p-6">
				{mediaContent}
			</div>
			{detailsContent}
		</CreationDialogLayout>
	);
}
