const DEFAULT_SITE_URL = "https://content-ops.example.com";

export const siteConfig = {
  name: "Content Ops Foundation",
  titleSuffix: "Content Ops Foundation",
  description:
    "Evidence-backed VIN check guidance, trust pages, and comparison content built for search and AI retrieval.",
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
