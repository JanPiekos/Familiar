import { CalendarIcon, CreditCard, Flag, ListFilterIcon } from "lucide-react";
import { useMemo } from "react";
import {
	OutlineCheck,
	OutlineClock03,
	OutlineClose,
} from "@/components/icons/icons";
import type { FilterGroup } from "@/components/layout/filter-bar";
import {
	getPaymentFilterValue,
	getRequestTimelineFilterValue,
	type RequestItem,
	stageLabel,
} from "@/components/layout/requests/my/helpers";
import { TCommissionRequestStatus } from "@/types/commissions";
import { TPaymentStatus } from "@/types/payment";
import { useTranslation } from "react-i18next";

export function useMyRequestFilterGroups() {
	const { t } = useTranslation();
	return useMemo<FilterGroup<RequestItem>[]>(
		() => [
			{
				id: "status",
				label: t("ui.status", "Status"),
				type: "select",
				icon: ListFilterIcon,
				getItemValue: (request) => request.status,
				options: [
					{
						id: TCommissionRequestStatus.Pending,
						label: stageLabel(TCommissionRequestStatus.Pending),
					},
					{
						id: TCommissionRequestStatus.Accepted,
						label: stageLabel(TCommissionRequestStatus.Accepted),
					},
					{
						id: TCommissionRequestStatus.In_Progress,
						label: stageLabel(TCommissionRequestStatus.In_Progress),
					},
					{
						id: TCommissionRequestStatus.Delivered,
						label: stageLabel(TCommissionRequestStatus.Delivered),
					},
					{
						id: TCommissionRequestStatus.Completed,
						label: stageLabel(TCommissionRequestStatus.Completed),
					},
					{
						id: TCommissionRequestStatus.Cancelled,
						label: stageLabel(TCommissionRequestStatus.Cancelled),
					},
				],
			},
			{
				id: "payment",
				label: t("ui.payment", "Payment"),
				type: "select",
				icon: CreditCard,
				getItemValue: (request) => getPaymentFilterValue(request),
				options: [
					{
						id: TPaymentStatus.Pending,
						label: t("ui.pending", "Pending"),
						icon: OutlineClock03,
					},
					{
						id: TPaymentStatus.Completed,
						label: t("ui.paid", "Paid"),
						icon: OutlineCheck,
					},
					{
						id: TPaymentStatus.Failed,
						label: t("ui.failed", "Failed"),
						icon: OutlineClose,
					},
					{
						id: TPaymentStatus.Refunded,
						label: t("ui.refunded", "Refunded"),
						icon: OutlineClose,
					},
				],
			},
			{
				id: "timeline",
				label: t("ui.timeline", "Timeline"),
				type: "select",
				icon: Flag,
				getItemValue: (request) => getRequestTimelineFilterValue(request),
				options: [
					{
						id: "awaiting_review",
						label: t("ui.awaiting_review", "Awaiting review"),
					},
					{ id: "accepted", label: t("ui.accepted", "Accepted") },
					{ id: "in_progress", label: t("ui.in_progress", "In progress") },
					{ id: "delivered", label: t("ui.delivered", "Delivered") },
					{ id: "completed", label: t("ui.completed", "Completed") },
					{ id: "cancelled", label: t("ui.cancelled", "Cancelled") },
				],
			},
			{
				id: "submittedDate",
				label: t("ui.submitted_date", "Submitted date"),
				type: "date",
				icon: CalendarIcon,
				getItemValue: (request) => new Date(request.createdAt),
			},
		],
		[t],
	);
}
