/**
 * External data source adapter for live match data.
 *
 * Supports multiple providers with automatic fallback:
 * 1. API-Football (api-football.com) - primary
 * 2. Football-Data.org - fallback
 * 3. Manual override via Supabase direct update
 *
 * Environment variables:
 *   API_FOOTBALL_KEY     - API-Football API key
 *   API_FOOTBALL_HOST    - API-Football host (default: v3.football.api-sports.io)
 *   FOOTBALL_DATA_KEY    - Football-Data.org API key (fallback)
 *   LIVE_SYNC_ENABLED    - Enable/disable live sync (default: true)
 *   LIVE_SYNC_INTERVAL   - Sync interval in seconds (default: 120)
 */

export interface LiveMatch {
  externalId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
  matchTime: string;
  minute: number | null;
}

export interface DataSourceProvider {
  name: string;
  fetchMatches(dateFrom: string, dateTo: string): Promise<LiveMatch[]>;
  fetchLiveMatches(): Promise<LiveMatch[]>;
  isAvailable(): Promise<boolean>;
}

// ---- API-Football Provider ----
class APIFootballProvider implements DataSourceProvider {
  name = 'api-football';
  private host: string;
  private key: string;

  constructor() {
    this.host = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io';
    this.key = process.env.API_FOOTBALL_KEY || '';
  }

  async isAvailable(): Promise<boolean> {
    if (!this.key) return false;
    try {
      const res = await fetch(`https://${this.host}/status`, {
        headers: { 'x-apisports-key': this.key },
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private mapStatus(status: string): LiveMatch['status'] {
    const s = status.toLowerCase();
    if (s === 'ft' || s === 'aet' || s === 'pen') return 'finished';
    if (s === 'ns' || s === 'tbd') return 'scheduled';
    if (s === 'pst' || s === 'canc') return 'postponed';
    if (s.includes('ht') || s.includes('et') || s.includes('p') || s === '1h' || s === '2h') return 'live';
    return 'scheduled';
  }

  async fetchMatches(dateFrom: string, dateTo: string): Promise<LiveMatch[]> {
    // FIFA World Cup 2026 league id in API-Football is typically 1
    const url = `https://${this.host}/fixtures?league=1&season=2026&from=${dateFrom}&to=${dateTo}`;
    const res = await fetch(url, {
      headers: { 'x-apisports-key': this.key },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`API-Football error: ${res.status}`);
    const data = await res.json();
    return (data.response || []).map((f: any) => ({
      externalId: String(f.fixture.id),
      homeTeamName: f.teams.home.name,
      awayTeamName: f.teams.away.name,
      homeScore: f.goals.home,
      awayScore: f.goals.away,
      status: this.mapStatus(f.fixture.status.short),
      matchTime: f.fixture.date,
      minute: f.fixture.status.elapsed,
    }));
  }

  async fetchLiveMatches(): Promise<LiveMatch[]> {
    const url = `https://${this.host}/fixtures?league=1&season=2026&live=all`;
    const res = await fetch(url, {
      headers: { 'x-apisports-key': this.key },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`API-Football error: ${res.status}`);
    const data = await res.json();
    return (data.response || []).map((f: any) => ({
      externalId: String(f.fixture.id),
      homeTeamName: f.teams.home.name,
      awayTeamName: f.teams.away.name,
      homeScore: f.goals.home,
      awayScore: f.goals.away,
      status: this.mapStatus(f.fixture.status.short),
      matchTime: f.fixture.date,
      minute: f.fixture.status.elapsed,
    }));
  }
}

// ---- Football-Data.org Provider (fallback) ----
class FootballDataOrgProvider implements DataSourceProvider {
  name = 'football-data-org';
  private key: string;

  constructor() {
    this.key = process.env.FOOTBALL_DATA_KEY || '';
  }

  async isAvailable(): Promise<boolean> {
    if (!this.key) return false;
    try {
      const res = await fetch('https://api.football-data.org/v4/competitions/WC', {
        headers: { 'X-Auth-Token': this.key },
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private mapStatus(status: string): LiveMatch['status'] {
    const s = status.toUpperCase();
    if (s === 'FINISHED') return 'finished';
    if (s === 'SCHEDULED' || s === 'TIMED') return 'scheduled';
    if (s === 'POSTPONED') return 'postponed';
    if (s === 'CANCELLED') return 'cancelled';
    if (s === 'IN_PLAY' || s === 'PAUSED' || s === 'EXTRA_TIME' || s === 'PENALTY_SHOOTOUT') return 'live';
    return 'scheduled';
  }

  async fetchMatches(dateFrom: string, dateTo: string): Promise<LiveMatch[]> {
    const url = `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    const res = await fetch(url, {
      headers: { 'X-Auth-Token': this.key },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Football-Data.org error: ${res.status}`);
    const data = await res.json();
    return (data.matches || []).map((m: any) => ({
      externalId: String(m.id),
      homeTeamName: m.homeTeam.name,
      awayTeamName: m.awayTeam.name,
      homeScore: m.score.fullTime.home,
      awayScore: m.score.fullTime.away,
      status: this.mapStatus(m.status),
      matchTime: m.utcDate,
      minute: m.minute || null,
    }));
  }

  async fetchLiveMatches(): Promise<LiveMatch[]> {
    const url = 'https://api.football-data.org/v4/competitions/WC/matches?status=LIVE,IN_PLAY,PAUSED';
    const res = await fetch(url, {
      headers: { 'X-Auth-Token': this.key },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Football-Data.org error: ${res.status}`);
    const data = await res.json();
    return (data.matches || []).map((m: any) => ({
      externalId: String(m.id),
      homeTeamName: m.homeTeam.name,
      awayTeamName: m.awayTeam.name,
      homeScore: m.score.fullTime.home,
      awayScore: m.score.fullTime.away,
      status: this.mapStatus(m.status),
      matchTime: m.utcDate,
      minute: m.minute || null,
    }));
  }
}

// ---- Provider Registry ----
const providers: DataSourceProvider[] = [
  new APIFootballProvider(),
  new FootballDataOrgProvider(),
];

export async function getActiveProvider(): Promise<DataSourceProvider | null> {
  for (const p of providers) {
    if (await p.isAvailable()) return p;
  }
  return null;
}

export { providers };
