const https = require("https");
const http = require("http");
const ref = "bpyqxdgpmrybrqjerkfw";
const key = "sb_publishable_rEmONiAglWMEPfoPPYFn0w_-UhAUceZ";

function post(table, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = https.request({
      hostname: `${ref}.supabase.co`,
      path: `/rest/v1/${table}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Prefer": "return=minimal",
        "Content-Length": Buffer.byteLength(body)
      }
    }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function predict(homeElo, awayElo, homeName, awayName) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ home_elo: homeElo, away_elo: awayElo, home_team: homeName, away_team: awayName });
    const req = http.request({
      hostname: "localhost", port: 8000, path: "/predict", method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve(JSON.parse(d)));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function query(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { headers: { "apikey": key, "Authorization": `Bearer ${key}` } }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve(JSON.parse(d)));
    });
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  // Get teams first
  const teams = await query(`https://${ref}.supabase.co/rest/v1/teams?select=id,name`);
  const teamMap = {};
  teams.forEach(t => teamMap[t.id] = t.name);
  console.log("Loaded", teams.length, "teams");

  // Get matches
  const matches = await query(`https://${ref}.supabase.co/rest/v1/matches?select=id,homeTeamId,awayTeamId,eloHome,eloAway&order=matchTime.asc`);
  console.log("Loaded", matches.length, "matches");

  const predictions = [];
  let errors = 0;

  for (const m of matches) {
    const homeName = teamMap[m.homeTeamId] || "Unknown";
    const awayName = teamMap[m.awayTeamId] || "Unknown";
    try {
      const pred = await predict(m.eloHome, m.eloAway, homeName, awayName);
      predictions.push({
        id: "p" + m.id.substring(1),
        matchId: m.id,
        modelVersion: "v1.0",
        homeWinProb: Math.round(pred.prediction.home_win * 1000) / 10,
        drawProb: Math.round(pred.prediction.draw * 1000) / 10,
        awayWinProb: Math.round(pred.prediction.away_win * 1000) / 10,
        predictedHomeScore: pred.predicted_score.home,
        predictedAwayScore: pred.predicted_score.away,
        confidence: Math.round(pred.confidence * 1000) / 10,
        topScores: JSON.stringify(pred.top_scores),
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      errors++;
      if (errors <= 3) console.error("Error:", homeName, "vs", awayName, e.message);
    }
  }

  console.log("Generated", predictions.length, "predictions,", errors, "errors");

  if (predictions.length > 0) {
    for (let i = 0; i < predictions.length; i += 20) {
      const batch = predictions.slice(i, i + 20);
      const r = await post("ai_predictions", batch);
      console.log("Batch", Math.floor(i/20) + 1, ":", r.status, r.body.substring(0, 100));
    }
    console.log("Done! Inserted", predictions.length, "predictions");
  }
}

main().catch(console.error);
