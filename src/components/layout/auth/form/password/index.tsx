import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { type FormEvent, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { passwordErrorKey } from "@/lib/password";
import { localizePath } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

const emptyValues = { current: "", password: "", confirm: "", nonce: "" };
type PasswordField = "current" | "password" | "confirm";

export function PasswordUpdateForm({
	requireCurrentPassword = false,
	onSuccess,
}: {
	requireCurrentPassword?: boolean;
	onSuccess?: () => void;
}) {
	const { t, i18n } = useTranslation();
	const id = useId();
	const [values, setValues] = useState(emptyValues);
	const [visible, setVisible] = useState<
		Partial<Record<PasswordField, boolean>>
	>({});
	const [busy, setBusy] = useState(false);
	const submitting = useRef(false);
	const [needsCode, setNeedsCode] = useState(false);
	const [error, setError] = useState("");
	const [saved, setSaved] = useState(false);
	const fields: PasswordField[] = requireCurrentPassword
		? ["current", "password", "confirm"]
		: ["password", "confirm"];
	const labels = {
		current: t("auth.reset.current"),
		password: t("auth.reset.new_password"),
		confirm: t("auth.confirm_password.label"),
	};

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (submitting.current) return;
		setSaved(false);
		if (requireCurrentPassword && !values.current)
			return setError(t("auth.reset.current_required"));
		if (values.password.length < 6)
			return setError(t("auth.reset.requirements"));
		if (values.password !== values.confirm)
			return setError(t("auth.reset.mismatch"));
		if (requireCurrentPassword && values.password === values.current)
			return setError(t("auth.reset.same_password"));
		if (needsCode && !values.nonce.trim())
			return setError(t("auth.reset.enter_code"));
		submitting.current = true;
		setBusy(true);
		setError("");
		try {
			const { error: updateError } = await supabase.auth.updateUser({
				password: values.password,
				...(requireCurrentPassword ? { current_password: values.current } : {}),
				...(needsCode ? { nonce: values.nonce.trim() } : {}),
			});
			if (updateError?.code === "reauthentication_needed" && !needsCode) {
				const { error: verificationError } =
					await supabase.auth.reauthenticate();
				if (verificationError) throw verificationError;
				setNeedsCode(true);
				return;
			}
			if (updateError) throw updateError;
			setValues(emptyValues);
			setVisible({});
			setNeedsCode(false);
			setSaved(true);
			onSuccess?.();
		} catch (failure) {
			setError(t(passwordErrorKey(failure)));
		} finally {
			submitting.current = false;
			setBusy(false);
		}
	};

	return (
		<form
			onSubmit={submit}
			noValidate
			aria-label={t("auth.reset.title")}
			className="auth-form flex min-w-0 flex-1 flex-col gap-5"
		>
			<fieldset disabled={busy} className="flex-1 space-y-4">
				<legend className="sr-only">{t("auth.reset.title")}</legend>
				{fields.map((name) => (
					<div key={name} className="space-y-2">
						<label htmlFor={`${id}-${name}`} className="text-sm font-medium">
							{labels[name]}
						</label>
						<InputGroup>
							<InputGroupAddon>
								<LockKeyhole aria-hidden="true" />
							</InputGroupAddon>
							<InputGroupInput
								id={`${id}-${name}`}
								type={visible[name] ? "text" : "password"}
								autoComplete={
									name === "current" ? "current-password" : "new-password"
								}
								required
								value={values[name]}
								aria-describedby={error ? `${id}-error` : undefined}
								onChange={(event) => {
									setValues({ ...values, [name]: event.target.value });
									setError("");
									setSaved(false);
								}}
							/>
							<InputGroupAddon align="inline-end">
								<InputGroupButton
									type="button"
									variant="ghost"
									size="icon-xs"
									aria-label={t(
										visible[name] ? "auth.password.hide" : "auth.password.show",
									)}
									aria-pressed={!!visible[name]}
									onClick={() =>
										setVisible({ ...visible, [name]: !visible[name] })
									}
								>
									{visible[name] ? (
										<EyeOff aria-hidden="true" />
									) : (
										<Eye aria-hidden="true" />
									)}
								</InputGroupButton>
							</InputGroupAddon>
						</InputGroup>
						{name === "password" && (
							<p className="text-xs text-muted-foreground">
								{t("auth.reset.requirements")}
							</p>
						)}
					</div>
				))}
				{needsCode && (
					<div className="space-y-2">
						<p role="status" className="text-sm text-muted-foreground">
							{t("auth.reset.code_sent")}
						</p>
						<label htmlFor={`${id}-nonce`} className="text-sm font-medium">
							{t("auth.reset.code")}
						</label>
						<InputGroup>
							<InputGroupInput
								id={`${id}-nonce`}
								autoComplete="one-time-code"
								inputMode="numeric"
								required
								value={values.nonce}
								onChange={(event) =>
									setValues({ ...values, nonce: event.target.value })
								}
							/>
						</InputGroup>
					</div>
				)}
			</fieldset>
			{error && (
				<p id={`${id}-error`} role="alert" className="text-sm text-destructive">
					{error}
				</p>
			)}
			{saved && (
				<p
					role="status"
					className="rounded-2xl border bg-secondary/40 p-4 text-sm"
				>
					{t("auth.reset.success")}
				</p>
			)}
			<Button
				type="submit"
				disabled={busy}
				size="2xl"
				className="w-full sm:w-auto"
			>
				{t(busy ? "auth.reset.saving" : "auth.reset.submit")}
			</Button>
			{requireCurrentPassword && (
				<Button asChild variant="link">
					<a href={localizePath("/auth/forgot", i18n.language)}>
						{t("auth.forgot.cta")}
					</a>
				</Button>
			)}
		</form>
	);
}
