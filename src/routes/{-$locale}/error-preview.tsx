import { createFileRoute } from "@tanstack/react-router";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { ErrorPage } from "@/components/layout/error-page";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const examples = [
	"530",
	"500",
	"404",
	"400",
	"401",
	"403",
	"410",
	"429",
	"502",
	"503",
	"504",
	"network",
	"update",
	"unknown",
] as const;
type Example = (typeof examples)[number];

function parseExample(value: unknown): Example {
	const candidate =
		typeof value === "number" || typeof value === "string" ? String(value) : "";
	return examples.includes(candidate as Example)
		? (candidate as Example)
		: "530";
}

export const Route = createFileRoute("/{-$locale}/error-preview")({
	validateSearch: (search: Record<string, unknown>) => ({
		type: parseExample(search.type),
	}),
	component: ErrorPreview,
});

function exampleError(type: Example): unknown {
	if (type === "network") return { name: "ApiNetworkError" };
	if (type === "update")
		return new Error("Failed to fetch dynamically imported module");
	if (type === "unknown") return new Error("Preview error");
	return { status: Number(type) };
}

function ErrorPreview() {
	const { type } = Route.useSearch();
	const navigate = Route.useNavigate();
	const { t } = useTranslation();
	const selectId = useId();
	const [retried, setRetried] = useState<Example | null>(null);
	const label = (example: Example) => {
		if (example === "network") return t("error_pages.connection");
		if (example === "update") return t("error_pages.page_update");
		if (example === "unknown") return t("error_pages.unexpected");
		return t("error_pages.status", { status: example });
	};

	return (
		<div className="flex min-h-dvh flex-col bg-background">
			<div className="shrink-0 border-b bg-background">
				<div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8">
					<div className="min-w-0">
						<p className="text-sm font-semibold">{t("error_preview.title")}</p>
						<p className="mt-1 text-sm text-muted-foreground">
							{t("error_preview.description")}
						</p>
					</div>
					<div className="w-full shrink-0 sm:w-60">
						<label htmlFor={selectId} className="sr-only">
							{t("error_preview.type")}
						</label>
						<Select
							value={type}
							onValueChange={(value) => {
								setRetried(null);
								void navigate({
									search: { type: parseExample(value) },
									replace: true,
									resetScroll: false,
								});
							}}
						>
							<SelectTrigger id={selectId} className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent position="popper" align="end">
								{examples.map((example) => (
									<SelectItem key={example} value={example}>
										{label(example)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>
			<ErrorPage
				key={type}
				className="min-h-0"
				error={exampleError(type)}
				onRetry={async () => {
					await new Promise((resolve) => window.setTimeout(resolve, 600));
					setRetried(type);
				}}
			/>
			<p
				role="status"
				className="mx-auto max-w-3xl shrink-0 px-5 pb-6 text-center text-xs leading-relaxed text-muted-foreground"
			>
				{retried === type
					? t("error_preview.retried")
					: t("error_preview.hint")}
			</p>
		</div>
	);
}
