import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { Resend } from 'resend';
import { emailHtml, emailText } from './lib/subscription.js';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      {
        name: 'api-dev-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/subscribe')) {
              // Always re-load environment variables dynamically so edits to .env take effect without restarting Vite
              const env = loadEnv(mode, process.cwd(), '');

              res.setHeader('Cache-Control', 'no-store');
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ message: 'Method not allowed.' }));
              }

              // Read request body stream
              const buffers = [];
              try {
                for await (const chunk of req) {
                  buffers.push(chunk);
                }
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ message: 'Error reading request body.' }));
              }

              const rawBody = Buffer.concat(buffers).toString('utf8');
              let body = {};
              try {
                body = rawBody ? JSON.parse(rawBody) : {};
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ message: 'Invalid JSON request.' }));
              }

              // Check honeypot
              if (body.company) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ message: 'Thank you for subscribing.' }));
              }

              const email = (body.email || '').trim().toLowerCase();
              if (!email || !email.includes('@')) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ message: 'Please enter a valid email address.' }));
              }

              const apiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
              const fromEmail = env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'updates@neurojnaai.com';
              const siteUrl = env.SITE_URL || process.env.SITE_URL || 'https://neurojnaai.com';

              if (!apiKey) {
                console.warn('[Dev Server] RESEND_API_KEY is not set in .env.');
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({
                  message: 'RESEND_API_KEY is not set in .env. Please configure your Resend API key.'
                }));
              }

              try {
                console.log(`[Dev Server] Sending email via Resend to ${email} from ${fromEmail}...`);
                const resend = new Resend(apiKey);
                const fromAddress = fromEmail.includes('<') ? fromEmail : `Neurojna-AI <${fromEmail}>`;
                const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=dev`;
                const logoUrl = `${siteUrl}/assets/logo.png`;

                const { data, error } = await resend.emails.send({
                  from: fromAddress,
                  to: [email],
                  subject: "Hurray! You're subscribed 🎉 | Neurojna-AI",
                  html: emailHtml({ unsubscribeUrl, logoUrl }),
                  text: emailText({ unsubscribeUrl }),
                });

                if (error) {
                  console.error('[Dev Server] Resend Error:', error);
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({
                    message: `Resend Error: ${error.message || 'Email delivery failed.'}`
                  }));
                }

                console.log(`[Dev Server] Email successfully sent via Resend! ID: ${data?.id}`);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({
                  message: 'Subscription successful! Please check your inbox.',
                  emailId: data?.id
                }));
              } catch (sendErr) {
                console.error('[Dev Server] Exception sending email:', sendErr);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({
                  message: `Email sending failed: ${sendErr?.message || 'Unknown error'}`
                }));
              }
            }

            if (req.url && req.url.startsWith('/api/unsubscribe')) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              return res.end(`
                <!doctype html>
                <html lang="en">
                  <head><meta charset="utf-8"><title>Unsubscribe | Dev Server</title></head>
                  <body style="font-family:sans-serif;padding:40px;text-align:center">
                    <h2>Unsubscribe (Local Development)</h2>
                    <p>Unsubscription simulated in development mode.</p>
                    <a href="/">Return to site</a>
                  </body>
                </html>
              `);
            }

            next();
          });
        }
      }
    ],
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
  };
});
