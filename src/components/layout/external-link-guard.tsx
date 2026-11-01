import { Surface } from "@heroui/react";
import { ArrowUpRight, ExternalLink, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/** One listener also covers links rendered in markdown, menus and dialog portals. */
export function ExternalLinkGuard() {
	const { t } = useTranslation();
	const [destination, setDestination] = useState<URL | null>(null);
	const [open, setOpen] = useState(false);
	const source = useRef<HTMLAnchorElement | null>(null);

	useEffect(() => {
		const intercept = (event: MouseEvent) => {
			if (event.defaultPrevented || event.button > 1) return;
			if (event.type === "auxclick" && event.button !== 1) return;
			const link =
				event.target instanceof Element
					? event.target.closest<HTMLAnchorElement>("a[href]")
					: null;
			if (!link || link.hasAttribute("download")) return;
			let url: URL;
			try {
				url = new URL(link.href, window.location.href);
			} catch {
				return;
			}
			if (
				!/^https?:$/.test(url.protocol) ||
				url.origin === window.location.origin
			)
				return;

			event.preventDefault();
			event.stopPropagation();
			source.current = link;
			setDestination(url);
			setOpen(true);
		};
		document.addEventListener("click", intercept, true);
		document.addEventListener("auxclick", intercept, true);
		return () => {
			document.removeEventListener("click", intercept, true);
			document.removeEventListener("auxclick", intercept, true);
		};
	}, []);

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent
				className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-3xl p-0"
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					if (source.current?.isConnected)
						source.current.focus({ preventScroll: true });
				}}
			>
				<Surface className="flex min-h-0 flex-col overflow-hidden rounded-[inherit]">
					<AlertDialogHeader className="block shrink-0 space-y-3 p-6 pb-0 text-left">
						<Surface
							variant="secondary"
							className="flex size-12 items-center justify-center rounded-full"
							aria-hidden="true"
						>
							<ExternalLink className="size-5" />
						</Surface>
						<AlertDialogTitle className="text-xl text-foreground">
							{t("external_link_guard.title")}
						</AlertDialogTitle>
						<AlertDialogDescription className="leading-relaxed text-foreground/80">
							{t("external_link_guard.description")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain p-6">
						<Surface
							variant="secondary"
							className="rounded-2xl border border-border p-4"
						>
							<p className="mb-2 text-xs font-medium text-foreground/70">
								{t("external_link_guard.destination")}
							</p>
							<p
								dir="ltr"
								className="break-all text-base font-semibold text-foreground"
							>
								{destination?.host}
							</p>
							<p
								dir="ltr"
								className="mt-1 break-all text-sm text-foreground/80"
							>
								{destination?.href}
							</p>
						</Surface>
						<Surface
							variant="secondary"
							className="flex items-start gap-3 rounded-2xl border border-border p-4"
						>
							<ShieldCheck
								className="mt-0.5 size-5 shrink-0"
								aria-hidden="true"
							/>
							<div className="space-y-1.5 text-sm">
								<p className="font-medium text-foreground">
									{t("external_link_guard.safety_title")}
								</p>
								<p className="leading-relaxed">
									{t("external_link_guard.safety_description")}
								</p>
							</div>
						</Surface>
					</div>
					<Surface className="shrink-0">
						<AlertDialogFooter className="p-4">
							<AlertDialogCancel size="xl" className="h-12 min-w-0">
								{t("external_link_guard.stay")}
							</AlertDialogCancel>
							<AlertDialogAction
								size="xl"
								className="h-12 min-w-0"
								onClick={() => {
									if (destination)
										window.open(
											destination.href,
											"_blank",
											"noopener,noreferrer",
										);
								}}
							>
								{t("external_link_guard.continue")}
								<ArrowUpRight aria-hidden="true" />
							</AlertDialogAction>
						</AlertDialogFooter>
					</Surface>
				</Surface>
			</AlertDialogContent>
		</AlertDialog>
	);
}
