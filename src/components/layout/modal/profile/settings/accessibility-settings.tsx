import { CheckCircle2, TriangleAlert } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	type AccessibilityPreferences,
	COLOR_OPTIONS,
	DEFAULT_ACCESSIBILITY,
	FONT_OPTIONS,
	GUIDE_HEIGHTS,
	saveAccessibility,
	TEXT_SIZES,
	useAccessibility,
} from "@/lib/accessibility";

export function AccessibilitySettings({
	onSubmit,
}: {
	onSubmit?: () => void | Promise<void>;
}) {
	const { t } = useTranslation();
	const saved = useAccessibility();
	const [draft, setDraft] = useState<AccessibilityPreferences>(saved);
	const id = useId();
	useEffect(() => setDraft(saved), [saved]);
	const update = <K extends keyof AccessibilityPreferences>(
		key: K,
		value: AccessibilityPreferences[K],
	) => setDraft((old) => ({ ...old, [key]: value }));
	const toggles = [
		"reduceMotion",
		"highContrast",
		"underlineLinks",
		"spaciousText",
	] as const;
	return (
		<form
			id="accessibility-settings-form"
			className="space-y-6 [overflow-wrap:anywhere]"
			onSubmit={async (event) => {
				event.preventDefault();
				const persisted = saveAccessibility(draft);
				if (persisted) toast.success(t("accessibility.saved"));
				else toast.info(t("accessibility.session_only"));
				await onSubmit?.();
			}}
		>
			<section className="space-y-5 rounded-2xl border bg-card p-4 sm:p-5">
				<div>
					<h2 className="font-semibold text-foreground">
						{t("accessibility.reading")}
					</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						{t("accessibility.save_hint")}
					</p>
				</div>
				<PreferenceSelect
					id={`${id}-font`}
					label={t("accessibility.font")}
					description={t("accessibility.font_help")}
					value={draft.font}
					onChange={(value) =>
						update("font", value as AccessibilityPreferences["font"])
					}
					options={FONT_OPTIONS.map((value) => ({
						value,
						label: t(`accessibility.font_${value}`),
					}))}
				/>
				<PreferenceSelect
					id={`${id}-size`}
					label={t("accessibility.text_size")}
					value={String(draft.textSize)}
					onChange={(value) =>
						update(
							"textSize",
							Number(value) as AccessibilityPreferences["textSize"],
						)
					}
					options={TEXT_SIZES.map((value) => ({
						value: String(value),
						label: `${value}%`,
					}))}
				/>
				<div
					className="rounded-xl border bg-muted/40 p-4 text-sm"
					style={{
						fontFamily:
							draft.font === "dyslexic"
								? "OpenDyslexic, sans-serif"
								: draft.font === "system"
									? "system-ui, sans-serif"
									: undefined,
						fontSize: (16 * draft.textSize) / 100,
						lineHeight: draft.spaciousText ? 1.8 : 1.5,
					}}
				>
					<p className="font-medium text-foreground">
						{t("accessibility.preview_title")}
					</p>
					<p className="mt-2">{t("accessibility.preview_text")}</p>
				</div>
			</section>
			<section className="space-y-5 rounded-2xl border bg-card p-4 sm:p-5">
				<h2 className="font-semibold text-foreground">
					{t("accessibility.vision")}
				</h2>
				<PreferenceSelect
					id={`${id}-color`}
					label={t("accessibility.color_vision")}
					description={t("accessibility.color_help")}
					value={draft.colorVision}
					onChange={(value) =>
						update(
							"colorVision",
							value as AccessibilityPreferences["colorVision"],
						)
					}
					options={COLOR_OPTIONS.map((value) => ({
						value,
						label: t(`accessibility.color_${value}`),
					}))}
				/>
				<div className="flex flex-wrap gap-3 text-sm">
					<span className="inline-flex items-center gap-2">
						<CheckCircle2 className="size-4 text-accent" />
						{t("accessibility.sample_complete")}
					</span>
					<span className="inline-flex items-center gap-2">
						<TriangleAlert className="size-4 text-destructive" />
						{t("accessibility.sample_attention")}
					</span>
				</div>
				{toggles.map((key) => (
					<div
						key={key}
						className="flex items-center justify-between gap-4 border-t pt-4"
					>
						<div className="min-w-0">
							<label htmlFor={id + key} className="text-sm font-medium">
								{t(`accessibility.${key}`)}
							</label>
							<p
								id={`${id + key}-help`}
								className="mt-1 text-sm text-muted-foreground"
							>
								{t(`accessibility.${key}_help`)}
							</p>
						</div>
						<div className="flex h-10 shrink-0 items-center">
							<Switch
								id={id + key}
								aria-describedby={`${id + key}-help`}
								checked={draft[key]}
								onCheckedChange={(value) => update(key, value)}
							/>
						</div>
					</div>
				))}
			</section>
			<section className="space-y-5 rounded-2xl border bg-card p-4 sm:p-5">
				<div className="flex items-center justify-between gap-4">
					<div>
						<label
							htmlFor={`${id}-guide`}
							className="font-semibold text-foreground"
						>
							{t("accessibility.guide_title")}
						</label>
						<p
							id={`${id}-guide-help`}
							className="mt-1 text-sm text-muted-foreground"
						>
							{t("accessibility.guide_help")}
						</p>
					</div>
					<div className="flex h-10 shrink-0 items-center">
						<Switch
							id={`${id}-guide`}
							aria-describedby={`${id}-guide-help`}
							checked={draft.readingGuide}
							onCheckedChange={(value) => update("readingGuide", value)}
						/>
					</div>
				</div>
				<PreferenceSelect
					id={`${id}-guide-height`}
					label={t("accessibility.guide_height")}
					value={String(draft.guideHeight)}
					onChange={(value) =>
						update(
							"guideHeight",
							Number(value) as AccessibilityPreferences["guideHeight"],
						)
					}
					options={GUIDE_HEIGHTS.map((value) => ({
						value: String(value),
						label: t("accessibility.guide_pixels", { height: value }),
					}))}
				/>
			</section>
			<Button
				type="button"
				variant="outline"
				className="h-auto min-h-10 max-w-full whitespace-normal lg:min-h-9"
				onClick={() => setDraft({ ...DEFAULT_ACCESSIBILITY })}
			>
				{t("accessibility.reset")}
			</Button>
		</form>
	);
}
function PreferenceSelect({
	id,
	label,
	description,
	value,
	onChange,
	options,
}: {
	id: string;
	label: string;
	description?: string;
	value: string;
	onChange: (value: string) => void;
	options: { value: string; label: string }[];
}) {
	return (
		<div className="space-y-2">
			<label htmlFor={id} className="text-sm font-medium">
				{label}
			</label>
			{description && (
				<p id={`${id}-help`} className="text-sm text-muted-foreground">
					{description}
				</p>
			)}
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger
					id={id}
					aria-describedby={description ? `${id}-help` : undefined}
					className="h-auto! min-h-10 w-full min-w-0 whitespace-normal text-left lg:min-h-9 [&_[data-slot=select-value]]:line-clamp-none"
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent position="popper" className="max-w-[calc(100vw-2rem)]">
					{options.map((option) => (
						<SelectItem
							key={option.value}
							value={option.value}
							className="min-h-10 lg:min-h-9"
						>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
