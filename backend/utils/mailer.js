// utils/mailer.js — nodemailer transport + branded HTML email wrapper.
//
// Transport selection (first match wins):
//   1. SENDGRID_API_KEY set       → SendGrid's SMTP relay
//   2. EMAIL_HOST/USER/PASS set   → generic SMTP (Gmail etc. — see .env.example)
//   3. neither                    → "json" dev transport: no network call,
//      just logs what would have been sent. Lets the app run and this
//      feature be exercised end-to-end without real email credentials.

import nodemailer from 'nodemailer';

const FROM_EMAIL = process.env.EMAIL_FROM || 'DEZE <noreply@deze.com>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const buildTransport = () => {
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
    });
  }

  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }

  console.warn(
    '[mailer] No SENDGRID_API_KEY or EMAIL_HOST/USER/PASS configured — emails will be logged, not sent. See .env.example.'
  );
  return nodemailer.createTransport({ jsonTransport: true });
};

const transporter = buildTransport();

/**
 * sendEmail({ to, subject, html }) — sends (or, with no credentials
 * configured, logs) a single HTML email. Never throws — a failed/unsent
 * email should never break the feature (e.g. job creation) that triggered it.
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({ from: FROM_EMAIL, to, subject, html });
    if (info.message) {
      // jsonTransport result — the "sent" email, for visibility in dev.
      console.log(`[mailer] (dev, not actually sent) to=${to} subject="${subject}"`);
    } else {
      console.log(`[mailer] sent — to=${to} subject="${subject}" id=${info.messageId}`);
    }
    return info;
  } catch (err) {
    console.error(`[mailer] failed to send — to=${to} subject="${subject}":`, err.message);
    return null;
  }
};

/**
 * wrapEmailHtml — the shared branded shell (logo/header/footer) every
 * notification email renders inside. Keeps per-template code down to just
 * the body content + an optional call-to-action button.
 */
export const wrapEmailHtml = ({ heading, bodyHtml, ctaText, ctaUrl }) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#18181b;border:1px solid #27272a;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid #27272a;">
                <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.02em;">DEZE</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:20px;color:#ffffff;">${heading}</h1>
                <div style="font-size:15px;line-height:1.6;color:#d4d4d8;">${bodyHtml}</div>
                ${
                  ctaText && ctaUrl
                    ? `<table cellpadding="0" cellspacing="0" style="margin-top:24px;">
                        <tr>
                          <td style="border-radius:8px;background-color:#00E5A0;">
                            <a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#09090b;text-decoration:none;">${ctaText}</a>
                          </td>
                        </tr>
                      </table>`
                    : ''
                }
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #27272a;">
                <p style="margin:0;font-size:12px;color:#71717a;">DEZE — mobile detailing marketplace. You're receiving this because you have a DEZE account.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export { FRONTEND_URL };
