"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTeamFlag } from "@/lib/utils";
import { fetchStandings } from "@/lib/api";

interface StandingEntry {
  teamId: string;
  teamName: string;
  flagCode: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

const GROUPS = Array.from({ length: 12 }, (_, i) => `Group ${String.fromCharCode(65 + i)}`);

export default function StandingsPage() {
  const [standings, setStandings] = useState<Record<string, StandingEntry[]>>({});
  const [activeGroup, setActiveGroup] = useState("Group A");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchStandings()
      .then((data) => setStandings(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currentStandings = standings[activeGroup] || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-3xl font-bold text-[#E3D380]"
      >
        Group Standings
      </motion.h1>

      <Tabs value={activeGroup} onValueChange={setActiveGroup} className="mb-6">
        <TabsList className="bg-[#0E1A2E] border border-white/10 flex-wrap h-auto gap-1 p-1">
          {GROUPS.map((g) => (
            <TabsTrigger
              key={g}
              value={g}
              className="data-[state=active]:bg-[#326295] data-[state=active]:text-white text-xs px-3"
            >
              {g}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#326295] border-t-transparent" />
        </div>
      ) : (
        <motion.div
          key={activeGroup}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-white/5 bg-[#0E1A2E]">
            <CardHeader>
              <CardTitle className="text-[#E3D380]">{activeGroup}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="w-8 text-[#E3D380]">#</TableHead>
                    <TableHead className="text-[#E3D380]">Team</TableHead>
                    <TableHead className="text-center text-[#E3D380]">P</TableHead>
                    <TableHead className="text-center text-[#E3D380]">W</TableHead>
                    <TableHead className="text-center text-[#E3D380]">D</TableHead>
                    <TableHead className="text-center text-[#E3D380]">L</TableHead>
                    <TableHead className="text-center text-[#E3D380]">GF</TableHead>
                    <TableHead className="text-center text-[#E3D380]">GA</TableHead>
                    <TableHead className="text-center text-[#E3D380]">GD</TableHead>
                    <TableHead className="text-center text-[#E3D380]">Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStandings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                        No standings data available yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentStandings.map((entry, i) => (
                      <TableRow
                        key={entry.teamId}
                        className={`border-white/5 ${
                          i < 2
                            ? "bg-green-900/10"
                            : i === 2
                            ? "bg-yellow-900/10"
                            : ""
                        }`}
                      >
                        <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getTeamFlag(entry.flagCode)}</span>
                            <span className="font-medium text-white">{entry.teamName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{entry.played}</TableCell>
                        <TableCell className="text-center">{entry.won}</TableCell>
                        <TableCell className="text-center">{entry.drawn}</TableCell>
                        <TableCell className="text-center">{entry.lost}</TableCell>
                        <TableCell className="text-center">{entry.goalsFor}</TableCell>
                        <TableCell className="text-center">{entry.goalsAgainst}</TableCell>
                        <TableCell className={`text-center font-medium ${entry.goalDifference > 0 ? "text-green-400" : entry.goalDifference < 0 ? "text-red-400" : ""}`}>
                          {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                        </TableCell>
                        <TableCell className="text-center font-bold text-[#E3D380]">{entry.points}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {currentStandings.length > 0 && (
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-sm bg-green-900/30 border border-green-500/30" />
                    Qualifies (Top 2)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-sm bg-yellow-900/30 border border-yellow-500/30" />
                    Possible qualification (3rd)
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
