import { describe, it, expect } from "vitest";
import { Session, ErrorMessages, Paths } from "@contracts/constants";

describe("Constants", () => {
  it("Session constants are defined", () => {
    expect(Session.cookieName).toBe("erp_sid");
    expect(Session.maxAgeMs).toBeGreaterThan(0);
  });

  it("ErrorMessages are defined", () => {
    expect(ErrorMessages.unauthenticated).toBeTruthy();
    expect(ErrorMessages.insufficientRole).toBeTruthy();
  });

  it("Paths are defined", () => {
    expect(Paths.login).toBeTruthy();
    expect(Paths.oauthCallback).toBeTruthy();
  });
});
