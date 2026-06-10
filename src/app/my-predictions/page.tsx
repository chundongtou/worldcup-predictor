"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTeamFlag, formatMatchTime } from "@/lib/utils";
import { fetchUserPredictions } from "@/lib/api";
import type { UserPrediction } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MyPredictionsPage() {
  const [predictions, setPredictions] = useState<UserPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPredictions()
      .then(setPredictions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const finished = predictions.filter((p) => p.pointsEarned !== null);
    const correct = finished.filter((p) => (p.pointsEarned ?? 0) > 0);
    const totalPoints = predictions.reduce(
      (sum, p) => sum + (p.pointsEarned ?? 0),
      0
    );
    return {
      total: predictions.length,
      correct: correct.length,
      accuracy:
        finished.length > 0
          ? Math.round((correct.length / finished.length) * 100)
          : 0,
      totalPoints,
    };
  }, [predictions]);

  const chartData = useMemo(() => {
    let cumulativePoints = 0;
    let cumulativeCorrect = 0;
    let cumulativeTotal = 0;
    return predictions
      .filter((p) => p.pointsEarned !== null)
      .map((p, i) => {
        cumulativePoints += p.pointsEarned ?? 0;
        cumulativeTotal += 1;
        if ((p.pointsEarned ?? 0) > 0) cumulativeCorrect += 1;
        return {
          index: i + 1,
          accuracy: Math.round((cumulativeCorrect / cumulativeTotal) * 100),
          points: cumulativePoints,
        };
      });
  }, [predictions]);

  const filterPredictions = (tab: string) => {
    switch (tab) {
      case "correct":
        return predictions.filter(
          (p) => p.pointsEarned !== null && (p.pointsEarned ?? 0) > 0
        );
      case "wrong":
        return predictions.filter(
          (p) => p.pointsEarned !== null && (p.pointsEarned ?? 0) === 0
        );
      case "pending":
        return predictions.filter((p) => p.pointsEarned === null);
      default:
        return predictions;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-[#0E1A2E]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-2 text-3xl font-bold text-white">My Predictions</h1>
        <p className="mb-8 text-muted-foreground">
          Track your prediction history and performance.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Accuracy", value: `${stats.accuracy}%`, color: "text-green-400" },
          { label: "Correct", value: stats.correct, color: "text-[#326295]" },
          { label: "Points", value: stats.totalPoints, color: "text-[#E3D380]" },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-white/5 bg-[#0E1A2E]">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Accuracy Chart */}
      {chartData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-white/5 bg-[#0E1A2E]">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Accuracy Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    dataKey="index"
                    stroke="#666"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#666"
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0E1A2E",
                      border: "1px solid #ffffff15",
                      borderRadius: 8,
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#E3D380"
                    strokeWidth={2}
                    dot={{ fill: "#E3D380", r: 3 }}
                    name="Accuracy %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="mb-4 bg-[#0E1A2E] border border-white/5">
          {["all", "correct", "wrong", "pending"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="data-[state=active]:bg-[#326295] data-[state=active]:text-white capitalize"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {["all", "correct", "wrong", "pending"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="space-y-3">
              {filterPredictions(tab).length === 0 ? (
                <Card className="border-white/5 bg-[#0E1A2E]">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No predictions found.
                  </CardContent>
                </Card>
              ) : (
                filterPredictions(tab).map((pred, i) => (
                  <motion.div
                    key={pred.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card className="border-white/5 bg-[#0E1A2E]">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {pred.match && (
                              <>
                                <span className="text-lg">
                                  {getTeamFlag(pred.match.homeTeam.flagCode)}
                                </span>
                                <span className="text-sm text-white">
                                  {pred.match.homeTeam.name}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            {/* User prediction */}
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground mb-1">You</div>
                              <div className="font-bold text-[#E3D380]">
                                {pred.predHome} : {pred.predAway}
                              </div>
                            </div>

                            {/* Actual result */}
                            {pred.match?.isFinished && (
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground mb-1">
                                  Actual
                                </div>
                                <div className="font-bold text-white">
                                  {pred.match.homeScore} : {pred.match.awayScore}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {pred.match && (
                              <>
                                <span className="text-sm text-white">
                                  {pred.match.awayTeam.name}
                                </span>
                                <span className="text-lg">
                                  {getTeamFlag(pred.match.awayTeam.flagCode)}
                                </span>
                              </>
                            )}

                            {/* Status badge */}
                            {pred.pointsEarned !== null ? (
                              <Badge
                                className={
                                  pred.pointsEarned > 0
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : "bg-red-500/20 text-red-400 border-red-500/30"
                                }
                              >
                                {pred.pointsEarned > 0
                                  ? `+${pred.pointsEarned} pts`
                                  : "0 pts"}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-[#326295]/30 text-[#326295]"
                              >
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
