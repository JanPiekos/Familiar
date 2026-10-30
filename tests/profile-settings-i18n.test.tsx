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

it("updates image-edit controls while keeping the current profile draft", async () => {
    const instance = await languageInstance();
    render(<I18nextProvider i18n={instance}><SettingsProfileEditor initialValues={{ username: "hasira", display_name: "Hasira", bio: "My unsaved profile", avatar_url: "", cover_url: "", accent_color: "" }} /></I18nextProvider>);
    expect(screen.getByRole("button", { name: "Edit cover image" })).toBeTruthy();
    await act(async () => { await instance.changeLanguage("pl"); });
    expect(screen.getByRole("button", { name: "Edytuj zdjęcie w tle" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edytuj zdjęcie profilowe" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: instance.t("auth.bio.label") })).toHaveProperty("value", "My unsaved profile");
});
