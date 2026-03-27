import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await transporter.sendMail({
      from: `"Komute Contact" <${process.env.SMTP_EMAIL}>`,
      to: process.env.SMTP_EMAIL,
      replyTo: email,
      subject: `[Contact Form] ${subject || "New message"} from ${name}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
          <div style="background: linear-gradient(135deg, #1B4332, #2D6A4F); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #F59E0B; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>
          <div style="background: #F9F9F7; padding: 32px; border: 1px solid #E5E0D5; border-top: none; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E0D5; font-weight: 600; width: 100px;">Name</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E0D5;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E0D5; font-weight: 600;">Email</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E0D5;">
                  <a href="mailto:${email}" style="color: #1B4332;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E0D5; font-weight: 600;">Subject</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E0D5;">${subject || "No subject"}</td>
              </tr>
            </table>
            <div style="margin-top: 24px;">
              <p style="font-weight: 600; margin-bottom: 8px;">Message:</p>
              <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #E5E0D5;">
                ${message.replace(/\n/g, "<br>")}
              </div>
            </div>
          </div>
          <div style="margin-top: 24px; text-align: center;">
            <p style="color: #9A9A9A; font-size: 12px;">
              Sent from komute.app contact form
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
