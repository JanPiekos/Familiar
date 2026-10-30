import type * as React from "react";
import { type Button, buttonVariants } from "src/components/ui/button";
import { cn } from "@/lib/utils";
import {
	OutlineChevronLeft,
	OutlineChevronRight,
	OutlineMore,
} from "../icons/icons";
import { useTranslation } from "react-i18next";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
	const { t } = useTranslation();
	return (
		<nav
			aria-label={t("ui.pagination", "pagination")}
			data-slot="pagination"
			className={cn("mx-auto flex w-full justify-center", className)}
			{...props}
		/>
	);
}

function PaginationContent({
	className,
	...props
}: React.ComponentProps<"ul">) {
	return (
		<ul
			data-slot="pagination-content"
			className={cn("flex flex-row items-center gap-1", className)}
			{...props}
		/>
	);
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
	return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
	isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
	React.ComponentProps<"a">;

function PaginationLink({
	className,
	isActive,
	size = "icon",
	...props
}: PaginationLinkProps) {
	return (
		<a
			aria-current={isActive ? "page" : undefined}
			data-slot="pagination-link"
			data-active={isActive}
			className={cn(
				buttonVariants({
					variant: isActive ? "default" : "ghost",
					size,
				}),
				className,
			)}
			{...props}
		/>
	);
}

function PaginationPrevious({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	const { t } = useTranslation();
	return (
		<PaginationLink
			aria-label={t("ui.go_to_previous_page", "Go to previous page")}
			size={"sm"}
			className={cn(buttonVariants({ variant: "ghost" }), className)}
			{...props}
		>
			<OutlineChevronLeft />
			<span className="hidden sm:block">{t("ui.previous", "Previous")}</span>
		</PaginationLink>
	);
}

function PaginationNext({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	const { t } = useTranslation();
	return (
		<PaginationLink
			aria-label={t("ui.go_to_next_page", "Go to next page")}
			size="sm"
			className={cn(buttonVariants({ variant: "ghost" }), className)}
			{...props}
		>
			<span className="hidden sm:block">{t("ui.next", "Next")}</span>
			<OutlineChevronRight />
		</PaginationLink>
	);
}

function PaginationEllipsis({
	className,
	...props
}: React.ComponentProps<"span">) {
	const { t } = useTranslation();
	return (
		<span
			aria-hidden
			data-slot="pagination-ellipsis"
			className={cn("flex size-9 items-center justify-center", className)}
			{...props}
		>
			<OutlineMore className="rotate-90" />
			<span className="sr-only">{t("ui.more_pages", "More pages")}</span>
		</span>
	);
}

export {
	Pagination,
	PaginationContent,
	PaginationLink,
	PaginationItem,
	PaginationPrevious,
	PaginationNext,
	PaginationEllipsis,
};
