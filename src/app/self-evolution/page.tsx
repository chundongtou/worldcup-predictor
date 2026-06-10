"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-db";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MatchReview {
  id: string;
  match_name: string;
  ai_prediction: string;
  actual_result: string;
  tags: string[];
  surprise_level: number;
  review_text: string;
  is_correct: boolean;
  direction_correct: boolean;
  created_at: string;
}

interface ModelWeight {
  id: string;
  dixon_coles: number;
  xgboost: number;
  elo: number;
  market: number;
  created_at: string;
}

interface ModelPerformance {
  id: string;
  direction_accuracy: number;
  score_accuracy: number;
  total_reviews: number;
  created_at: string;
}

interface AgentAction {
  id: string;
  action_type: string;
  trigger_event: string;
  summary: string;
  created_at: string;
}

const PIE_COLORS = ["#22c55e", "#eab308", "#326295", "#e3d380", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function SelfEvolutionPage() {
  const [reviews, setReviews] = useState<MatchReview[]>([]);
  const [weights, setWeights] = useState<ModelWeight[]>([]);
  const [performance, setPerformance] = useState<ModelPerformance[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [reviewsRes, weightsRes, perfRes, actionsRes] = await Promise.all([
          supabase
            .from("match_reviews")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("model_weights")
            .select("*")
            .order("created_at", { ascending: true })
            .limit(100),
          supabase
            .from("model_performance")
            .select("*")
            .order("created_at", { ascending: true })
            .limit(100),
          supabase
            .from("agent_actions")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

        if (reviewsRes.data) setReviews(reviewsRes.data);
        if (weightsRes.data) setWeights(weightsRes.data);
        if (perfRes.data) setPerformance(perfRes.data);
        if (actionsRes.data) setActions(actionsRes.data);
      } catch (err) {
        console.error("Error fetching self-evolution data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const latestPerf = performance.length > 0 ? performance[performance.length - 1] : null;
  const prevPerf = performance.length > 1 ? performance[performance.length - 2] : null;

  const directionTrend = latestPerf && prevPerf
    ? latestPerf.direction_accuracy - prevPerf.direction_accuracy
    : 0;

  const tagDistribution = useMemo(() => {
    const tagCount: Record<string, number> = {};
    reviews.forEach((r) => {
      (r.tags || []).forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCount).map(([name, value]) => ({ name, value }));
  }, [reviews]);

  const weightsChartData = useMemo(() => {
    return weights.map((w) => ({
      date: new Date(w.created_at).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
      "Dixon-Coles": w.dixon_coles,
      XGBoost: w.xgboost,
      ELO: w.elo,
      Market: w.market,
    }));
  }, [weights]);

  const accuracyTrendData = useMemo(() => {
    return performance.map((p) => ({
      date: new Date(p.created_at).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
      方向准确率: p.direction_accuracy,
      比分准确率: p.score_accuracy,
    }));
  }, [performance]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#326295] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-4xl">🧬</span>
          AI 自进化
        </h1>
        <p className="mt-2 text-muted-foreground">
          透明展示 AI 预测模型的自我进化过程：每次赛后复盘、权重调整、策略优化
        </p>
      </motion.div>

      {/* Accuracy Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        <Card className="border-[#326295]/30 bg-[#0E1A2E]">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">方向准确率</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-[#E3D380]">
                {latestPerf?.direction_accuracy?.toFixed(1) ?? "—"}
              </span>
              <span className="text-2xl text-[#E3D380]">%</span>
            </div>
            {directionTrend !== 0 && (
              <span className={`mt-1 text-sm ${directionTrend > 0 ? "text-green-400" : "text-red-400"}`}>
                {directionTrend > 0 ? "↑" : "↓"} {Math.abs(directionTrend).toFixed(1)}%
              </span>
            )}
          </CardContent>
        </Card>
        <Card className="border-[#326295]/30 bg-[#0E1A2E]">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">比分准确率</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-[#326295]">
                {latestPerf?.score_accuracy?.toFixed(1) ?? "—"}
              </span>
              <span className="text-2xl text-[#326295]">%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#326295]/30 bg-[#0E1A2E]">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">已复盘比赛</p>
            <span className="text-5xl font-bold text-white">
              {latestPerf?.total_reviews ?? reviews.length}
            </span>
          </CardContent>
        </Card>
        <Card className="border-[#326295]/30 bg-[#0E1A2E]">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">进化趋势</p>
            <span className={`text-5xl ${directionTrend >= 0 ? "text-green-400" : "text-red-400"}`}>
              {directionTrend >= 0 ? "📈" : "📉"}
            </span>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Model Weights Evolution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-[#326295]/30 bg-[#0E1A2E]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <span className="text-xl">⚖️</span>
                模型权重演化
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weightsChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weightsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0A1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Legend wrapperStyle={{ color: "#9ca3af" }} />
                    <Line type="monotone" dataKey="Dixon-Coles" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="XGBoost" stroke="#22c55e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="ELO" stroke="#f97316" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Market" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-12 text-center text-muted-foreground">暂无权重数据</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-[#326295]/30 bg-[#0E1A2E]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <span className="text-xl">📊</span>
                标签分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tagDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tagDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {tagDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0A1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-12 text-center text-muted-foreground">暂无标签数据</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Accuracy Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <Card className="border-[#326295]/30 bg-[#0E1A2E]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <span className="text-xl">📈</span>
              准确率趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accuracyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={accuracyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0A1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="方向准确率" stroke="#E3D380" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="比分准确率" stroke="#326295" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-muted-foreground">暂无趋势数据</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <Card className="border-[#326295]/30 bg-[#0E1A2E]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <span className="text-xl">🔍</span>
              赛后复盘记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] space-y-3 overflow-y-auto pr-2">
              {reviews.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">暂无复盘记录</p>
              ) : (
                reviews.map((review, i) => {
                  const statusColor = review.is_correct
                    ? "border-green-500/30 bg-green-500/5"
                    : review.direction_correct
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : "border-red-500/30 bg-red-500/5";
                  const statusBadge = review.is_correct
                    ? "bg-green-500/20 text-green-400"
                    : review.direction_correct
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400";
                  const statusLabel = review.is_correct
                    ? "✅ 完全正确"
                    : review.direction_correct
                      ? "🟡 方向正确"
                      : "❌ 预测错误";

                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <div
                        className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-white/5 ${statusColor}`}
                        onClick={() =>
                          setExpandedReview(expandedReview === review.id ? null : review.id)
                        }
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-white">{review.match_name}</span>
                            <Badge className={statusBadge}>{statusLabel}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {(review.tags || []).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                            {review.surprise_level > 0 && (
                              <span className="text-sm">
                                {"🔥".repeat(Math.min(review.surprise_level, 5))}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex gap-6 text-sm text-muted-foreground">
                          <span>
                            AI 预测: <span className="text-white">{review.ai_prediction}</span>
                          </span>
                          <span>
                            实际结果: <span className="text-white">{review.actual_result}</span>
                          </span>
                          <span className="ml-auto text-xs">
                            {new Date(review.created_at).toLocaleDateString("zh-CN")}
                          </span>
                        </div>

                        <AnimatePresence>
                          {expandedReview === review.id && review.review_text && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-muted-foreground">
                                {review.review_text}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Agent Actions Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-[#326295]/30 bg-[#0E1A2E]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <span className="text-xl">🤖</span>
              Agent 操作日志
            </CardTitle>
          </CardHeader>
          <CardContent>
            {actions.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">暂无操作记录</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-muted-foreground">时间</th>
                      <th className="px-4 py-3 text-left text-muted-foreground">操作类型</th>
                      <th className="px-4 py-3 text-left text-muted-foreground">触发事件</th>
                      <th className="px-4 py-3 text-left text-muted-foreground">摘要</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actions.map((action, i) => (
                      <motion.tr
                        key={action.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {new Date(action.created_at).toLocaleString("zh-CN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">
                            {action.action_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{action.trigger_event}</td>
                        <td className="px-4 py-3 text-white">{action.summary}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
