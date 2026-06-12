import { resend } from "@/lib/resend"

const FROM = process.env.EMAIL_FROM ?? "DevStash <onboarding@resend.dev>"

export async function sendVerificationEmail({
  email,
  name,
  token,
  origin,
}: {
  email: string
  name: string | null
  token: string
  origin: string
}) {
  const verifyUrl = `${origin}/api/auth/verify-email?token=${token}`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your email address",
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;padding:32px;background:#f9fafb">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <div style="width:40px;height:40px;background:#9333ea;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;margin-bottom:24px">D</div>
    <h1 style="font-size:20px;margin:0 0 8px">Verify your email</h1>
    <p style="color:#6b7280;margin:0 0 24px;line-height:1.5">Hi${name ? ` ${name}` : ""}, click the button below to verify your email address and start using DevStash.</p>
    <a href="${verifyUrl}" style="display:inline-block;background:#9333ea;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Verify email</a>
    <p style="color:#9ca3af;font-size:13px;margin-top:24px">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
  </div>
</body>
</html>`,
  })
}
