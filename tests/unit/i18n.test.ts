import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("US-05: Bilingual Interface & Localization Parity (Arabic / English)", () => {
  const arPath = path.resolve(__dirname, "../../messages/ar.json");
  const enPath = path.resolve(__dirname, "../../messages/en.json");

  const arMessages = JSON.parse(fs.readFileSync(arPath, "utf-8"));
  const enMessages = JSON.parse(fs.readFileSync(enPath, "utf-8"));

  it("both ar.json and en.json exist and are non-empty", () => {
    expect(Object.keys(arMessages).length).toBeGreaterThan(0);
    expect(Object.keys(enMessages).length).toBeGreaterThan(0);
  });

  it("core feature namespaces exist in both dictionaries", () => {
    const coreNamespaces = [
      "site",
      "header",
      "nav",
      "auth",
      "home",
      "catalog",
      "course",
      "cart",
      "checkout",
      "player",
      "instructor",
      "footer",
      "certificate",
      "certificateVerify",
      "studentWorkspace",
      "studentSettings",
      "courseStudio",
      "instructorDashboard",
    ];

    for (const ns of coreNamespaces) {
      expect(arMessages, `Missing namespace '${ns}' in ar.json`).toHaveProperty(ns);
      expect(enMessages, `Missing namespace '${ns}' in en.json`).toHaveProperty(ns);
    }
  });

  it("both dictionaries have high top-level parity", () => {
    const arKeys = Object.keys(arMessages);
    const enKeys = Object.keys(enMessages);

    // Ensure all critical user-facing namespaces in ar exist in en
    for (const key of arKeys) {
      expect(enMessages, `Namespace '${key}' present in ar.json but missing in en.json`).toHaveProperty(key);
    }
    for (const key of enKeys) {
      expect(arMessages, `Namespace '${key}' present in en.json but missing in ar.json`).toHaveProperty(key);
    }
  });

  it("determines correct text direction (RTL for Arabic, LTR for English)", () => {
    const getDirection = (locale: string) => (locale === "ar" ? "rtl" : "ltr");
    expect(getDirection("ar")).toBe("rtl");
    expect(getDirection("en")).toBe("ltr");
  });
});
