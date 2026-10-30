import { OutlineArrowLeft, OutlineCheck } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth";
import { useTranslation } from "react-i18next";

interface CommissionRequestFooterProps {
	onBack: () => void;
	totalPrice: number;
	isPreview?: boolean;
}

export function CommissionRequestFooter({
	onBack,
	totalPrice,
	isPreview = false,
}: CommissionRequestFooterProps) {
	const { t } = useTranslation();
	const { user: currentUser } = useAuth();

	return (
		<div className="z-20 space-y-3 border-t bg-background p-4">
			<div className="flex items-center justify-between rounded-lg bg-secondary/10 px-4 py-2 lg:hidden">
				<div className="text-sm">
					<span className="text-muted-foreground">
						{t("ui.estimated_total", "Estimated Total:")}
					</span>
				</div>
				<div className="font-bold text-lg text-primary">
					~USD {totalPrice.toFixed(2)}
				</div>
			</div>

			<div className="flex flex-col gap-2 rounded-xl border border-secondary  p-3 text-xs">
				<span className="font-semibold">
					{t(
						"ui.request_as_guest_or_sign_up_to",
						"Request as guest, or sign up to:",
					)}
				</span>
				<div className="flex flex-wrap gap-x-4 gap-y-2">
					<div className="flex items-center gap-1.5">
						<OutlineCheck
							size={14}
							className="rounded-full bg-primary p-0.5 text-primary-foreground"
						/>
						<span>{t("ui.track_requests", "Track requests")}</span>
					</div>
					<div className="flex items-center gap-1.5">
						<OutlineCheck
							size={14}
							className="rounded-full bg-primary p-0.5 text-primary-foreground"
						/>
						<span>{t("ui.follow_artists", "Follow artists")}</span>
					</div>
					<div className="flex items-center gap-1.5">
						<OutlineCheck
							size={14}
							className="rounded-full bg-primary p-0.5 text-primary-foreground"
						/>
						<span>{t("ui.priority_support", "Priority support")}</span>
					</div>
				</div>
			</div>
			<div className="flex w-full gap-3">
				{!currentUser ? (
					<>
						<Button variant="ghost" size="xl" onClick={onBack} type="button">
							<OutlineArrowLeft />
							{t("ui.back", "Back")}
						</Button>
						<Button disabled size="xl" className="flex-1" type="button">
							{t("ui.sign_up_login", "Sign up / login")}
						</Button>
						<Button
							disabled
							size="xl"
							variant="outline"
							className="flex-1"
							type={isPreview ? "button" : "submit"}
						>
							{isPreview
								? t("ui.preview_mode", "Preview Mode")
								: t("ui.request_as_guest", "Request as Guest")}
						</Button>
					</>
				) : (
					<>
						<Button variant="ghost" size="xl" onClick={onBack} type="button">
							<OutlineArrowLeft />
							{t("ui.back", "Back")}
						</Button>
						<Button
							disabled
							size="xl"
							className="flex-1"
							type={isPreview ? "button" : "submit"}
						>
							{isPreview
								? t("ui.preview_mode", "Preview Mode")
								: t("ui.request_commission", "Request commission")}
						</Button>
					</>
				)}
			</div>
			<div className="px-4 text-center text-muted-foreground text-xs">
				{t(
					"ui.by_submitting_a_request_you_agree_to_terms_of_service_and_acknowledge_you_v",
					"By submitting a request, you agree to Terms of Service and acknowledge you've read our Privacy Policy.",
				)}
			</div>
		</div>
	);
}
