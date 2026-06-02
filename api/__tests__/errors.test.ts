import { describe, it, expect } from "vitest";
import { Errors } from "@contracts/errors";

describe("Errors", () => {
  it("badRequest creates correct error", () => {
    const err = Errors.badRequest("Invalid input");
    expect(err.tag).toBe("app_error");
    expect(err.status).toBe(400);
    expect(err.message).toBe("Invalid input");
  });

  it("unauthorized creates correct error", () => {
    const err = Errors.unauthorized("Not logged in");
    expect(err.tag).toBe("app_error");
    expect(err.status).toBe(401);
    expect(err.message).toBe("Not logged in");
  });

  it("forbidden creates correct error", () => {
    const err = Errors.forbidden("No access");
    expect(err.tag).toBe("app_error");
    expect(err.status).toBe(403);
    expect(err.message).toBe("No access");
  });

  it("notFound creates correct error", () => {
    const err = Errors.notFound("User not found");
    expect(err.tag).toBe("app_error");
    expect(err.status).toBe(404);
    expect(err.message).toBe("User not found");
  });

  it("internal creates correct error", () => {
    const err = Errors.internal("Server error");
    expect(err.tag).toBe("app_error");
    expect(err.status).toBe(500);
    expect(err.message).toBe("Server error");
  });
});
