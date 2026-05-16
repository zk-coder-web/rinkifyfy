import nodemailer from 'nodemailer'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function getTransporter() {
  const port = Number(process.env.SMTP_PORT) || 587
  const secure = process.env.SMTP_SECURE === 'true'
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    // Configurações adicionais para Gmail
    tls: {
      rejectUnauthorized: false
    }
  })
}

/** Sends verification code only (for password recovery) */
export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Rankify" <noreply@rankify.com.br>',
    to,
    subject: 'Seu código de verificação Rankify',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:16px;">
        <h1 style="font-size:28px;font-weight:900;color:#0f172a;margin:0 0 8px;">Rankify</h1>
        <p style="color:#475569;margin:0 0 24px;">Use o código abaixo para confirmar seu e-mail:</p>
        <div style="background:#0066ff;color:#fff;font-size:36px;font-weight:900;letter-spacing:10px;text-align:center;padding:20px 32px;border-radius:12px;margin-bottom:24px;">
          ${code}
        </div>
        <p style="color:#94a3b8;font-size:13px;">Este código expira em <strong>15 minutos</strong>. Se você não solicitou isso, ignore este e-mail.</p>
      </div>
    `,
  })
}

/** Sends welcome email with verification link + PIN (more secure and user-friendly) */
export async function sendWelcomeEmail(to: string, verifyToken: string, pin?: string): Promise<void> {
  const verifyLink = `${APP_URL}/verify/${verifyToken}`
  const pinDisplay = pin || 'RKF-XXXX'
  const transporter = getTransporter()
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Rankify" <noreply@rankify.com.br>',
    to,
    subject: 'Bem-vindo ao Rankify — Verifique seu e-mail',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:16px;">
        <h1 style="font-size:28px;font-weight:900;color:#0f172a;margin:0 0 4px;">Rankify</h1>
        <p style="color:#475569;margin:0 0 28px;font-size:15px;">Bem-vindo! Clique no botão abaixo para verificar seu e-mail e ativar sua conta.</p>

        <!-- Verification button -->
        <div style="text-align:center;margin-bottom:32px;">
          <a href="${verifyLink}" style="display:inline-block;background:#0066ff;color:#fff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:12px;text-decoration:none;">
            Verificar meu e-mail
          </a>
        </div>

        <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
        <p style="color:#0066ff;font-size:11px;word-break:break-all;margin:0 0 24px;">${verifyLink}</p>
        <p style="color:#94a3b8;font-size:12px;margin:0 0 32px;">Este link expira em <strong>24 horas</strong>.</p>

        <!-- PIN -->
        <div style="background:#0f172a;border-radius:14px;padding:24px 28px;margin-bottom:12px;">
          <p style="color:#7dd3fc;font-size:11px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 8px;">PIN de Segurança</p>
          <p style="color:#ffffff;font-size:28px;font-weight:900;letter-spacing:6px;margin:0 0 12px;font-family:monospace;">${pinDisplay}</p>
          <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
            Mantenha esta credencial em local seguro.<br/>
            Esta chave poderá ser solicitada para validações de segurança e ações sensíveis da conta.
          </p>
        </div>

        <p style="color:#cbd5e1;font-size:11px;margin:0;">Se você não criou esta conta, ignore este e-mail.</p>
      </div>
    `,
  })
}

/** Sends welcome email with verification code + PIN (for legacy/sms fallback) */
export async function sendWelcomeEmailWithCode(to: string, code: string, pin: string): Promise<void> {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Rankify" <noreply@rankify.com.br>',
    to,
    subject: 'Bem-vindo ao Rankify — Código de verificação e PIN de segurança',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:16px;">
        <h1 style="font-size:28px;font-weight:900;color:#0f172a;margin:0 0 4px;">Rankify</h1>
        <p style="color:#475569;margin:0 0 28px;font-size:15px;">Bem-vindo! Aqui estão suas credenciais de acesso.</p>

        <!-- Verification code -->
        <p style="color:#0f172a;font-weight:700;margin:0 0 8px;font-size:14px;">Código de verificação</p>
        <div style="background:#0066ff;color:#fff;font-size:34px;font-weight:900;letter-spacing:10px;text-align:center;padding:18px 32px;border-radius:12px;margin-bottom:28px;">
          ${code}
        </div>
        <p style="color:#94a3b8;font-size:12px;margin:0 0 32px;">Este código expira em <strong>15 minutos</strong>.</p>

        <!-- PIN -->
        <div style="background:#0f172a;border-radius:14px;padding:24px 28px;margin-bottom:12px;">
          <p style="color:#7dd3fc;font-size:11px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 8px;">PIN de Segurança</p>
          <p style="color:#ffffff;font-size:28px;font-weight:900;letter-spacing:6px;margin:0 0 12px;font-family:monospace;">${pin}</p>
          <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
            Mantenha esta credencial em local seguro.<br/>
            Esta chave poderá ser solicitada para validações de segurança e ações sensíveis da conta.
          </p>
        </div>

        <p style="color:#cbd5e1;font-size:11px;margin:0;">Se você não criou esta conta, ignore este e-mail.</p>
      </div>
    `,
  })
}

/** Sends recovery email with code + PIN reminder */
export async function sendRecoveryEmail(to: string, code: string, pin: string): Promise<void> {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Rankify" <noreply@rankify.com.br>',
    to,
    subject: 'Recuperação de acesso — Rankify',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:16px;">
        <h1 style="font-size:28px;font-weight:900;color:#0f172a;margin:0 0 4px;">Rankify</h1>
        <p style="color:#475569;margin:0 0 28px;font-size:15px;">Recebemos uma solicitação de recuperação de acesso para esta conta.</p>

        <!-- Verification code -->
        <p style="color:#0f172a;font-weight:700;margin:0 0 8px;font-size:14px;">Código de verificação</p>
        <div style="background:#0066ff;color:#fff;font-size:34px;font-weight:900;letter-spacing:10px;text-align:center;padding:18px 32px;border-radius:12px;margin-bottom:28px;">
          ${code}
        </div>
        <p style="color:#94a3b8;font-size:12px;margin:0 0 32px;">Este código expira em <strong>15 minutos</strong>.</p>

        <!-- PIN reminder -->
        <div style="background:#0f172a;border-radius:14px;padding:24px 28px;margin-bottom:12px;">
          <p style="color:#7dd3fc;font-size:11px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 8px;">Seu PIN de Segurança</p>
          <p style="color:#ffffff;font-size:28px;font-weight:900;letter-spacing:6px;margin:0 0 12px;font-family:monospace;">${pin}</p>
          <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
            Use este PIN junto ao código acima para redefinir sua senha.
          </p>
        </div>

        <p style="color:#cbd5e1;font-size:11px;margin:0;">Se você não solicitou isso, ignore este e-mail.</p>
      </div>
    `,
  })
}
/**
 * Sends welcome email after account creation
 */
export async function sendWelcomeUserEmail(to: string, name: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const transporter = getTransporter()
  
  const displayName = name || to.split('@')[0]
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Rankify" <noreply@rankify.com.br>',
    to,
    subject: `Bem-vindo ao Rankify, ${displayName}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:520px;margin:0 auto;padding:40px 24px;background:#f8fafc;">
          <!-- Logo -->
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="font-size:32px;font-weight:900;color:#0f172a;margin:0 0 8px;">Rankify</h1>
            <p style="color:#64748b;margin:0;font-size:14px;">Sua plataforma de gerenciamento de reputação</p>
          </div>

          <!-- Main Card -->
          <div style="background:#ffffff;border-radius:20px;padding:40px 32px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <!-- Avatar -->
            <div style="width:80px;height:80px;background:linear-gradient(135deg,#0066ff,#06b6d4);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
              <span style="color:#fff;font-size:32px;font-weight:900;">${displayName.charAt(0).toUpperCase()}</span>
            </div>

            <!-- Greeting -->
            <h2 style="color:#0f172a;font-size:24px;font-weight:900;text-align:center;margin:0 0 12px;">
              Olá, ${displayName}! 👋
            </h2>

            <p style="color:#475569;text-align:center;font-size:15px;line-height:1.6;margin:0 0 32px;">
              Seja muito bem-vindo ao <strong>Rankify</strong>! We're thrilled to have you on board. 
              Agora você pode gerenciar suas páginas, acompanhar métricas e impulsionar sua reputação online.
            </p>

            <!-- Features -->
            <div style="background:#f8fafc;border-radius:16px;padding:24px;margin-bottom:32px;">
              <h3 style="color:#0f172a;font-size:14px;font-weight:800;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.5px;">
                O que você pode fazer:
              </h3>
              <ul style="margin:0;padding:0;list-style:none;">
                <li style="display:flex;align-items:center;gap:12px;margin-bottom:12px;color:#334155;font-size:14px;">
                  <span style="width:24px;height:24px;background:#dbeafe;border-radius:8px;display:flex;align-items:center;justify-content:center;">
                    <span style="color:#0066ff;font-size:12px;">✓</span>
                  </span>
                  Criar páginas personalizadas para seu negócio
                </li>
                <li style="display:flex;align-items:center;gap:12px;margin-bottom:12px;color:#334155;font-size:14px;">
                  <span style="width:24px;height:24px;background:#dbeafe;border-radius:8px;display:flex;align-items:center;justify-content:center;">
                    <span style="color:#0066ff;font-size:12px;">✓</span>
                  </span>
                  Acompanhar avaliações e métricas em tempo real
                </li>
                <li style="display:flex;align-items:center;gap:12px;color:#334155;font-size:14px;">
                  <span style="width:24px;height:24px;background:#dbeafe;border-radius:8px;display:flex;align-items:center;justify-content:center;">
                    <span style="color:#0066ff;font-size:12px;">✓</span>
                  </span>
                  Gerenciar links do Instagram e WhatsApp
                </li>
              </ul>
            </div>

            <!-- CTA Button -->
            <div style="text-align:center;">
              <a href="${appUrl}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#0066ff,#06b6d4);color:#ffffff;font-size:16px;font-weight:700;padding:16px 48px;border-radius:12px;text-decoration:none;box-shadow:0 4px 12px rgba(0,102,255,0.3);">
                Acessar Dashboard
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align:center;margin-top:32px;">
            <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">
              © 2024 Rankify. Todos os direitos reservados.
            </p>
            <p style="color:#94a3b8;font-size:11px;margin:0;">
              Se você não criou esta conta, ignore este e-mail.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}