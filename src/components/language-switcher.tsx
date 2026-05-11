"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";

import { APP_LOCALE_COOKIE, type AppLocale } from "@/lib/i18n";

const LANGUAGE_OPTIONS: Array<{ value: AppLocale; label: string }> = [
  { value: "en", label: "EN" },
  { value: "ru", label: "RU" },
];

export function LanguageSwitcher({ locale }: { locale: AppLocale }) {
  const router = useRouter();

  return (
    <div className="globalLanguageSwitcher card" aria-label="Language switcher" role="group">
      <span className="globalLanguageSwitcherLabel">Language</span>
      <div className="globalLanguageSwitcherButtons">
        {LANGUAGE_OPTIONS.map((option) => (
          <button
            className={`globalLanguageSwitcherButton${option.value === locale ? " globalLanguageSwitcherButtonActive" : ""}`}
            key={option.value}
            onClick={() => {
              if (option.value === locale) {
                return;
              }

              document.cookie = `${APP_LOCALE_COOKIE}=${option.value}; Path=/; Max-Age=31536000; SameSite=Lax`;

              startTransition(() => {
                router.refresh();
              });
            }}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
