import { env } from "./env";

export const yascoBrand = {
  primary: "#C99700",
  primaryLight: "#F5E6B8",
  primaryDark: "#8B6E00",
  secondary: "#1A1A2E",
  secondaryLight: "#2D2D4E",
  bg: "#F8F9FC",
  bgCard: "#FFFFFF",
  text: "#1F2937",
  textLight: "#6B7280",
  textWhite: "#FFFFFF",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  border: "#E5E7EB",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  logo: "YASCO",
};

function wrapper(html: string, subtitle?: string): string {
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>YASCO ERP</title>
</head>
<body style="margin:0;padding:0;background-color:${yascoBrand.bg};font-family:${yascoBrand.fontFamily};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${yascoBrand.bg};padding:20px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${yascoBrand.secondary},${yascoBrand.secondaryLight});padding:30px 40px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:2px;color:${yascoBrand.primary};">${yascoBrand.logo}</h1>
              <p style="margin:5px 0 0;font-size:13px;color:#9CA3AF;letter-spacing:3px;text-transform:uppercase;">ERP SYSTEM</p>
              ${subtitle ? `<p style="margin:15px 0 0;font-size:16px;color:${yascoBrand.textWhite};font-weight:600;">${subtitle}</p>` : ""}
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:${yascoBrand.bgCard};padding:40px;border-left:1px solid ${yascoBrand.border};border-right:1px solid ${yascoBrand.border};">
              ${html}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:${yascoBrand.bgCard};padding:25px 40px;border:1px solid ${yascoBrand.border};border-radius:0 0 12px 12px;border-top:none;text-align:center;">
              <p style="margin:0;font-size:12px;color:${yascoBrand.textLight};line-height:1.6;">
                ${yascoBrand.logo} ERP &mdash; Enterprise Resource Planning System<br/>
                Saudi Arabia &middot; All Rights Reserved &copy; ${new Date().getFullYear()}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(link: string, text: string, color: string = yascoBrand.primary): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px auto;">
    <tr>
      <td style="background:${color};border-radius:8px;text-align:center;">
        <a href="${link}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function box(content: string, borderColor: string = yascoBrand.primary, bgColor: string = "#FFFBEB"): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:${bgColor};border-left:4px solid ${borderColor};border-radius:8px;">
    <tr><td style="padding:20px;">${content}</td></tr>
  </table>`;
}

export const templates = {
  otp(params: { otp: string; expiryMinutes: number; name?: string }): string {
    return wrapper(`
      <p style="margin:0 0 20px;font-size:16px;color:${yascoBrand.text};line-height:1.6;">
        ${params.name ? `Dear <strong>${params.name}</strong>,` : "Hello,"}
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:${yascoBrand.text};line-height:1.6;">
        Use the following one-time password to verify your account:
      </p>
      ${box(`
        <div style="text-align:center;padding:10px 0;">
          <p style="margin:0 0 5px;font-size:13px;color:${yascoBrand.textLight};letter-spacing:1px;text-transform:uppercase;">Verification Code</p>
          <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:10px;color:${yascoBrand.primary};">${params.otp}</p>
        </div>
      `, yascoBrand.primary, "#FFFBEB")}
      <p style="margin:0;font-size:14px;color:${yascoBrand.error};font-weight:600;text-align:center;">
        ⏱ Expires in ${params.expiryMinutes} minutes
      </p>
      <p style="margin:20px 0 0;font-size:13px;color:${yascoBrand.textLight};line-height:1.6;">
        If you did not request this code, please ignore this email. Do not share this code with anyone.
      </p>
    `, "🔐 Account Verification");
  },

  passwordReset(params: { otp: string; expiryMinutes: number }): string {
    return wrapper(`
      <p style="margin:0 0 20px;font-size:16px;color:${yascoBrand.text};line-height:1.6;">
        You requested to reset your password.
      </p>
      ${box(`
        <div style="text-align:center;padding:10px 0;">
          <p style="margin:0 0 5px;font-size:13px;color:${yascoBrand.textLight};letter-spacing:1px;text-transform:uppercase;">Reset Code</p>
          <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:10px;color:${yascoBrand.primary};">${params.otp}</p>
        </div>
      `, yascoBrand.warning, "#FEF3C7")}
      <p style="margin:0;font-size:14px;color:${yascoBrand.error};font-weight:600;text-align:center;">
        ⏱ Expires in ${params.expiryMinutes} minutes
      </p>
      <p style="margin:20px 0 0;font-size:13px;color:${yascoBrand.textLight};line-height:1.6;">
        If you did not request this, please ignore this email and ensure your account is secure.
      </p>
    `, "🔑 Password Reset");
  },

  invoice(params: {
    invoiceNumber: string;
    customerName: string;
    amount: number;
    currency: string;
    dueDate?: string;
    companyName?: string;
  }): string {
    return wrapper(`
      <p style="margin:0 0 20px;font-size:16px;color:${yascoBrand.text};line-height:1.6;">
        Dear <strong>${params.customerName}</strong>,
      </p>
      <p style="margin:0 0 10px;font-size:15px;color:${yascoBrand.text};line-height:1.6;">
        A new invoice has been generated for your account.
      </p>
      ${box(`
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px;color:${yascoBrand.text};">
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Invoice No</td>
            <td style="text-align:right;font-weight:700;">${params.invoiceNumber}</td>
          </tr>
          ${params.companyName ? `<tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Company</td>
            <td style="text-align:right;">${params.companyName}</td>
          </tr>` : ""}
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Amount Due</td>
            <td style="text-align:right;font-size:22px;font-weight:800;color:${yascoBrand.primary};">${params.currency} ${params.amount.toLocaleString()}</td>
          </tr>
          ${params.dueDate ? `<tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Due Date</td>
            <td style="text-align:right;font-weight:600;color:${yascoBrand.error};">${params.dueDate}</td>
          </tr>` : ""}
        </table>
      `, yascoBrand.primary)}
      ${button("#", "View Invoice")}
      <p style="margin:20px 0 0;font-size:13px;color:${yascoBrand.textLight};line-height:1.6;">
        If you have any questions, please contact our support team.
      </p>
    `, "📄 New Invoice");
  },

  paymentReceived(params: {
    invoiceNumber: string;
    customerName: string;
    amount: number;
    currency: string;
  }): string {
    return wrapper(`
      <p style="margin:0 0 20px;font-size:16px;color:${yascoBrand.text};line-height:1.6;">
        Dear <strong>${params.customerName}</strong>,
      </p>
      <p style="margin:0 0 10px;font-size:15px;color:${yascoBrand.text};line-height:1.6;">
        Thank you! Your payment has been received successfully.
      </p>
      ${box(`
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px;color:${yascoBrand.text};">
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Invoice</td>
            <td style="text-align:right;font-weight:700;">${params.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Amount Paid</td>
            <td style="text-align:right;font-size:22px;font-weight:800;color:${yascoBrand.success};">${params.currency} ${params.amount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Status</td>
            <td style="text-align:right;"><span style="background:#D1FAE5;color:#065F46;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">✅ Paid</span></td>
          </tr>
        </table>
      `, yascoBrand.success, "#ECFDF5")}
      <p style="margin:20px 0 0;font-size:13px;color:${yascoBrand.textLight};line-height:1.6;">
        We appreciate your business.
      </p>
    `, "✅ Payment Received");
  },

  invoiceOverdue(params: {
    invoiceNumber: string;
    customerName: string;
    amount: number;
    currency: string;
    daysOverdue: number;
  }): string {
    return wrapper(`
      <p style="margin:0 0 20px;font-size:16px;color:${yascoBrand.text};line-height:1.6;">
        Dear <strong>${params.customerName}</strong>,
      </p>
      <p style="margin:0 0 10px;font-size:15px;color:${yascoBrand.text};line-height:1.6;">
        This is a friendly reminder that the following invoice is <strong>${params.daysOverdue} days overdue</strong>.
      </p>
      ${box(`
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px;color:${yascoBrand.text};">
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Invoice</td>
            <td style="text-align:right;font-weight:700;">${params.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Outstanding</td>
            <td style="text-align:right;font-size:22px;font-weight:800;color:${yascoBrand.error};">${params.currency} ${params.amount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Overdue By</td>
            <td style="text-align:right;font-weight:600;color:${yascoBrand.error};">${params.daysOverdue} day${params.daysOverdue > 1 ? "s" : ""}</td>
          </tr>
        </table>
      `, yascoBrand.error, "#FEF2F2")}
      ${button("#", "Pay Now", yascoBrand.error)}
      <p style="margin:20px 0 0;font-size:13px;color:${yascoBrand.textLight};line-height:1.6;">
        Please arrange payment at your earliest convenience to avoid any service interruption.
      </p>
    `, "⚠️ Payment Overdue");
  },

  planExpiring(params: {
    planName: string;
    companyName: string;
    daysLeft: number;
    expiryDate: string;
  }): string {
    const isUrgent = params.daysLeft <= 3;
    const borderColor = isUrgent ? yascoBrand.error : yascoBrand.warning;
    const bgColor = isUrgent ? "#FEF2F2" : "#FFFBEB";
    return wrapper(`
      <p style="margin:0 0 20px;font-size:16px;color:${yascoBrand.text};line-height:1.6;">
        Dear <strong>${params.companyName}</strong>,
      </p>
      <p style="margin:0 0 10px;font-size:15px;color:${yascoBrand.text};line-height:1.6;">
        Your <strong>${params.planName}</strong> plan is about to expire.
      </p>
      ${box(`
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px;color:${yascoBrand.text};">
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Plan</td>
            <td style="text-align:right;font-weight:700;">${params.planName}</td>
          </tr>
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Expiry Date</td>
            <td style="text-align:right;font-weight:600;">${params.expiryDate}</td>
          </tr>
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Time Remaining</td>
            <td style="text-align:right;font-size:20px;font-weight:800;color:${borderColor};">${params.daysLeft} day${params.daysLeft > 1 ? "s" : ""}</td>
          </tr>
        </table>
      `, borderColor, bgColor)}
      ${button("#", "Renew Plan", borderColor)}
      <p style="margin:20px 0 0;font-size:13px;color:${yascoBrand.textLight};line-height:1.6;">
        ${isUrgent ? "Your plan will expire soon. Please renew to avoid service interruption." : "We recommend renewing your plan to continue enjoying uninterrupted service."}
      </p>
    `, isUrgent ? "🔴 Plan Expiring Soon" : "🟡 Plan Expiry Reminder");
  },

  planExpired(params: {
    planName: string;
    companyName: string;
  }): string {
    return wrapper(`
      <p style="margin:0 0 20px;font-size:16px;color:${yascoBrand.text};line-height:1.6;">
        Dear <strong>${params.companyName}</strong>,
      </p>
      <p style="margin:0 0 10px;font-size:15px;color:${yascoBrand.text};line-height:1.6;">
        Your <strong>${params.planName}</strong> plan has expired.
      </p>
      ${box(`
        <div style="text-align:center;padding:10px 0;">
          <p style="margin:0 0 5px;font-size:36px;">⛔</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:${yascoBrand.error};">Service Suspended</p>
          <p style="margin:5px 0 0;font-size:13px;color:${yascoBrand.textLight};">Your ${params.planName} plan is no longer active</p>
        </div>
      `, yascoBrand.error, "#FEF2F2")}
      ${button("#", "Reactivate Plan", yascoBrand.primary)}
      <p style="margin:20px 0 0;font-size:13px;color:${yascoBrand.textLight};line-height:1.6;">
        Renew your subscription to restore full access to all features.
      </p>
    `, "⛔ Plan Expired");
  },

  welcome(params: {
    companyName: string;
    ownerName: string;
    planName: string;
  }): string {
    return wrapper(`
      <p style="margin:0 0 20px;font-size:16px;color:${yascoBrand.text};line-height:1.6;">
        Welcome <strong>${params.ownerName}</strong>!
      </p>
      <p style="margin:0 0 10px;font-size:15px;color:${yascoBrand.text};line-height:1.6;">
        Thank you for choosing <strong>${yascoBrand.logo} ERP</strong>. Your account has been created successfully.
      </p>
      ${box(`
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px;color:${yascoBrand.text};">
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Company</td>
            <td style="text-align:right;font-weight:700;">${params.companyName}</td>
          </tr>
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Plan</td>
            <td style="text-align:right;">${params.planName}</td>
          </tr>
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Status</td>
            <td style="text-align:right;"><span style="background:#D1FAE5;color:#065F46;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">Active</span></td>
          </tr>
        </table>
      `, yascoBrand.success, "#ECFDF5")}
      ${button("https://yasco.tech", "Go to Dashboard")}
      <p style="margin:20px 0 0;font-size:13px;color:${yascoBrand.textLight};line-height:1.6;">
        If you have any questions, our support team is here to help.
      </p>
    `, "🎉 Welcome to YASCO ERP");
  },

  loginNotification(params: {
    name: string;
    time: string;
    device: string;
    location: string;
  }): string {
    return wrapper(`
      <p style="margin:0 0 20px;font-size:16px;color:${yascoBrand.text};line-height:1.6;">
        Dear <strong>${params.name}</strong>,
      </p>
      <p style="margin:0 0 10px;font-size:15px;color:${yascoBrand.text};line-height:1.6;">
        A new login was detected on your account.
      </p>
      ${box(`
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px;color:${yascoBrand.text};">
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Time</td>
            <td style="text-align:right;">${params.time}</td>
          </tr>
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Device</td>
            <td style="text-align:right;">${params.device}</td>
          </tr>
          <tr>
            <td style="font-weight:600;color:${yascoBrand.textLight};">Location</td>
            <td style="text-align:right;">${params.location}</td>
          </tr>
        </table>
      `, yascoBrand.primary)}
      <p style="margin:20px 0 0;font-size:13px;color:${yascoBrand.textLight};line-height:1.6;">
        If this was you, you can ignore this email. If not, please secure your account immediately.
      </p>
    `, "🔔 Login Notification");
  },

  complianceAlert(params: {
    alertType: string;
    message: string;
    severity: "critical" | "high" | "medium" | "low";
    actionRequired: string;
    deadline?: string;
  }): string {
    const severityColors = { critical: yascoBrand.error, high: yascoBrand.warning, medium: yascoBrand.primary, low: yascoBrand.success };
    const color = severityColors[params.severity];
    return wrapper(`
      <div style="background:${color}20;border:1px solid ${color};border-radius:8px;padding:20px;margin-bottom:20px;">
        <p style="margin:0;font-size:13px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:1px;">${params.severity.toUpperCase()} PRIORITY</p>
        <p style="margin:5px 0 0;font-size:15px;font-weight:600;color:${yascoBrand.text};">${params.alertType}</p>
      </div>
      <p style="margin:0 0 20px;font-size:15px;color:${yascoBrand.text};line-height:1.6;">${params.message}</p>
      ${box(`
        <p style="margin:0;font-size:14px;font-weight:600;color:${yascoBrand.text};">Action Required:</p>
        <p style="margin:5px 0 0;font-size:14px;color:${yascoBrand.text};line-height:1.6;">${params.actionRequired}</p>
        ${params.deadline ? `<p style="margin:10px 0 0;font-size:13px;color:${yascoBrand.error};font-weight:600;">Deadline: ${params.deadline}</p>` : ""}
      `, color, `${color}08`)}
      ${button("#", "View Dashboard", color)}
    `, `🛡️ ${params.alertType} Alert`);
  },
};
