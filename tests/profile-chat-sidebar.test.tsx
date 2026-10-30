import { afterEach, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import en from "@/i18n/en";
import pl from "@/i18n/pl";

vi.mock("@/components/layout/content-warning-overlay", () => ({
	ContentWarningOverlay: ({ children }: { children: ReactNode }) => (
		<>{children}</>
	),
}));
vi.mock("boneyard-js/react", () => ({
	Skeleton: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
import { ChatSidebar } from "@/components/layout/chat/chat-sidebar";

afterEach(cleanup);
async function language(locale = "en") {
	const instance = createInstance();
	await instance.init({
		lng: locale,
		fallbackLng: "en",
		resources: { en: { translation: en }, pl: { translation: pl } },
		interpolation: { escapeValue: false },
	});
	return instance;
}

describe("translated chat sidebar", () => {
	const props = {
		conversations: [],
		activeConversationId: null,
		searchQuery: "",
		isAuthPending: false,
		isPending: false,
		error: null,
		onSearchChange: vi.fn(),
		onSelectConversation: vi.fn(),
	};
	it("updates compact labels, accessible names, and the active empty state when switching language", async () => {
		const i18n = await language("en");
		render(
			<I18nextProvider i18n={i18n}>
				<ChatSidebar {...props} />
			</I18nextProvider>,
		);
		expect(
			screen.getByRole("tab", { name: "Direct messages (0)" }),
		).toHaveProperty("textContent", "DMs0");
		expect(screen.getByText("No conversations yet")).toBeDefined();
		await act(async () => i18n.changeLanguage("pl"));
		expect(
			screen.getByRole("tab", { name: "Wiadomości prywatne (0)" }),
		).toHaveProperty("textContent", "Prywatne0");
		expect(screen.getByText("Brak rozmów")).toBeDefined();
		fireEvent.mouseDown(screen.getByRole("tab", { name: "Zapytania (0)" }), {
			button: 0,
			ctrlKey: false,
		});
		expect(await screen.findByText("Brak zapytań")).toBeDefined();
	});

	it("distinguishes an empty search from having no conversations", async () => {
		render(
			<I18nextProvider i18n={await language("pl")}>
				<ChatSidebar {...props} searchQuery="missing" />
			</I18nextProvider>,
		);
		expect(screen.getByText("Brak pasujących rozmów")).toBeDefined();
		expect(screen.queryByText("Brak rozmów")).toBeNull();
	});
});
