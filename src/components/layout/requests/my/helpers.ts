import type { DateRange } from "react-day-picker";
import {
	type TCommissionRequest,
	TCommissionRequestStatus,
} from "@/types/commissions";
import { TPaymentStatus } from "@/types/payment";
import appI18n from "@/lib/i18n";

export type RequestPayment = {
	paymentStatus: TPaymentStatus;
	updatedAt: string;
} | null;

export type RequestItem = Omit<TCommissionRequest, "payment"> & {
	payment: RequestPayment;
};

export type SortValue = "newest" | "oldest" | "updated";
export type QuickTab = "all" | "pending" | "accepted" | "completed" | "other";
export type DetailTab = "details" | "delivery" | "review";

export const ITEMS_PER_PAGE = 10;

function localizedDate(options: Intl.DateTimeFormatOptions) {
	return {
		format: (date: Date) =>
			new Intl.DateTimeFormat(appI18n.resolvedLanguage ?? "en", options).format(
				date,
			),
	};
}

const SHORT_DATE_FORMATTER = localizedDate({
	month: "short",
	day: "numeric",
	year: "numeric",
});

const TIME_FORMATTER = localizedDate({
	hour: "numeric",
	minute: "2-digit",
});

const DETAILED_DATE_FORMATTER = localizedDate({
	month: "short",
	day: "numeric",
	year: "numeric",
	hour: "numeric",
	minute: "2-digit",
});

export function getPaymentStatus(request: RequestItem): TPaymentStatus {
	return request.payment?.paymentStatus ?? TPaymentStatus.Pending;
}

export function getPaymentFilterValue(request: RequestItem): TPaymentStatus {
	return request.payment?.paymentStatus ?? TPaymentStatus.Pending;
}

export type TimelineFilterValue =
	| "awaiting_review"
	| "accepted"
	| "in_progress"
	| "delivered"
	| "completed"
	| "cancelled";

export function getRequestTimelineFilterValue(
	request: RequestItem,
): TimelineFilterValue {
	switch (request.status) {
		case TCommissionRequestStatus.Pending:
			return "awaiting_review";
		case TCommissionRequestStatus.Accepted:
			return "accepted";
		case TCommissionRequestStatus.In_Progress:
			return "in_progress";
		case TCommissionRequestStatus.Delivered:
			return "delivered";
		case TCommissionRequestStatus.Completed:
			return "completed";
		case TCommissionRequestStatus.Cancelled:
			return "cancelled";
		default:
			return "awaiting_review";
	}
}

export function stageLabel(stage: TCommissionRequestStatus): string {
	switch (stage) {
		case TCommissionRequestStatus.Pending:
			return appI18n.t("ui.pending", "Pending");
		case TCommissionRequestStatus.Accepted:
			return appI18n.t("ui.accepted", "Accepted");
		case TCommissionRequestStatus.In_Progress:
			return appI18n.t("ui.in_progress_829ac8", "In Progress");
		case TCommissionRequestStatus.Delivered:
			return appI18n.t("ui.delivered", "Delivered");
		case TCommissionRequestStatus.Completed:
			return appI18n.t("ui.completed", "Completed");
		case TCommissionRequestStatus.Cancelled:
			return appI18n.t("ui.cancelled", "Cancelled");
		default:
			return appI18n.t("ui.unknown", "Unknown");
	}
}

export function paymentLabel(payment: TPaymentStatus): string {
	switch (payment) {
		case TPaymentStatus.Completed:
			return appI18n.t("ui.paid", "Paid");
		case TPaymentStatus.Pending:
			return appI18n.t("ui.pending", "Pending");
		case TPaymentStatus.Failed:
			return appI18n.t("ui.failed", "Failed");
		case TPaymentStatus.Refunded:
			return appI18n.t("ui.refunded", "Refunded");
		default:
			return appI18n.t("ui.pending", "Pending");
	}
}

export function statusTone(stage: TCommissionRequestStatus) {
	switch (stage) {
		case TCommissionRequestStatus.Pending:
			return "warning_ghost";
		case TCommissionRequestStatus.Accepted:
			return "success_ghost";
		case TCommissionRequestStatus.In_Progress:
			return "info_ghost";
		case TCommissionRequestStatus.Delivered:
			return "info_ghost";
		case TCommissionRequestStatus.Completed:
			return "success_ghost";
		case TCommissionRequestStatus.Cancelled:
			return "danger_ghost";
	}
}

export function paymentTone(payment: TPaymentStatus) {
	switch (payment) {
		case TPaymentStatus.Completed:
			return "success_ghost";
		case TPaymentStatus.Pending:
			return "warning_ghost";
		case TPaymentStatus.Failed:
			return "danger_ghost";
		case TPaymentStatus.Refunded:
			return "info_ghost";
		default:
			return "warning_ghost";
	}
}

export function formatShortDate(date: string) {
	return SHORT_DATE_FORMATTER.format(new Date(date));
}

export function formatTime(date: string) {
	return TIME_FORMATTER.format(new Date(date));
}

export function formatDetailedDate(date: string) {
	return DETAILED_DATE_FORMATTER.format(new Date(date));
}

export function getRequestTitle(request: RequestItem) {
	const text = request.description?.trim();
	if (!text)
		return appI18n.t("ui.commission_request_id", {
			defaultValue: `Commission request ${request.id}`,
			id: request.id,
		});
	return text.length > 44 ? `${text.slice(0, 44).trimEnd()}…` : text;
}

export function getRequestAvatarLabel(request: RequestItem) {
	const seed = request.artistId || request.commissionId || request.id;
	return seed.slice(0, 2).toUpperCase();
}

export function getRequestTimeline(request: RequestItem) {
	if (request.status === TCommissionRequestStatus.Completed) {
		return {
			primary: appI18n.t("ui.completed", "Completed"),
			secondary: appI18n.t("ui.updated_value0", {
				defaultValue: "Updated {{value0}}",
				value0: formatShortDate(request.updatedAt),
			}),
		};
	}

	if (request.status === TCommissionRequestStatus.Delivered) {
		return {
			primary: appI18n.t("ui.ready_for_review", "Ready for review"),
			secondary: appI18n.t("ui.updated_value0", {
				defaultValue: "Updated {{value0}}",
				value0: formatShortDate(request.updatedAt),
			}),
		};
	}

	if (request.status === TCommissionRequestStatus.In_Progress) {
		return {
			primary: appI18n.t("ui.work_in_progress", "Work in progress"),
			secondary: appI18n.t("ui.updated_value0", {
				defaultValue: "Updated {{value0}}",
				value0: formatShortDate(request.updatedAt),
			}),
		};
	}

	if (request.status === TCommissionRequestStatus.Accepted) {
		return {
			primary: appI18n.t("ui.accepted", "Accepted"),
			secondary: appI18n.t("ui.updated_value0", {
				defaultValue: "Updated {{value0}}",
				value0: formatShortDate(request.updatedAt),
			}),
		};
	}

	if (request.status === TCommissionRequestStatus.Cancelled) {
		return {
			primary: appI18n.t("ui.cancelled", "Cancelled"),
			secondary: appI18n.t("ui.updated_value0", {
				defaultValue: "Updated {{value0}}",
				value0: formatShortDate(request.updatedAt),
			}),
		};
	}

	return {
		primary: appI18n.t("ui.awaiting_review", "Awaiting review"),
		secondary: appI18n.t("ui.submitted_value0", {
			defaultValue: "Submitted {{value0}}",
			value0: formatShortDate(request.createdAt),
		}),
	};
}

export function matchQuickTab(status: TCommissionRequestStatus, tab: QuickTab) {
	if (tab === "all") return true;
	if (tab === "pending") return status === TCommissionRequestStatus.Pending;
	if (tab === "accepted") {
		return (
			status === TCommissionRequestStatus.Accepted ||
			status === TCommissionRequestStatus.In_Progress
		);
	}
	if (tab === "completed") {
		return (
			status === TCommissionRequestStatus.Completed ||
			status === TCommissionRequestStatus.Delivered
		);
	}
	return status === TCommissionRequestStatus.Cancelled;
}

export function generatePaginationItems(
	currentPage: number,
	totalPages: number,
) {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	if (currentPage <= 3) {
		return [1, 2, 3, 4, "ellipsis", totalPages] as const;
	}

	if (currentPage >= totalPages - 2) {
		return [
			1,
			"ellipsis",
			totalPages - 3,
			totalPages - 2,
			totalPages - 1,
			totalPages,
		] as const;
	}

	return [
		1,
		"ellipsis-left",
		currentPage - 1,
		currentPage,
		currentPage + 1,
		"ellipsis-right",
		totalPages,
	] as const;
}

function startOfLocalDay(date: Date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

function endOfLocalDay(date: Date) {
	const d = new Date(date);
	d.setHours(23, 59, 59, 999);
	return d;
}

export function matchesSubmittedRange(dateString: string, range?: DateRange) {
	if (!range?.from && !range?.to) return true;

	const value = new Date(dateString).getTime();
	const from = range?.from
		? startOfLocalDay(range.from).getTime()
		: Number.NEGATIVE_INFINITY;
	const to = range?.to
		? endOfLocalDay(range.to).getTime()
		: Number.POSITIVE_INFINITY;

	return value >= from && value <= to;
}

export function matchSingleOrMulti(
	actual: string,
	operator?: string,
	values: unknown[] = [],
) {
	const selected = values.filter((v): v is string => typeof v === "string");
	if (!selected.length) return true;

	switch (operator) {
		case "is":
			return actual === selected[0];

		case "is not":
		case "is_not":
			return actual !== selected[0];

		case "is any of":
		case "is_any_of":
			return selected.includes(actual);

		case "is none of":
		case "is_none_of":
			return !selected.includes(actual);

		default:
			return true;
	}
}

export function matchDateFilter(
	dateString: string,
	operator: string,
	values: unknown[],
) {
	if (!values?.length || typeof values[0] !== "string") return true;

	const from = new Date(values[0]);
	const to =
		values[1] && typeof values[1] === "string"
			? new Date(values[1])
			: new Date(values[0]);

	const inRange = matchesSubmittedRange(dateString, { from, to });
	return operator === "not_between" ? !inRange : inRange;
}
