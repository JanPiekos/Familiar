import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	OutlineLink,
	SolidInstagram,
	SolidTwitter,
} from "@/components/icons/icons";
import { buttonVariants } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { UserSocial, UserSocials } from "@/types/user";

type SocialPlatformDetails = {
	label: string;
	icon: typeof OutlineLink;
	baseUrl?: string;
};

const SOCIAL_PLATFORM_DETAILS: Record<string, SocialPlatformDetails> = {
	TWITTER: {
		label: "Twitter",
		icon: SolidTwitter,
		baseUrl: "https://x.com/",
	},
	X: {
		label: "X",
		icon: SolidTwitter,
		baseUrl: "https://x.com/",
	},
	INSTAGRAM: {
		label: "Instagram",
		icon: SolidInstagram,
		baseUrl: "https://instagram.com/",
	},
	FACEBOOK: {
		label: "Facebook",
		icon: OutlineLink,
		baseUrl: "https://facebook.com/",
	},
	WEBSITE: {
		label: "Website",
		icon: OutlineLink,
	},
	WEBSITE_1: {
		label: "Website",
		icon: OutlineLink,
	},
	WEBSITE_2: {
		label: "Website",
		icon: OutlineLink,
	},
};

// Only known support sites get colored chips; ordinary websites stay neutral.
const DONATION_PLATFORMS: Record<string, string> = {
	"ko-fi.com": "Ko-fi",
	"buymeacoffee.com": "Buy Me a Coffee",
	"patreon.com": "Patreon",
	"paypal.me": "PayPal",
	"liberapay.com": "Liberapay",
	"opencollective.com": "Open Collective",
	"donate.stripe.com": "Stripe",
};

function getDonationPlatform(url: URL) {
	const host = url.hostname.replace(/^www\./, "");
	if (
		host === "paypal.com" &&
		/^\/(?:donate|paypalme)(?:\/|$)/.test(url.pathname)
	) {
		return "PayPal";
	}
	return DONATION_PLATFORMS[host];
}

function WebsiteFavicon({
	url,
	fallback: Fallback,
}: {
	url: URL;
	fallback: typeof OutlineLink;
}) {
	const [failed, setFailed] = useState(false);
	if (failed) return <Fallback className="size-4" />;
	// Request only the public hostname, without the profile path or query string.
	const query = new URLSearchParams({ domain: url.hostname, sz: "32" });
	return (
		<img
			src={`https://www.google.com/s2/favicons?${query}`}
			alt=""
			width={16}
			height={16}
			loading="lazy"
			decoding="async"
			referrerPolicy="no-referrer"
			onError={() => setFailed(true)}
			className="size-4 shrink-0 rounded-full object-cover"
		/>
	);
}
function getPlatformDetails(platform: string): SocialPlatformDetails {
	const normalizedPlatform = platform.trim().toUpperCase();
	return (
		SOCIAL_PLATFORM_DETAILS[normalizedPlatform] ?? {
			label: normalizedPlatform
				.toLowerCase()
				.replace(/_/g, " ")
				.replace(/^\w/, (character) => character.toUpperCase()),
			icon: OutlineLink,
		}
	);
}

function getSocialUrl(
	{ value }: UserSocial,
	details: SocialPlatformDetails,
): URL | null {
	const normalizedValue = value.trim();
	if (!normalizedValue) return null;
	// Dots are valid in Instagram handles; only treat them as URLs when
	// they include a path or match a known social platform domain.
	const isBareWebUrl =
		/^[\w.-]+\.[a-z]{2,}[/?#]/i.test(normalizedValue) ||
		/^(?:www\.)?(?:x\.com|twitter\.com|instagram\.com|facebook\.com)$/i.test(
			normalizedValue,
		);
	let candidate: string;
	if (/^https?:\/\//i.test(normalizedValue)) {
		candidate = normalizedValue;
	} else if (/^[a-z][a-z\d+.-]*:/i.test(normalizedValue)) {
		return null;
	} else if (normalizedValue.startsWith("//")) {
		candidate = `https:${normalizedValue}`;
	} else if (details.baseUrl && !isBareWebUrl) {
		candidate = `${details.baseUrl}${normalizedValue.replace(/^@/, "")}`;
	} else {
		candidate = `https://${normalizedValue.replace(/^\/+/, "")}`;
	}
	try {
		const url = new URL(candidate);
		return url.hostname && !url.username && !url.password ? url : null;
	} catch {
		return null;
	}
}

export function ProfileSocials({ socials }: { socials: UserSocials }) {
	const { t } = useTranslation();
	const links = socials.flatMap((social) => {
		const details = getPlatformDetails(social.platform);
		const url = getSocialUrl(social, details);
		return url ? [{ social, details, url }] : [];
	});
	if (links.length === 0) return null;

	return (
		<div className="flex min-w-0 flex-wrap items-center gap-1.5">
			{links.map(({ social, details, url }) => {
				const donationPlatform = getDonationPlatform(url);
				const label =
					donationPlatform ??
					(details.label === "Website"
						? t("ui.website", "Website")
						: details.label);
				const suffix =
					url.pathname === "/" && !url.search && !url.hash
						? ""
						: `${url.pathname}${url.search}${url.hash}`;
				return (
					<Tooltip
						key={`${social.platform}-${social.value}`}
						delayDuration={150}
					>
						<TooltipTrigger asChild>
							<a
								href={url.href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`${label}: ${url.href}`}
								className={cn(
									buttonVariants({ variant: "secondary", size: "sm" }),
									"h-8 min-w-0 max-w-full shrink gap-1.5 rounded-full bg-primary/6 px-2.5 text-xs font-medium text-foreground hover:bg-primary/10",
									donationPlatform &&
										"bg-emerald-700 font-semibold text-white hover:bg-emerald-800",
								)}
							>
								<span
									aria-hidden="true"
									className="inline-flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-slate-600"
								>
									<WebsiteFavicon
										key={url.hostname}
										url={url}
										fallback={details.icon}
									/>
								</span>
								<span className="truncate">{label}</span>
								<ArrowUpRight
									aria-hidden="true"
									className={cn(
										"size-3 shrink-0",
										donationPlatform
											? "text-white/80"
											: "text-muted-foreground",
									)}
								/>
							</a>
						</TooltipTrigger>
						<TooltipContent
							side="top"
							align="start"
							sideOffset={8}
							aria-label={url.href}
							className="max-w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-border bg-popover px-3 py-2 text-left text-sm leading-relaxed text-popover-foreground shadow-lg [overflow-wrap:anywhere] [&_svg]:bg-popover [&_svg]:fill-popover"
						>
							<strong className="font-semibold">{url.host}</strong>
							<span>{suffix}</span>
						</TooltipContent>
					</Tooltip>
				);
			})}
		</div>
	);
}
