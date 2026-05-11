import { cookies } from "next/headers";

import { APP_LOCALE_COOKIE, normalizeAppLocale } from "@/lib/i18n";

export async function getCurrentLocale() {
  const cookieStore = await cookies();
  return normalizeAppLocale(cookieStore.get(APP_LOCALE_COOKIE)?.value);
}
