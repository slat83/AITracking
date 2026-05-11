const DEFAULT_SITE_URL = "https://flowvory.com";

export const siteConfig = {
  name: "Flowvory",
  titleSuffix: "Flowvory",
  description:
    "Founder-led AI Visibility Audit for eCommerce brands, with an invite-only workspace and a practical 30-day action plan.",
  defaultLocale: "en_US",
  siteUrl: getSiteUrl(),
};

function normalizeUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getSiteUrl() {
  const rawValue = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL;

  if (!rawValue) {
    return DEFAULT_SITE_URL;
  }

  return normalizeUrl(rawValue);
}

export function absoluteUrl(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteConfig.siteUrl}${normalizedPath}`;
}
