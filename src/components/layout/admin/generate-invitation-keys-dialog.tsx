import { Surface } from "@heroui/react";
import { Copy, KeyRound, Plus } from "lucide-react";
import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	type InvitationKey,
	isInvitationKeyCount,
} from "@/api/admin/invitation-keys";
import { CreationDialogLayout } from "@/components/layout/creation-dialog-layout";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { ApiFetchError } from "@/lib/fetch";
import { copyInvitationKeys } from "./invitation-key-list";

export function GenerateInvitationKeysDialog({
	onGenerate,
	onClose,
}: {
	onGenerate: (count: number) => Promise<InvitationKey[]>;
	onClose: () => void;
}) {
	const { t } = useTranslation();
	const id = useId();
	const [count, setCount] = useState("10");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [generated, setGenerated] = useState<InvitationKey[] | null>(null);
	const lock = useRef(false);
	const valid = count.trim() !== "" && isInvitationKeyCount(Number(count));
	const generate = async () => {
		if (lock.current || !valid || generated) return;
		lock.current = true;
		setBusy(true);
		setError("");
		try {
			setGenerated(await onGenerate(Number(count)));
		} catch (error) {
			setError(
				t(
					error instanceof ApiFetchError && error.status === 403
						? "admin_keys.forbidden"
						: "admin_keys.generate_error",
				),
			);
		} finally {
			lock.current = false;
			setBusy(false);
		}
	};
	return (
		<CreationDialogLayout
			open
			onOpenChange={(open) => {
				if (!open && !lock.current) onClose();
			}}
			title={t(
				generated ? "admin_keys.generated_title" : "admin_keys.generate",
			)}
			description={t(
				generated
					? "admin_keys.generated_description"
					: "admin_keys.generate_description",
			)}
			isBusy={busy}
			className="max-w-lg sm:max-w-lg"
			footer={
				<Surface className="flex flex-wrap justify-end gap-2 p-4 sm:px-6">
					{generated ? (
						<>
							<Button
								type="button"
								variant="outline"
								size="2xl"
								onClick={() =>
									void copyInvitationKeys(
										generated.map((key) => key.code),
										t("admin_keys.copied_all"),
										t("admin_keys.copy_failed"),
									)
								}
							>
								<Copy aria-hidden="true" />
								{t("admin_keys.copy_all")}
							</Button>
							<Button type="button" size="2xl" onClick={onClose}>
								{t("admin_keys.done")}
							</Button>
						</>
					) : (
						<>
							<Button
								type="button"
								variant="outline"
								size="2xl"
								disabled={busy}
								onClick={onClose}
							>
								{t("ui.cancel")}
							</Button>
							<Button
								type="submit"
								form={id}
								size="2xl"
								disabled={!valid || busy}
							>
								<Plus aria-hidden="true" />
								{t(busy ? "admin_keys.generating" : "admin_keys.generate")}
							</Button>
						</>
					)}
				</Surface>
			}
		>
			{generated ? (
				<div className="space-y-4 p-5 sm:p-6">
					<p className="flex items-center gap-2 text-sm font-medium">
						<KeyRound className="size-4" aria-hidden="true" />
						{t("admin_keys.generated_count", { count: generated.length })}
					</p>
					<ul className="space-y-2">
						{generated.map((key) => (
							<li
								key={key.id}
								className="flex items-center justify-between gap-3 rounded-2xl border p-3"
							>
								<code className="break-all text-sm font-semibold">
									{key.code}
								</code>
								<Button
									type="button"
									variant="ghost"
									size="icon-xl"
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
			) : (
				<form
					id={id}
					className="space-y-5 p-5 sm:p-6"
					onSubmit={(event) => {
						event.preventDefault();
						void generate();
					}}
				>
					<div className="space-y-2">
						<label htmlFor={`${id}-count`} className="text-sm font-medium">
							{t("admin_keys.quantity")}
						</label>
						<InputGroup>
							<InputGroupInput
								id={`${id}-count`}
								type="number"
								min={1}
								max={100}
								step={1}
								required
								value={count}
								disabled={busy}
								aria-describedby={`${id}-hint`}
								onChange={(event) => setCount(event.target.value)}
							/>
						</InputGroup>
						<p id={`${id}-hint`} className="text-sm text-muted-foreground">
							{t("admin_keys.quantity_hint")}
						</p>
					</div>
					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}
				</form>
			)}
		</CreationDialogLayout>
	);
}
