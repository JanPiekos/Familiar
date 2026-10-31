import { useMemo } from "react";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserAccentStylesFromHex } from "@/lib/colors";
import type { TUserResponse } from "@/types/user";
import { useTranslation } from "react-i18next";

const PROFILE_COVER_CLASS_NAME =
	"relative h-48 w-full overflow-hidden rounded-none ring-1 ring-ring/30 md:h-72 lg:rounded-3xl";

const imageCache = new Map<string, Promise<void> | true>();

function useImagePreload(src?: string | null) {
	if (!src) return;

	const status = imageCache.get(src);

	if (status === true) return;

	if (status instanceof Promise) throw status;

	const promise = new Promise<void>((resolve) => {
		const img = new Image();
		img.src = src;
		img.onload = () => {
			imageCache.set(src, true);
			resolve();
		};
		img.onerror = () => {
			imageCache.set(src, true);
			resolve();
		};
	});

	imageCache.set(src, promise);
	throw promise;
}

function ProfileCover({ user }: { user: TUserResponse }) {
	const { t } = useTranslation();
	useImagePreload(user.coverPath);

	const { coverBgStyle } = useMemo(
		() => getUserAccentStylesFromHex(user.accentColor),
		[user.accentColor, t],
	);
	const alt = t("ui.value0_cover", { value0: user.username });

	return (
		<div className={PROFILE_COVER_CLASS_NAME} style={coverBgStyle}>
			{/* TODO: add webm (animated) support */}
			{user.coverPath && (
				<ImageZoom
					src={user.coverPath}
					alt={alt}
					className="block size-full rounded-[inherit]"
				>
					<img
						src={user.coverPath}
						alt={alt}
						className="h-full w-full object-cover"
					/>
				</ImageZoom>
			)}
		</div>
	);
}

function ProfileCoverSkeleton() {
	return <Skeleton className={PROFILE_COVER_CLASS_NAME} />;
}

export { ProfileCover, ProfileCoverSkeleton };
