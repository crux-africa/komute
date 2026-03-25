import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendOTPviaEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await transporter.sendMail({
      from: `"Komute" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `${code} — Your Komute verification code`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 24px;">
          <h1 style="font-size: 20px; font-weight: 700; color: #1B4332; margin: 0 0 8px;">
            Komute
          </h1>
          <p style="font-size: 14px; color: #6B6B6B; margin: 0 0 32px;">
            Smart Journeys, Simplified.
          </p>
          <p style="font-size: 15px; color: #1A1A1A; margin: 0 0 16px;">
            Your verification code is:
          </p>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1B4332; background: #F0ECE3; padding: 20px; border-radius: 12px; text-align: center; margin: 0 0 24px;">
            ${code}
          </div>
          <p style="font-size: 13px; color: #6B6B6B; margin: 0 0 4px;">
            This code expires in 10 minutes.
          </p>
          <p style="font-size: 13px; color: #6B6B6B; margin: 0;">
            If you didn't request this, ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #E5E0D5; margin: 32px 0 16px;" />
          <p style="font-size: 11px; color: #9A9A9A; margin: 0;">
            Komute — Book your seat tonight. Skip the queue tomorrow.
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Email OTP error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Email send failed",
    };
  }
}