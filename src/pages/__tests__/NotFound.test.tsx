import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import NotFound from "../NotFound";

describe("NotFound", () => {
  it("renders 404 message", () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText("404")).toBeDefined();
    expect(screen.getByText(/page not found/i)).toBeDefined();
  });

  it("has a link back to home", () => {
    renderWithProviders(<NotFound />);
    const link = screen.getByRole("link", { name: /back to home/i });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/");
  });
});
