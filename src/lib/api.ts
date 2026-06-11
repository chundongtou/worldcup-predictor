import type { Match, AiPrediction, UserPrediction, LeaderboardEntry } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "";

// ---- Match APIs ----
export async function fetchMatches(round?: string, groupName?: string): Promise<Match[]> {
  const params = new URLSearchParams();
  if (round) params.set("round", round);
  if (groupName) params.set("group", groupName);
  
  const res = await fetch(`${BASE_URL}/api/matches?${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
}

export async function fetchMatch(id: string): Promise<Match> {
  const res = await fetch(`${BASE_URL}/api/matches/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch match");
  return res.json();
}

// ---- Prediction APIs ----
export async function fetchAiPredictions(): Promise<(Match & { aiPrediction: AiPrediction })[]> {
  const res = await fetch(`${BASE_URL}/api/predictions`, { cache: 'no-store' });
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
  const res = await fetch(`${BASE_URL}/api/user-predictions`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch predictions");
  return res.json();
}

// ---- Leaderboard & Standings ----
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${BASE_URL}/api/leaderboard`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export async function fetchStandings(groupName?: string) {
  const params = groupName ? `?group=${groupName}` : "";
  const res = await fetch(`${BASE_URL}/api/standings${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch standings");
  return res.json();
}

// ---- Sync APIs (agent auth required) ----
export async function triggerSync(agentKey: string) {
  const res = await fetch(`${BASE_URL}/api/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${agentKey}`,
    },
  });
  if (!res.ok) throw new Error("Failed to trigger sync");
  return res.json();
}

export async function getSyncStatus(agentKey: string) {
  const res = await fetch(`${BASE_URL}/api/sync`, {
    headers: { 'Authorization': `Bearer ${agentKey}` },
  });
  if (!res.ok) throw new Error("Failed to get sync status");
  return res.json();
}

export async function getAccuracyReport(agentKey: string) {
  const res = await fetch(`${BASE_URL}/api/agent/accuracy-report`, {
    headers: { 'Authorization': `Bearer ${agentKey}` },
  });
  if (!res.ok) throw new Error("Failed to get accuracy report");
  return res.json();
}

export async function getPredictionsStatus(agentKey: string) {
  const res = await fetch(`${BASE_URL}/api/agent/predictions-status`, {
    headers: { 'Authorization': `Bearer ${agentKey}` },
  });
  if (!res.ok) throw new Error("Failed to get predictions status");
  return res.json();
}
