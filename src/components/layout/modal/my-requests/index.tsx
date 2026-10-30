import { Surface } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import {
	AlertTriangle,
	Check,
	CircleDollarSign,
	Download,
	Plus,
	X,
} from "lucide-react";
import { useMemo, useState, type ElementType, type ReactNode } from "react";
import { MarkdownDisplay } from "@/components/ui/markdown-display";
import {
	OutlineAI,
	OutlineChat,
	OutlineCheck,
	OutlineClock03,
	OutlineClose,
	OutlineFileArchive,
	OutlineQestionMarkCrFr,
} from "@/components/icons/icons";
import {
	TabSelector,
	type TabItem,
} from "@/components/layout/profile/feed/selector";
import { StatusBadge } from "@/components/layout/badges";
import {
	type DetailTab,
	formatDetailedDate,
	getPaymentStatus,
	type RequestItem,
} from "@/components/layout/requests/my/helpers";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCommission } from "@/hooks/commissions/use-commissions";
import { useUserById } from "@/hooks/user/use-user";
import { cn } from "@/lib/utils";
import {
	type TCommission,
	type TCommissionRequest,
	TCommissionRequestStatus,
} from "@/types/commissions";
import { TPaymentStatus } from "@/types/payment";
import type { TUserProfile } from "@/types/user";
import User from "../../profile/user";
import { RequestStatusStepper } from "../../requests/my/stepper";
import { DangerActionCard, StatusCard } from "./status-card";
import { DeliveryTab } from "./tabs/delivery";
import { RequestSectionCard } from "./tabs/request";
import { useTranslation } from "react-i18next";
import appI18n from "@/lib/i18n";

// TODO: replace viewType to use Permissions / am I client or artist?

interface RequestDetailsModalProps {
	request: RequestItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	viewType?: "client" | "artist";
}

type ViewType = NonNullable<RequestDetailsModalProps["viewType"]>;
type OverviewTone = "accent" | "danger" | "default" | "success" | "warning";
type OverviewActionVariant = "default" | "secondary";

type OverviewStatus = {
	icon: ElementType;
	tone: OverviewTone;
	title: string;
	description: string;
	meta?: string;
	action?: {
		label: string;
		variant: OverviewActionVariant;
		onClick?: () => void;
	};
};

interface RequestDetailsModel {
	request: RequestItem;
	commission?: TCommission;
	client?: TUserProfile;
	artist?: TUserProfile;
	payment: TPaymentStatus;
	commissionTitle: string;
	commissionDescription: string;
	listingCurrency: string;
	listingPrice: number;
	isPaid: boolean;
	isCancelled: boolean;
	shouldShowPayButton: boolean;
	shouldShowTipButton: boolean;
	shouldShowArchiveAction: boolean;
	shouldShowInvoiceButton: boolean;
	overviewStatus: OverviewStatus;
}

const DETAIL_TABS: TabItem<DetailTab>[] = [
	{
		id: "details",
		get label() {
			return appI18n.t("ui.details", "Details");
		},
	},
	{
		id: "delivery",
		get label() {
			return appI18n.t("ui.final_delivery", "Final delivery");
		},
	},
	{
		id: "review",
		get label() {
			return appI18n.t("ui.review_tab", "Review");
		},
	},
];

const ALLOWED_USES = [
	{
		get label() {
			return appI18n.t("ui.personal", "Personal");
		},
		allowed: true,
	},
	{
		get label() {
			return appI18n.t(
				"ui.commercial_redistribution",
				"Commercial redistribution",
			);
		},
		allowed: false,
	},
	{
		get label() {
			return appI18n.t("ui.credit_required", "Credit required");
		},
		allowed: true,
	},
] as const;

function getRecordString(
	record: Record<string, unknown> | undefined,
	keys: string[],
) {
	if (!record) return undefined;

	for (const key of keys) {
		const value = record[key];
		if (typeof value === "string" && value.trim()) return value;
	}

	return undefined;
}

function getRecordNumber(
	record: Record<string, unknown> | undefined,
	keys: string[],
) {
	if (!record) return undefined;

	for (const key of keys) {
		const value = record[key];
		if (typeof value === "number" && Number.isFinite(value)) return value;
	}

	return undefined;
}

function formatCurrency(value: number, currencyCode: string) {
	try {
		return value.toLocaleString("en-US", {
			style: "currency",
			currency: currencyCode,
			maximumFractionDigits: 2,
		});
	} catch {
		return `${currencyCode} ${value.toFixed(2)}`;
	}
}

function getOverviewStatus({
	isCancelled,
	isPaid,
	requestStatus,
	shouldShowPayButton,
	viewType,
}: {
	isCancelled: boolean;
	isPaid: boolean;
	requestStatus: TCommissionRequestStatus;
	shouldShowPayButton: boolean;
	viewType: ViewType;
}): OverviewStatus {
	if (isCancelled) {
		return {
			icon: OutlineClose,
			tone: "danger",
			title: appI18n.t("ui.request_cancelled", "Request cancelled"),
			description: appI18n.t(
				"ui.this_commission_request_is_no_longer_active",
				"This commission request is no longer active.",
			),
			meta: "Closed",
		};
	}

	if (shouldShowPayButton) {
		return {
			icon: CircleDollarSign,
			tone: "warning",
			title: appI18n.t("ui.payment_required", "Payment required"),
			description:
				viewType === "artist"
					? appI18n.t(
							"ui.you_have_accepted_this_request_and_are_waiting_for_the_client_to_complete_p",
							"You have accepted this request and are waiting for the client to complete payment before work begins.",
						)
					: appI18n.t(
							"ui.this_request_was_accepted_and_is_waiting_for_payment_before_work_begins",
							"This request was accepted and is waiting for payment before work begins.",
						),
			meta: "Pending",
		};
	}

	if (requestStatus === TCommissionRequestStatus.Pending) {
		return {
			icon: OutlineClock03,
			tone: "default",
			title:
				viewType === "artist"
					? appI18n.t("ui.pending_response", "Pending response")
					: appI18n.t(
							"ui.waiting_for_artist_response",
							"Waiting for artist response",
						),
			description:
				viewType === "artist"
					? appI18n.t(
							"ui.you_have_a_new_commission_request_waiting_for_your_response",
							"You have a new commission request waiting for your response.",
						)
					: appI18n.t(
							"ui.the_artist_has_not_responded_to_this_request_yet",
							"The artist has not responded to this request yet.",
						),
			meta: "Pending",
			action:
				viewType === "artist"
					? {
							label: appI18n.t("ui.accept_request", "Accept request"),
							variant: "default",
						}
					: undefined,
		};
	}

	if (requestStatus === TCommissionRequestStatus.Accepted) {
		return {
			icon: OutlineCheck,
			tone: "success",
			title: appI18n.t("ui.accepted", "Accepted"),
			description:
				viewType === "artist"
					? appI18n.t(
							"ui.you_have_accepted_this_request",
							"You have accepted this request.",
						)
					: appI18n.t(
							"ui.the_artist_has_accepted_this_request",
							"The artist has accepted this request.",
						),
			meta: "Accepted",
			action:
				viewType === "artist" && isPaid
					? {
							label: appI18n.t("ui.set_to_wip", "Set to WIP"),
							variant: "secondary",
						}
					: undefined,
		};
	}

	if (requestStatus === TCommissionRequestStatus.In_Progress) {
		return {
			icon: OutlineAI,
			tone: "accent",
			title: appI18n.t("ui.work_in_progress", "Work in progress"),
			description:
				viewType === "artist"
					? appI18n.t(
							"ui.you_are_currently_working_on_this_commission",
							"You are currently working on this commission.",
						)
					: appI18n.t(
							"ui.the_artist_is_currently_working_on_your_commission",
							"The artist is currently working on your commission.",
						),
			meta: "In progress",
			action:
				viewType === "artist"
					? {
							label: appI18n.t("ui.final_delivery_d8af9e", "Final Delivery"),
							variant: "secondary",
						}
					: undefined,
		};
	}

	if (requestStatus === TCommissionRequestStatus.Delivered) {
		return {
			icon: OutlineCheck,
			tone: "accent",
			title:
				viewType === "artist"
					? appI18n.t("ui.delivery_sent", "Delivery sent")
					: appI18n.t("ui.delivery_ready", "Delivery ready"),
			description:
				viewType === "artist"
					? appI18n.t(
							"ui.you_have_sent_the_final_delivery_to_the_client_for_review",
							"You have sent the final delivery to the client for review.",
						)
					: appI18n.t(
							"ui.your_files_are_ready_to_review_in_the_delivery_tab",
							"Your files are ready to review in the delivery tab.",
						),
			meta: "Delivered",
		};
	}

	return {
		icon: OutlineClock03,
		tone: "default",
		title: appI18n.t("ui.request_updated", "Request updated"),
		description: appI18n.t(
			"ui.check_the_latest_progress_and_details_below",
			"Check the latest progress and details below.",
		),
	};
}

function useRequestDetailsModel(
	request: RequestItem | null,
	viewType: ViewType,
): RequestDetailsModel | null {
	const commissionId = request?.commissionId ?? "";
	const { data: commissionData } = useCommission(commissionId);
	const { user: client } = useUserById(request?.clientId ?? "");
	const { user: artist } = useUserById(request?.artistId ?? "");

	const commission = commissionData as TCommission | undefined;
	const commissionRecord = commission as Record<string, unknown> | undefined;
	const payment = request ? getPaymentStatus(request) : TPaymentStatus.Pending;

	const commissionTitle = useMemo(() => {
		if (!request) return "Request details";

		return (
			getRecordString(commissionRecord, ["title", "name", "displayName"]) ??
			`Commission request ${commission?.title ?? request.id}`
		);
	}, [commission?.title, commissionRecord, request]);

	if (!request) {
		return null;
	}

	const commissionDescription =
		getRecordString(commissionRecord, ["description", "summary", "details"]) ??
		request.description ??
		"No additional scope details provided.";

	const commissionPrice = getRecordNumber(commissionRecord, [
		"basePrice",
		"basePriceUsd",
		"price",
		"priceUsd",
	]);

	const listingCurrency = commission?.currencyCode || "USD";
	const listingPrice = commissionPrice ?? 0;

	const isAccepted = request.status === TCommissionRequestStatus.Accepted;
	const isPaid = payment === TPaymentStatus.Completed;
	const isCancelled = request.status === TCommissionRequestStatus.Cancelled;
	const isDeliveredAndPaid =
		request.status === TCommissionRequestStatus.Delivered && isPaid;

	const shouldShowPayButton = isAccepted && !isPaid;
	const shouldShowTipButton = isAccepted && isPaid && !isCancelled;
	const shouldShowArchiveAction = isDeliveredAndPaid || isCancelled;
	const shouldShowInvoiceButton = isPaid && !isCancelled;

	const overviewStatus = getOverviewStatus({
		isCancelled,
		isPaid,
		requestStatus: request.status,
		shouldShowPayButton,
		viewType,
	});

	return {
		request,
		commission,
		client: client as TUserProfile | undefined,
		artist: artist as TUserProfile | undefined,
		payment,
		commissionTitle,
		commissionDescription,
		listingCurrency,
		listingPrice,
		isPaid,
		isCancelled,
		shouldShowPayButton,
		shouldShowTipButton,
		shouldShowArchiveAction,
		shouldShowInvoiceButton,
		overviewStatus,
	};
}

function SidebarSection({
	children,
	title,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3 px-6 pb-6">
			<span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
				{title}
			</span>
			{children}
		</div>
	);
}

function CardSection({
	children,
	title,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<Surface className="rounded-2xl p-3">
			<h3 className="mb-3 text-lg font-semibold text-primary">{title}</h3>
			{children}
		</Surface>
	);
}

function SecondaryActionCard({
	buttonLabel,
	description,
	onClick,
	title,
}: {
	title: string;
	description: string;
	buttonLabel: string;
	onClick?: () => void;
}) {
	return (
		<div className="flex items-center justify-between gap-3 rounded-[20px] border border-border p-3">
			<div className="min-w-0">
				<h6 className="text-sm font-semibold text-primary">{title}</h6>
				<p className="text-xs text-muted-foreground">{description}</p>
			</div>

			<Button
				variant="outline"
				size="lg"
				className="shrink-0"
				disabled={!onClick}
				onClick={onClick}
			>
				{buttonLabel}
			</Button>
		</div>
	);
}

function DeliveryFilesPlaceholder() {
	const { t } = useTranslation();
	return (
		<div className="rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
			{t(
				"ui.no_delivery_files_were_attached_yet",
				"No delivery files were attached yet.",
			)}
		</div>
	);
}

function ModalTabs({
	activeTab,
	onOpenChange,
	setActiveTab,
}: {
	activeTab: DetailTab;
	setActiveTab: (tab: DetailTab) => void;
	onOpenChange: (open: boolean) => void;
}) {
	const { t } = useTranslation();
	return (
		<div className="flex items-center justify-between border-b border-border/70 px-6 pt-2 pb-[0.15rem]">
			<TabSelector
				items={DETAIL_TABS}
				value={activeTab}
				onValueChange={setActiveTab}
				className="-mb-px"
				size="default"
			/>
			<div className="flex items-center gap-2">
				<Button disabled variant="ghost">
					<OutlineQestionMarkCrFr />
					{t("ui.help", "Help")}
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="hidden lg:flex"
					onClick={() => onOpenChange(false)}
				>
					<OutlineClose />
				</Button>
			</div>
		</div>
	);
}

function ModalHeading({
	client,
	commissionTitle,
	viewType,
}: {
	client?: TUserProfile;
	commissionTitle: string;
	viewType: ViewType;
}) {
	if (viewType === "artist") {
		return (
			<>
				{client?.displayName?.trim() || "Unknown client"}&apos;s{" "}
				{commissionTitle}
			</>
		);
	}

	return commissionTitle;
}

function RequestSidebar({
	model,
	viewType,
}: {
	model: RequestDetailsModel;
	viewType: ViewType;
}) {
	return (
		<div className="hidden w-sm shrink-0 flex-col border-r border-border xl:flex">
			<RequestSidebarHeader model={model} viewType={viewType} />

			<div className="flex-1 overflow-y-auto">
				<RequestSidebarOverview model={model} viewType={viewType} />
				<RequestSidebarUserCard model={model} viewType={viewType} />
			</div>

			<RequestSidebarAccordion model={model} viewType={viewType} />
		</div>
	);
}

function RequestSidebarHeader({
	model,
	viewType,
}: {
	model: RequestDetailsModel;
	viewType: ViewType;
}) {
	const { t } = useTranslation();
	return (
		<div className="flex flex-col gap-4 p-6">
			<div className="flex flex-col gap-1.5">
				<h2 className="text-2xl font-semibold leading-tight text-primary">
					<ModalHeading
						client={model.client}
						commissionTitle={model.commissionTitle}
						viewType={viewType}
					/>
				</h2>
				<span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
					COM#{model.request.id}
				</span>
				<span className="text-sm text-muted-foreground">
					{t("ui.submitted", "Submitted")}{" "}
					{formatDetailedDate(model.request.createdAt)}
				</span>
			</div>
			<RequestStatusStepper status={model.request.status} />
		</div>
	);
}

function RequestSidebarOverview({
	model,
	viewType,
}: {
	model: RequestDetailsModel;
	viewType: ViewType;
}) {
	const { t } = useTranslation();
	return (
		<SidebarSection title={t("ui.overview", "Overview")}>
			<Surface
				variant="default"
				className="flex flex-col gap-3 rounded-3xl p-1"
			>
				<StatusCard
					icon={model.overviewStatus.icon}
					tone={model.overviewStatus.tone}
					title={model.overviewStatus.title}
					description={model.overviewStatus.description}
					meta={model.overviewStatus.meta}
					action={getPrimaryOverviewAction(model, viewType)}
				/>

				<RequestSidebarSecondaryActions model={model} viewType={viewType} />
			</Surface>
		</SidebarSection>
	);
}

function getPrimaryOverviewAction(
	model: RequestDetailsModel,
	viewType: ViewType,
) {
	if (model.overviewStatus.action) {
		return model.overviewStatus.action;
	}

	if (!model.shouldShowPayButton || viewType !== "client") {
		return undefined;
	}

	return {
		label: appI18n.t("ui.pay_value0", {
			defaultValue: "Pay {{value0}}",
			value0: formatCurrency(model.listingPrice, model.listingCurrency),
		}),
		variant: "default" as const,
	};
}

function RequestSidebarSecondaryActions({
	model,
	viewType,
}: {
	model: RequestDetailsModel;
	viewType: ViewType;
}) {
	const { t } = useTranslation();
	return (
		<>
			{model.shouldShowTipButton && viewType === "client" && (
				<SecondaryActionCard
					title={t("ui.enjoyed_the_result", "Enjoyed the result?")}
					description={t(
						"ui.leave_an_optional_tip_for_the_artist",
						"Leave an optional tip for the artist.",
					)}
					buttonLabel={t("ui.leave_a_tip", "Leave a tip")}
				/>
			)}

			{model.shouldShowInvoiceButton && viewType === "client" && (
				<SecondaryActionCard
					title={t("ui.invoice", "Invoice")}
					description={t(
						"ui.download_a_copy_of_your_payment_invoice",
						"Download a copy of your payment invoice.",
					)}
					buttonLabel={t("ui.download_invoice", "Download invoice")}
				/>
			)}

			{model.shouldShowArchiveAction && (
				<DangerActionCard
					title={t("ui.archive_this_request", "Archive this request")}
					description={t(
						"ui.hold_the_button_to_archive_this_completed_request",
						"Hold the button to archive this completed request.",
					)}
					action={<ArchiveRequestButton />}
				/>
			)}
		</>
	);
}

function ArchiveRequestButton() {
	const { t } = useTranslation();
	return (
		<Button
			disabled
			variant="destructive"
			size="icon-lg"
			aria-haspopup="false"
			className="mr-1"
			onHold={() => {
				// TODO: handle archive
			}}
		>
			<OutlineFileArchive className="size-4" />
			{t("ui.hold_to_archive", "Hold to archive")}
		</Button>
	);
}

function RequestSidebarUserCard({
	model,
	viewType,
}: {
	model: RequestDetailsModel;
	viewType: ViewType;
}) {
	const { t } = useTranslation();
	const sidebarUser = viewType === "artist" ? model.client : model.artist;

	return (
		<SidebarSection
			title={
				viewType === "artist"
					? t("ui.client", "Client")
					: t("ui.artist", "Artist")
			}
		>
			<Surface className="flex items-center gap-1 rounded-3xl p-1">
				{sidebarUser ? (
					<Link
						to={`/${sidebarUser.username}` as string}
						className="flex w-full items-start gap-3 rounded-2xl transition-colors hover:bg-muted/50"
					>
						<User user={sidebarUser} />
					</Link>
				) : (
					<UnknownSidebarUser viewType={viewType} />
				)}

				{model.request.status === TCommissionRequestStatus.In_Progress && (
					<ChatButton />
				)}
			</Surface>
		</SidebarSection>
	);
}

function UnknownSidebarUser({ viewType }: { viewType: ViewType }) {
	const { t } = useTranslation();
	return (
		<div className="flex w-full flex-col rounded-2xl px-3 py-2">
			<span className="text-sm font-semibold text-primary">
				{t("ui.unknown", "Unknown")}{" "}
				{viewType === "artist"
					? t("ui.client_12f3cb", "client")
					: t("ui.artist_02df47", "artist")}
			</span>
			<span className="text-xs text-muted-foreground">
				{t(
					"ui.profile_data_is_not_available",
					"Profile data is not available.",
				)}
			</span>
		</div>
	);
}

function ChatButton() {
	return (
		<Button
			disabled
			variant="secondary"
			size="icon-lg"
			aria-haspopup="false"
			className="mr-1"
			onClick={(event) => {
				event.preventDefault();
				// TODO: handle chat
			}}
		>
			<OutlineChat />
		</Button>
	);
}

function RequestSidebarAccordion({
	model,
	viewType,
}: {
	model: RequestDetailsModel;
	viewType: ViewType;
}) {
	const { t } = useTranslation();
	return (
		<div className="flex flex-col border-t border-border">
			<Accordion type="multiple" className="[&>div]:px-6 mb-2">
				<AccordionItem value="terms">
					<AccordionTrigger>
						{viewType === "artist"
							? t("ui.client_accepted_terms", "Client Accepted Terms")
							: t("ui.accepted_terms", "Accepted Terms")}
					</AccordionTrigger>
					<AccordionContent>
						<MarkdownDisplay
							content={model.commission?.artistTos?.tosText || ""}
						/>
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="desc">
					<AccordionTrigger>
						{model.commissionTitle} {t("ui.description_3583fc", "description")}
					</AccordionTrigger>
					<AccordionContent>{model.commissionDescription}</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}

function MobileRequestHeader({
	model,
	onBack,
	viewType,
}: {
	model: RequestDetailsModel;
	viewType: ViewType;
	onBack: () => void;
}) {
	const { t } = useTranslation();
	return (
		<div className="xl:hidden">
			<div className="border-b border-border px-5 py-4">
				<div className="flex items-center justify-between gap-4">
					<button
						type="button"
						onClick={onBack}
						className="text-sm text-muted-foreground hover:text-foreground"
					>
						{t("ui.back_88c197", "← Back")}
					</button>
					<StatusBadge status={model.request.status} className="w-fit" />
				</div>
				<div className="mt-4">
					<p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
						{model.request.id}
					</p>
					<h2 className="mt-1 text-lg font-semibold text-primary">
						<ModalHeading
							client={model.client}
							commissionTitle={model.commissionTitle}
							viewType={viewType}
						/>
					</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						{t("ui.submitted", "Submitted")}{" "}
						{formatDetailedDate(model.request.createdAt)}
					</p>
				</div>
			</div>
		</div>
	);
}

function DeliveryMessage({
	model,
	viewType,
}: {
	model: RequestDetailsModel;
	viewType: ViewType;
}) {
	const isDelivered =
		model.request.status === TCommissionRequestStatus.Delivered ||
		model.request.status === TCommissionRequestStatus.Completed;
	const displayUser = viewType === "artist" ? model.client : model.artist;

	return (
		<div className="mb-6 rounded-2xl border border-border/70 bg-muted/40 p-4">
			<p className="text-sm leading-relaxed text-primary/90">
				{getDeliveryMessage(isDelivered, viewType)}
			</p>
			<div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
				<span>{displayUser?.displayName}</span>
				<span>@{displayUser?.username}</span>
			</div>
		</div>
	);
}

function getDeliveryMessage(isDelivered: boolean, viewType: ViewType) {
	if (isDelivered) {
		return viewType === "artist"
			? "You have submitted the final delivery. The client is currently reviewing the attached files."
			: "Your commission has a delivery-stage update. Review the attached files and contact the artist if anything needs correction.";
	}

	return viewType === "artist"
		? "You haven't attached a final delivery message yet. You can use this section later to upload files and provide delivery instructions to the client."
		: "There is no final delivery message attached yet. This section can be used later for files and delivery instructions.";
}

function AllowedUsesList() {
	const { t } = useTranslation();
	return (
		<div className="mb-6">
			<span className="mb-3 block text-xs text-muted-foreground">
				{t("ui.allowed_uses", "Allowed uses")}
			</span>
			<div className="flex flex-col gap-2">
				{ALLOWED_USES.map((item) => (
					<AllowedUseItem key={item.label} item={item} />
				))}
			</div>
		</div>
	);
}

function AllowedUseItem({ item }: { item: (typeof ALLOWED_USES)[number] }) {
	return (
		<div className="flex items-center gap-3">
			{item.allowed ? (
				<Check className="size-4 text-emerald-600 dark:text-emerald-400" />
			) : (
				<X className="size-4 text-muted-foreground" />
			)}
			<span
				className={cn(
					"text-sm",
					item.allowed ? "text-primary" : "text-muted-foreground line-through",
				)}
			>
				{item.label}
			</span>
		</div>
	);
}

function DeliveryFiles({ request }: { request: RequestItem }) {
	const { t } = useTranslation();
	if (!request.multimedia?.length) {
		return <DeliveryFilesPlaceholder />;
	}

	return (
		<div className="mb-6">
			<div className="flex flex-col gap-2">
				{request.multimedia.map((media) => (
					<DeliveryFileRow key={media.id} media={media} />
				))}
			</div>
			<button
				type="button"
				className="mt-3 w-full rounded-2xl border border-border/70 bg-background py-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-primary"
			>
				{t("ui.download_all_files", "Download all files")}
			</button>
		</div>
	);
}

function DeliveryFileRow({
	media,
}: {
	media: NonNullable<RequestItem["multimedia"]>[number];
}) {
	const { t } = useTranslation();
	return (
		<div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/40 px-4 py-3">
			<div className="flex min-w-0 flex-col">
				<span className="text-sm font-medium text-violet-600 dark:text-violet-400">
					{t("ui.file", "File")} {media.id}
				</span>
				<span className="text-[11px] text-muted-foreground">
					{t(
						"ui.attached_media_ready_to_preview",
						"Attached media · ready to preview",
					)}
				</span>
			</div>
			<button
				type="button"
				aria-label={t("ui.download_file_value0", {
					defaultValue: "Download file {{value0}}",
					value0: media.id,
				})}
				className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-background text-muted-foreground shadow-sm hover:bg-muted hover:text-primary"
			>
				<Download className="size-4" />
			</button>
		</div>
	);
}

function FinalDeliveryCard({
	model,
	viewType,
}: {
	model: RequestDetailsModel;
	viewType: ViewType;
}) {
	const { t } = useTranslation();
	return (
		<CardSection title={t("ui.final_delivery_d8af9e", "Final Delivery")}>
			<div className="mb-1 flex items-center justify-between gap-4">
				<h4 className="text-lg font-semibold text-primary">
					{t("ui.delivery_update", "Delivery update")}
				</h4>
				<span className="text-xs text-muted-foreground">
					{t("ui.latest_update", "Latest update")}{" "}
					{formatDetailedDate(model.request.updatedAt)}
				</span>
			</div>

			<DeliveryMessage model={model} viewType={viewType} />
			<AllowedUsesList />
			<DeliveryFiles request={model.request} />
		</CardSection>
	);
}

function VerifiedMediaPreview({ request }: { request: RequestItem }) {
	if (!request.multimedia?.length) return null;

	return (
		<div className="mb-4 flex gap-2">
			{request.multimedia.slice(0, 4).map((media, index) => (
				<VerifiedMediaThumb key={media.id} media={media} index={index} />
			))}
		</div>
	);
}

function VerifiedMediaThumb({
	index,
	media,
}: {
	index: number;
	media: NonNullable<RequestItem["multimedia"]>[number];
}) {
	const { t } = useTranslation();
	const url = media.sizes.thumbnail || media.sizes.half || media.sizes.full;

	if (!url) return null;

	return (
		<div className="relative size-20 overflow-hidden rounded-xl border border-border/70 bg-muted">
			<img
				src={url}
				alt={t("ui.verified_media_value0", {
					defaultValue: "Verified media {{value0}}",
					value0: index + 1,
				})}
				className="size-full object-cover"
			/>
			{index === 0 && (
				<div className="absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-500">
					<Check className="size-3 text-white" />
				</div>
			)}
		</div>
	);
}

function VerifiedMediaCard({
	request,
	viewType,
}: {
	request: RequestItem;
	viewType: ViewType;
}) {
	const { t } = useTranslation();
	return (
		<CardSection title={t("ui.verified_media", "Verified media")}>
			<p className="mb-4 text-xs leading-relaxed text-muted-foreground">
				{t(
					"ui.respecting_any_applicable_privacy_arrangements_the_artist_can_submit_media_",
					"Respecting any applicable privacy arrangements, the artist can submit media here to represent your commission.",
				)}
			</p>

			<VerifiedMediaPreview request={request} />
			<VerifiedMediaWarning viewType={viewType} />

			<button
				type="button"
				className="w-full rounded-2xl border border-border/70 bg-background py-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-primary"
			>
				{viewType === "artist"
					? t("ui.manage_media", "Manage media")
					: t("ui.report_issue", "Report issue")}
			</button>
		</CardSection>
	);
}

function VerifiedMediaWarning({ viewType }: { viewType: ViewType }) {
	const { t } = useTranslation();
	return (
		<div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
			<AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
			<span className="text-xs text-amber-700 dark:text-amber-400">
				{viewType === "artist"
					? t(
							"ui.only_upload_media_that_accurately_represents_the_work_completed_for_this_cl",
							"Only upload media that accurately represents the work completed for this client.",
						)
					: t(
							"ui.please_report_if_the_media_misrepresents_the_work_completed",
							"Please report if the media misrepresents the work completed.",
						)}
			</span>
		</div>
	);
}

function TaggedCharactersCard() {
	const { t } = useTranslation();
	return (
		<CardSection title={t("ui.tagged_characters", "Tagged Characters")}>
			<p className="mb-4 text-xs leading-relaxed text-muted-foreground">
				{t(
					"ui.your_commission_s_verified_media_may_be_publicly_featured_in_the_gallery_of",
					"Your commission's verified media may be publicly featured in the gallery of the characters you tag.",
				)}
			</p>
			<button
				type="button"
				className="flex items-center gap-2 rounded-xl border border-border/70 bg-background px-4 py-2.5 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-muted"
			>
				<Plus className="size-4" />
				{t("ui.add", "Add")}
			</button>
			<p className="mt-4 text-[11px] text-muted-foreground">
				{t(
					"ui.you_may_remove_or_tag_characters_whenever_you_please_as_long_as_the_charact",
					"You may remove or tag characters whenever you please, as long as the character curator allows it.",
				)}
			</p>
		</CardSection>
	);
}

function DeliveryContent({
	model,
	viewType,
}: {
	model: RequestDetailsModel;
	viewType: ViewType;
}) {
	return (
		<div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 p-5 md:p-6 xl:p-8">
			<FinalDeliveryCard model={model} viewType={viewType} />
			<VerifiedMediaCard request={model.request} viewType={viewType} />
			<TaggedCharactersCard />
		</div>
	);
}

function ActiveTabContent({
	activeTab,
	model,
	viewType,
}: {
	activeTab: DetailTab;
	model: RequestDetailsModel;
	viewType: ViewType;
}) {
	if (activeTab === "details") {
		return (
			<RequestSectionCard
				request={model.request as TCommissionRequest}
				commission={model.commission as TCommission}
			/>
		);
	}

	if (activeTab === "delivery") {
		return <DeliveryContent model={model} viewType={viewType} />;
	}

	return <DeliveryTab artist={model.artist as TUserProfile} />;
}

function RequestDetailsLayout({
	activeTab,
	model,
	onOpenChange,
	setActiveTab,
	viewType,
}: {
	activeTab: DetailTab;
	setActiveTab: (tab: DetailTab) => void;
	onOpenChange: (open: boolean) => void;
	model: RequestDetailsModel;
	viewType: ViewType;
}) {
	return (
		<div className="flex h-[90vh] w-full overflow-hidden">
			<RequestSidebar model={model} viewType={viewType} />

			<div className="flex min-w-0 flex-1 flex-col">
				<MobileRequestHeader
					model={model}
					onBack={() => onOpenChange(false)}
					viewType={viewType}
				/>

				<ModalTabs
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					onOpenChange={onOpenChange}
				/>

				<div className="min-w-0 flex-1 overflow-y-auto w-full p-6">
					<ActiveTabContent
						activeTab={activeTab}
						model={model}
						viewType={viewType}
					/>
				</div>
			</div>
		</div>
	);
}

export function RequestDetailsModal({
	onOpenChange,
	open,
	request,
	viewType = "client",
}: RequestDetailsModalProps) {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<DetailTab>("details");
	const model = useRequestDetailsModel(request, viewType);

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) {
			setActiveTab("details");
		}

		onOpenChange(nextOpen);
	}

	if (!model) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="w-[min(96vw,1480px)]! max-w-[1480px]! overflow-hidden border-border bg-secondary p-0 text-primary shadow-2xl sm:rounded-[28px] [&>button]:hidden">
				<DialogTitle className="sr-only">
					{t("ui.request_details", "Request details")}
				</DialogTitle>

				<RequestDetailsLayout
					activeTab={activeTab}
					model={model}
					onOpenChange={handleOpenChange}
					setActiveTab={setActiveTab}
					viewType={viewType}
				/>
			</DialogContent>
		</Dialog>
	);
}
