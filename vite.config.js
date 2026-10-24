import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import subscribe from "./api/subscribe.js";
import unsubscribe from "./api/unsubscribe.js";
import sendAppointmentConfirmation from "./api/send-appointment-confirmation.js";

// Local requests use the same handlers as deployment; secrets stay server-side.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of [
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "SUBSCRIPTION_SECRET",
    "SITE_URL",
    "FIREBASE_ADMIN_PROJECT_ID",
    "FIREBASE_ADMIN_CLIENT_EMAIL",
    "FIREBASE_ADMIN_PRIVATE_KEY",
  ]) {
    if (!process.env[key] && env[key]) process.env[key] = env[key];
  }
  return {
    plugins: [
      react(),
      {
        name: "api-dev-server",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = new URL(req.url || "/", "http://localhost");
            const handler = {
              "/api/subscribe": subscribe,
              "/api/unsubscribe": unsubscribe,
              "/api/send-appointment-confirmation": sendAppointmentConfirmation,
            }[url.pathname];
            if (!handler) return next();
            req.query = Object.fromEntries(url.searchParams);
            res.status = (code) => {
              res.statusCode = code;
              return res;
            };
            res.json = (body) => {
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify(body));
            };
            res.send = (body) => res.end(body);
            try {
              await handler(req, res);
            } catch {
              if (!res.headersSent) {
                res.statusCode = 500;
                res.json({
                  message:
                    "The service is temporarily unavailable. Please try again.",
                });
              } else res.end();
            }
          });
        },
      },
    ],
    server: { host: "0.0.0.0", port: 5173 },
    build: {
      outDir: "dist",
      sourcemap: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-firebase": [
              "firebase/app",
              "firebase/auth",
              "firebase/firestore",
            ],
            "vendor-icons": ["lucide-react"],
            "vendor-phone": ["libphonenumber-js/max"],
          },
        },
      },
    },
  };
});
