import {
	type ErrorComponentProps,
	type NotFoundRouteProps,
	useLocation,
	useRouter,
} from "@tanstack/react-router";
import {
	ArrowLeft,
	ArrowRight,
	Clock3,
	FileQuestion,
	Home,
	Info,
	LockKeyhole,
	RefreshCw,
	ServerCrash,
	ShieldAlert,
	Unplug,
	WifiOff,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SolidLogo } from "@/components/icons/assets/logo/logo";
import { Button } from "@/components/ui/button";
import { detectLocaleFromPathOrParams, localizePath } from "@/lib/i18n";
import { getPageError, type PageErrorKind } from "@/lib/page-error";
import { cn } from "@/lib/utils";

const icons = {
	not_found: FileQuestion,
	unauthorized: LockKeyhole,
	forbidden: ShieldAlert,
	rate_limit: Clock3,
	timeout: Clock3,
	unavailable: Unplug,
	server: ServerCrash,
	request: FileQuestion,
	network: WifiOff,
	update: RefreshCw,
	unknown: ServerCrash,
} satisfies Record<PageErrorKind, typeof ServerCrash>;

export function ErrorPage({
	error,
	onRetry,
	onBack,
	compact = false,
	embedded = false,
	className,
}: {
	error: unknown;
	onRetry?: () => unknown;
	onBack?: () => void;
	compact?: boolean;
	/** Fit inside the app layout, which already supplies the site header. */
	embedded?: boolean;
	className?: string;
}) {
	const { i18n } = useTranslation();
	const pathname = useLocation({ select: (location) => location.pathname });
	const locale = detectLocaleFromPathOrParams({}, pathname) ?? i18n.language;
	const t = i18n.getFixedT(locale);
	const issue = getPageError(error);
	const Icon = icons[issue.kind];
	const titleId = useId();
	const heading = useRef<HTMLHeadingElement>(null);
	const [retrying, setRetrying] = useState(false);
	const reload = () => window.location.reload();
	const retry = async () => {
		if (retrying) return;
		setRetrying(true);
		try {
			await (issue.kind === "update" ? reload() : onRetry?.());
		} catch {
			// Keep the explanation visible if the service is still unavailable.
		} finally {
			setRetrying(false);
		}
	};
	useEffect(() => {
		heading.current?.focus({ preventScroll: true });
	}, []);
	const home = localizePath("/", locale);
	return (
		<section
			aria-labelledby={titleId}
			className={cn(
				"mx-auto w-full max-w-5xl flex-1 px-5 py-8 text-foreground sm:px-8 sm:py-12",
				compact
					? "flex min-h-80 flex-col"
					: embedded
						? "flex min-h-0 flex-col"
						: "grid min-h-dvh grid-cols-1 grid-rows-[minmax(4rem,1fr)_auto_minmax(4rem,1fr)]",
				className,
			)}
		>
			{!compact && !embedded && (
				<a
					href={home}
					aria-label="Familiar"
					className="col-start-1 row-start-1 inline-flex w-fit items-center self-start gap-2.5 rounded-full text-sm font-bold tracking-wider focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
				>
					<SolidLogo size={28} className="text-primary" aria-hidden="true" />
					FAMILIAR
				</a>
			)}
			<div
				className={cn(
					"mx-auto flex w-full max-w-lg flex-col items-center justify-center text-center",
					compact || embedded ? "flex-1" : "col-start-1 row-start-2",
				)}
			>
				<div className="mb-5 flex size-20 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
					<Icon aria-hidden="true" className="size-8 stroke-[1.5]" />
				</div>
				<p className="mb-3 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
					{issue.status
						? t("error_pages.status", { status: issue.status })
						: t(
								"error_pages." +
									(issue.kind === "network"
										? "connection"
										: issue.kind === "update"
											? "page_update"
											: "unexpected"),
							)}
				</p>
				<h1
					id={titleId}
					ref={heading}
					tabIndex={-1}
					className={cn(
						"text-balance font-semibold tracking-tight outline-none",
						compact ? "text-2xl" : "text-3xl sm:text-4xl",
					)}
				>
					{t(`error_pages.${issue.kind}.title`)}
				</h1>
				<p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
					{t(`error_pages.${issue.kind}.description`)}
				</p>
				<div className="mt-7 flex w-full flex-col items-stretch justify-center gap-2 sm:w-auto sm:flex-row">
					{issue.kind === "unauthorized" ? (
						<Button asChild size="2xl">
							<a href={localizePath("/auth/login", locale)}>
								{t("error_pages.sign_in")}
								<ArrowRight aria-hidden="true" />
							</a>
						</Button>
					) : issue.retryable && (onRetry || issue.kind === "update") ? (
						<Button
							type="button"
							size="2xl"
							disabled={retrying}
							onClick={retry}
						>
							<RefreshCw
								aria-hidden="true"
								className={cn(
									retrying && "animate-spin motion-reduce:animate-none",
								)}
							/>
							{retrying
								? t("error_pages.retrying")
								: issue.kind === "update"
									? t("error_pages.reload")
									: t("error_pages.retry")}
						</Button>
					) : null}
					<Button
						asChild
						size="2xl"
						variant={
							issue.retryable || issue.kind === "unauthorized"
								? "outline"
								: "default"
						}
					>
						<a href={home}>
							<Home aria-hidden="true" />
							{t("error_pages.home")}
						</a>
					</Button>
				</div>
				<div className="mt-7 flex w-full items-start gap-3 rounded-2xl border bg-secondary/30 p-4 text-left">
					<Info
						aria-hidden="true"
						className="mt-0.5 size-4 shrink-0 text-muted-foreground"
					/>
					<p className="min-w-0 text-sm leading-relaxed text-muted-foreground">
						{t(`error_pages.${issue.kind}.hint`)}
					</p>
				</div>
				{onBack && (
					<Button
						type="button"
						variant="ghost"
						size="xl"
						className="mt-4"
						onClick={onBack}
					>
						<ArrowLeft aria-hidden="true" />
						{t("error_pages.back")}
					</Button>
				)}
			</div>
		</section>
	);
}

export function RouteErrorPage({ error, reset }: ErrorComponentProps) {
	const router = useRouter();
	return (
		<ErrorPage
			error={error}
			onRetry={async () => {
				await router.invalidate();
				reset?.();
			}}
			onBack={
				router.history.canGoBack() ? () => router.history.back() : undefined
			}
		/>
	);
}

export function RouteNotFoundPage({
	embedded = false,
}: Partial<NotFoundRouteProps> & {
	embedded?: boolean;
} = {}) {
	const router = useRouter();
	return (
		<ErrorPage
			error={{ status: 404 }}
			embedded={embedded}
			onBack={
				router.history.canGoBack() ? () => router.history.back() : undefined
			}
		/>
	);
}
