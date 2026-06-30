import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./lib/session";
import { requireDesktopLicense } from "./lib/license";
import { localAdminUnionId, createLocalAdminUser } from "./lib/localUser";
import { findUserByUnionId } from "./queries/users";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import * as cookie from "cookie";

async function authenticateRequest(headers: Headers) {
  requireDesktopLicense(headers);
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    console.warn("[auth] No session cookie found in request.");
    throw Errors.forbidden("Invalid authentication token.");
  }
  const { verifySessionToken } = await import("./lib/session");
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  let user;
  try {
    user = await findUserByUnionId(claim.unionId);
  } catch (error) {
    if (claim.unionId === localAdminUnionId()) {
      console.warn("[auth] Using local admin fallback because database is unavailable.", error);
      return createLocalAdminUser();
    }
    throw error;
  }
  if (!user) {
    if (claim.unionId === localAdminUnionId()) {
      return createLocalAdminUser();
    }
    throw Errors.forbidden("User not found. Please re-login.");
  }
  return user;
}

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  clientIp?: string;
  countryCode?: string;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const req = opts.req;
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
  const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country");

  const ctx: TrpcContext = { 
    req: opts.req, 
    resHeaders: opts.resHeaders,
    clientIp: ip ? ip.split(',')[0].trim() : undefined,
    countryCode: country || undefined,
  };
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Authentication is optional here
  }
  return ctx;
}
