import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const devHost = env.VITE_DEV_HOST || "0.0.0.0";
  const devPort = Number(env.VITE_DEV_PORT || 5173);

  // HTTPS configuration for development (graceful fallback to HTTP if certs missing)
  const keyPath = path.resolve(__dirname, "certs/dev.key");
  const certPath = path.resolve(__dirname, "certs/dev.crt");
  const hasSSL =
    mode === "development" && fs.existsSync(keyPath) && fs.existsSync(certPath);

  const httpsConfig = hasSSL
    ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
    : false;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: devHost,
      port: devPort,
      strictPort: true,
      https: httpsConfig,
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_TARGET || "https://localhost:5001",
          changeOrigin: true,
          secure: false, // Allow self-signed certificates
        },
      },
    },
    preview: {
      host: devHost,
      port: devPort,
      strictPort: true,
    },
  };
});
