import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // API_PROXY_TARGET (in frontend/.env) = which backend `npm run dev` talks to.
  // No VITE_ prefix on purpose: it is only used here, never sent to the browser.
  const apiTarget = loadEnv(mode, process.cwd(), "").API_PROXY_TARGET || "http://localhost:5000";
  const isLocalBackend = /^http:\/\/(localhost|127\.0\.0\.1)/.test(apiTarget);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      // Lets us write `import { Button } from "@/components/ui/Button"`.
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    server: {
      port: 5173,
      // In development, /api calls are forwarded to the backend, so the browser
      // only ever talks to localhost and the login cookie just works.
      proxy: {
        // An online backend (Render) needs its own host name in the request.
        "/api": { target: apiTarget, changeOrigin: !isLocalBackend, secure: true },
      },
    },
  };
});
