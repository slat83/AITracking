import type { Metadata } from "next";

import "@/app/globals.css";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LocaleRuntime } from "@/components/locale-runtime";
import { getSiteUrl, siteConfig } from "@/lib/site";
import { getHtmlLang } from "@/lib/i18n";
import { getCurrentLocale } from "@/server/i18n";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.titleSuffix}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    locale: siteConfig.defaultLocale,
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();

  return (
    <html data-locale={locale} lang={getHtmlLang(locale)}>
      <body>
        <LanguageSwitcher locale={locale} />
        <LocaleRuntime locale={locale} />
        {children}
      </body>
    </html>
  );
}
