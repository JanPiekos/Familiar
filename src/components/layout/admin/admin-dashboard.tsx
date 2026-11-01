import { Surface } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	KeyRound,
	Plus,
	RefreshCw,
	ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	generateAdminInvitationKeys,
	getAdminInvitationKeyStats,
	getAdminInvitationKeys,
} from "@/api/admin/invitation-keys";
import type { ManagedFilterValue } from "@/components/layout/filter-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiFetchError } from "@/lib/fetch";
import { localizePath } from "@/lib/i18n";
import { useAuth } from "@/providers/auth";
import { TRoles } from "@/types/user/roles";
import { GenerateInvitationKeysDialog } from "./generate-invitation-keys-dialog";
import {
	InvitationKeyFilters,
	invitationUsedFilter,
} from "./invitation-key-filters";
import { InvitationKeyList } from "./invitation-key-list";

const retry = (attempt: number, error: Error) =>
	!(error instanceof ApiFetchError && [401, 403].includes(error.status)) &&
	attempt < 1;

function KeyRowsSkeleton() {
	return (
		<div aria-hidden="true" className="divide-y divide-border">
			{[0, 1, 2].map((index) => (
				<div
					key={index}
					className="grid grid-cols-[1fr_2.5rem] items-center gap-5 p-4 md:grid-cols-[1.2fr_1fr_1fr_1fr_2.5rem] md:px-6"
				>
					<div className="space-y-2">
						<Skeleton className="h-4 w-40 max-w-full" />
						<Skeleton className="h-3 w-20" />
					</div>
					{[0, 1, 2].map((item) => (
						<Skeleton key={item} className="hidden h-4 w-4/5 md:block" />
					))}
					<Skeleton className="size-10 rounded-full" />
				</div>
			))}
		</div>
	);
}

export function AdminDashboard() {
	const { user, isPending } = useAuth();
	const { t, i18n } = useTranslation();
	if (isPending)
		return (
			<section aria-busy="true" className="space-y-6 p-4 lg:p-0">
				<span role="status" className="sr-only">
					{t("admin_keys.loading")}
				</span>
				<Skeleton className="h-10 w-64" />
				<div className="grid grid-cols-3 gap-2 sm:gap-3">
					{[0, 1, 2].map((index) => (
						<Skeleton
							key={index}
							className="h-24 rounded-2xl sm:h-32 sm:rounded-3xl"
						/>
					))}
				</div>
				<KeyRowsSkeleton />
			</section>
		);
	if (!user?.roles?.includes(TRoles.Admin))
		return (
			<Surface className="mx-4 my-auto flex flex-col items-center rounded-3xl border p-8 text-center lg:mx-auto lg:max-w-lg">
				<ShieldCheck
					aria-hidden="true"
					className="mb-4 size-9 text-muted-foreground"
				/>
				<h1 className="text-2xl font-semibold text-foreground">
					{t("admin_keys.title")}
				</h1>
				<p className="mt-3 text-pretty text-muted-foreground">
					{t(user ? "admin_keys.forbidden" : "admin_keys.sign_in")}
				</p>
				<Button asChild size="2xl" className="mt-6">
					<Link to={localizePath(user ? "/" : "/auth/login", i18n.language)}>
						{t(user ? "error_pages.home" : "error_pages.sign_in")}
					</Link>
				</Button>
			</Surface>
		);
	return <AdminInvitationKeys key={user.userId} userId={user.userId} />;
}

export function AdminInvitationKeys({ userId }: { userId: string }) {
	const { t, i18n } = useTranslation();
	const client = useQueryClient();
	const [page, setPage] = useState(0);
	const [status, setStatus] = useState<ManagedFilterValue>();
	const [search, setSearch] = useState("");
	const [owner, setOwner] = useState<string>();
	const [generateOpen, setGenerateOpen] = useState(false);
	const scope = ["invitation-keys", "admin", userId];
	const used = invitationUsedFilter(status);
	const filters = {
		page,
		used: used ?? undefined,
		ownerUserId: owner,
	};
	const keys = useQuery({
		queryKey: [...scope, "list", filters],
		queryFn: ({ signal }) => getAdminInvitationKeys(filters, signal),
		gcTime: 0,
		staleTime: 30_000,
		retry,
	});
	const stats = useQuery({
		queryKey: [...scope, "stats"],
		queryFn: ({ signal }) => getAdminInvitationKeyStats(signal),
		gcTime: 0,
		staleTime: 30_000,
		retry,
	});
	const generate = useMutation({
		mutationFn: generateAdminInvitationKeys,
		retry: false,
		onSuccess: () => {
			void client.invalidateQueries({ queryKey: scope });
		},
	});
	const deniedError = [keys.error, stats.error, generate.error].find(
		(error): error is ApiFetchError =>
			error instanceof ApiFetchError && [401, 403].includes(error.status),
	);
	const accessDenied = Boolean(deniedError);
	useEffect(() => {
		if (accessDenied) setGenerateOpen(false);
	}, [accessDenied]);
	useEffect(() => {
		if (keys.isSuccess && page > 0 && keys.data.totalPages <= page)
			setPage(Math.max(0, keys.data.totalPages - 1));
	}, [keys.isSuccess, keys.data?.totalPages, page]);
	const rows = (used === null ? [] : (keys.data?.content ?? [])).filter((key) =>
		key.code.toLowerCase().includes(search.trim().toLowerCase()),
	);
	const refreshing = keys.isFetching || stats.isFetching;
	const refresh = () => {
		generate.reset();
		void keys.refetch();
		void stats.refetch();
	};
	const statusError = deniedError ?? keys.error;
	const errorKey =
		statusError instanceof ApiFetchError && statusError.status === 403
			? "admin_keys.forbidden"
			: statusError instanceof ApiFetchError && statusError.status === 401
				? "admin_keys.sign_in"
				: "admin_keys.load_error";
	const counters = [
		{
			label: "admin_keys.available",
			value: stats.data?.activeCount,
			icon: KeyRound,
		},
		{
			label: "admin_keys.used",
			value: stats.data?.usedCount,
			icon: CheckCircle2,
		},
		{
			label: "admin_keys.total",
			value: stats.data
				? stats.data.activeCount + stats.data.usedCount
				: undefined,
			icon: ShieldCheck,
		},
	];
	return (
		<section className="min-w-0 space-y-6 px-4 py-5 lg:px-0 lg:py-4">
			<header className="flex flex-wrap items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
						{t("admin_keys.eyebrow")}
					</p>
					<h1 className="text-3xl font-semibold tracking-tight text-foreground">
						{t("admin_keys.title")}
					</h1>
					<p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
						{t("admin_keys.description")}
					</p>
				</div>
				<Button
					type="button"
					size="2xl"
					disabled={accessDenied}
					onClick={() => setGenerateOpen(true)}
				>
					<Plus aria-hidden="true" />
					{t("admin_keys.generate")}
				</Button>
			</header>
			<div className="grid grid-cols-3 gap-2 sm:gap-3">
				{counters.map(({ label, value, icon: Icon }) => (
					<Surface
						key={label}
						className="flex items-center justify-between gap-4 rounded-2xl border p-3 sm:rounded-3xl sm:p-5"
					>
						<div>
							<p className="text-xs text-muted-foreground sm:text-sm">
								{t(label)}
							</p>
							{stats.isPending ? (
								<Skeleton className="mt-2 h-9 w-20" />
							) : (
								<p className="mt-2 text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
									{value === undefined || accessDenied
										? "—"
										: value.toLocaleString(i18n.language)}
								</p>
							)}
						</div>
						<div className="hidden size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground sm:flex">
							<Icon aria-hidden="true" className="size-5" />
						</div>
					</Surface>
				))}
			</div>
			{stats.isError && !accessDenied && (
				<p role="alert" className="text-sm text-muted-foreground">
					{t("admin_keys.stats_error")}
				</p>
			)}
			<Surface className="min-w-0 overflow-hidden rounded-3xl border">
				<div className="space-y-4 border-b p-4 sm:p-6">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h2 className="text-lg font-semibold text-foreground">
								{t("admin_keys.keys_title")}
							</h2>
							<p className="mt-1 text-xs text-muted-foreground">
								{t("admin_keys.single_use")}
								{keys.data &&
									!accessDenied &&
									` · ${t("admin_keys.matching_total", { count: used === null ? 0 : keys.data.totalElements })}`}
							</p>
						</div>
						<Button
							type="button"
							variant="outline"
							size="icon-xl"
							disabled={refreshing}
							aria-label={t("admin_keys.refresh")}
							onClick={refresh}
						>
							<RefreshCw
								aria-hidden="true"
								className={
									refreshing
										? "animate-spin motion-reduce:animate-none"
										: undefined
								}
							/>
						</Button>
					</div>
					<InvitationKeyFilters
						data={keys.data?.content ?? []}
						status={status}
						owner={owner}
						search={search}
						onSearchChange={setSearch}
						onStatusChange={(value) => {
							setStatus(value);
							setPage(0);
						}}
						onOwnerChange={(value) => {
							setOwner(value);
							setPage(0);
						}}
					/>
				</div>
				<div aria-busy={keys.isPending}>
					{keys.isPending && !accessDenied ? (
						<KeyRowsSkeleton />
					) : keys.isError || accessDenied ? (
						<div role="alert" className="space-y-4 p-8 text-center">
							<p className="text-sm text-muted-foreground">{t(errorKey)}</p>
							<Button
								type="button"
								variant="outline"
								size="xl"
								onClick={refresh}
							>
								{t("admin_keys.retry")}
							</Button>
						</div>
					) : rows.length ? (
						<InvitationKeyList keys={rows} />
					) : (
						<div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
							<KeyRound
								className="size-8 text-muted-foreground"
								aria-hidden="true"
							/>
							<h3 className="font-semibold text-foreground">
								{t(search ? "admin_keys.no_search" : "admin_keys.empty")}
							</h3>
							<p className="max-w-sm text-sm text-muted-foreground">
								{t(search ? "admin_keys.search_hint" : "admin_keys.empty_hint")}
							</p>
							{search && (
								<Button
									type="button"
									variant="outline"
									size="xl"
									onClick={() => setSearch("")}
								>
									{t("admin_keys.clear_search")}
								</Button>
							)}
						</div>
					)}
				</div>
				{keys.data &&
					used !== null &&
					!accessDenied &&
					keys.data.totalPages > 0 && (
						<footer className="flex flex-wrap items-center justify-between gap-3 border-t p-4 sm:px-6">
							<p className="text-sm text-muted-foreground">
								{t("admin_keys.page", {
									page: page + 1,
									pages: keys.data.totalPages,
								})}
							</p>
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									size="icon-xl"
									aria-label={t("admin_keys.previous")}
									disabled={page === 0 || keys.isFetching}
									onClick={() => {
										setSearch("");
										setPage((current) => current - 1);
									}}
								>
									<ChevronLeft aria-hidden="true" />
								</Button>
								<Button
									type="button"
									variant="outline"
									size="icon-xl"
									aria-label={t("admin_keys.next")}
									disabled={page + 1 >= keys.data.totalPages || keys.isFetching}
									onClick={() => {
										setSearch("");
										setPage((current) => current + 1);
									}}
								>
									<ChevronRight aria-hidden="true" />
								</Button>
							</div>
						</footer>
					)}
			</Surface>
			{generateOpen && !accessDenied && (
				<GenerateInvitationKeysDialog
					onGenerate={(count) => generate.mutateAsync(count)}
					onClose={() => setGenerateOpen(false)}
				/>
			)}
		</section>
	);
}
