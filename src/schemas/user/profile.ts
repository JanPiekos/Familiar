import { z } from "zod";

const username = z
	.string()
	.trim()
	.refine(
		(value) => value.length === 0 || /^[a-zA-Z0-9_]{3,32}$/.test(value),
		"Username must be 3-32 characters and contain only letters, numbers, and underscores.",
	);

const displayName = z
	.string()
	.trim()
	.max(100, "Display name must be at most 100 characters.");

const bio = z.string().trim().max(150, "Bio must be at most 150 characters.");

// Shared by registration and settings so the rules cannot drift.
export const profileFieldsSchema = z.object({
	username,
	display_name: displayName,
	bio,
});

export const profileSettingsSchema = profileFieldsSchema.extend({
	bio: bio.optional(),
	avatar_url: z.string().optional(),
	cover_url: z.string().optional(),
	accent_color: z.string().optional(),
});
