import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  // Tests never touch CSS; skip the app's Tailwind PostCSS config.
  css: { postcss: { plugins: [] } },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
