import { Image, Search, ShieldAlert } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PortfolioPostResponse } from "@/api/portfolio/posts/post-types";
import { CreationDialogLayout } from "@/components/layout/creation-dialog-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

export function AddFolderPostsModal({
	open,
	onOpenChange,
	folderId,
	posts,
	onAddPost,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	folderId: string;
	posts: PortfolioPostResponse[];
	onAddPost: (postId: string) => Promise<unknown>;
}) {
	const { t } = useTranslation();
	const id = useId();
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<string[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(false);
	// biome-ignore lint/correctness/useExhaustiveDependencies: Switching folders must reset the selection even when the picker stays open.
	useEffect(() => {
		if (open) {
			setQuery("");
			setSelected([]);
			setError(false);
		}
	}, [open, folderId]);
	const available = posts.filter(
		(post): post is PortfolioPostResponse & { id: string } =>
			Boolean(post.id) && !post.catalogIds?.includes(folderId),
	);
	const normalizedQuery = query.trim().toLocaleLowerCase();
	const matches = available.filter(
		(post) =>
			!normalizedQuery ||
			[post.title, post.description, ...(post.tags ?? [])].some((value) =>
				value?.toLocaleLowerCase().includes(normalizedQuery),
			),
	);
	const submit = async () => {
		if (isSaving || !selected.length) return;
		setIsSaving(true);
		setError(false);
		try {
			for (const postId of selected) {
				await onAddPost(postId);
				setSelected((current) => current.filter((value) => value !== postId));
			}
			onOpenChange(false);
		} catch {
			setError(true);
		} finally {
			setIsSaving(false);
		}
	};
	return (
		<CreationDialogLayout
			open={open}
			onOpenChange={onOpenChange}
			title={t("components.portfolio.folder.add.title")}
			description={t("components.portfolio.folder.add.description")}
			isBusy={isSaving}
			className="max-w-xl sm:max-w-xl"
			footer={
				<div className="flex items-center justify-end gap-2 p-4 sm:px-6">
					<Button
						size="xl"
						variant="outline"
						disabled={isSaving}
						onClick={() => onOpenChange(false)}
					>
						{t("ui.cancel")}
					</Button>
					<Button
						size="xl"
						disabled={isSaving || !selected.length}
						onClick={() => void submit()}
					>
						{isSaving ? <Spinner aria-hidden="true" /> : null}
						{isSaving
							? t("components.portfolio.folder.add.saving")
							: t("components.portfolio.folder.add.confirm", {
									count: selected.length,
								})}
					</Button>
				</div>
			}
		>
			<div className="space-y-4 p-4 sm:p-6">
				<InputGroup>
					<InputGroupAddon>
						<Search aria-hidden="true" />
					</InputGroupAddon>
					<InputGroupInput
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						disabled={isSaving}
						aria-label={t("components.portfolio.folder.add.search")}
						placeholder={t("components.portfolio.folder.add.search")}
					/>
				</InputGroup>
				<div className="space-y-1">
					{matches.map((post) => {
						const title =
							post.title?.trim() ||
							t("components.portfolio.folder.add.untitled");
						const thumbnail = [...(post.images ?? [])].sort(
							(a, b) => (a.position ?? 0) - (b.position ?? 0),
						)[0];
						const src = thumbnail?.thumbnail?.path ?? thumbnail?.fullSize?.path;
						const sensitive = Boolean(post.contentWarnings?.length);
						return (
							<label
								key={post.id}
								htmlFor={id + post.id}
								className="flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-muted has-[[data-state=checked]]:bg-muted"
							>
								<div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
									{sensitive ? (
										<ShieldAlert aria-hidden="true" className="size-5" />
									) : src ? (
										<img
											src={src}
											alt=""
											loading="lazy"
											className="size-full object-cover"
										/>
									) : (
										<Image aria-hidden="true" className="size-5" />
									)}
								</div>
								<div className="min-w-0 flex-1">
									<span className="block truncate text-sm font-medium">
										{title}
									</span>
									{post.description && (
										<span className="mt-0.5 block truncate text-xs text-muted-foreground">
											{post.description}
										</span>
									)}
								</div>
								<Checkbox
									id={id + post.id}
									aria-label={title}
									checked={selected.includes(post.id)}
									disabled={isSaving}
									onCheckedChange={(checked) =>
										setSelected((current) =>
											checked
												? [...current, post.id]
												: current.filter((value) => value !== post.id),
										)
									}
								/>
							</label>
						);
					})}
					{!matches.length && (
						<p className="py-8 text-center text-sm text-muted-foreground">
							{t(
								available.length
									? "components.portfolio.folder.add.no_matches"
									: "components.portfolio.folder.add.none",
							)}
						</p>
					)}
				</div>
				{error && (
					<p role="alert" className="text-sm text-destructive">
						{t("components.portfolio.folder.add.error")}
					</p>
				)}
			</div>
		</CreationDialogLayout>
	);
}
