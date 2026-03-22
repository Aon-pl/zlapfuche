import nodemailer from 'nodemailer'

// ── Konfiguracja transportu ───────────────────────────────
// Ustaw zmienne środowiskowe w .env:
//   EMAIL_HOST=smtp.gmail.com
//   EMAIL_PORT=587
//   EMAIL_USER=twoj@gmail.com
//   EMAIL_PASS=haslo-aplikacji   ← NIE zwykłe hasło, App Password z Google
//   EMAIL_FROM="PracaTymczasowa <twoj@gmail.com>"

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST   ?? 'smtp.gmail.com',
  port:   Number(process.env.EMAIL_PORT ?? 587),
  secure: Number(process.env.EMAIL_PORT ?? 587) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const FROM = process.env.EMAIL_FROM ?? 'PracaTymczasowa <noreply@pracatymczasowa.pl>'
const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

// ── Weryfikacja emaila ────────────────────────────────────
export async function sendVerificationEmail(to: string, token: string) {
  const url = `${BASE_URL}/api/auth/verify-email?token=${token}`

  await transporter.sendMail({
    from:    FROM,
    to,
    subject: 'Zweryfikuj swój adres email – PracaTymczasowa',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">

          <!-- Header -->
          <div style="background: #1a1a2e; padding: 32px; text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; background: #E8C547; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #1a1a2e; font-weight: 900; font-size: 14px;">PT</span>
              </div>
              <span style="color: #fff; font-weight: 700; font-size: 18px;">PracaTymczasowa</span>
            </div>
          </div>

          <!-- Treść -->
          <div style="padding: 40px 32px;">
            <h1 style="color: #1e293b; font-size: 22px; font-weight: 800; margin: 0 0 12px;">
              Zweryfikuj swój email
            </h1>
            <p style="color: #64748b; line-height: 1.6; margin: 0 0 32px;">
              Kliknij przycisk poniżej, aby potwierdzić adres email i aktywować konto.
              Link jest ważny przez <strong>24 godziny</strong>.
            </p>

            <a href="${url}"
              style="display: inline-block; background: #E8C547; color: #1a1a2e; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none;">
              Zweryfikuj email →
            </a>

            <p style="color: #94a3b8; font-size: 13px; margin: 32px 0 0; line-height: 1.5;">
              Jeśli nie zakładałeś/aś konta w PracaTymczasowa, zignoruj tę wiadomość.
            </p>

            <p style="color: #cbd5e1; font-size: 12px; margin: 16px 0 0; word-break: break-all;">
              Lub skopiuj link: ${url}
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} PracaTymczasowa. Wszystkie prawa zastrzeżone.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

// ── Powiadomienie o nowej aplikacji (email) ───────────────
export async function sendNewApplicationEmail(to: string, applicantName: string, offerTitle: string, offerId: string) {
  const url = `${BASE_URL}/offers/${offerId}/applications`

  await transporter.sendMail({
    from:    FROM,
    to,
    subject: `Nowa aplikacja na ofertę "${offerTitle}" – PracaTymczasowa`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #1a1a2e; padding: 32px; text-align: center;">
            <span style="color: #E8C547; font-weight: 900; font-size: 18px;">PracaTymczasowa</span>
          </div>
          <div style="padding: 40px 32px;">
            <h1 style="color: #1e293b; font-size: 20px; font-weight: 800; margin: 0 0 12px;">
              📨 Nowa aplikacja
            </h1>
            <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px;">
              <strong>${applicantName}</strong> zaaplikował/a na Twoją ofertę <strong>"${offerTitle}"</strong>.
            </p>
            <a href="${url}"
              style="display: inline-block; background: #E8C547; color: #1a1a2e; font-weight: 700; padding: 12px 28px; border-radius: 12px; text-decoration: none;">
              Zobacz aplikacje →
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

// ── Zmiana statusu aplikacji (email) ─────────────────────
export async function sendStatusChangeEmail(to: string, offerTitle: string, newStatus: string) {
  const STATUS_INFO: Record<string, { label: string; emoji: string; color: string }> = {
    accepted: { label: 'zaakceptowana',  emoji: '🎉', color: '#10b981' },
    rejected: { label: 'odrzucona',      emoji: '❌', color: '#ef4444' },
    viewed:   { label: 'przejrzana',     emoji: '👀', color: '#3b82f6' },
  }
  const info = STATUS_INFO[newStatus] ?? { label: newStatus, emoji: '📋', color: '#64748b' }

  await transporter.sendMail({
    from:    FROM,
    to,
    subject: `${info.emoji} Twoja aplikacja na "${offerTitle}" – ${info.label}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #1a1a2e; padding: 32px; text-align: center;">
            <span style="color: #E8C547; font-weight: 900; font-size: 18px;">PracaTymczasowa</span>
          </div>
          <div style="padding: 40px 32px; text-align: center;">
            <p style="font-size: 48px; margin: 0 0 16px;">${info.emoji}</p>
            <h1 style="color: #1e293b; font-size: 20px; font-weight: 800; margin: 0 0 12px;">
              Aktualizacja aplikacji
            </h1>
            <p style="color: #64748b; line-height: 1.6; margin: 0 0 8px;">
              Twoja aplikacja na ofertę:
            </p>
            <p style="color: #1e293b; font-weight: 700; font-size: 16px; margin: 0 0 24px;">
              "${offerTitle}"
            </p>
            <p style="color: #fff; background: ${info.color}; display: inline-block; padding: 8px 20px; border-radius: 99px; font-weight: 700; font-size: 15px; margin: 0 0 32px;">
              ${info.label}
            </p>
            <br>
            <a href="${BASE_URL}/dashboard"
              style="display: inline-block; background: #E8C547; color: #1a1a2e; font-weight: 700; padding: 12px 28px; border-radius: 12px; text-decoration: none;">
              Przejdź do dashboardu →
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}
