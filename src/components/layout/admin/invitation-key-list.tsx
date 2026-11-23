import { Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { InvitationKey } from "@/api/admin/invitation-keys";
import { Button } from "@/components/ui/button";

export function invitationDate(
	value: string | null | undefined,
	locale: string,
) {
	if (!value || Number.isNaN(Date.parse(value))) return "—";
	return new Intl.DateTimeFormat(locale, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export async function copyInvitationKeys(
	codes: string[],
	copied: string,
	failed: string,
) {
	try {
		await navigator.clipboard.writeText(codes.join("\n"));
		toast.success(copied);
	} catch {
		toast.error(failed);
	}
}

export function InvitationKeyList({ keys }: { keys: InvitationKey[] }) {
	const { t, i18n } = useTranslation();
	return (
		<div>
			<div
				aria-hidden="true"
				className="hidden grid-cols-[1.2fr_1fr_1fr_1fr_2.5rem] gap-5 border-b bg-muted/30 px-6 py-3 text-xs font-medium text-muted-foreground md:grid"
			>
				<span>{t("admin_keys.key_column")}</span>
				<span>{t("admin_keys.owner")}</span>
				<span>{t("admin_keys.created")}</span>
				<span>{t("admin_keys.redeemed")}</span>
				<span />
			</div>
			<ul className="divide-y divide-border">
				{keys.map((key) => (
					<li
						key={key.id}
						className="grid grid-cols-[1fr_2.5rem] items-center gap-x-4 gap-y-4 p-4 transition-colors hover:bg-muted/20 md:grid-cols-[1.2fr_1fr_1fr_1fr_2.5rem] md:gap-x-5 md:px-6"
					>
						<div className="min-w-0 space-y-2">
							<code className="block break-all text-sm font-semibold tracking-wide text-foreground">
								{key.code}
							</code>
							<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
								<span
									aria-hidden="true"
									className={
										key.isUsed
											? "size-1.5 rounded-full bg-muted-foreground/60"
											: "size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"
									}
								/>
								{t(key.isUsed ? "admin_keys.used" : "admin_keys.available")}
							</span>
						</div>
						<dl className="col-span-2 row-start-2 grid min-w-0 grid-cols-2 gap-x-4 gap-y-3 text-xs text-muted-foreground md:contents">
							<div className="min-w-0">
								<dt className="mb-1 md:sr-only">{t("admin_keys.owner")}</dt>
								<dd
									className="truncate text-foreground/85"
									title={key.ownerUserId || t("admin_keys.pool")}
								>
									{key.ownerUserId || t("admin_keys.pool")}
								</dd>
							</div>
							<div>
								<dt className="mb-1 md:sr-only">{t("admin_keys.created")}</dt>
								<dd className="text-foreground/80">
									{invitationDate(key.createdAt, i18n.language)}
								</dd>
							</div>
							<div className="min-w-0">
								<dt className="mb-1 md:sr-only">{t("admin_keys.redeemed")}</dt>
								<dd className="break-all text-foreground/80">
									{key.isUsed ? invitationDate(key.usedAt, i18n.language) : "—"}
									{key.usedByUserId && (
										<span
											className="mt-1 block truncate text-muted-foreground"
											title={key.usedByUserId}
										>
											{key.usedByUserId}
										</span>
									)}
								</dd>
							</div>
						</dl>
						<Button
							type="button"
							variant="outline"
							size="icon-xl"
							className="col-start-2 row-start-1 shrink-0 md:col-start-5"
							aria-label={t("admin_keys.copy_key", { code: key.code })}
							onClick={() =>
								void copyInvitationKeys(
									[key.code],
									t("admin_keys.copied"),
									t("admin_keys.copy_failed"),
								)
							}
						>
							<Copy aria-hidden="true" />
						</Button>
					</li>
				))}
			</ul>
		</div>
	);
}
