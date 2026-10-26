import { describe, expect, it } from "vitest";
import { register } from "@/schemas/auth/register";
import { profileSettingsSchema } from "@/schemas/user/profile";

const profile = { username: "artist_1", display_name: "Artist", bio: "" };
const registration = {
	account_type: "client",
	email: "artist@example.com",
	password: "secret1",
	confirm_password: "secret1",
	invite_key: "FAM-ABCD-1234-ABC",
	socials: {},
};

describe("shared registration and profile settings validation", () => {
	const cases = [
		["username", "ab", false],
		["username", "abc", true],
		["username", "a".repeat(32), true],
		["username", "a".repeat(33), false],
		["username", "artist.name", false],
		["username", "artist-name", false],
		["username", "artist+name", false],
		["username", "artist_name", true],
		["username", "", true],
		["display_name", "A", true],
		["display_name", "A".repeat(100), true],
		["display_name", "A".repeat(101), false],
		["bio", "a".repeat(150), true],
		["bio", "a".repeat(151), false],
	] as const;
	for (const [field, value, valid] of cases) {
		it(`${field}: ${JSON.stringify(value)} is ${valid ? "accepted" : "rejected"} in both forms`, () => {
			const values = { ...profile, [field]: value };
			expect(register.safeParse({ ...registration, ...values }).success).toBe(
				valid,
			);
			expect(profileSettingsSchema.safeParse(values).success).toBe(valid);
		});
	}
	it("trims submitted values in both forms", () => {
		const values = {
			username: " artist_1 ",
			display_name: " Artist ",
			bio: " Hello ",
		};
		const settings = profileSettingsSchema.parse(values);
		const registered = register.parse({ ...registration, ...values });
		expect(settings).toEqual({
			username: "artist_1",
			display_name: "Artist",
			bio: "Hello",
		});
		for (const key of ["username", "display_name", "bio"] as const)
			expect(settings[key]).toBe(registered[key]);
	});
});
