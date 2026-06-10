import type { Match, AiPrediction, UserPrediction, LeaderboardEntry } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "";

export async function fetchMatches(round?: string, groupName?: string): Promise<Match[]> {
  const params = new URLSearchParams();
  if (round) params.set("round", round);
  if (groupName) params.set("group", groupName);
  
  const res = await fetch(`${BASE_URL}/api/matches?${params}`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
}

export async function fetchMatch(id: string): Promise<Match> {
  const res = await fetch(`${BASE_URL}/api/matches/${id}`);
  if (!res.ok) throw new Error("Failed to fetch match");
  return res.json();
}

export async function fetchAiPredictions(): Promise<(Match & { aiPrediction: AiPrediction })[]> {
  const res = await fetch(`${BASE_URL}/api/predictions`);
  if (!res.ok) throw new Error("Failed to fetch predictions");
  return res.json();
}

export async function submitPrediction(matchId: string, predHome: number, predAway: number, confidence: number) {
  const res = await fetch(`${BASE_URL}/api/user-predictions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matchId, predHome, predAway, confidence }),
  });
  if (!res.ok) throw new Error("Failed to submit prediction");
  return res.json();
}

export async function fetchUserPredictions(): Promise<UserPrediction[]> {
  const res = await fetch(`${BASE_URL}/api/user-predictions`);
  if (!res.ok) throw new Error("Failed to fetch predictions");
  return res.json();
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${BASE_URL}/api/leaderboard`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export async function fetchStandings(groupName?: string) {
  const params = groupName ? `?group=${groupName}` : "";
  const res = await fetch(`${BASE_URL}/api/standings${params}`);
  if (!res.ok) throw new Error("Failed to fetch standings");
  return res.json();
}
