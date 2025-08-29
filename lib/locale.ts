import { headers } from "next/headers";

export async function getUserLocale(): Promise<string> {
    const h = await headers();
    const acceptLanguage = h.get("accept-language");

    if (!acceptLanguage) return "en"; // fallback

    const locale = acceptLanguage.split(",")[0]?.split("-")[0] || "en";

    const supportedLocales = ["en", "hi"];
    return supportedLocales.includes(locale) ? locale : "en";
}
