import { useTranslation } from "react-i18next";
import { MailCheck } from "lucide-react";
import { useId, useRef, useState } from "react";
import { OutlineMail } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import useFormValidation from "@/hooks/form/use-form-validation";
import { requestPasswordReset } from "@/lib/password";
import { forgotPassword } from "@/schemas/auth/forgot-password";
import type { ForgotFormProps } from "@/types/auth/form/forgot";
import type { ForgotPasswordData } from "@/types/auth/schema/forgot-password";

function ForgotForm({ onModeChange }: ForgotFormProps) {
	const { t, i18n } = useTranslation();
	const emailId = useId();
	const [sentTo, setSentTo] = useState("");
	const [error, setError] = useState("");
	const pending = useRef(false);

	const form = useFormValidation({
		schema: forgotPassword,
		initialData: {
			email: "",
		},
	});

	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = form;

	const submitPasswordResetRequest = async (data: ForgotPasswordData) => {
		if (pending.current) return;
		pending.current = true;
		setError("");
		try {
			await requestPasswordReset(data.email, i18n.language);
			setSentTo(data.email.trim().toLowerCase());
		} catch (failure) {
			setError(
				t(
					(failure as { status?: number })?.status === 429
						? "auth.errors.rate_limit"
						: "auth.forgot.send_failed",
				),
			);
		} finally {
			pending.current = false;
		}
	};
	if (sentTo)
		return (
			<div className="space-y-5 py-4">
				<MailCheck className="size-12 text-foreground" aria-hidden="true" />
				<div role="status" className="space-y-3">
					<h2 className="text-xl font-semibold">
						{t("auth.forgot.sent_title")}
					</h2>
					<p className="text-sm leading-relaxed text-muted-foreground">
						{t("auth.forgot.sent_description")}
					</p>
					<p className="break-all font-medium">{sentTo}</p>
				</div>
				<Button type="button" variant="outline" onClick={() => setSentTo("")}>
					{t("auth.forgot.try_another")}
				</Button>
				<Button
					type="button"
					variant="link"
					onClick={() => onModeChange("login")}
				>
					{t("auth.forgot.back_to_login")}
				</Button>
			</div>
		);

	return (
		<Form {...form}>
			<form
				onSubmit={handleSubmit(submitPasswordResetRequest)}
				className="flex min-h-[300px] h-full w-full flex-col"
				aria-label={t("auth.forgot.reset_password")}
			>
				<fieldset
					disabled={isSubmitting}
					className="flex flex-1 flex-col gap-4 px-1"
				>
					<legend className="sr-only">{t("auth.forgot.title")}</legend>

					<FormField
						control={control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor={emailId}>{t("auth.email.label")}</FormLabel>

								<FormControl>
									<InputGroup>
										<InputGroupAddon aria-hidden="true">
											<OutlineMail />
										</InputGroupAddon>

										<InputGroupInput
											id={emailId}
											placeholder={t("auth.email.placeholder")}
											type="email"
											autoComplete="email"
											inputMode="email"
											{...field}
										/>
									</InputGroup>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>
				</fieldset>
				{error && (
					<p role="alert" className="my-4 text-sm text-destructive">
						{error}
					</p>
				)}

				<footer className="mt-auto flex shrink-0 flex-col gap-2 px-1">
					<Button
						type="submit"
						disabled={isSubmitting}
						className="w-full"
						size="2xl"
					>
						{t(isSubmitting ? "auth.forgot.sending" : "auth.forgot.submit")}
					</Button>

					<Button
						type="button"
						variant="link"
						onClick={() => onModeChange?.("login")}
						className="w-full justify-center"
					>
						{t("auth.forgot.back_to_login")}
					</Button>
				</footer>
			</form>
		</Form>
	);
}

export default ForgotForm;
