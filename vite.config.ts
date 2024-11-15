import react from "@vitejs/plugin-react";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    coverage: {
      exclude: ["./example", ...coverageConfigDefaults.exclude]
    }
  }
});
