import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";

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
