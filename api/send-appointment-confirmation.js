import { Resend } from "resend";

function json(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  res.setHeader("Allow", "POST");
  if (req.method !== "POST") {
    return json(res, 405, { message: "Method not allowed." });
  }

  let input = req.body;
  try {
    if (!input && req[Symbol.asyncIterator]) {
      const buffers = [];
      let size = 0;
      for await (const chunk of req) {
        size += Buffer.byteLength(chunk);
        if (size > 65536) {
          return json(res, 413, { message: "Request too large." });
        }
        buffers.push(Buffer.from(chunk));
      }
      input = Buffer.concat(buffers).toString("utf8");
    }
    if (typeof input === "string") {
      input = JSON.parse(input);
    }
  } catch {
    return json(res, 400, { message: "Invalid JSON request payload." });
  }

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return json(res, 400, { message: "Invalid request body." });
  }

  const { to, subject, html, text, appointmentId } = input;

  if (!to || !to.includes("@")) {
    return json(res, 400, { message: "Valid recipient email address is required." });
  }

  if (!subject) {
    return json(res, 400, { message: "Email subject is required." });
  }

  if (!html && !text) {
    return json(res, 400, { message: "Email content is required." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "updates@neurojnaai.com";

  if (!apiKey) {
    console.error("[Appointment Notice] RESEND_API_KEY is not configured.");
    return json(res, 503, {
      message: "Email service is temporarily unavailable. RESEND_API_KEY is not configured.",
    });
  }

  const fromAddress = fromEmail.includes("<")
    ? fromEmail
    : `Neurojana AI <${fromEmail}>`;

  try {
    console.log(`[Appointment Notice] Sending email to ${to} from ${fromAddress}...`);
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to.trim().toLowerCase()],
      subject: subject.trim(),
      html: html || `<p>${text}</p>`,
      text: text || "",
    });

    if (error) {
      console.error("[Appointment Notice] Resend delivery error:", error);
      return json(res, 400, {
        message: `Resend error: ${error.message || "Failed to deliver email."}`,
      });
    }

    console.log(`[Appointment Notice] Email sent successfully! ID: ${data?.id}`);
    return json(res, 200, {
      ok: true,
      emailId: data?.id,
      message: "Appointment confirmation email successfully dispatched.",
    });
  } catch (err) {
    console.error("[Appointment Notice] Server exception sending email:", err);
    return json(res, 500, {
      message: `Email dispatch exception: ${err?.message || "Unknown error"}`,
    });
  }
}
