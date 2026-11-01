import { CheckCircle2, Copy, KeyRound } from "lucide-react";
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
		<ul className="divide-y divide-border">
			{keys.map((key) => (
				<li key={key.id} className="flex items-start gap-3 p-4 sm:px-6 sm:py-5">
					<div
						className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
						aria-hidden="true"
					>
						{key.isUsed ? (
							<CheckCircle2 className="size-5" />
						) : (
							<KeyRound className="size-5" />
						)}
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
							<code className="break-all text-sm font-semibold tracking-wide text-foreground sm:text-base">
								{key.code}
							</code>
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground/70">
								{t(key.isUsed ? "admin_keys.used" : "admin_keys.available")}
							</span>
						</div>
						<dl className="mt-3 grid min-w-0 gap-x-5 gap-y-2 text-xs text-muted-foreground md:grid-cols-3">
							<div className="min-w-0">
								<dt className="mb-0.5">{t("admin_keys.owner")}</dt>
								<dd className="break-all text-foreground/80">
									{key.ownerUserId || t("admin_keys.pool")}
								</dd>
							</div>
							<div>
								<dt className="mb-0.5">{t("admin_keys.created")}</dt>
								<dd className="text-foreground/80">
									{invitationDate(key.createdAt, i18n.language)}
								</dd>
							</div>
							<div className="min-w-0">
								<dt className="mb-0.5">{t("admin_keys.redeemed")}</dt>
								<dd className="break-all text-foreground/80">
									{key.isUsed ? invitationDate(key.usedAt, i18n.language) : "—"}
									{key.usedByUserId && (
										<span className="mt-0.5 block">{key.usedByUserId}</span>
									)}
								</dd>
							</div>
						</dl>
					</div>
					<Button
						type="button"
						variant="outline"
						size="icon-xl"
						className="shrink-0"
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
	);
}
