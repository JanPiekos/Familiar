import { Link } from "@tanstack/react-router";
import { ArrowLeft, FolderInput, FolderOpen, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { CatalogResponse } from "@/api/portfolio/catalogs/catalog-types";
import { EmptyPage } from "@/components/layout/empty-page";
import { Button } from "@/components/ui/button";

export function PortfolioFolderView({
	folder,
	username,
	locale,
	postCount,
	isOwner,
	actions,
	toolbar,
	isFiltered,
	onClearFilters,
	onAddPosts,
	children,
}: {
	folder: CatalogResponse;
	username: string;
	locale?: string;
	postCount: number;
	isOwner: boolean;
	actions?: ReactNode;
	toolbar: ReactNode;
	isFiltered: boolean;
	onClearFilters: () => void;
	onAddPosts?: () => void;
	children?: ReactNode;
}) {
	const { t } = useTranslation();
	const params = { locale, username, tab: "portfolio" };
	const description = folder.description?.trim();
	return (
		<div className="flex min-h-0 flex-1 flex-col gap-5">
			<div className="px-4 lg:px-0 xl:px-4">{toolbar}</div>
			<section aria-label={folder.name} className="px-4 lg:px-0 xl:px-4">
				<div className="flex min-w-0 flex-wrap items-start gap-x-3 gap-y-2 sm:flex-nowrap">
					<Button
						variant="ghost"
						size="icon-xl"
						className="order-1 -ml-2 text-muted-foreground"
						asChild
					>
						<Link
							to="/{-$locale}/user/$username/$tab"
							params={params}
							aria-label={t("components.portfolio.folder.back")}
						>
							<ArrowLeft aria-hidden="true" />
						</Link>
					</Button>
					<div className="order-3 w-full min-w-0 basis-full sm:order-2 sm:w-auto sm:flex-1 sm:basis-auto sm:pt-1.5">
						<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
							<h1 className="break-words text-xl leading-snug font-semibold text-foreground">
								{folder.name}
							</h1>
							<span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
								{t("components.portfolio.folder.items", { count: postCount })}
							</span>
						</div>
						{description && (
							<p className="mt-1 max-w-3xl whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">
								{description}
							</p>
						)}
					</div>
					<div className="order-2 ml-auto flex shrink-0 items-center gap-1 sm:order-3">
						{onAddPosts && (
							<Button
								type="button"
								variant="secondary"
								size="xl"
								onClick={onAddPosts}
								aria-label={t("components.portfolio.folder.add.action")}
							>
								<FolderInput aria-hidden="true" />
								<span>{t("components.portfolio.folder.add.action")}</span>
							</Button>
						)}
						{actions}
					</div>
				</div>
			</section>
			<div className="flex min-h-0 flex-1 flex-col px-4 lg:px-0 xl:px-4">
				{children ?? (
					<EmptyPage
						icon={isFiltered ? SearchX : FolderOpen}
						title={t(
							isFiltered
								? "components.portfolio.folder.empty.search_title"
								: "components.portfolio.folder.empty.title",
						)}
						description={t(
							isFiltered
								? "components.portfolio.folder.empty.search_description"
								: isOwner
									? "components.portfolio.folder.empty.owner_description"
									: "components.portfolio.folder.empty.description",
						)}
						className="min-h-64 rounded-none border-0 px-4 py-12"
						titleClassName="text-lg font-semibold"
						descriptionClassName="max-w-sm"
					>
						{isFiltered ? (
							<Button
								type="button"
								size="xl"
								variant="secondary"
								onClick={onClearFilters}
							>
								{t("components.portfolio.folder.empty.clear")}
							</Button>
						) : onAddPosts ? (
							<Button type="button" size="xl" onClick={onAddPosts}>
								<FolderInput aria-hidden="true" />
								{t("components.portfolio.folder.add.action")}
							</Button>
						) : isOwner ? (
							<Button asChild size="xl" variant="outline">
								<Link to="/{-$locale}/user/$username/$tab" params={params}>
									{t("components.portfolio.folder.empty.browse")}
								</Link>
							</Button>
						) : null}
					</EmptyPage>
				)}
			</div>
		</div>
	);
}
