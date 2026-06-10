"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ProbabilityBar } from "@/components/probability-bar";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { getTeamFlag, formatMatchTime } from "@/lib/utils";
import type { Match, AiPrediction } from "@/lib/types";

interface MatchCardProps {
  match: Match & { aiPrediction: AiPrediction | null };
  index?: number;
}

export function MatchCard({ match, index = 0 }: MatchCardProps) {
  const pred = match.aiPrediction;
  const homeFlag = getTeamFlag(match.homeTeam.flagCode);
  const awayFlag = getTeamFlag(match.awayTeam.flagCode);

  if (!pred) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }}>
        <Card className="group cursor-pointer border-white/5 bg-[#0E1A2E] transition-all hover:border-[#326295]/50">
          <CardContent className="p-4">
            <div className="mb-3 text-xs text-muted-foreground">{match.round}{match.groupName && ` · ${match.groupName}`}</div>
            <div className="text-center py-6 text-muted-foreground">预测待生成</div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/ai-predictions/${match.id}`}>
        <Card className="group cursor-pointer border-white/5 bg-[#0E1A2E] transition-all hover:border-[#326295]/50 hover:shadow-lg hover:shadow-[#326295]/10">
          <CardContent className="p-4">
            {/* Header: Round + Confidence */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {match.round}
                {match.groupName && ` · ${match.groupName}`}
              </span>
              <ConfidenceBadge confidence={pred.confidence} />
            </div>

            {/* Teams */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex flex-1 items-center gap-2">
                <span className="text-2xl">{homeFlag}</span>
                <span className="font-medium text-white truncate">
                  {match.homeTeam.name}
                </span>
              </div>
              <div className="mx-3 flex items-center gap-1 text-lg font-bold text-[#E3D380]">
                <span>{pred.predictedHomeScore}</span>
                <span className="text-muted-foreground">:</span>
                <span>{pred.predictedAwayScore}</span>
              </div>
              <div className="flex flex-1 items-center justify-end gap-2">
                <span className="font-medium text-white truncate text-right">
                  {match.awayTeam.name}
                </span>
                <span className="text-2xl">{awayFlag}</span>
              </div>
            </div>

            {/* Probability Bar */}
            <ProbabilityBar
              homeLabel={match.homeTeam.name}
              awayLabel={match.awayTeam.name}
              homeProb={pred.homeWinProb}
              drawProb={pred.drawProb}
              awayProb={pred.awayWinProb}
            />

            {/* Match time */}
            <div className="mt-2 text-center text-xs text-muted-foreground">
              {formatMatchTime(new Date(match.matchTime))}
              {match.stadium && ` · ${match.stadium}`}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
