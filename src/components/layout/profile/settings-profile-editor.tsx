import { Typography } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import {
	type ChangeEvent,
	type RefObject,
	useEffect,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	ProfileImageSizeHint,
	useProfileImageCrop,
} from "./profile-image-crop-dialog";
import { PROFILE_COVER_CLASS_NAME } from "@/lib/image-crop";
import { cn } from "@/lib/utils";
import { profileSettingsSchema } from "@/schemas/user/profile";
import { OutlineAt, OutlineUser } from "@/components/icons/icons";
import type { ProfileEditorValues } from "@/components/layout/profile/profile-editor";
import UserAvatar from "@/components/layout/profile/avatar";
import { ProfileImageMenu } from "./profile-image-menu";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupTextArea,
} from "@/components/ui/input-group";
import type { TUserProfile } from "@/types/user";

const EMPTY_PROFILE_VALUES: ProfileEditorValues = {
	avatar_url: "",
	cover_url: "",
	display_name: "",
	username: "",
	bio: "",
	accent_color: "",
};

interface SettingsProfileEditorProps {
	initialValues?: ProfileEditorValues;
	displayNameRef?: RefObject<HTMLInputElement | null>;
	bioClassName?: string;
	onSubmit?: (
		values: ProfileEditorValues,
		initialValues: ProfileEditorValues,
	) =>
		| void
		| ProfileEditorValues
		| null
		| Promise<void | ProfileEditorValues | null>;
}

export function SettingsProfileEditor({
	initialValues,
	displayNameRef,
	bioClassName,
	onSubmit,
}: SettingsProfileEditorProps) {
	const { t } = useTranslation();
	const { requestCrop, cropDialog } = useProfileImageCrop();
	const [submitError, setSubmitError] = useState<string | null>(null);
	const submittingRef = useRef(false);
	// Keep the edit baseline stable when background profile queries refresh.
	const baselineRef = useRef(initialValues ?? EMPTY_PROFILE_VALUES);
	const form = useForm({
		defaultValues: baselineRef.current,
		validators: {
			onSubmit: profileSettingsSchema,
			onChange: profileSettingsSchema,
			onBlur: profileSettingsSchema,
		},
		onSubmitInvalid: () => {
			toast.error(
				t(
					"settings.profile.validation_failed",
					"Please correct the highlighted fields before saving.",
				),
			);
		},
		onSubmit: async ({ value, formApi }) => {
			if (submittingRef.current) return;
			submittingRef.current = true;
			setSubmitError(null);
			const toastId = toast.loading(
				t("settings.profile.saving", "Saving profile…"),
			);
			try {
				if (!onSubmit) {
					throw new Error(
						t(
							"settings.profile.save_unavailable",
							"Saving profile changes is not available yet.",
						),
					);
				}
				const parsed = profileSettingsSchema.parse(value);
				const saved = await onSubmit(parsed, baselineRef.current);
				const nextValues = saved ?? parsed;
				baselineRef.current = nextValues;
				formApi.reset(nextValues);
				if (saved === null) {
					toast.info(t("settings.profile.no_changes", "No changes to save."), {
						id: toastId,
					});
				} else {
					toast.success(t("settings.profile.saved", "Profile changes saved."), {
						id: toastId,
					});
				}
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: t(
								"settings.profile.save_failed",
								"Your profile changes could not be saved. Please try again.",
							),
					{ id: toastId },
				);
				setSubmitError(
					error instanceof Error
						? error.message
						: t(
								"settings.profile.save_failed",
								"Your profile changes could not be saved. Please try again.",
							),
				);
			} finally {
				submittingRef.current = false;
			}
		},
	});

	useEffect(() => {
		const hasEdits = (
			Object.keys(baselineRef.current) as Array<keyof ProfileEditorValues>
		).some((field) => form.state.values[field] !== baselineRef.current[field]);
		if (submittingRef.current || hasEdits) return;
		baselineRef.current = initialValues ?? EMPTY_PROFILE_VALUES;
		form.reset(baselineRef.current);
	}, [form, initialValues]);

	function handleFileChange(
		event: ChangeEvent<HTMLInputElement>,
		field: "avatar_url" | "cover_url",
	) {
		const file = event.target.files?.[0];
		if (!file) return;

		requestCrop(file, field === "avatar_url" ? "avatar" : "cover", ({ dataUrl }) => {
			form.setFieldValue(field, dataUrl);
		});
		event.target.value = "";
	}

	return (
		<form
			id="profile-settings-form"
			noValidate
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
		>
			{cropDialog}
			{submitError && (
				<p role="alert" className="mb-4 text-sm text-destructive">
					{submitError}
				</p>
			)}
			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<fieldset disabled={isSubmitting} className="min-w-0 border-0 p-0">
						<form.Subscribe selector={(state) => state.values}>
							{(values) => {
								const previewUser = {
									avatarPath: values.avatar_url || undefined,
									displayName: values.display_name || "",
									username: values.username || "",
									accentColor: values.accent_color || undefined,
								} as TUserProfile;

								return (
									<div className="flex flex-col gap-6">
										<div className="relative -mx-4 -mt-4 w-[calc(100%+2rem)] sm:-mx-6 sm:-mt-6 sm:w-[calc(100%+3rem)] md:mx-0 md:mt-0 md:w-full">
											<div
												className={cn(
													"relative w-full overflow-hidden bg-surface-3 md:rounded-3xl",
													PROFILE_COVER_CLASS_NAME,
												)}
											>
												{values.cover_url ? (
													<img
														src={values.cover_url}
														alt=""
														className="size-full object-cover"
													/>
												) : (
													<div className="flex size-full items-center justify-center text-xs text-muted-foreground/50">
														{t("settings.profile.no_cover", "No cover image")}
													</div>
												)}
												<ProfileImageMenu
													kind="cover"
													hasImage={Boolean(values.cover_url)}
													disabled={isSubmitting}
													onChange={(event) =>
														handleFileChange(event, "cover_url")
													}
													onRemove={() => form.setFieldValue("cover_url", "")}
												/>
											</div>
											<div className="pointer-events-none relative z-10 -mt-12 px-4 sm:px-6 md:px-4">
												<div className="pointer-events-auto size-24 rounded-full ring-6 ring-surface-2">
													<div className="relative flex size-full items-center justify-center overflow-hidden rounded-full">
														<UserAvatar user={previewUser} size="2xl" />
														<ProfileImageMenu
															kind="avatar"
															hasImage={Boolean(values.avatar_url)}
															disabled={isSubmitting}
															onChange={(event) =>
																handleFileChange(event, "avatar_url")
															}
															onRemove={() =>
																form.setFieldValue("avatar_url", "")
															}
														/>
													</div>
												</div>
												<div className="pointer-events-auto mt-3">
													<Typography.Paragraph
														size="sm"
														className="font-semibold"
													>
														{values.display_name ||
															t(
																"settings.profile.display_name",
																"Display name",
															)}
													</Typography.Paragraph>
													<Typography.Paragraph
														size="xs"
														className="text-muted-foreground!"
													>
														@
														{values.username ||
															t("settings.profile.username", "username")}
													</Typography.Paragraph>
												</div>
											</div>
										</div>

										<p className="flex flex-wrap gap-x-3 text-xs leading-5 text-muted-foreground">
											<ProfileImageSizeHint />
										</p>
										<FieldGroup>
											<form.Field
												name="display_name"
												children={(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;

													return (
														<Field data-disabled data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>
																{t("auth.display_name.label", "Display name")}
															</FieldLabel>
															<InputGroup>
																<InputGroupAddon>
																	<OutlineUser />
																</InputGroupAddon>
																<InputGroupInput
																	disabled
																	id={field.name}
																	name={field.name}
																	value={field.state.value}
																	onBlur={field.handleBlur}
																	onChange={(event) =>
																		field.handleChange(event.target.value)
																	}
																	aria-invalid={isInvalid}
																	placeholder={t(
																		"auth.display_name.placeholder",
																		"Display name",
																	)}
																	ref={displayNameRef}
																/>
															</InputGroup>
															{isInvalid ? (
																<FieldError errors={field.state.meta.errors} />
															) : null}
														</Field>
													);
												}}
											/>

											<form.Field
												name="username"
												children={(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;

													return (
														<Field data-disabled data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>
																{t("auth.username.label", "Username")}
															</FieldLabel>
															<InputGroup>
																<InputGroupAddon>
																	<OutlineAt />
																</InputGroupAddon>
																<InputGroupInput
																	disabled
																	id={field.name}
																	name={field.name}
																	value={field.state.value}
																	onBlur={field.handleBlur}
																	onChange={(event) =>
																		field.handleChange(event.target.value)
																	}
																	aria-invalid={isInvalid}
																	placeholder={t(
																		"auth.username.placeholder",
																		"Username",
																	)}
																/>
															</InputGroup>
															{isInvalid ? (
																<FieldError errors={field.state.meta.errors} />
															) : null}
														</Field>
													);
												}}
											/>

											<form.Field
												name="bio"
												children={(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;

													return (
														<Field data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>
																{t("auth.bio.label", "Bio")}
															</FieldLabel>
															<InputGroup className="rounded-2xl">
																<InputGroupTextArea
																	id={field.name}
																	name={field.name}
																	value={field.state.value ?? ""}
																	onBlur={field.handleBlur}
																	onChange={(event) =>
																		field.handleChange(event.target.value)
																	}
																	aria-invalid={isInvalid}
																	className={bioClassName}
																	placeholder={t(
																		"auth.bio.placeholder",
																		"Tell us about yourself...",
																	)}
																	maxLength={150}
																/>
															</InputGroup>
															<p className="text-right text-xs tabular-nums text-muted-foreground">
																{field.state.value?.length ?? 0} / 150
															</p>
															{isInvalid ? (
																<FieldError errors={field.state.meta.errors} />
															) : null}
														</Field>
													);
												}}
											/>
										</FieldGroup>
									</div>
								);
							}}
						</form.Subscribe>
					</fieldset>
				)}
			</form.Subscribe>
		</form>
	);
}
