"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTeamFlag, formatMatchTime } from "@/lib/utils";
import { fetchMatches } from "@/lib/api";
import type { Match } from "@/lib/types";

const KNOCKOUT_ROUNDS = [
  { key: "ROUND_OF_32", label: "Round of 32" },
  { key: "ROUND_OF_16", label: "Round of 16" },
  { key: "QUARTER_FINAL", label: "Quarter-Finals" },
  { key: "SEMI_FINAL", label: "Semi-Finals" },
  { key: "FINAL", label: "Final" },
];

function MatchSlot({ match }: { match?: Match }) {
  if (!match) {
    return (
      <div className="rounded border border-dashed border-white/10 bg-[#0A1628]/50 p-3 text-center text-xs text-muted-foreground">
        TBD
      </div>
    );
  }

  const isFinished = match.isFinished;
  const homeWin = isFinished && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWin = isFinished && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  return (
    <div className="rounded border border-white/10 bg-[#0E1A2E] overflow-hidden min-w-[180px]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{getTeamFlag(match.homeTeam.flagCode)}</span>
          <span className={`text-sm font-medium truncate ${homeWin ? "text-[#E3D380]" : "text-white"}`}>
            {match.homeTeam.name}
          </span>
        </div>
        <span className={`text-sm font-bold ${homeWin ? "text-[#E3D380]" : "text-muted-foreground"}`}>
          {isFinished ? match.homeScore : "-"}
        </span>
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{getTeamFlag(match.awayTeam.flagCode)}</span>
          <span className={`text-sm font-medium truncate ${awayWin ? "text-[#E3D380]" : "text-white"}`}>
            {match.awayTeam.name}
          </span>
        </div>
        <span className={`text-sm font-bold ${awayWin ? "text-[#E3D380]" : "text-muted-foreground"}`}>
          {isFinished ? match.awayScore : "-"}
        </span>
      </div>
      {!isFinished && (
        <div className="px-3 py-1 text-center text-[10px] text-muted-foreground border-t border-white/5">
          {formatMatchTime(new Date(match.matchTime))}
        </div>
      )}
    </div>
  );
}

export default function BracketPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(KNOCKOUT_ROUNDS.map((r) => fetchMatches(r.key)))
      .then((results) => setMatches(results.flat()))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const grouped = KNOCKOUT_ROUNDS.map((round) => ({
    ...round,
    matches: matches.filter((m) => m.round === round.key),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-3xl font-bold text-[#E3D380]"
      >
        Knockout Bracket
      </motion.h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#326295] border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-8 min-w-max">
            {grouped.map((round, ri) => (
              <motion.div
                key={round.key}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ri * 0.1 }}
                className="flex flex-col"
              >
                <h3 className="mb-4 text-center text-sm font-semibold text-[#E3D380] uppercase tracking-wider">
                  {round.label}
                </h3>
                <div className="flex flex-col gap-4" style={{ justifyContent: "center", minHeight: ri > 0 ? `${Math.pow(2, ri) * 120}px` : undefined }}>
                  {round.matches.length === 0 ? (
                    Array.from({ length: Math.max(1, 32 / Math.pow(2, ri)) }).map((_, j) => (
                      <MatchSlot key={j} />
                    ))
                  ) : (
                    round.matches.map((match) => (
                      <div key={match.id} className="flex items-center" style={{ marginTop: ri > 0 ? `${Math.pow(2, ri - 1) * 30}px` : 0, marginBottom: ri > 0 ? `${Math.pow(2, ri - 1) * 30}px` : 0 }}>
                        <MatchSlot match={match} />
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
