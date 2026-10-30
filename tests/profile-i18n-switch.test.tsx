import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import en from "@/i18n/en";
import pl from "@/i18n/pl";
import { Pagination, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { SettingsProfileEditor } from "@/components/layout/profile/settings-profile-editor";

afterEach(cleanup);
async function languageInstance() {
    const instance = createInstance();
    await instance.use(initReactI18next).init({ lng: "en", fallbackLng: "en", resources: { en: { translation: en }, pl: { translation: pl } }, interpolation: { escapeValue: false } });
    return instance;
}

it("updates visible pagination labels and accessible names when switching languages", async () => {
    const instance = await languageInstance();
    render(<I18nextProvider i18n={instance}><Pagination><PaginationPrevious href="#previous" /><PaginationNext href="#next" /></Pagination></I18nextProvider>);
    expect(screen.getByRole("link", { name: "Go to next page" }).textContent).toContain("Next");
    await act(async () => { await instance.changeLanguage("pl"); });
    expect(screen.getByRole("link", { name: "Przejdź do następnej strony" }).textContent).toContain("Następna");
    expect(screen.getByRole("link", { name: "Przejdź do poprzedniej strony" }).textContent).toContain("Poprzednia");
    expect(screen.getByRole("navigation", { name: "Nawigacja po stronach" })).toBeTruthy();
});
