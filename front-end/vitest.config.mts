import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],

  test: {
    environment: "jsdom",
    pool: 'vmThreads', // environment per worker, fresh window per file
    setupFiles: ["./vitest.setup.ts"],
  },
});
