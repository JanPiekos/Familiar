import { useQuery } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTags } from "@/api/commisions/index";
import type { PortfolioPostResponse } from "@/api/portfolio/posts/post-types";
import { CreationDialogLayout } from "@/components/layout/creation-dialog-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { useUpdatePortfolioPost } from "@/hooks/portfolio/use-portfolio";

export function PostWarningsDialog({
	post,
	onOpenChange,
}: {
	post: PortfolioPostResponse;
	onOpenChange: (open: boolean) => void;
}) {
	const { t } = useTranslation();
	const id = useId();
	const existingWarnings = (post.tagDetails ?? []).filter(
		(tag) => tag.hasContentWarning,
	);
	const [selected, setSelected] = useState(
		existingWarnings.map((tag) => tag.id),
	);
	const [error, setError] = useState(false);
	const lock = useRef(false);
	const catalog = useQuery({
		queryKey: ["tags"],
		queryFn: () => getTags(true),
	});
	const update = useUpdatePortfolioPost();
	const options = Array.from(
		new Map(
			[
				...existingWarnings,
				...(catalog.data ?? []).filter((tag) => tag.hasContentWarning),
			].map((tag) => [tag.id, tag]),
		).values(),
	);
	const changed =
		selected.length !== existingWarnings.length ||
		selected.some((id) => !existingWarnings.some((tag) => tag.id === id));
	const save = async () => {
		if (
			lock.current ||
			!post.id ||
			!changed ||
			catalog.isPending ||
			catalog.isError
		)
			return;
		lock.current = true;
		setError(false);
		const warningIds = new Set(options.map((tag) => tag.id));
		const otherIds = (post.tagIds ?? []).filter((id) => !warningIds.has(id));
		try {
			await update.mutateAsync({
				postId: post.id,
				data: { tagIds: Array.from(new Set([...otherIds, ...selected])) },
			});
			onOpenChange(false);
		} catch {
			setError(true);
		} finally {
			lock.current = false;
		}
	};
	return (
		<CreationDialogLayout
			open
			onOpenChange={onOpenChange}
			title={t("components.portfolio.post.warnings.title")}
			description={t("components.portfolio.post.warnings.description")}
			isBusy={update.isPending}
			className="max-w-lg sm:max-w-lg"
			footer={
				<div className="flex justify-end gap-2 p-4 sm:px-6">
					<Button
						size="xl"
						variant="outline"
						disabled={update.isPending}
						onClick={() => onOpenChange(false)}
					>
						{t("ui.cancel")}
					</Button>
					<Button
						size="xl"
						disabled={
							!changed ||
							catalog.isPending ||
							catalog.isError ||
							update.isPending
						}
						onClick={() => void save()}
					>
						{update.isPending ? <Spinner aria-hidden="true" /> : null}
						{t("ui.save_changes")}
					</Button>
				</div>
			}
		>
			<div className="space-y-3 p-4 sm:p-6">
				{catalog.isPending ? (
					<div role="status" className="flex justify-center py-6">
						<Spinner />
					</div>
				) : catalog.isError ? (
					<div role="alert" className="space-y-3 text-sm">
						<p>{t("components.portfolio.post.warnings.load_error")}</p>
						<Button variant="secondary" onClick={() => void catalog.refetch()}>
							{t("components.portfolio.post.warnings.retry")}
						</Button>
					</div>
				) : options.length ? (
					options.map((tag) => (
						<label
							key={tag.id}
							htmlFor={id + tag.id}
							className="flex cursor-pointer items-center gap-3 rounded-xl p-3 hover:bg-muted"
						>
							<Checkbox
								id={id + tag.id}
								aria-label={tag.name}
								checked={selected.includes(tag.id)}
								disabled={update.isPending}
								onCheckedChange={(checked) =>
									setSelected((current) =>
										checked
											? [...current, tag.id]
											: current.filter((id) => id !== tag.id),
									)
								}
							/>
							<span className="text-sm">{tag.name}</span>
						</label>
					))
				) : (
					<p className="py-4 text-sm text-muted-foreground">
						{t("ui.no_warnings_found")}
					</p>
				)}
				{error && (
					<p role="alert" className="text-sm text-destructive">
						{t("components.portfolio.post.warnings.save_error")}
					</p>
				)}
			</div>
		</CreationDialogLayout>
	);
}
