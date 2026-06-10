"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchLeaderboard } from "@/lib/api";
import type { LeaderboardEntry } from "@/lib/types";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"points" | "accuracy">("points");

  useEffect(() => {
    fetchLeaderboard()
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...entries].sort((a, b) =>
    sortBy === "points" ? b.totalPoints - a.totalPoints : b.accuracy - a.accuracy
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-3xl font-bold text-[#E3D380]"
      >
        Leaderboard
      </motion.h1>

      <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as "points" | "accuracy")} className="mb-6">
        <TabsList className="bg-[#0E1A2E] border border-white/10">
          <TabsTrigger value="points" className="data-[state=active]:bg-[#326295] data-[state=active]:text-white">
            🏆 Points Ranking
          </TabsTrigger>
          <TabsTrigger value="accuracy" className="data-[state=active]:bg-[#326295] data-[state=active]:text-white">
            🎯 Accuracy Ranking
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="border-white/5 bg-[#0E1A2E]">
        <CardHeader>
          <CardTitle className="text-[#E3D380]">
            {sortBy === "points" ? "Points Ranking" : "Accuracy Ranking"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#326295] border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="w-12 text-[#E3D380]">Rank</TableHead>
                  <TableHead className="text-[#E3D380]">Player</TableHead>
                  <TableHead className="text-center text-[#E3D380]">Points</TableHead>
                  <TableHead className="text-center text-[#E3D380]">Accuracy</TableHead>
                  <TableHead className="text-center text-[#E3D380]">Predictions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No leaderboard data yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((entry, i) => {
                    const rank = i + 1;
                    const isTop3 = rank <= 3;
                    const medalEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

                    return (
                      <TableRow
                        key={entry.userId}
                        className={`border-white/5 ${isTop3 ? "bg-[#326295]/5" : ""}`}
                      >
                        <TableCell className="font-medium">
                          <span className="flex items-center gap-1">
                            {medalEmoji && <span>{medalEmoji}</span>}
                            <span className={isTop3 ? "text-[#E3D380] font-bold" : "text-muted-foreground"}>
                              {rank}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-[#326295]/30 flex items-center justify-center text-sm font-bold text-[#E3D380]">
                              {(entry.name || "U")[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-white">{entry.name || "Anonymous"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="border-[#E3D380]/30 text-[#E3D380] font-bold">
                            {entry.totalPoints}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={entry.accuracy >= 60 ? "text-green-400" : entry.accuracy >= 40 ? "text-yellow-400" : "text-red-400"}>
                            {entry.accuracy.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {entry.correctPredictions}/{entry.totalPredictions}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
