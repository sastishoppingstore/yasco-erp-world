import * as cookie from "cookie";
import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { env } from "./lib/env";
import { DESKTOP_LICENSE_COOKIE, verifyDesktopLicense } from "./lib/license";
import { getSessionCookieOptions } from "./lib/cookies";

export const licenseRouter = createRouter({
  status: publicQuery.query(({ ctx }) => {
    try {
      const cookies = cookie.parse(ctx.req.headers.get("cookie") || "");
      const key = cookies[DESKTOP_LICENSE_COOKIE];
      if (!key) return { desktopMode: env.isDesktop, activated: false as const };
      const license = verifyDesktopLicense(key);
      return { desktopMode: env.isDesktop, activated: true as const, license };
    } catch (error: any) {
      return { desktopMode: env.isDesktop, activated: false as const, error: error.message };
    }
  }),

  activate: publicQuery
    .input(z.object({ key: z.string().min(20) }))
    .mutation(({ input, ctx }) => {
      const license = verifyDesktopLicense(input.key);
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(DESKTOP_LICENSE_COOKIE, input.key.trim(), {
          httpOnly: true,
          path: "/",
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Math.max(60, Math.floor((new Date(license.expiresAt).getTime() - Date.now()) / 1000)),
        }),
      );
      return { activated: true, license };
    }),
});
