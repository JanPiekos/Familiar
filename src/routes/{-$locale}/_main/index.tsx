import { Surface } from "@heroui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FlaskConical, KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SolidLogo } from "@/components/icons/assets/logo/logo";
import { Button } from "@/components/ui/button";
import { localizePath } from "@/lib/i18n";
import { useAuth } from "@/providers/auth";

export const Route = createFileRoute("/{-$locale}/_main/")({
	component: HomePage,
});

export function HomePage() {
	const { t, i18n } = useTranslation();
	const { user } = useAuth();
	const profilePath = user?.username
		? `/user/${encodeURIComponent(user.username)}`
		: null;

	return (
		<section
			className="flex flex-1 flex-col justify-center gap-5 px-4 py-6 sm:px-6 lg:px-0 lg:py-8"
			aria-labelledby="home-title"
		>
			<Surface className="overflow-hidden rounded-[2rem] border border-border">
				<div className="grid md:grid-cols-[1.2fr_0.8fr]">
					<div className="flex flex-col items-start p-6 sm:p-10 xl:p-12">
						<div className="flex w-full items-center justify-between gap-4">
							<Surface
								variant="secondary"
								className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium"
							>
								<span
									aria-hidden="true"
									className="size-1.5 rounded-full bg-amber-500"
								/>
								{t("pages.home.beta")}
							</Surface>
							<SolidLogo
								size={32}
								className="text-primary md:hidden"
								aria-hidden="true"
							/>
						</div>
						<h1
							id="home-title"
							className="mt-7 max-w-xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl xl:text-6xl"
						>
							{t("pages.home.title")}
						</h1>
						<p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-foreground/70 sm:text-lg">
							{t("pages.home.description")}
						</p>
						<div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
							<Button asChild size="2xl" className="h-12 px-6">
								<Link
									to={localizePath(profilePath ?? "/auth/login", i18n.language)}
								>
									{t(profilePath ? "pages.home.profile" : "pages.home.sign_in")}
									<ArrowRight aria-hidden="true" />
								</Link>
							</Button>
							{!profilePath && (
								<Button
									asChild
									size="2xl"
									variant="outline"
									className="h-12 px-6"
								>
									<Link to={localizePath("/auth/register", i18n.language)}>
										{t("pages.home.invitation")}
									</Link>
								</Button>
							)}
						</div>
						<p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-foreground/60">
							<KeyRound aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
							{t(
								profilePath
									? "pages.home.welcome_back"
									: "pages.home.invitation_only",
							)}
						</p>
					</div>
					<Surface
						variant="secondary"
						className="relative isolate hidden flex-col items-center justify-center overflow-hidden border-l border-border p-8 md:flex"
					>
						<div
							aria-hidden="true"
							className="pointer-events-none absolute size-[30rem] rounded-full border border-border"
						/>
						<div
							aria-hidden="true"
							className="pointer-events-none absolute size-[22rem] rounded-full border border-border"
						/>
						<SolidLogo
							size={224}
							className="relative h-60 w-44 text-primary"
							aria-hidden="true"
						/>
						<p className="relative mt-8 max-w-48 text-balance text-center text-sm font-medium text-foreground/70">
							{t("pages.home.brand_note")}
						</p>
					</Surface>
				</div>
			</Surface>
			<Surface
				variant="secondary"
				className="flex items-start gap-4 rounded-3xl border border-border p-5 sm:p-6"
			>
				<Surface
					className="flex size-10 shrink-0 items-center justify-center rounded-full"
					aria-hidden="true"
				>
					<FlaskConical className="size-5" />
				</Surface>
				<div>
					<h2 className="font-semibold text-foreground">
						{t("pages.home.testing_title")}
					</h2>
					<p className="mt-1 max-w-3xl text-sm leading-relaxed text-foreground/70">
						{t("pages.home.testing_description")}
					</p>
				</div>
			</Surface>
		</section>
	);
}
