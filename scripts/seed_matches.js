const https = require("https");
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

async function main() {
  const now = new Date().toISOString();

  // Team data for ELO ratings
  const teamElo = {
    t01:1862,t02:1520,t03:1825,t04:1800,t05:1680,t06:1595,t07:1690,t08:1818,
    t09:1988,t10:1880,t11:1380,t12:1805,t13:1875,t14:1650,t15:1765,t16:1810,
    t17:1968,t18:1340,t19:1720,t20:1812,t21:1955,t22:1885,t23:1845,t24:1640,
    t25:1942,t26:1830,t27:1775,t28:1500,t29:2155,t30:1420,t31:1720,t32:1898,
    t33:2062,t34:1855,t35:1560,t36:1835,t37:2113,t38:1610,t39:1840,t40:1510,
    t41:1975,t42:1540,t43:1570,t44:1910,t45:2020,t46:1930,t47:1600,t48:1620
  };

  const groups = "ABCDEFGHIJKL".split("");
  const baseDate = new Date("2026-06-11T14:00:00Z");
  const venues = [
    {stadium:"Estadio Azteca",city:"Mexico City"},
    {stadium:"MetLife Stadium",city:"New York"},
    {stadium:"AT&T Stadium",city:"Dallas"},
    {stadium:"Hard Rock Stadium",city:"Miami"},
    {stadium:"SoFi Stadium",city:"Los Angeles"},
    {stadium:"Lumen Field",city:"Seattle"},
    {stadium:"BC Place",city:"Vancouver"},
    {stadium:"BMO Field",city:"Toronto"},
  ];

  const matches = [];
  let idx = 0;
  for (const g of groups) {
    const off = (g.charCodeAt(0) - 65) * 4;
    const teamIds = [];
    for (let i = 0; i < 4; i++) teamIds.push("t" + String(off + i + 1).padStart(2, "0"));
    
    const fixtures = [
      {md:1,h:0,a:1},{md:1,h:2,a:3},
      {md:2,h:0,a:2},{md:2,h:1,a:3},
      {md:3,h:0,a:3},{md:3,h:1,a:2},
    ];
    for (const f of fixtures) {
      const dayOffset = (f.md - 1) * 5 + Math.floor(off / 4);
      const t = new Date(baseDate);
      t.setDate(t.getDate() + dayOffset);
      t.setUTCHours(14 + (idx % 4) * 3, 0, 0, 0);
      const v = venues[idx % venues.length];
      const homeId = teamIds[f.h];
      const awayId = teamIds[f.a];
      matches.push({
        id: "m" + String(idx + 1).padStart(3, "0"),
        round: "Group Stage",
        groupName: g,
        matchday: f.md,
        homeTeamId: homeId,
        awayTeamId: awayId,
        matchTime: t.toISOString(),
        status: "scheduled",
        stadium: v.stadium,
        city: v.city,
        eloHome: teamElo[homeId],
        eloAway: teamElo[awayId],
        isFinished: false,
        updatedAt: now
      });
      idx++;
    }
  }

  console.log("Inserting", matches.length, "matches...");
  const r = await post("matches", matches);
  console.log("Result:", r.status, r.body.substring(0, 200));
  
  if (r.status < 400) {
    console.log("Success! Inserted", matches.length, "matches");
  }
}

main().catch(console.error);
