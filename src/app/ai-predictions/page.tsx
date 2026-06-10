"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchCard } from "@/components/match-card";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { fetchAiPredictions } from "@/lib/api";
import { getTeamFlag } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { Match, AiPrediction } from "@/lib/types";

type PredictionMatch = Match & { aiPrediction: AiPrediction | null };

// Mock data for championship & group advancement (since API doesn't provide these)
const CHAMPIONSHIP_TOP10 = [
  { team: "巴西", flagCode: "BR", prob: 18.2 },
  { team: "法国", flagCode: "FR", prob: 15.5 },
  { team: "英格兰", flagCode: "GB-ENG", prob: 12.1 },
  { team: "阿根廷", flagCode: "AR", prob: 11.8 },
  { team: "德国", flagCode: "DE", prob: 8.4 },
  { team: "西班牙", flagCode: "ES", prob: 7.9 },
  { team: "荷兰", flagCode: "NL", prob: 5.2 },
  { team: "葡萄牙", flagCode: "PT", prob: 4.8 },
  { team: "克罗地亚", flagCode: "HR", prob: 3.6 },
  { team: "比利时", flagCode: "BE", prob: 2.9 },
];

const GROUP_ADVANCEMENT = [
  { team: "巴西", flagCode: "BR", group: "A组", prob: 92 },
  { team: "法国", flagCode: "FR", group: "D组", prob: 89 },
  { team: "英格兰", flagCode: "GB-ENG", group: "B组", prob: 87 },
  { team: "阿根廷", flagCode: "AR", group: "C组", prob: 85 },
  { team: "德国", flagCode: "DE", group: "E组", prob: 82 },
  { team: "西班牙", flagCode: "ES", group: "F组", prob: 80 },
  { team: "荷兰", flagCode: "NL", group: "A组", prob: 78 },
  { team: "葡萄牙", flagCode: "PT", group: "H组", prob: 75 },
];

export default function AiPredictionsPage() {
  const [predictions, setPredictions] = useState<PredictionMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterRound, setFilterRound] = useState<string>("all");
  const { t } = useI18n();

  useEffect(() => {
    fetchAiPredictions()
      .then(setPredictions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const g = new Set(predictions.map((m) => m.groupName).filter(Boolean));
    return Array.from(g).sort();
  }, [predictions]);

  const rounds = useMemo(() => {
    const r = new Set(predictions.map((m) => m.round));
    return Array.from(r).sort();
  }, [predictions]);

  const filtered = useMemo(() => {
    return predictions
      .filter((m) => filterGroup === "all" || m.groupName === filterGroup)
      .filter((m) => filterRound === "all" || m.round === filterRound)
      .sort((a, b) => (b.aiPrediction?.confidence ?? 0) - (a.aiPrediction?.confidence ?? 0));
  }, [predictions, filterGroup, filterRound]);

  const upsetAlerts = useMemo(() => {
    return predictions.filter((m) => {
      const pred = m.aiPrediction;
      if (!pred) return false;
      const isHomeUnderdog = m.eloHome < m.eloAway && pred.homeWinProb > 0.5;
      const isAwayUnderdog = m.eloAway < m.eloHome && pred.awayWinProb > 0.5;
      return pred.confidence >= 65 && (isHomeUnderdog || isAwayUnderdog);
    });
  }, [predictions]);

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
          <span className="text-4xl">🤖</span>
          {t('ai.title')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t('ai.subtitle')}
        </p>
      </motion.div>

      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="bg-[#0E1A2E] border border-white/5">
          <TabsTrigger value="predictions">{t('ai.match_predictions')}</TabsTrigger>
          <TabsTrigger value="upset">{t('ai.upset_alerts')}</TabsTrigger>
          <TabsTrigger value="champion">{t('ai.champion_probs')}</TabsTrigger>
          <TabsTrigger value="advance">{t('ai.qualification')}</TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('common.group')}:</span>
              <div className="flex flex-wrap gap-1">
                <Badge
                  variant={filterGroup === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilterGroup("all")}
                >
                  {t('ai.all_groups')}
                </Badge>
                {groups.map((g) => (
                  <Badge
                    key={g}
                    variant={filterGroup === g ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterGroup(g!)}
                  >
                    {g}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('common.round')}:</span>
              <div className="flex flex-wrap gap-1">
                <Badge
                  variant={filterRound === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilterRound("all")}
                >
                  {t('ai.all_rounds')}
                </Badge>
                {rounds.map((r) => (
                  <Badge
                    key={r}
                    variant={filterRound === r ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterRound(r)}
                  >
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Match Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((match, i) => (
              <MatchCard key={match.id} match={match} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              {t('ai.no_match_data')}
            </div>
          )}
        </TabsContent>

        {/* Upset Alerts Tab */}
        <TabsContent value="upset" className="space-y-4">
          <Card className="border-yellow-500/20 bg-[#0E1A2E]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <span className="text-2xl">⚠️</span>
                {t('ai.upset_alerts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upsetAlerts.length === 0 ? (
                <p className="text-muted-foreground">{t('ai.no_upsets')}</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {upsetAlerts.map((match, i) => {
                    const pred = match.aiPrediction;
                    if (!pred) return null;
                    const isHomeUpset = pred.homeWinProb > pred.awayWinProb && match.eloHome < match.eloAway;
                    const underdog = isHomeUpset ? match.homeTeam : match.awayTeam;
                    const favorite = isHomeUpset ? match.awayTeam : match.homeTeam;
                    return (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="border-yellow-500/10 bg-[#0A1628]">
                          <CardContent className="p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{match.round}</span>
                              <ConfidenceBadge confidence={pred.confidence} />
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-lg">{getTeamFlag(underdog.flagCode)}</span>
                              <span className="font-medium text-yellow-400">{underdog.name}</span>
                              <span className="text-muted-foreground">{t('ai.may_defeat')}</span>
                              <span className="text-lg">{getTeamFlag(favorite.flagCode)}</span>
                              <span className="font-medium text-white">{favorite.name}</span>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              {t('ai.predicted_score')}: {pred.predictedHomeScore} : {pred.predictedAwayScore}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Championship Tab */}
        <TabsContent value="champion" className="space-y-4">
          <Card className="border-[#E3D380]/20 bg-[#0E1A2E]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E3D380]">
                <span className="text-2xl">🏆</span>
                {t('ai.champion_top10')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {CHAMPIONSHIP_TOP10.map((item, i) => (
                  <motion.div
                    key={item.team}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="w-6 text-center text-sm font-bold text-[#E3D380]">
                      {i + 1}
                    </span>
                    <span className="text-xl">{getTeamFlag(item.flagCode)}</span>
                    <span className="w-16 font-medium text-white">{item.team}</span>
                    <div className="flex-1">
                      <div className="h-4 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.prob / CHAMPIONSHIP_TOP10[0].prob) * 100}%` }}
                          transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#326295] to-[#E3D380]"
                        />
                      </div>
                    </div>
                    <span className="w-12 text-right text-sm font-semibold text-[#E3D380]">
                      {item.prob}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Group Advancement Tab */}
        <TabsContent value="advance" className="space-y-4">
          <Card className="border-[#326295]/20 bg-[#0E1A2E]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#326295]">
                <span className="text-2xl">📊</span>
                {t('ai.group_advancement')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {GROUP_ADVANCEMENT.map((item, i) => (
                  <motion.div
                    key={item.team}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-xl">{getTeamFlag(item.flagCode)}</span>
                    <span className="w-16 font-medium text-white">{item.team}</span>
                    <Badge variant="outline" className="w-10 justify-center text-xs">
                      {item.group}
                    </Badge>
                    <div className="flex-1">
                      <div className="h-4 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.prob}%` }}
                          transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#326295] to-blue-400"
                        />
                      </div>
                    </div>
                    <span className="w-12 text-right text-sm font-semibold text-blue-400">
                      {item.prob}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
