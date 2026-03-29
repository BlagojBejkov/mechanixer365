import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// The "from" address — must be a verified domain in Resend.
// Using onboarding@resend.dev works for testing without a verified domain.
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Mechanixer 365 <onboarding@resend.dev>'

export interface OverdueInvoiceEmailProps {
  to: string           // client contact email
  clientName: string   // e.g. "AutoLine GmbH"
  invoiceNumber: string // e.g. "INV-2026-001"
  invoiceTitle: string
  total: number
  currency: string
  dueDate: Date
  daysOverdue: number
  invoiceUrl: string   // deep link to /finance/invoices/[id]
}

export async function sendOverdueInvoiceEmail(props: OverdueInvoiceEmailProps) {
  const {
    to, clientName, invoiceNumber, invoiceTitle,
    total, currency, dueDate, daysOverdue, invoiceUrl
  } = props

  const formattedTotal = new Intl.NumberFormat('de-DE', {
    style: 'currency', currency
  }).format(total)

  const formattedDue = dueDate.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  const subject = `Payment reminder — ${invoiceNumber} is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#0A0A0B;padding:28px 36px;">
              <span style="font-family:'Helvetica Neue',sans-serif;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Mechanixer <span style="color:#3D8EF0;">365</span>
              </span>
            </td>
          </tr>
          <!-- Alert banner -->
          <tr>
            <td style="background:#FEF2F2;border-left:4px solid #EF4444;padding:14px 36px;">
              <p style="margin:0;font-size:13px;font-weight:600;color:#991B1B;">
                ⚠️ Payment overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin:0 0 16px;font-size:15px;color:#374151;">Dear ${clientName},</p>
              <p style="margin:0 0 24px;font-size:14px;color:#6B7280;line-height:1.6;">
                This is a friendly reminder that the following invoice is now overdue.
                We would appreciate your prompt attention to this matter.
              </p>

              <!-- Invoice card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0;font-size:12px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;">Invoice</p>
                          <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#111827;font-family:monospace;">${invoiceNumber}</p>
                        </td>
                        <td align="right">
                          <p style="margin:0;font-size:12px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;">Amount Due</p>
                          <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#EF4444;">${formattedTotal}</p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top:16px;border-top:1px solid #E5E7EB;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:13px;color:#6B7280;">Description</td>
                              <td style="font-size:13px;color:#111827;font-weight:500;">${invoiceTitle}</td>
                            </tr>
                            <tr>
                              <td style="font-size:13px;color:#6B7280;padding-top:6px;">Due Date</td>
                              <td style="font-size:13px;color:#DC2626;font-weight:600;padding-top:6px;">${formattedDue}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:14px;color:#6B7280;line-height:1.6;">
                If you have already made this payment, please disregard this message.
                Otherwise, please arrange payment at your earliest convenience.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#3D8EF0;border-radius:8px;">
                    <a href="${invoiceUrl}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                      View Invoice →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB;border-top:1px solid #E5E7EB;padding:20px 36px;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6;">
                Mechanixer Engineering Studio · This is an automated payment reminder.<br>
                If you have questions, please reply to this email or contact us directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  })

  if (error) throw new Error(`Resend error: ${error.message}`)
  return data
}
