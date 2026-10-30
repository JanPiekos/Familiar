import type { ChangeEvent } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { OutlineEdit, OutlineTrash } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileImageMenu({
	kind,
	hasImage,
	disabled,
	onChange,
	onRemove,
}: {
	kind: "avatar" | "cover";
	hasImage: boolean;
	disabled: boolean;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onRemove: () => void;
}) {
	const { t } = useTranslation();
	const inputRef = useRef<HTMLInputElement>(null);
	const isAvatar = kind === "avatar";
	const editLabel = isAvatar
		? t("settings.profile.edit_avatar", "Edit profile picture")
		: t("settings.profile.edit_cover", "Edit cover image");
	const changeLabel = isAvatar
		? t("settings.profile.change_avatar", "Change profile picture")
		: t("settings.profile.change_cover", "Change cover image");
	const removeLabel = isAvatar
		? t("settings.profile.remove_avatar", "Remove profile picture")
		: t("settings.profile.remove_cover", "Remove cover image");

	return (
		<>
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				className="hidden"
				aria-label={changeLabel}
				disabled={disabled}
				onChange={onChange}
			/>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						disabled={disabled}
						aria-label={editLabel}
						className={
							isAvatar
								? "absolute inset-0 size-full rounded-full p-0 hover:bg-black/10 focus-visible:bg-black/10 aria-expanded:bg-black/10"
								: "absolute right-3 bottom-3 size-10 rounded-full bg-black/50 p-0 text-white hover:text-white focus-visible:text-white aria-expanded:text-white backdrop-blur-sm hover:bg-black/70 focus-visible:bg-black/70 aria-expanded:bg-black/70"
						}
					>
						{isAvatar ? (
							<span className="absolute inset-x-0 bottom-0 flex h-8 items-center justify-center bg-black/50 text-white backdrop-blur-sm">
								<OutlineEdit />
							</span>
						) : (
							<OutlineEdit />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align={isAvatar ? "start" : "end"}
					className="z-100 min-w-52"
				>
					<DropdownMenuItem
						disabled={disabled}
						onSelect={() => inputRef.current?.click()}
					>
						<OutlineEdit />
						{changeLabel}
					</DropdownMenuItem>
					{hasImage && (
						<DropdownMenuItem
							disabled={disabled}
							variant="destructive"
							onSelect={onRemove}
						>
							<OutlineTrash />
							{removeLabel}
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
