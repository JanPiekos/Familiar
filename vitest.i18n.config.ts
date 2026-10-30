import { defineConfig } from "vitest/config";

export default defineConfig({
    test: { environment: "node", include: ["tests/i18n-coverage.test.ts"] },
});
