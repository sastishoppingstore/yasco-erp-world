import type { CookieOptions } from "hono/utils/cookie";

function isLocalhost(headers: Headers): boolean {
  const host = headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

function isHttps(headers: Headers): boolean {
  const proto = headers.get("x-forwarded-proto") || "";
  return proto === "https";
}

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const localhost = isLocalhost(headers);
  const https = isHttps(headers);

  return {
    httpOnly: true,
    path: "/",
    sameSite: localhost || !https ? "Lax" : "None",
    secure: https,
  };
}
