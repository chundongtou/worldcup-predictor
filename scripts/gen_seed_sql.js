const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const p = new PrismaClient({ datasourceUrl: "file:./dev.db" });

(async () => {
  const teams = await p.team.findMany({ orderBy: { groupName: "asc" } });
  const matches = await p.match.findMany({
    include: { homeTeam: true, awayTeam: true },
    orderBy: { matchTime: "asc" },
  });
  const preds = await p.aiPrediction.findMany();

  let sql = "-- Schema\n" + fs.readFileSync("supabase_schema.sql", "utf8") + "\n\n";

  // Teams
  sql += "-- Teams\n";
  for (const t of teams) {
    const val = [
      `'${t.id}'`, `'${t.name.replace(/'/g, "''")}'`, `'${t.flagCode}'`,
      `'${t.groupName}'`, t.eloRating, t.fifaRanking || "NULL",
      t.confederation ? `'${t.confederation}'` : "NULL",
      t.worldCupAppearances,
      t.bestResult ? `'${t.bestResult}'` : "NULL",
      "NOW()", "NOW()",
    ].join(",");
    sql += `INSERT INTO teams (id,name,"flagCode","groupName","eloRating","fifaRanking",confederation,"worldCupAppearances","bestResult","createdAt","updatedAt") VALUES (${val});\n`;
  }

  // Matches
  sql += "\n-- Matches\n";
  for (const m of matches) {
    const val = [
      `'${m.id}'`, `'${m.round}'`,
      m.groupName ? `'${m.groupName}'` : "NULL",
      m.matchday || "NULL",
      `'${m.homeTeamId}'`, `'${m.awayTeamId}'`,
      `'${m.matchTime.toISOString()}'`,
      `'${m.status}'`,
      m.stadium ? `'${m.stadium.replace(/'/g, "''")}'` : "NULL",
      m.city ? `'${m.city.replace(/'/g, "''")}'` : "NULL",
      m.eloHome, m.eloAway, m.isFinished, "NOW()", "NOW()",
    ].join(",");
    sql += `INSERT INTO matches (id,"round","groupName",matchday,"homeTeamId","awayTeamId","matchTime",status,stadium,city,"eloHome","eloAway","isFinished","createdAt","updatedAt") VALUES (${val});\n`;
  }

  // Predictions
  sql += "\n-- AI Predictions\n";
  for (const pr of preds) {
    const val = [
      `'${pr.id}'`, `'${pr.matchId}'`, `'${pr.modelVersion}'`,
      pr.homeWinProb, pr.drawProb, pr.awayWinProb,
      pr.predictedHomeScore, pr.predictedAwayScore,
      pr.confidence,
      pr.topScores ? `'${pr.topScores.replace(/'/g, "''")}'` : "NULL",
      "NOW()", "NOW()",
    ].join(",");
    sql += `INSERT INTO ai_predictions (id,"matchId","modelVersion","homeWinProb","drawProb","awayWinProb","predictedHomeScore","predictedAwayScore",confidence,"topScores","createdAt","updatedAt") VALUES (${val});\n`;
  }

  fs.writeFileSync("supabase_full.sql", sql);
  console.log(`Done: ${teams.length} teams, ${matches.length} matches, ${preds.length} predictions`);
  console.log(`SQL file: supabase_full.sql (${sql.split("\n").length} lines)`);
  await p.$disconnect();
})();
