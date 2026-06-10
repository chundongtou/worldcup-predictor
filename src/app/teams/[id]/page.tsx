"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getTeamFlag, formatMatchTime, getConfidenceColor } from "@/lib/utils";
import type { Team, Match } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "";

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;
  const [team, setTeam] = useState<Team | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/api/teams/${teamId}`).then((r) => r.json()),
      fetch(`${BASE_URL}/api/matches?team=${teamId}`).then((r) => r.json()),
    ])
      .then(([teamData, matchesData]) => {
        setTeam(teamData);
        setMatches(matchesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#326295] border-t-transparent" />
      </div>
    );
  }

  if (!team) {
    return <p className="text-center text-muted-foreground py-20">Team not found.</p>;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Team Info Card */}
        <Card className="mb-6 border-white/5 bg-[#0E1A2E]">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <span className="text-7xl mb-4">{getTeamFlag(team.flagCode)}</span>
              <h1 className="text-3xl font-bold text-white mb-2">{team.name}</h1>
              <Badge variant="outline" className="border-[#326295] text-[#326295] mb-6">
                {team.groupName}
              </Badge>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-lg">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">ELO Rating</p>
                  <p className="text-2xl font-bold text-[#E3D380]">{team.eloRating}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">FIFA Ranking</p>
                  <p className="text-2xl font-bold text-[#E3D380]">{team.fifaRanking ?? "N/A"}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Confederation</p>
                  <p className="text-lg font-bold text-white">{team.confederation ?? "N/A"}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">WC Appearances</p>
                  <p className="text-2xl font-bold text-[#E3D380]">{team.worldCupAppearances}</p>
                </div>
              </div>

              {team.bestResult && (
                <div className="mt-4">
                  <span className="text-sm text-muted-foreground">Best Result: </span>
                  <span className="text-sm font-medium text-white">{team.bestResult}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Group Matches */}
        <Card className="border-white/5 bg-[#0E1A2E]">
          <CardHeader>
            <CardTitle className="text-[#E3D380]">📅 Group Stage Matches</CardTitle>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No matches scheduled.</p>
            ) : (
              <div className="space-y-3">
                {matches.map((match) => {
                  const pred = match.aiPrediction;
                  const isHome = match.homeTeamId === teamId;

                  return (
                    <Link key={match.id} href={`/matches/${match.id}`}>
                      <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#0A1628] p-4 hover:border-[#326295]/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-20">
                            {formatMatchTime(new Date(match.matchTime))}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getTeamFlag(match.homeTeam.flagCode)}</span>
                            <span className={`text-sm font-medium ${isHome ? "text-white" : "text-muted-foreground"}`}>
                              {match.homeTeam.name}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground mx-2">
                            {match.isFinished ? `${match.homeScore} - ${match.awayScore}` : "vs"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${!isHome ? "text-white" : "text-muted-foreground"}`}>
                              {match.awayTeam.name}
                            </span>
                            <span className="text-xl">{getTeamFlag(match.awayTeam.flagCode)}</span>
                          </div>
                        </div>

                        {pred && (
                          <div className="flex items-center gap-3">
                            <div className="text-xs text-muted-foreground">
                              AI: {pred.predictedHomeScore}-{pred.predictedAwayScore}
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getConfidenceColor(pred.confidence)} border-current`}
                            >
                              {pred.confidence.toFixed(0)}%
                            </Badge>
                          </div>
                        )}

                        <Badge
                          variant={match.isFinished ? "default" : "outline"}
                          className={match.isFinished ? "bg-green-700" : "border-[#326295] text-[#326295]"}
                        >
                          {match.isFinished ? "FT" : "Upcoming"}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
