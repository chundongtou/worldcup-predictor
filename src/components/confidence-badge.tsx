"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const level =
    confidence >= 80
      ? { label: "极高", variant: "default" as const, color: "bg-green-600 text-white" }
      : confidence >= 70
        ? { label: "高置信", variant: "default" as const, color: "bg-green-500/20 text-green-400 border-green-500/30" }
        : confidence >= 50
          ? { label: "中置信", variant: "secondary" as const, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" }
          : { label: "低置信", variant: "outline" as const, color: "bg-red-500/20 text-red-400 border-red-500/30" };

  return (
    <Badge
      variant={level.variant}
      className={cn("border text-xs font-semibold", level.color, className)}
    >
      {level.label} {confidence.toFixed(0)}%
    </Badge>
  );
}
