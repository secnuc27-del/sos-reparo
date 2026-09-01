import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/").pop();

export default defineConfig({
  base: repositoryName ? `/${repositoryName}/` : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
