"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTeamFlag, formatMatchTime } from "@/lib/utils";
import { fetchMatches } from "@/lib/api";
import type { Match } from "@/lib/types";

const ROUNDS = [
  { value: "GROUP_STAGE", label: "Group Stage" },
  { value: "ROUND_OF_32", label: "Round of 32" },
  { value: "ROUND_OF_16", label: "Round of 16" },
  { value: "QUARTER_FINAL", label: "Quarter-Finals" },
  { value: "SEMI_FINAL", label: "Semi-Finals" },
  { value: "FINAL", label: "Final" },
];

const GROUPS = Array.from({ length: 12 }, (_, i) => `Group ${String.fromCharCode(65 + i)}`);

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRound, setActiveRound] = useState("GROUP_STAGE");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchMatches(activeRound, activeGroup || undefined)
      .then(setMatches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeRound, activeGroup]);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-3xl font-bold text-[#E3D380]"
      >
        Match Schedule
      </motion.h1>

      {/* Round Tabs */}
      <Tabs value={activeRound} onValueChange={setActiveRound} className="mb-6">
        <TabsList className="bg-[#0E1A2E] border border-white/10 flex-wrap h-auto gap-1 p-1">
          {ROUNDS.map((round) => (
            <TabsTrigger
              key={round.value}
              value={round.value}
              className="data-[state=active]:bg-[#326295] data-[state=active]:text-white text-sm"
            >
              {round.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Group Filter (only for group stage) */}
      {activeRound === "GROUP_STAGE" && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={activeGroup === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveGroup(null)}
            className={activeGroup === null ? "bg-[#326295]" : "border-white/20"}
          >
            All
          </Button>
          {GROUPS.map((g) => (
            <Button
              key={g}
              variant={activeGroup === g ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveGroup(g)}
              className={activeGroup === g ? "bg-[#326295]" : "border-white/20"}
            >
              {g.replace("Group ", "")}
            </Button>
          ))}
        </div>
      )}

      {/* Match Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#326295] border-t-transparent" />
        </div>
      ) : matches.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No matches found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link href={`/matches/${match.id}`}>
                <Card className="group cursor-pointer border-white/5 bg-[#0E1A2E] transition-all hover:border-[#326295]/50 hover:shadow-lg hover:shadow-[#326295]/10">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {match.round === "GROUP_STAGE" ? `Matchday ${match.matchday}` : match.round.replace(/_/g, " ")}
                        {match.groupName && ` · ${match.groupName}`}
                      </span>
                      <Badge
                        variant={match.isFinished ? "default" : "outline"}
                        className={match.isFinished ? "bg-green-700" : "border-[#326295] text-[#326295]"}
                      >
                        {match.isFinished ? "FT" : match.status === "IN_PLAY" ? "LIVE" : "Upcoming"}
                      </Badge>
                    </div>

                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex flex-1 items-center gap-2">
                        <span className="text-2xl">{getTeamFlag(match.homeTeam.flagCode)}</span>
                        <span className="font-medium text-white truncate">{match.homeTeam.name}</span>
                      </div>
                      <div className="mx-3 text-lg font-bold text-[#E3D380]">
                        {match.isFinished ? (
                          <span>{match.homeScore} - {match.awayScore}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">vs</span>
                        )}
                      </div>
                      <div className="flex flex-1 items-center justify-end gap-2">
                        <span className="font-medium text-white truncate text-right">{match.awayTeam.name}</span>
                        <span className="text-2xl">{getTeamFlag(match.awayTeam.flagCode)}</span>
                      </div>
                    </div>

                    <div className="text-center text-xs text-muted-foreground">
                      {formatMatchTime(new Date(match.matchTime))}
                      {match.stadium && ` · ${match.stadium}`}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
