"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProbabilityBar } from "@/components/probability-bar";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { fetchMatch } from "@/lib/api";
import { getTeamFlag, formatMatchTime } from "@/lib/utils";
import type { Match, AiPrediction } from "@/lib/types";

const PIE_COLORS = ["#326295", "#6B7280", "#F87171"];

const MODEL_BREAKDOWN = [
  { name: "Elo 评分模型", homeWin: 55, draw: 22, awayWin: 23 },
  { name: "历史交锋模型", homeWin: 48, draw: 28, awayWin: 24 },
  { name: "近期状态模型", homeWin: 60, draw: 20, awayWin: 20 },
  { name: "市场价值模型", homeWin: 52, draw: 25, awayWin: 23 },
];

const H2H_HISTORY = [
  { date: "2022-12-06", home: "A队", away: "B队", score: "2:1", tournament: "世界杯" },
  { date: "2021-06-15", home: "B队", away: "A队", score: "1:1", tournament: "友谊赛" },
  { date: "2019-11-18", home: "A队", away: "B队", score: "3:0", tournament: "预选赛" },
];

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatch(matchId)
      .then(setMatch)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#326295] border-t-transparent" />
      </div>
    );
  }

  if (!match || !match.aiPrediction) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">未找到该比赛的 AI 预测数据</p>
        <Link href="/ai-predictions">
          <Button variant="outline">返回预测列表</Button>
        </Link>
      </div>
    );
  }

  const pred = match.aiPrediction;
  const homeFlag = getTeamFlag(match.homeTeam.flagCode);
  const awayFlag = getTeamFlag(match.awayTeam.flagCode);

  const probData = [
    { name: match.homeTeam.name, value: pred.homeWinProb * 100 },
    { name: "平局", value: pred.drawProb * 100 },
    { name: match.awayTeam.name, value: pred.awayWinProb * 100 },
  ];

  const scoreData = (pred.topScores || [
    { home: pred.predictedHomeScore, away: pred.predictedAwayScore, prob: 0.15 },
    { home: pred.predictedHomeScore + 1, away: pred.predictedAwayScore, prob: 0.10 },
    { home: pred.predictedHomeScore, away: pred.predictedAwayScore + 1, prob: 0.09 },
    { home: pred.predictedHomeScore - 1, away: pred.predictedAwayScore, prob: 0.08 },
    { home: pred.predictedHomeScore, away: pred.predictedAwayScore - 1, prob: 0.07 },
  ]).map((s) => ({
    score: `${s.home}:${s.away}`,
    prob: (s.prob * 100).toFixed(1),
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Back button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <Link href="/ai-predictions">
          <Button variant="ghost" className="text-muted-foreground hover:text-white">
            ← 返回预测列表
          </Button>
        </Link>
      </motion.div>

      {/* Match Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="border-[#326295]/30 bg-gradient-to-br from-[#0E1A2E] to-[#0A1628]">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {match.round}
                {match.groupName && ` · ${match.groupName}`}
              </Badge>
              <ConfidenceBadge confidence={pred.confidence} />
            </div>
            <div className="flex items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl">{homeFlag}</span>
                <span className="text-lg font-bold text-white">{match.homeTeam.name}</span>
                <span className="text-xs text-muted-foreground">
                  Elo {match.eloHome}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl font-bold text-[#E3D380]">
                  {pred.predictedHomeScore} : {pred.predictedAwayScore}
                </span>
                <span className="text-xs text-muted-foreground">AI 预测比分</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl">{awayFlag}</span>
                <span className="text-lg font-bold text-white">{match.awayTeam.name}</span>
                <span className="text-xs text-muted-foreground">
                  Elo {match.eloAway}
                </span>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {formatMatchTime(new Date(match.matchTime))}
              {match.stadium && ` · ${match.stadium}`}
              {match.city && `, ${match.city}`}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Probability Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-white/5 bg-[#0E1A2E] h-full">
            <CardHeader>
              <CardTitle className="text-white">概率分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={probData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                    >
                      {probData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0E1A2E",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, "概率"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2">
                <ProbabilityBar
                  homeLabel={match.homeTeam.name}
                  awayLabel={match.awayTeam.name}
                  homeProb={pred.homeWinProb * 100}
                  drawProb={pred.drawProb * 100}
                  awayProb={pred.awayWinProb * 100}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-white/5 bg-[#0E1A2E] h-full">
            <CardHeader>
              <CardTitle className="text-white">比分概率 Top 5</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="score" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0E1A2E",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      formatter={(value) => [`${value}%`, "概率"]}
                    />
                    <Bar dataKey="prob" radius={[4, 4, 0, 0]}>
                      {scoreData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={index === 0 ? "#E3D380" : "#326295"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Model Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-white/5 bg-[#0E1A2E]">
            <CardHeader>
              <CardTitle className="text-white">模型分解</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MODEL_BREAKDOWN.map((model, i) => (
                  <div key={model.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{model.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.homeWin}% / {model.draw}% / {model.awayWin}%
                      </span>
                    </div>
                    <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="bg-blue-500"
                        style={{ width: `${model.homeWin}%` }}
                      />
                      <div
                        className="bg-gray-500"
                        style={{ width: `${model.draw}%` }}
                      />
                      <div
                        className="bg-red-400"
                        style={{ width: `${model.awayWin}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                  主胜
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-gray-500" />
                  平局
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                  客胜
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Head to Head */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-white/5 bg-[#0E1A2E]">
            <CardHeader>
              <CardTitle className="text-white">历史交锋</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {H2H_HISTORY.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-[#0A1628] p-3"
                  >
                    <div className="text-xs text-muted-foreground">
                      {h.date}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {h.tournament}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-white">{h.home}</span>
                      <span className="font-bold text-[#E3D380]">{h.score}</span>
                      <span className="font-medium text-white">{h.away}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                * 历史交锋数据为占位示例
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
