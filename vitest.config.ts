import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: [
      "src/lib/**/*.test.ts",
      "src/actions/**/*.test.ts",
    ],
    exclude: [
      "src/components/**",
      "node_modules/**",
    ],
    environment: "node",
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      include: [
        "src/lib/**/*.ts",
        "src/actions/**/*.ts",
      ],
      exclude: [
        "src/lib/mock-data.ts",
        "src/__tests__/**",
      ],
    },
  },
})
