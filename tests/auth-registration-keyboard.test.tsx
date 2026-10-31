import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RegisterForm from "@/components/layout/auth/form/register";
import i18n from "@/lib/i18n";

vi.mock("@/providers/auth", () => ({
	RegistrationError: class extends Error {},
	useAuth: () => ({
		isPending: false,
		isEmailVerified: false,
		authEmail: null,
		register: vi.fn(),
		refreshSession: vi.fn(),
	}),
}));
vi.mock("@/components/layout/auth/form/register/step/profile", () => ({
	RegisterStepProfile: () => null,
}));
vi.mock("@/components/layout/auth/form/register/step/socials", () => ({
	RegisterStepSocials: () => null,
}));

beforeEach(async () => {
	await i18n.changeLanguage("en");
	render(
		<I18nextProvider i18n={i18n}>
			<RegisterForm onSuccess={vi.fn()} />
		</I18nextProvider>,
	);
});
afterEach(cleanup);

describe("registration keyboard controls", () => {
	it("lets the password toggle handle Enter without validating the form", () => {
		const toggle = screen.getAllByRole("button", { name: "Show password" })[0];
		const event = new KeyboardEvent("keydown", {
			key: "Enter",
			bubbles: true,
			cancelable: true,
		});
		fireEvent(toggle, event);
		expect(event.defaultPrevented).toBe(false);
		// jsdom does not synthesize the browser's button click after Enter.
		fireEvent.click(toggle);
		expect(screen.getByLabelText("Password")).toHaveProperty("type", "text");
		expect(document.querySelector('[data-slot="form-message"]')).toBeNull();
	});

	it("still validates the current step when Enter is pressed in a text input", async () => {
		fireEvent.keyDown(screen.getByLabelText("Email"), { key: "Enter" });
		expect(
			await screen.findAllByText("Password must be at least 6 characters."),
		).toHaveLength(2);
		expect(
			screen.getByRole("tab", { name: "Profile" }).getAttribute("aria-selected"),
		).toBe("false");
	});
});
