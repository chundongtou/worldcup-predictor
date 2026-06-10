"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { fetchUserPredictions } from "@/lib/api";
import type { UserPrediction } from "@/lib/types";

export default function ProfilePage() {
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
    const exactScores = finished.filter((p) => (p.pointsEarned ?? 0) >= 3);
    return {
      total: predictions.length,
      finished: finished.length,
      correct: correct.length,
      accuracy:
        finished.length > 0
          ? Math.round((correct.length / finished.length) * 100)
          : 0,
      totalPoints,
      exactScores: exactScores.length,
      pending: predictions.filter((p) => p.pointsEarned === null).length,
    };
  }, [predictions]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-40 rounded-lg bg-[#0E1A2E]" />
          <div className="h-60 rounded-lg bg-[#0E1A2E]" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Profile Header */}
        <Card className="mb-6 border-white/5 bg-[#0E1A2E]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#326295]/20 text-3xl">
                👤
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">User Profile</h1>
                <p className="text-sm text-muted-foreground">
                  WC2026 Predictor Player
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {[
            {
              label: "Total Predictions",
              value: stats.total,
              icon: "📊",
            },
            {
              label: "Total Points",
              value: stats.totalPoints,
              icon: "⭐",
              highlight: true,
            },
            {
              label: "Accuracy",
              value: `${stats.accuracy}%`,
              icon: "🎯",
            },
            {
              label: "Exact Scores",
              value: stats.exactScores,
              icon: "✅",
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-white/5 bg-[#0E1A2E]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{s.icon}</span>
                    <span className="text-xs text-muted-foreground">
                      {s.label}
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      s.highlight ? "text-[#E3D380]" : "text-white"
                    }`}
                  >
                    {s.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Progress Card */}
        <Card className="mb-6 border-white/5 bg-[#0E1A2E]">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Season Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Predictions Made</span>
                <span className="text-white">{stats.total}</span>
              </div>
              <Progress
                value={stats.total > 0 ? 100 : 0}
                className="h-2 bg-[#0A1628]"
              />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Accuracy Rate</span>
                <span className="text-white">{stats.accuracy}%</span>
              </div>
              <Progress
                value={stats.accuracy}
                className="h-2 bg-[#0A1628]"
              />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Pending Results</span>
                <Badge
                  variant="outline"
                  className="border-[#326295]/30 text-[#326295]"
                >
                  {stats.pending}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <a href="/predict" className="flex-1">
            <Button className="w-full bg-[#326295] hover:bg-[#326295]/80 text-white">
              Make Prediction
            </Button>
          </a>
          <a href="/my-predictions" className="flex-1">
            <Button variant="outline" className="w-full border-[#E3D380]/30 text-[#E3D380] hover:bg-[#E3D380]/10">
              View History
            </Button>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
