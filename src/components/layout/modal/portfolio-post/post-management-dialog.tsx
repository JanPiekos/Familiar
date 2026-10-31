import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { CatalogResponse } from "@/api/portfolio/catalogs/catalog-types";
import type {
	PortfolioPostResponse,
	PortfolioVisibility,
	UpdatePortfolioPostRequest,
} from "@/api/portfolio/posts/post-types";
import { CreationDialogLayout } from "@/components/layout/creation-dialog-layout";
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
	InputGroup,
	InputGroupInput,
	InputGroupTextArea,
} from "@/components/ui/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useAddPortfolioPostToCatalog,
	useDeletePortfolioPost,
	useRemovePortfolioPostFromCatalog,
	useUpdatePortfolioPost,
} from "@/hooks/portfolio/use-portfolio";

export type PostManagementAction = "edit" | "move" | "delete";

export function PostManagementDialog({
	post,
	action,
	folders,
	onClose,
}: {
	post: PortfolioPostResponse;
	action: PostManagementAction;
	folders: CatalogResponse[];
	onClose: () => void;
}) {
	const { t } = useTranslation();
	const id = useId();
	const [title, setTitle] = useState(post.title ?? "");
	const [description, setDescription] = useState(post.description ?? "");
	const [visibility, setVisibility] = useState<PortfolioVisibility>(
		post.visibility ?? "PUBLIC",
	);
	const [destination, setDestination] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const lock = useRef(false);
	// Remember completed membership requests so retrying a partial move is safe.
	const memberships = useRef(new Set(post.catalogIds ?? []));
	const update = useUpdatePortfolioPost();
	const remove = useDeletePortfolioPost();
	const addToFolder = useAddPortfolioPostToCatalog();
	const removeFromFolder = useRemovePortfolioPostFromCatalog();
	const changed =
		action === "edit"
			? title.trim() !== (post.title ?? "").trim() ||
				description !== (post.description ?? "") ||
				visibility !== (post.visibility ?? "PUBLIC")
			: Boolean(destination) &&
				(!memberships.current.has(destination) ||
					memberships.current.size !== 1);
	const close = () => {
		if (!lock.current) onClose();
	};
	const save = async () => {
		if (
			lock.current ||
			!post.id ||
			(action !== "delete" && !changed) ||
			(action === "edit" && !title.trim())
		)
			return;
		lock.current = true;
		setBusy(true);
		setError("");
		try {
			if (action === "delete") await remove.mutateAsync(post.id);
			else if (action === "edit") {
				const data: UpdatePortfolioPostRequest = {};
				if (title.trim() !== (post.title ?? "").trim())
					data.title = title.trim();
				if (description !== (post.description ?? ""))
					data.description = description;
				if (visibility !== (post.visibility ?? "PUBLIC"))
					data.visibility = visibility;
				await update.mutateAsync({
					postId: post.id,
					data,
				});
			} else {
				// Keep the post in at least one folder if a later removal fails.
				if (!memberships.current.has(destination)) {
					await addToFolder.mutateAsync({
						postId: post.id,
						catalogId: destination,
					});
					memberships.current.add(destination);
				}
				for (const catalogId of [...memberships.current]) {
					if (catalogId === destination) continue;
					await removeFromFolder.mutateAsync({ postId: post.id, catalogId });
					memberships.current.delete(catalogId);
				}
			}
			toast.success(
				t(
					action === "delete"
						? "components.portfolio.post.delete.success"
						: `components.portfolio.post.manage.${action}_success`,
				),
			);
			onClose();
		} catch {
			setError(
				t(
					action === "delete"
						? "components.portfolio.post.delete.error"
						: action === "move" && memberships.current.has(destination)
							? "components.portfolio.post.manage.move_partial"
							: "components.portfolio.post.manage.save_error",
				),
			);
		} finally {
			lock.current = false;
			setBusy(false);
		}
	};
	const errorMessage = error ? (
		<p role="alert" className="text-sm text-destructive">
			{error}
		</p>
	) : null;
	if (action === "delete")
		return (
			<AlertDialog
				open
				onOpenChange={(open) => {
					if (!open) close();
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("components.portfolio.post.delete.title")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("components.portfolio.post.delete.description")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					{errorMessage}
					<AlertDialogFooter>
						<AlertDialogCancel disabled={busy}>
							{t("ui.cancel")}
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={busy || !post.id}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={(event) => {
								event.preventDefault();
								void save();
							}}
						>
							{t(
								busy
									? "components.portfolio.post.delete.deleting"
									: "components.portfolio.post.delete.confirm",
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	return (
		<CreationDialogLayout
			open
			onOpenChange={(open) => {
				if (!open) close();
			}}
			title={t(`components.portfolio.post.manage.${action}`)}
			description={t(`components.portfolio.post.manage.${action}_description`)}
			isBusy={busy}
			className="max-w-lg sm:max-w-lg"
			footer={
				<div className="flex justify-end gap-2 p-4 sm:px-6">
					<Button size="2xl" variant="outline" disabled={busy} onClick={close}>
						{t("ui.cancel")}
					</Button>
					<Button
						size="2xl"
						type="submit"
						form={id}
						disabled={
							busy ||
							!changed ||
							!post.id ||
							(action === "edit" && !title.trim())
						}
					>
						{t(
							busy
								? "ui.saving"
								: action === "move"
									? "components.portfolio.post.manage.move"
									: "ui.save_changes",
						)}
					</Button>
				</div>
			}
		>
			<form
				id={id}
				className="space-y-5 p-5 sm:p-6"
				onSubmit={(event) => {
					event.preventDefault();
					void save();
				}}
			>
				<fieldset disabled={busy} className="space-y-5">
					<legend className="sr-only">
						{t(`components.portfolio.post.manage.${action}`)}
					</legend>
					{action === "edit" ? (
						<>
							<div className="space-y-2">
								<label htmlFor={`${id}-title`} className="text-sm font-medium">
									{t("components.portfolio.post.create.fields.title")}
								</label>
								<InputGroup>
									<InputGroupInput
										id={`${id}-title`}
										value={title}
										maxLength={100}
										required
										onChange={(event) => setTitle(event.target.value)}
									/>
								</InputGroup>
							</div>
							<div className="space-y-2">
								<label
									htmlFor={`${id}-description`}
									className="text-sm font-medium"
								>
									{t("components.portfolio.post.create.fields.description")}
								</label>
								<InputGroup className="rounded-2xl">
									<InputGroupTextArea
										id={`${id}-description`}
										value={description}
										className="min-h-28"
										onChange={(event) => setDescription(event.target.value)}
									/>
								</InputGroup>
							</div>
							<div className="space-y-2">
								<label
									htmlFor={`${id}-visibility`}
									className="text-sm font-medium"
								>
									{t("components.portfolio.post.create.fields.visibility")}
								</label>
								<Select
									value={visibility}
									onValueChange={(value) =>
										setVisibility(value as PortfolioVisibility)
									}
								>
									<SelectTrigger id={`${id}-visibility`} className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{(["PUBLIC", "PRIVATE"] as const).map((value) => (
											<SelectItem key={value} value={value}>
												{t(
													`components.portfolio.post.create.visibility.${value.toLowerCase()}`,
												)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</>
					) : folders.length ? (
						<div className="space-y-2">
							<label htmlFor={`${id}-folder`} className="text-sm font-medium">
								{t("components.portfolio.post.manage.destination")}
							</label>
							<Select value={destination} onValueChange={setDestination}>
								<SelectTrigger id={`${id}-folder`} className="w-full">
									<SelectValue
										placeholder={t(
											"components.portfolio.post.manage.choose_folder",
										)}
									/>
								</SelectTrigger>
								<SelectContent>
									{folders.map((folder) => (
										<SelectItem key={folder.id} value={folder.id}>
											{folder.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							{t("components.portfolio.post.manage.no_folders")}
						</p>
					)}
				</fieldset>
				{errorMessage}
			</form>
		</CreationDialogLayout>
	);
}
