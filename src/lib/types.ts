export interface Team {
  id: string;
  name: string;
  flagCode: string;
  groupName: string;
  eloRating: number;
  fifaRanking: number | null;
  marketValue: number | null;
  confederation: string | null;
  worldCupAppearances: number;
  bestResult: string | null;
}

export interface Match {
  id: string;
  round: string;
  groupName: string | null;
  matchday: number | null;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  matchTime: string;
  status: string;
  stadium: string | null;
  city: string | null;
  eloHome: number;
  eloAway: number;
  isFinished: boolean;
  homeTeam: Team;
  awayTeam: Team;
  aiPrediction?: AiPrediction | null;
}

export interface AiPrediction {
  id: string;
  matchId: string;
  modelVersion: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  confidence: number;
  topScores?: Array<{ home: number; away: number; prob: number }>;
}

export interface UserPrediction {
  id: string;
  userId: string;
  matchId: string;
  predHome: number;
  predAway: number;
  confidence: number;
  pointsEarned: number | null;
  match?: Match;
}

export interface LeaderboardEntry {
  userId: string;
  name: string | null;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
  accuracy: number;
}
