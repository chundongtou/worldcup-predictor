import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const teams = [
  { name: "Mexico", flagCode: "MX", groupName: "A", eloRating: 1862, fifaRanking: 22, confederation: "CONCACAF", worldCupAppearances: 17, bestResult: "Quarter-finals" },
  { name: "South Africa", flagCode: "ZA", groupName: "A", eloRating: 1520, fifaRanking: 62, confederation: "CAF", worldCupAppearances: 4, bestResult: "Group stage" },
  { name: "South Korea", flagCode: "KR", groupName: "A", eloRating: 1825, fifaRanking: 29, confederation: "AFC", worldCupAppearances: 11, bestResult: "Semi-finals" },
  { name: "Czechia", flagCode: "CZ", groupName: "A", eloRating: 1800, fifaRanking: 35, confederation: "UEFA", worldCupAppearances: 2, bestResult: "Group stage" },
  { name: "Canada", flagCode: "CA", groupName: "B", eloRating: 1680, fifaRanking: 43, confederation: "CONCACAF", worldCupAppearances: 2, bestResult: "Group stage" },
  { name: "Bosnia & Herzegovina", flagCode: "BA", groupName: "B", eloRating: 1595, fifaRanking: 55, confederation: "UEFA", worldCupAppearances: 1, bestResult: "Group stage" },
  { name: "Qatar", flagCode: "QA", groupName: "B", eloRating: 1690, fifaRanking: 50, confederation: "AFC", worldCupAppearances: 2, bestResult: "Group stage" },
  { name: "Switzerland", flagCode: "CH", groupName: "B", eloRating: 1818, fifaRanking: 31, confederation: "UEFA", worldCupAppearances: 12, bestResult: "Quarter-finals" },
  { name: "Brazil", flagCode: "BR", groupName: "C", eloRating: 1988, fifaRanking: 5, confederation: "CONMEBOL", worldCupAppearances: 23, bestResult: "Champions" },
  { name: "Morocco", flagCode: "MA", groupName: "C", eloRating: 1880, fifaRanking: 17, confederation: "CAF", worldCupAppearances: 7, bestResult: "Semi-finals" },
  { name: "Haiti", flagCode: "HT", groupName: "C", eloRating: 1380, fifaRanking: 87, confederation: "CONCACAF", worldCupAppearances: 1, bestResult: "Group stage" },
  { name: "Scotland", flagCode: "SC", groupName: "C", eloRating: 1805, fifaRanking: 34, confederation: "UEFA", worldCupAppearances: 9, bestResult: "Group stage" },
  { name: "USA", flagCode: "US", groupName: "D", eloRating: 1875, fifaRanking: 18, confederation: "CONCACAF", worldCupAppearances: 12, bestResult: "Semi-finals" },
  { name: "Paraguay", flagCode: "PY", groupName: "D", eloRating: 1650, fifaRanking: 49, confederation: "CONMEBOL", worldCupAppearances: 9, bestResult: "Quarter-finals" },
  { name: "Australia", flagCode: "AU", groupName: "D", eloRating: 1765, fifaRanking: 40, confederation: "AFC", worldCupAppearances: 7, bestResult: "Round of 16" },
  { name: "Turkiye", flagCode: "TR", groupName: "D", eloRating: 1810, fifaRanking: 33, confederation: "UEFA", worldCupAppearances: 3, bestResult: "Semi-finals" },
  { name: "Germany", flagCode: "DE", groupName: "E", eloRating: 1968, fifaRanking: 7, confederation: "UEFA", worldCupAppearances: 21, bestResult: "Champions" },
  { name: "Curacao", flagCode: "CW", groupName: "E", eloRating: 1340, fifaRanking: 95, confederation: "CONCACAF", worldCupAppearances: 0, bestResult: "N/A" },
  { name: "Cote d'Ivoire", flagCode: "CI", groupName: "E", eloRating: 1720, fifaRanking: 46, confederation: "CAF", worldCupAppearances: 4, bestResult: "Group stage" },
  { name: "Ecuador", flagCode: "EC", groupName: "E", eloRating: 1812, fifaRanking: 32, confederation: "CONMEBOL", worldCupAppearances: 4, bestResult: "Round of 16" },
  { name: "Netherlands", flagCode: "NL", groupName: "F", eloRating: 1955, fifaRanking: 8, confederation: "UEFA", worldCupAppearances: 11, bestResult: "Runners-up" },
  { name: "Japan", flagCode: "JP", groupName: "F", eloRating: 1885, fifaRanking: 16, confederation: "AFC", worldCupAppearances: 8, bestResult: "Round of 16" },
  { name: "Sweden", flagCode: "SE", groupName: "F", eloRating: 1845, fifaRanking: 25, confederation: "UEFA", worldCupAppearances: 12, bestResult: "Runners-up" },
  { name: "Tunisia", flagCode: "TN", groupName: "F", eloRating: 1640, fifaRanking: 52, confederation: "CAF", worldCupAppearances: 7, bestResult: "Group stage" },
  { name: "Belgium", flagCode: "BE", groupName: "G", eloRating: 1942, fifaRanking: 9, confederation: "UEFA", worldCupAppearances: 14, bestResult: "Semi-finals" },
  { name: "Egypt", flagCode: "EG", groupName: "G", eloRating: 1830, fifaRanking: 28, confederation: "CAF", worldCupAppearances: 4, bestResult: "Group stage" },
  { name: "Iran", flagCode: "IR", groupName: "G", eloRating: 1775, fifaRanking: 38, confederation: "AFC", worldCupAppearances: 7, bestResult: "Group stage" },
  { name: "New Zealand", flagCode: "NZ", groupName: "G", eloRating: 1500, fifaRanking: 70, confederation: "OFC", worldCupAppearances: 3, bestResult: "Group stage" },
  { name: "Spain", flagCode: "ES", groupName: "H", eloRating: 2155, fifaRanking: 1, confederation: "UEFA", worldCupAppearances: 17, bestResult: "Champions" },
  { name: "Cabo Verde", flagCode: "CV", groupName: "H", eloRating: 1420, fifaRanking: 78, confederation: "CAF", worldCupAppearances: 0, bestResult: "N/A" },
  { name: "Saudi Arabia", flagCode: "SA", groupName: "H", eloRating: 1720, fifaRanking: 45, confederation: "AFC", worldCupAppearances: 7, bestResult: "Round of 16" },
  { name: "Uruguay", flagCode: "UY", groupName: "H", eloRating: 1898, fifaRanking: 14, confederation: "CONMEBOL", worldCupAppearances: 14, bestResult: "Champions" },
  { name: "France", flagCode: "FR", groupName: "I", eloRating: 2062, fifaRanking: 3, confederation: "UEFA", worldCupAppearances: 17, bestResult: "Champions" },
  { name: "Senegal", flagCode: "SN", groupName: "I", eloRating: 1855, fifaRanking: 23, confederation: "CAF", worldCupAppearances: 4, bestResult: "Quarter-finals" },
  { name: "Iraq", flagCode: "IQ", groupName: "I", eloRating: 1560, fifaRanking: 63, confederation: "AFC", worldCupAppearances: 1, bestResult: "Group stage" },
  { name: "Norway", flagCode: "NO", groupName: "I", eloRating: 1835, fifaRanking: 27, confederation: "UEFA", worldCupAppearances: 4, bestResult: "Round of 16" },
  { name: "Argentina", flagCode: "AR", groupName: "J", eloRating: 2113, fifaRanking: 2, confederation: "CONMEBOL", worldCupAppearances: 18, bestResult: "Champions" },
  { name: "Algeria", flagCode: "DZ", groupName: "J", eloRating: 1610, fifaRanking: 54, confederation: "CAF", worldCupAppearances: 5, bestResult: "Round of 16" },
  { name: "Austria", flagCode: "AT", groupName: "J", eloRating: 1840, fifaRanking: 26, confederation: "UEFA", worldCupAppearances: 8, bestResult: "Third place" },
  { name: "Jordan", flagCode: "JO", groupName: "J", eloRating: 1510, fifaRanking: 66, confederation: "AFC", worldCupAppearances: 0, bestResult: "N/A" },
  { name: "Portugal", flagCode: "PT", groupName: "K", eloRating: 1975, fifaRanking: 6, confederation: "UEFA", worldCupAppearances: 9, bestResult: "Third place" },
  { name: "DR Congo", flagCode: "CD", groupName: "K", eloRating: 1540, fifaRanking: 61, confederation: "CAF", worldCupAppearances: 2, bestResult: "Quarter-finals" },
  { name: "Uzbekistan", flagCode: "UZ", groupName: "K", eloRating: 1570, fifaRanking: 59, confederation: "AFC", worldCupAppearances: 0, bestResult: "N/A" },
  { name: "Colombia", flagCode: "CO", groupName: "K", eloRating: 1910, fifaRanking: 12, confederation: "CONMEBOL", worldCupAppearances: 7, bestResult: "Quarter-finals" },
  { name: "England", flagCode: "GB-ENG", groupName: "L", eloRating: 2020, fifaRanking: 4, confederation: "UEFA", worldCupAppearances: 17, bestResult: "Champions" },
  { name: "Croatia", flagCode: "HR", groupName: "L", eloRating: 1930, fifaRanking: 10, confederation: "UEFA", worldCupAppearances: 7, bestResult: "Runners-up" },
  { name: "Ghana", flagCode: "GH", groupName: "L", eloRating: 1600, fifaRanking: 58, confederation: "CAF", worldCupAppearances: 4, bestResult: "Quarter-finals" },
  { name: "Panama", flagCode: "PA", groupName: "L", eloRating: 1620, fifaRanking: 56, confederation: "CONCACAF", worldCupAppearances: 2, bestResult: "Group stage" },
];

const venues: Record<string, { stadium: string; city: string }> = {
  "Mexico City": { stadium: "Estadio Azteca", city: "Mexico City" },
  "New York": { stadium: "MetLife Stadium", city: "New York/New Jersey" },
  "Dallas": { stadium: "AT&T Stadium", city: "Dallas" },
  "Miami": { stadium: "Hard Rock Stadium", city: "Miami" },
  "Los Angeles": { stadium: "SoFi Stadium", city: "Los Angeles" },
  "Seattle": { stadium: "Lumen Field", city: "Seattle" },
  "Vancouver": { stadium: "BC Place", city: "Vancouver" },
  "Toronto": { stadium: "BMO Field", city: "Toronto" },
  "Boston": { stadium: "Gillette Stadium", city: "Boston" },
  "Philadelphia": { stadium: "Lincoln Financial Field", city: "Philadelphia" },
  "Houston": { stadium: "NRG Stadium", city: "Houston" },
  "Atlanta": { stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
  "San Francisco": { stadium: "Levi's Stadium", city: "San Francisco" },
  "Guadalajara": { stadium: "Estadio Akron", city: "Guadalajara" },
  "Monterrey": { stadium: "Estadio BBVA", city: "Monterrey" },
  "Kansas City": { stadium: "Arrowhead Stadium", city: "Kansas City" },
};

function generateGroupMatches() {
  const matches: Array<{ round: string; groupName: string; matchday: number; homeIdx: number; awayIdx: number; matchTime: Date; venue: string }> = [];
  const groups = "ABCDEFGHIJKL".split("");
  let teamOffset = 0;
  const baseDate = new Date("2026-06-11T14:00:00Z");
  for (const group of groups) {
    const fixtures = [
      { md: 1, h: 0, a: 1 }, { md: 1, h: 2, a: 3 },
      { md: 2, h: 0, a: 2 }, { md: 2, h: 1, a: 3 },
      { md: 3, h: 0, a: 3 }, { md: 3, h: 1, a: 2 },
    ];
    for (const fix of fixtures) {
      const dayOffset = (fix.md - 1) * 5 + Math.floor(teamOffset / 4);
      const hourOffset = (matches.length % 4) * 3;
      const matchTime = new Date(baseDate);
      matchTime.setDate(matchTime.getDate() + dayOffset);
      matchTime.setUTCHours(14 + hourOffset, 0, 0, 0);
      const venueKeys = Object.keys(venues);
      const venue = venues[venueKeys[matches.length % venueKeys.length]];
      matches.push({ round: "Group Stage", groupName: group, matchday: fix.md, homeIdx: teamOffset + fix.h, awayIdx: teamOffset + fix.a, matchTime, venue: venue.stadium + ", " + venue.city });
    }
    teamOffset += 4;
  }
  return matches;
}

function generateKnockoutMatches() {
  const matches: Array<{ round: string; matchday: number; homeIdx: number; awayIdx: number; matchTime: Date; venue: string }> = [];
  const schedule = [
    { round: "Round of 32", count: 16, startDate: "2026-06-28" },
    { round: "Round of 16", count: 8, startDate: "2026-07-04" },
    { round: "Quarter-finals", count: 4, startDate: "2026-07-09" },
    { round: "Semi-finals", count: 2, startDate: "2026-07-14" },
    { round: "Third place", count: 1, startDate: "2026-07-18" },
    { round: "Final", count: 1, startDate: "2026-07-19" },
  ];
  let idx = 100;
  for (const stage of schedule) {
    for (let i = 0; i < stage.count; i++) {
      const matchTime = new Date(stage.startDate + "T14:00:00Z");
      matchTime.setUTCHours(14 + (i % 4) * 3, 0, 0, 0);
      const venue = stage.round === "Final" ? venues["New York"] : venues[Object.keys(venues)[i % Object.keys(venues).length]];
      matches.push({ round: stage.round, matchday: 0, homeIdx: idx++, awayIdx: idx++, matchTime, venue: venue.stadium + ", " + venue.city });
    }
  }
  return matches;
}

async function main() {
  console.log("Seeding database...");
  await prisma.pointsLog.deleteMany();
  await prisma.userPrediction.deleteMany();
  await prisma.aiPrediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();

  console.log("Inserting 48 teams...");
  const createdTeams = [];
  for (const team of teams) {
    createdTeams.push(await prisma.team.create({ data: team }));
  }
  console.log(`Inserted ${createdTeams.length} teams`);

  console.log("Inserting group stage matches...");
  const groupMatches = generateGroupMatches();
  let gc = 0;
  for (const m of groupMatches) {
    const ht = createdTeams[m.homeIdx];
    const at = createdTeams[m.awayIdx];
    if (!ht || !at) continue;
    await prisma.match.create({
      data: { round: "Group Stage", groupName: m.groupName, matchday: m.matchday, homeTeamId: ht.id, awayTeamId: at.id, matchTime: m.matchTime, status: "scheduled", stadium: m.venue.split(", ")[0], city: m.venue.split(", ")[1] || "", eloHome: ht.eloRating, eloAway: at.eloRating },
    });
    gc++;
  }
  console.log(`Inserted ${gc} group stage matches`);

  console.log("Inserting knockout matches...");
  const koMatches = generateKnockoutMatches();
  const ph = createdTeams[0];
  let kc = 0;
  for (const m of koMatches) {
    await prisma.match.create({
      data: { round: m.round, homeTeamId: ph.id, awayTeamId: ph.id, matchTime: m.matchTime, status: "scheduled", stadium: m.venue.split(", ")[0], city: m.venue.split(", ")[1] || "", eloHome: 0, eloAway: 0 },
    });
    kc++;
  }
  console.log(`Inserted ${kc} knockout matches`);
  console.log(`\nDone! ${createdTeams.length} teams, ${gc + kc} matches`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
