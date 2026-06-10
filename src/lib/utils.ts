import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTeamFlag(flagCode: string): string {
  if (flagCode === "GB-ENG") return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
  // Convert country code to flag emoji
  const codePoints = flagCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function formatMatchTime(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 70) return "text-green-500";
  if (confidence >= 50) return "text-yellow-500";
  return "text-red-500";
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 70) return "高置信";
  if (confidence >= 50) return "中置信";
  return "低置信";
}
