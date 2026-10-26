import { uploadProfileImage } from "@/api/media/profile-media";
import { updateMyProfile, type UpdateProfileRequest } from "@/api/users";
import type { ProfileEditorValues } from "@/components/layout/profile/profile-editor";
import { profileSettingsSchema } from "@/schemas/user/profile";

export async function saveProfileSettings({
	values,
	initialValues,
}: {
	values: ProfileEditorValues;
	initialValues: ProfileEditorValues;
}) {
	const parsed = profileSettingsSchema.parse(values);
	// Reject unsupported edits before uploading or PATCHing to avoid partial saves.
	if (
		parsed.username !== initialValues.username.trim() ||
		parsed.display_name !== initialValues.display_name.trim() ||
		(parsed.accent_color ?? "") !== (initialValues.accent_color ?? "")
	) {
		throw new Error(
			"Username, display name, and accent color changes are not supported by the profile API yet. Restore those fields to save your other changes.",
		);
	}
	for (const field of ["avatar_url", "cover_url"] as const) {
		if (initialValues[field] && !parsed[field]) {
			throw new Error(
				"Removing an existing avatar or cover is not supported by the profile API yet. Restore the image or choose a replacement before saving.",
			);
		}
	}
	const input: UpdateProfileRequest = {};
	if ((parsed.bio ?? "") !== (initialValues.bio ?? ""))
		input.bio = parsed.bio ?? "";
	for (const [field, key] of [
		["avatar_url", "avatarMultimediaId"],
		["cover_url", "coverMultimediaId"],
	] as const) {
		if (parsed[field] && parsed[field] !== initialValues[field]) {
			input[key] = await uploadProfileImage(parsed[field]);
		}
	}
	if (Object.keys(input).length === 0) return null;
	const response = await updateMyProfile(input);
	if (input.bio !== undefined && (response.bio ?? "") !== input.bio) {
		throw new Error("The server returned a different bio than the one submitted. Your edits have been kept; the save could not be confirmed.");
	}
	return response;
}
