const https = require("https");
const ref = "bpyqxdgpmrybrqjerkfw";
const key = "sb_publishable_rEmONiAglWMEPfoPPYFn0w_-UhAUceZ";

function query(table, params = "") {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: `${ref}.supabase.co`,
      path: `/rest/v1/${table}?${params}`,
      method: "GET",
      headers: { "apikey": key, "Authorization": `Bearer ${key}` }
    }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve(JSON.parse(d)));
    });
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  const teams = await query("teams", "select=id&limit=5");
  console.log("Teams:", teams.length, "sample:", teams.map(t => t.id));
  
  const matches = await query("matches", "select=id&limit=5");
  console.log("Matches:", matches.length, "sample:", matches.map(m => m.id));
  
  // Count all
  const allTeams = await query("teams", "select=id");
  const allMatches = await query("matches", "select=id");
  console.log("Total teams:", allTeams.length);
  console.log("Total matches:", allMatches.length);
}

main().catch(console.error);
