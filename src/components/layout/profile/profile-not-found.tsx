import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, Home, UserRoundSearch } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import { EmbeddedRouteNotFoundPage } from "@/components/layout/error-page";
import { Button } from "@/components/ui/button";
import { detectLocaleFromPathOrParams, localizePath } from "@/lib/i18n";
import { getMissingProfileUsername } from "@/lib/page-error";

export function ProfileNotFoundPage({ data }: { data?: unknown }) {
	const username = getMissingProfileUsername(data);
	return username ? (
		<MissingProfile username={username} />
	) : (
		<EmbeddedRouteNotFoundPage />
	);
}

function MissingProfile({ username }: { username: string }) {
	const router = useRouter();
	const { i18n } = useTranslation();
	const locale =
		detectLocaleFromPathOrParams({}, router.state.location.pathname) ??
		i18n.language;
	const t = i18n.getFixedT(locale);
	const titleId = useId();
	const heading = useRef<HTMLHeadingElement>(null);
	useEffect(() => {
		heading.current?.focus({ preventScroll: true });
	}, []);

	return (
		<section
			aria-labelledby={titleId}
			className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-12 text-center text-foreground sm:px-8"
		>
			<div className="flex size-24 shrink-0 items-center justify-center rounded-full border border-dashed border-border bg-secondary/50 text-muted-foreground">
				<UserRoundSearch className="size-10 stroke-[1.5]" aria-hidden="true" />
			</div>
			<p
				dir="auto"
				className="mt-6 max-w-full break-all rounded-2xl bg-secondary/60 px-4 py-2 text-sm font-medium text-secondary-foreground"
			>
				@{username}
			</p>
			<h1
				id={titleId}
				ref={heading}
				tabIndex={-1}
				className="mt-4 text-balance text-3xl font-semibold tracking-tight outline-none sm:text-4xl"
			>
				{t("error_pages.profile_not_found.title")}
			</h1>
			<p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
				{t("error_pages.profile_not_found.description")}
			</p>
			<div className="mt-8 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
				{router.history.canGoBack() && (
					<Button
						size="2xl"
						variant="outline"
						onClick={() => router.history.back()}
					>
						<ArrowLeft aria-hidden="true" />
						{t("error_pages.back")}
					</Button>
				)}
				<Button asChild size="2xl">
					<a href={localizePath("/", locale)}>
						<Home aria-hidden="true" />
						{t("error_pages.home")}
					</a>
				</Button>
			</div>
		</section>
	);
}
