import type { ReactNode } from "react";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { OutlineCalendar, OutlineClose } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import type { TUserProfile } from "@/types/user";
import UserAvatar from "./avatar";
import { ProfileBio } from "./bio";
import { ProfileSocials } from "./socials";

function SectionLabel({ children }: { children: ReactNode }) {
	return (
		<h4 className="mb-3 text-xs font-medium text-muted-foreground">
			{children}
		</h4>
	);
}

export const ProfileDetailsContent = memo(function ProfileDetailsContent({
	user,
}: {
	user: TUserProfile;
}) {
	const { t, i18n } = useTranslation();
	const name = user.displayName || user.username;
	const createdAt = user.createdAt ? new Date(user.createdAt) : null;
	const joinDate =
		createdAt && !Number.isNaN(createdAt.getTime())
			? new Intl.DateTimeFormat(
					i18n.resolvedLanguage || i18n.language || "en",
					{ month: "long", year: "numeric" },
				).format(createdAt)
			: null;

	return (
		<DialogContent
			showCloseButton={false}
			className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg! flex-col gap-0 overflow-hidden rounded-3xl bg-card p-0 text-foreground [color-scheme:light] dark:[color-scheme:dark]"
		>
			<header className="flex shrink-0 items-center justify-between gap-4 border-b px-5 py-4 sm:px-6">
				<DialogTitle className="text-base leading-snug font-semibold text-foreground">
					{t("components.profile.info.about_me")}
				</DialogTitle>
				<DialogDescription className="sr-only">
					{t("components.profile.details.description", { name })}
				</DialogDescription>
				<DialogClose asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon-xl"
						className="-mr-2"
						aria-label={t("ui.close")}
					>
						<OutlineClose aria-hidden="true" />
					</Button>
				</DialogClose>
			</header>
			<div className="min-h-0 space-y-6 overflow-y-auto overscroll-contain p-5 sm:p-6">
				<div>
					<div className="flex items-center gap-4">
						<UserAvatar user={user} size="xl" />
						<div className="min-w-0 flex-1">
							<h3 className="break-words text-xl leading-snug font-semibold text-foreground sm:text-2xl">
								{name}
							</h3>
							<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground [overflow-wrap:anywhere]">
								<span>@{user.username}</span>
								{user.pronouns && (
									<>
										<span aria-hidden="true">·</span>
										<span>{user.pronouns}</span>
									</>
								)}
							</div>
						</div>
					</div>
					{joinDate && (
						<p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
							<OutlineCalendar aria-hidden="true" className="size-4 shrink-0" />
							<span>
								{t("components.profile.details.joined")} {joinDate}
							</span>
						</p>
					)}
				</div>
				{user.bio?.trim() && (
					<section aria-label={t("components.profile.details.bio")}>
						<SectionLabel>{t("components.profile.details.bio")}</SectionLabel>
						<ProfileBio
							user={user}
							className="text-sm leading-relaxed text-foreground [overflow-wrap:anywhere] prose-headings:text-foreground prose-strong:text-foreground"
						/>
					</section>
				)}
				{user.socials.length > 0 && (
					<section aria-label={t("components.profile.details.links")}>
						<SectionLabel>{t("components.profile.details.links")}</SectionLabel>
						<ProfileSocials socials={user.socials} />
					</section>
				)}
			</div>
		</DialogContent>
	);
});
