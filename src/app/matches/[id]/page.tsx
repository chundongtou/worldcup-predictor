"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { getTeamFlag, formatMatchTime, getConfidenceColor } from "@/lib/utils";
import { fetchMatch, submitPrediction } from "@/lib/api";
import type { Match } from "@/lib/types";

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [predHome, setPredHome] = useState("");
  const [predAway, setPredAway] = useState("");
  const [confidence, setConfidence] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMatch(matchId)
      .then(setMatch)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [matchId]);

  const handleSubmit = async () => {
    if (!predHome || !predAway) return;
    setSubmitting(true);
    try {
      await submitPrediction(matchId, parseInt(predHome), parseInt(predAway), confidence);
      // Refresh match data
      const updated = await fetchMatch(matchId);
      setMatch(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#326295] border-t-transparent" />
      </div>
    );
  }

  if (!match) {
    return <p className="text-center text-muted-foreground py-20">Match not found.</p>;
  }

  const pred = match.aiPrediction;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Match Header */}
        <Card className="mb-6 border-white/5 bg-[#0E1A2E]">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {match.round.replace(/_/g, " ")}{match.groupName && ` · ${match.groupName}`}
              </span>
              <Badge
                variant={match.isFinished ? "default" : "outline"}
                className={match.isFinished ? "bg-green-700" : match.status === "IN_PLAY" ? "bg-red-600" : "border-[#326295] text-[#326295]"}
              >
                {match.isFinished ? "Full Time" : match.status === "IN_PLAY" ? "LIVE" : "Upcoming"}
              </Badge>
            </div>

            <div className="flex items-center justify-between py-6">
              <Link href={`/teams/${match.homeTeamId}`} className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-5xl">{getTeamFlag(match.homeTeam.flagCode)}</span>
                <span className="text-lg font-semibold text-white">{match.homeTeam.name}</span>
              </Link>

              <div className="text-center">
                {match.isFinished || match.status === "IN_PLAY" ? (
                  <div className="text-4xl font-bold text-[#E3D380]">
                    {match.homeScore} - {match.awayScore}
                  </div>
                ) : (
                  <div className="text-2xl text-muted-foreground">vs</div>
                )}
              </div>

              <Link href={`/teams/${match.awayTeamId}`} className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-5xl">{getTeamFlag(match.awayTeam.flagCode)}</span>
                <span className="text-lg font-semibold text-white">{match.awayTeam.name}</span>
              </Link>
            </div>

            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>{formatMatchTime(new Date(match.matchTime))}</p>
              {match.stadium && <p>{match.stadium}{match.city && `, ${match.city}`}</p>}
              <p>ELO: {match.eloHome} vs {match.eloAway}</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Prediction */}
        {pred && (
          <Card className="mb-6 border-white/5 bg-[#0E1A2E]">
            <CardHeader>
              <CardTitle className="text-[#E3D380] flex items-center gap-2">
                🤖 AI Prediction
                <Badge variant="outline" className="border-[#326295] text-[#326295]">
                  {pred.modelVersion}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-center text-2xl font-bold text-white">
                {pred.predictedHomeScore} - {pred.predictedAwayScore}
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{match.homeTeam.name} Win</span>
                  <span className={getConfidenceColor(pred.homeWinProb * 100)}>{(pred.homeWinProb * 100).toFixed(1)}%</span>
                </div>
                <Progress value={pred.homeWinProb * 100} className="h-2 bg-white/10" />

                <div className="flex items-center justify-between text-sm">
                  <span>Draw</span>
                  <span className={getConfidenceColor(pred.drawProb * 100)}>{(pred.drawProb * 100).toFixed(1)}%</span>
                </div>
                <Progress value={pred.drawProb * 100} className="h-2 bg-white/10" />

                <div className="flex items-center justify-between text-sm">
                  <span>{match.awayTeam.name} Win</span>
                  <span className={getConfidenceColor(pred.awayWinProb * 100)}>{(pred.awayWinProb * 100).toFixed(1)}%</span>
                </div>
                <Progress value={pred.awayWinProb * 100} className="h-2 bg-white/10" />
              </div>

              <Separator className="my-4 bg-white/10" />
              <div className="text-center">
                <span className="text-sm text-muted-foreground">Confidence: </span>
                <span className={`text-lg font-bold ${getConfidenceColor(pred.confidence)}`}>
                  {pred.confidence.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Prediction */}
        <Card className="mb-6 border-white/5 bg-[#0E1A2E]">
          <CardHeader>
            <CardTitle className="text-[#E3D380]">📝 Your Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground mb-1 block">{match.homeTeam.name}</Label>
                <Input
                  type="number"
                  min="0"
                  value={predHome}
                  onChange={(e) => setPredHome(e.target.value)}
                  placeholder="0"
                  className="bg-[#0A1628] border-white/20 text-center text-lg"
                />
              </div>
              <span className="text-2xl text-muted-foreground pb-2">-</span>
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground mb-1 block">{match.awayTeam.name}</Label>
                <Input
                  type="number"
                  min="0"
                  value={predAway}
                  onChange={(e) => setPredAway(e.target.value)}
                  placeholder="0"
                  className="bg-[#0A1628] border-white/20 text-center text-lg"
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground mb-1 block">Confidence ({confidence}%)</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(parseInt(e.target.value))}
                  className="w-full accent-[#326295]"
                />
              </div>
              <Button onClick={handleSubmit} disabled={submitting || !predHome || !predAway} className="bg-[#326295] hover:bg-[#326295]/80">
                {submitting ? "..." : "Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Match Events */}
        <Card className="border-white/5 bg-[#0E1A2E]">
          <CardHeader>
            <CardTitle className="text-[#E3D380]">⚽ Match Events</CardTitle>
          </CardHeader>
          <CardContent>
            {match.isFinished ? (
              <p className="text-center text-muted-foreground py-8">Match events will appear here.</p>
            ) : (
              <p className="text-center text-muted-foreground py-8">Events will be shown during the match.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
