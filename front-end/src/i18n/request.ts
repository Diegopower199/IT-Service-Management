import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { messages } from "../../messages";

const SUPPORTED_LOCALES = ["en", "es"] as const;

type Locale = (typeof SUPPORTED_LOCALES)[number];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();

  const cookieLocale = cookieStore.get("locale")?.value;

  const locale: Locale = SUPPORTED_LOCALES.includes(cookieLocale as Locale)
    ? (cookieLocale as Locale)
    : "en";

  return {
    locale,
    messages: messages[locale],
  };
});
