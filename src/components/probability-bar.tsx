"use client";

import { cn } from "@/lib/utils";

interface ProbabilityBarProps {
  homeLabel: string;
  awayLabel: string;
  homeProb: number;
  drawProb: number;
  awayProb: number;
  className?: string;
}

export function ProbabilityBar({
  homeLabel,
  awayLabel,
  homeProb,
  drawProb,
  awayProb,
  className,
}: ProbabilityBarProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="bg-blue-500 transition-all duration-500"
          style={{ width: `${homeProb}%` }}
          title={`${homeLabel}: ${homeProb.toFixed(1)}%`}
        />
        <div
          className="bg-gray-500 transition-all duration-500"
          style={{ width: `${drawProb}%` }}
          title={`平局: ${drawProb.toFixed(1)}%`}
        />
        <div
          className="bg-red-400 transition-all duration-500"
          style={{ width: `${awayProb}%` }}
          title={`${awayLabel}: ${awayProb.toFixed(1)}%`}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="text-blue-400">
          {homeLabel} {homeProb.toFixed(1)}%
        </span>
        <span className="text-gray-400">平 {drawProb.toFixed(1)}%</span>
        <span className="text-red-400">
          {awayProb.toFixed(1)}% {awayLabel}
        </span>
      </div>
    </div>
  );
}
