import en from "../locales/en.json";
import pl from "../locales/pl.json";

export type Locale = "en" | "pl";

type Translations = Record<string, string>;

const translations: Record<Locale, Translations> = {
	en,
	pl,
};

export function t(key: string, locale: Locale = "en"): string {
	return translations[locale]?.[key] ?? en[key as keyof typeof en] ?? key;
}
