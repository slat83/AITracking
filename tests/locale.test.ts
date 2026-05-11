import { describe, expect, it } from "vitest";

import { getHtmlLang, getIntlLocale, normalizeAppLocale, translateInterfaceText } from "@/lib/i18n";

describe("locale utilities", () => {
  it("normalizes the supported locale values", () => {
    expect(normalizeAppLocale("ru")).toBe("ru");
    expect(normalizeAppLocale("en")).toBe("en");
    expect(normalizeAppLocale("fr")).toBe("en");
    expect(normalizeAppLocale(undefined)).toBe("en");
  });

  it("returns locale metadata for html and intl formatting", () => {
    expect(getHtmlLang("en")).toBe("en");
    expect(getHtmlLang("ru")).toBe("ru");
    expect(getIntlLocale("en")).toBe("en-US");
    expect(getIntlLocale("ru")).toBe("ru-RU");
  });

  it("translates exact interface strings", () => {
    expect(translateInterfaceText("Workspace", "ru")).toBe("Рабочее пространство");
    expect(translateInterfaceText("Sign in to Flowvory", "ru")).toBe("Войти в Flowvory");
    expect(translateInterfaceText("Workspace", "en")).toBe("Workspace");
  });

  it("translates prefixed labels and reusable fallback values", () => {
    expect(translateInterfaceText("Owner: Unassigned", "ru")).toBe("Владелец: Не назначен");
    expect(translateInterfaceText("Verified: May 11, 2026", "ru")).toBe("Проверено: 11 мая 2026 г.");
  });

  it("translates dynamic invite and timeline phrases", () => {
    expect(translateInterfaceText("Join the Acme workspace", "ru")).toBe(
      "Присоединиться к рабочему пространству Acme",
    );
    expect(
      translateInterfaceText(
        "This invite grants access to the founder-led Flowvory audit workspace for team@acme.com. Set your password here once, then use the normal sign-in page for future access.",
        "ru",
      ),
    ).toBe(
      "Это приглашение дает доступ к рабочему пространству аудита Flowvory для team@acme.com. Сначала задайте пароль, затем используйте обычную страницу входа для следующих входов.",
    );
    expect(translateInterfaceText("Scenario status is Blocked and proof readiness is Ready.", "ru")).toBe(
      "Статус сценария: Заблокировано. Готовность доказательств: Готово.",
    );
  });
});
