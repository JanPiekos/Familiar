import { describe, expect, it } from "vitest";
import { createInstance } from "i18next";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import ts from "typescript";
import en from "../src/i18n/en";
import pl from "../src/i18n/pl";
import filterEn from "../src/components/data-table-filter/locales/en.json";
import filterPl from "../src/components/data-table-filter/locales/pl.json";

const sourceDirectory = fileURLToPath(new URL("../src", import.meta.url));
const locales = { en, pl };
function lookup(resource: unknown, key: string): unknown {
    return key.split(".").reduce<unknown>((value, part) => value && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined, resource);
}
function flatten(value: unknown, prefix = "", result: Record<string, string> = {}) {
    if (value && typeof value === "object") {
        for (const [key, item] of Object.entries(value)) flatten(item, prefix ? `${prefix}.${key}` : key, result);
    } else if (typeof value === "string") result[prefix] = value;
    return result;
}
function files(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) return ["i18n", "data-table-filter"].includes(entry.name) ? [] : files(path);
        return /\.tsx?$/.test(entry.name) && entry.name !== "routeTree.gen.ts" ? [path] : [];
    });
}
function placeholders(value: string) {
    return [...value.matchAll(/{{-?\s*([\w.]+)(?:\s*,[^}]+)?\s*}}/g)].map((match) => match[1]).sort();
}

describe("application translations", () => {
    it("provides English and Polish for every literal translation key in the frontend", () => {
        const missing: string[] = [];
        for (const file of files(sourceDirectory)) {
            const ast = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, file.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
            function visit(node: ts.Node) {
                if (ts.isCallExpression(node) && (ts.isIdentifier(node.expression) && node.expression.text === "t" || ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "t")) {
                    const key = node.arguments[0];
                    if (key && ts.isStringLiteralLike(key)) {
                        for (const [language, resource] of Object.entries(locales)) {
                            const result = lookup(resource, key.text);
                            const plural = lookup(resource, `${key.text}_other`);
                            if (result === undefined && plural === undefined) missing.push(`${language}: ${key.text} (${file})`);
                            if (typeof result === "string" && !result.trim()) missing.push(`${language}: empty ${key.text}`);
                        }
                    }
                }
                ts.forEachChild(node, visit);
            }
            visit(ast);
        }
        expect(missing).toEqual([]);
    }, 15_000);

    it("keeps both languages in sync and preserves interpolation values", () => {
        const english = flatten(en);
        const polish = flatten(pl);
        expect(Object.keys(polish).sort()).toEqual(Object.keys(english).sort());
        const mismatches = Object.keys(english).filter((key) => JSON.stringify(placeholders(english[key])) !== JSON.stringify(placeholders(polish[key] ?? "")));
        expect(mismatches).toEqual([]);
    });

    it("has no empty translations, including keys not yet used by the frontend", () => {
        const empty: string[] = [];
        for (const [language, resource] of Object.entries({ ...locales, filterEn, filterPl })) {
            for (const [key, value] of Object.entries(flatten(resource))) {
                if (!value.trim()) empty.push(`${language}: ${key}`);
            }
        }
        expect(empty).toEqual([]);
    });

    it("does not silently overwrite duplicate dictionary keys", () => {
        const duplicates: string[] = [];
        for (const path of ["i18n/en.ts", "i18n/pl.ts", "components/data-table-filter/locales/en.json", "components/data-table-filter/locales/pl.json"]) {
            const ast = ts.createSourceFile(path, readFileSync(join(sourceDirectory, path), "utf8"), ts.ScriptTarget.Latest, false, path.endsWith("json") ? ts.ScriptKind.JSON : ts.ScriptKind.TS);
            function visit(node: ts.Node) {
                if (ts.isObjectLiteralExpression(node)) {
                    const seen = new Set<string>();
                    for (const property of node.properties) {
                        if (!ts.isPropertyAssignment(property)) continue;
                        const name = property.name;
                        if (!ts.isIdentifier(name) && !ts.isStringLiteralLike(name)) continue;
                        if (seen.has(name.text)) duplicates.push(`${path}: ${name.text}`);
                        seen.add(name.text);
                    }
                }
                ts.forEachChild(node, visit);
            }
            visit(ast);
        }
        expect(duplicates).toEqual([]);
    });

    it("covers dynamic commission and language labels", () => {
        for (const resource of Object.values(locales)) {
            for (const type of ["service", "communication", "process"]) {
                for (const suffix of ["title", "description"]) expect(typeof lookup(resource, `components.profile.commissions.modal.info_selection_modal.${type}.${suffix}`)).toBe("string");
            }
            for (const action of ["join_waitlist", "get_notified"]) expect(typeof lookup(resource, `components.profile.commissions.card.${action}`)).toBe("string");
            for (const level of ["native", "fluent", "communicative", "learning", "basic"]) expect(typeof lookup(resource, `components.profile.languages.levels.${level}`)).toBe("string");
        }
    });

    it("uses Polish plural forms for review counts", async () => {
        const instance = createInstance();
        await instance.init({ lng: "pl", fallbackLng: false, resources: { pl: { translation: pl } } });
        const key = "components.profile.commissions.modal.reviews.total_count";
        for (const [count, expected] of [[1, "1 opinia"], [2, "2 opinie"], [5, "5 opinii"], [12, "12 opinii"], [22, "22 opinie"]] as const) expect(instance.t(key, { count })).toBe(expected);
    });

    it("has matching filter translations, including the back action", () => {
        expect(Object.keys(filterPl).sort()).toEqual(Object.keys(filterEn).sort());
        expect(filterEn.back).toBe("Back");
        expect(filterPl.back).toBe("Wstecz");
        expect(Object.values(filterPl).every((value) => value.trim().length > 0)).toBe(true);
    });
});
