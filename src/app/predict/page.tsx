"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTeamFlag, formatMatchTime } from "@/lib/utils";
import { fetchMatches, fetchUserPredictions, submitPrediction } from "@/lib/api";
import type { Match, UserPrediction } from "@/lib/types";

export default function PredictPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predicted, setPredicted] = useState<Set<string>>(new Set());
  const [formState, setFormState] = useState<
    Record<string, { home: string; away: string; confidence: number }>
  >({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [allMatches, userPreds] = await Promise.all([
        fetchMatches(),
        fetchUserPredictions(),
      ]);
      const scheduled = allMatches.filter((m) => m.status === "scheduled");
      setMatches(scheduled);
      const predictedIds = new Set(userPreds.map((p) => p.matchId));
      setPredicted(predictedIds);
    } catch (e) {
      console.error("Failed to load data", e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const availableMatches = matches.filter((m) => !predicted.has(m.id));

  const handleSubmit = async (matchId: string) => {
    const state = formState[matchId];
    if (!state || state.home === "" || state.away === "") return;
    setSubmitting(matchId);
    try {
      await submitPrediction(
        matchId,
        parseInt(state.home),
        parseInt(state.away),
        state.confidence
      );
      setPredicted((prev) => new Set([...prev, matchId]));
      setToast("Prediction submitted successfully!");
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast("Failed to submit prediction.");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSubmitting(null);
    }
  };

  const updateField = (
    matchId: string,
    field: "home" | "away" | "confidence",
    value: string | number
  ) => {
    setFormState((prev) => ({
      ...prev,
      [matchId]: {
        home: prev[matchId]?.home ?? "",
        away: prev[matchId]?.away ?? "",
        confidence: prev[matchId]?.confidence ?? 5,
        [field]: value,
      },
    }));
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#326295] px-6 py-3 text-white shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-2 text-3xl font-bold text-white">Make Predictions</h1>
        <p className="mb-8 text-muted-foreground">
          Predict scores for upcoming matches and earn points.
        </p>
      </motion.div>

      {availableMatches.length === 0 ? (
        <Card className="border-white/5 bg-[#0E1A2E]">
          <CardContent className="py-12 text-center text-muted-foreground">
            No upcoming matches available for prediction.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {availableMatches.map((match, i) => {
            const ai = match.aiPrediction;
            const state = formState[match.id] ?? {
              home: "",
              away: "",
              confidence: 5,
            };
            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-white/5 bg-[#0E1A2E]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-muted-foreground">
                        {match.round}
                        {match.groupName && ` · ${match.groupName}`}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {formatMatchTime(new Date(match.matchTime))}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Teams + Score inputs */}
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex flex-1 items-center gap-2">
                        <span className="text-2xl">
                          {getTeamFlag(match.homeTeam.flagCode)}
                        </span>
                        <span className="font-medium text-white truncate">
                          {match.homeTeam.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          placeholder="0"
                          className="h-12 w-14 text-center text-lg font-bold bg-[#0A1628] border-white/10 text-white"
                          value={state.home}
                          onChange={(e) =>
                            updateField(match.id, "home", e.target.value)
                          }
                        />
                        <span className="text-xl font-bold text-muted-foreground">
                          :
                        </span>
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          placeholder="0"
                          className="h-12 w-14 text-center text-lg font-bold bg-[#0A1628] border-white/10 text-white"
                          value={state.away}
                          onChange={(e) =>
                            updateField(match.id, "away", e.target.value)
                          }
                        />
                      </div>

                      <div className="flex flex-1 items-center justify-end gap-2">
                        <span className="font-medium text-white truncate text-right">
                          {match.awayTeam.name}
                        </span>
                        <span className="text-2xl">
                          {getTeamFlag(match.awayTeam.flagCode)}
                        </span>
                      </div>
                    </div>

                    {/* AI vs User comparison */}
                    {ai && (
                      <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-[#326295]/10 border border-[#326295]/20 p-3 text-center">
                          <div className="mb-1 text-xs text-[#326295]">
                            🤖 AI Prediction
                          </div>
                          <div className="text-lg font-bold text-[#326295]">
                            {ai.predictedHomeScore} : {ai.predictedAwayScore}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Confidence: {ai.confidence}%
                          </div>
                        </div>
                        <div className="rounded-lg bg-[#E3D380]/10 border border-[#E3D380]/20 p-3 text-center">
                          <div className="mb-1 text-xs text-[#E3D380]">
                            👤 Your Prediction
                          </div>
                          <div className="text-lg font-bold text-[#E3D380]">
                            {state.home !== "" && state.away !== ""
                              ? `${state.home} : ${state.away}`
                              : "- : -"}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Confidence: {state.confidence}/10
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Confidence slider */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm text-muted-foreground">
                          Confidence
                        </label>
                        <Badge variant="outline" className="border-[#E3D380]/30 text-[#E3D380]">
                          {state.confidence}/10
                        </Badge>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={state.confidence}
                        onChange={(e) =>
                          updateField(
                            match.id,
                            "confidence",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full accent-[#E3D380]"
                      />
                    </div>

                    <Button
                      className="w-full bg-[#326295] hover:bg-[#326295]/80 text-white"
                      disabled={
                        state.home === "" ||
                        state.away === "" ||
                        submitting === match.id
                      }
                      onClick={() => handleSubmit(match.id)}
                    >
                      {submitting === match.id
                        ? "Submitting..."
                        : "Submit Prediction"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
