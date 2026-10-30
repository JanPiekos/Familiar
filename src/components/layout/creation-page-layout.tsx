import { ArrowLeft } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function CreationPageLayout({
	title,
	description,
	onBack,
	isBusy,
	children,
	footer,
}: {
	title: string;
	description?: string;
	onBack: () => void;
	isBusy: boolean;
	children: ReactNode;
	footer: ReactNode;
}) {
	const { t } = useTranslation();
	const heading = useRef<HTMLHeadingElement>(null);
	useEffect(() => {
		window.scrollTo(0, 0);
		heading.current?.focus({ preventScroll: true });
	}, []);
	return (
		<div className="min-h-dvh bg-background text-foreground">
			<header className="sticky top-0 z-40 border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
				<div className="mx-auto flex min-h-16 w-full max-w-3xl items-center gap-3 px-4 py-3">
					<Button
						type="button"
						variant="ghost"
						size="icon-xl"
						disabled={isBusy}
						onClick={onBack}
						aria-label={t("ui.back", "Back")}
					>
						<ArrowLeft aria-hidden="true" />
					</Button>
					<h1
						ref={heading}
						tabIndex={-1}
						className="min-w-0 text-lg font-semibold outline-none"
					>
						{title}
					</h1>
				</div>
			</header>
			<main className="mx-auto w-full max-w-3xl [&_input]:text-base [&_textarea]:text-base pb-[calc(5rem+max(1rem,env(safe-area-inset-bottom)))]">
				{description && (
					<p className="px-4 pt-5 text-sm leading-relaxed text-muted-foreground">
						{description}
					</p>
				)}
				{children}
			</main>
			<footer className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-xl">
				<div className="mx-auto w-full max-w-3xl [&_button]:h-11 [&_button]:flex-1">
					{footer}
				</div>
			</footer>
		</div>
	);
}
