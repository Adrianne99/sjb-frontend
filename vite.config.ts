import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Lets us write `import { Button } from "@/components/ui/Button"`.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 5173,
    // In development, /api calls are forwarded to the Node.js backend, so the
    // browser sees one origin and the session cookie just works.
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: false },
    },
  },
});
