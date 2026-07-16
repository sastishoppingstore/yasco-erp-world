import { describe, it, expect } from "vitest";
import { t, setLanguage, getLanguage } from "@/lib/i18n";

describe("i18n", () => {
  it("returns English by default", () => {
    expect(getLanguage()).toBe("en");
  });

  it("translates known keys in English", () => {
    expect(t("common.save")).toBe("Save");
    expect(t("common.cancel")).toBe("Cancel");
    expect(t("nav.dashboard")).toBe("Dashboard");
  });

  it("translates known keys in Arabic", () => {
    expect(t("common.save", "ar")).toBe("حفظ");
    expect(t("common.cancel", "ar")).toBe("إلغاء");
    expect(t("nav.dashboard", "ar")).toBe("لوحة القيادة");
  });

  it("returns key for unknown translations", () => {
    expect(t("nonexistent.key")).toBe("nonexistent.key");
  });

  it("setLanguage updates current language", () => {
    setLanguage("ar");
    expect(getLanguage()).toBe("ar");
    expect(t("common.save")).toBe("حفظ");
    setLanguage("en");
    expect(getLanguage()).toBe("en");
  });
});
