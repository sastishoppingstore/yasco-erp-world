# YASCO

Enterprise ERP for finance, inventory, sales, purchase, CRM, HRM, manufacturing, projects, support, assets, and platform growth workflows.

## Login

The app now uses first-party authentication:

- Admin password login
- Email OTP login through SMTP
- Secure HTTP-only session cookie
- Protected ERP layout with logout

Default admin credentials:

```text
Username: wafaweb
Password: Wafa@1122
```

Override these in production:

```env
ADMIN_USERNAME=wafaweb
ADMIN_PASSWORD=change-this-password
ADMIN_EMAIL=admin@yourdomain.com
```

## SMTP OTP

Set SMTP variables to enable real email OTP delivery:

```env
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=no-reply@yourdomain.com
SMTP_SECURE=false
```

For port `587`, keep `SMTP_SECURE=false` so STARTTLS is used. For port `465`, set `SMTP_SECURE=true`.

If SMTP is not configured in development, the login page shows the OTP for testing. In production, missing SMTP configuration blocks OTP sending.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Checks

```bash
npm run lint
npm run check
npm run test
```

`npm run check` currently reports existing project-wide Drizzle/tRPC type issues in older modules. The production build passes.
