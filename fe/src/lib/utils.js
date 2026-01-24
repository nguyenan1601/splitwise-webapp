import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = "VND") {
  const locales = {
    VND: "vi-VN",
    USD: "en-US",
    EUR: "de-DE",
  };

  return new Intl.NumberFormat(locales[currency] || "vi-VN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(amount);
}

export function formatDate(date, locale = "vi-VN") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date, locale = "vi-VN") {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (days > 0) return rtf.format(-days, "day");
  if (hours > 0) return rtf.format(-hours, "hour");
  if (minutes > 0) return rtf.format(-minutes, "minute");
  return rtf.format(-seconds, "second");
}
