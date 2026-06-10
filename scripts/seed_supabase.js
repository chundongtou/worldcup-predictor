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

  // All 48 teams
  const teams = [
    {id:"t01",name:"Mexico",flagCode:"MX",groupName:"A",eloRating:1862,fifaRanking:22,confederation:"CONCACAF",worldCupAppearances:17,bestResult:"Quarter-finals",updatedAt:now},
    {id:"t02",name:"South Africa",flagCode:"ZA",groupName:"A",eloRating:1520,fifaRanking:62,confederation:"CAF",worldCupAppearances:4,bestResult:"Group stage",updatedAt:now},
    {id:"t03",name:"South Korea",flagCode:"KR",groupName:"A",eloRating:1825,fifaRanking:29,confederation:"AFC",worldCupAppearances:11,bestResult:"Semi-finals",updatedAt:now},
    {id:"t04",name:"Czechia",flagCode:"CZ",groupName:"A",eloRating:1800,fifaRanking:35,confederation:"UEFA",worldCupAppearances:2,bestResult:"Group stage",updatedAt:now},
    {id:"t05",name:"Canada",flagCode:"CA",groupName:"B",eloRating:1680,fifaRanking:43,confederation:"CONCACAF",worldCupAppearances:2,bestResult:"Group stage",updatedAt:now},
    {id:"t06",name:"Bosnia Herzegovina",flagCode:"BA",groupName:"B",eloRating:1595,fifaRanking:55,confederation:"UEFA",worldCupAppearances:1,bestResult:"Group stage",updatedAt:now},
    {id:"t07",name:"Qatar",flagCode:"QA",groupName:"B",eloRating:1690,fifaRanking:50,confederation:"AFC",worldCupAppearances:2,bestResult:"Group stage",updatedAt:now},
    {id:"t08",name:"Switzerland",flagCode:"CH",groupName:"B",eloRating:1818,fifaRanking:31,confederation:"UEFA",worldCupAppearances:12,bestResult:"Quarter-finals",updatedAt:now},
    {id:"t09",name:"Brazil",flagCode:"BR",groupName:"C",eloRating:1988,fifaRanking:5,confederation:"CONMEBOL",worldCupAppearances:23,bestResult:"Champions",updatedAt:now},
    {id:"t10",name:"Morocco",flagCode:"MA",groupName:"C",eloRating:1880,fifaRanking:17,confederation:"CAF",worldCupAppearances:7,bestResult:"Semi-finals",updatedAt:now},
    {id:"t11",name:"Haiti",flagCode:"HT",groupName:"C",eloRating:1380,fifaRanking:87,confederation:"CONCACAF",worldCupAppearances:1,bestResult:"Group stage",updatedAt:now},
    {id:"t12",name:"Scotland",flagCode:"SC",groupName:"C",eloRating:1805,fifaRanking:34,confederation:"UEFA",worldCupAppearances:9,bestResult:"Group stage",updatedAt:now},
    {id:"t13",name:"USA",flagCode:"US",groupName:"D",eloRating:1875,fifaRanking:18,confederation:"CONCACAF",worldCupAppearances:12,bestResult:"Semi-finals",updatedAt:now},
    {id:"t14",name:"Paraguay",flagCode:"PY",groupName:"D",eloRating:1650,fifaRanking:49,confederation:"CONMEBOL",worldCupAppearances:9,bestResult:"Quarter-finals",updatedAt:now},
    {id:"t15",name:"Australia",flagCode:"AU",groupName:"D",eloRating:1765,fifaRanking:40,confederation:"AFC",worldCupAppearances:7,bestResult:"Round of 16",updatedAt:now},
    {id:"t16",name:"Turkiye",flagCode:"TR",groupName:"D",eloRating:1810,fifaRanking:33,confederation:"UEFA",worldCupAppearances:3,bestResult:"Semi-finals",updatedAt:now},
    {id:"t17",name:"Germany",flagCode:"DE",groupName:"E",eloRating:1968,fifaRanking:7,confederation:"UEFA",worldCupAppearances:21,bestResult:"Champions",updatedAt:now},
    {id:"t18",name:"Curacao",flagCode:"CW",groupName:"E",eloRating:1340,fifaRanking:95,confederation:"CONCACAF",worldCupAppearances:0,bestResult:"N/A",updatedAt:now},
    {id:"t19",name:"Cote dIvoire",flagCode:"CI",groupName:"E",eloRating:1720,fifaRanking:46,confederation:"CAF",worldCupAppearances:4,bestResult:"Group stage",updatedAt:now},
    {id:"t20",name:"Ecuador",flagCode:"EC",groupName:"E",eloRating:1812,fifaRanking:32,confederation:"CONMEBOL",worldCupAppearances:4,bestResult:"Round of 16",updatedAt:now},
    {id:"t21",name:"Netherlands",flagCode:"NL",groupName:"F",eloRating:1955,fifaRanking:8,confederation:"UEFA",worldCupAppearances:11,bestResult:"Runners-up",updatedAt:now},
    {id:"t22",name:"Japan",flagCode:"JP",groupName:"F",eloRating:1885,fifaRanking:16,confederation:"AFC",worldCupAppearances:8,bestResult:"Round of 16",updatedAt:now},
    {id:"t23",name:"Sweden",flagCode:"SE",groupName:"F",eloRating:1845,fifaRanking:25,confederation:"UEFA",worldCupAppearances:12,bestResult:"Runners-up",updatedAt:now},
    {id:"t24",name:"Tunisia",flagCode:"TN",groupName:"F",eloRating:1640,fifaRanking:52,confederation:"CAF",worldCupAppearances:7,bestResult:"Group stage",updatedAt:now},
    {id:"t25",name:"Belgium",flagCode:"BE",groupName:"G",eloRating:1942,fifaRanking:9,confederation:"UEFA",worldCupAppearances:14,bestResult:"Semi-finals",updatedAt:now},
    {id:"t26",name:"Egypt",flagCode:"EG",groupName:"G",eloRating:1830,fifaRanking:28,confederation:"CAF",worldCupAppearances:4,bestResult:"Group stage",updatedAt:now},
    {id:"t27",name:"Iran",flagCode:"IR",groupName:"G",eloRating:1775,fifaRanking:38,confederation:"AFC",worldCupAppearances:7,bestResult:"Group stage",updatedAt:now},
    {id:"t28",name:"New Zealand",flagCode:"NZ",groupName:"G",eloRating:1500,fifaRanking:70,confederation:"OFC",worldCupAppearances:3,bestResult:"Group stage",updatedAt:now},
    {id:"t29",name:"Spain",flagCode:"ES",groupName:"H",eloRating:2155,fifaRanking:1,confederation:"UEFA",worldCupAppearances:17,bestResult:"Champions",updatedAt:now},
    {id:"t30",name:"Cabo Verde",flagCode:"CV",groupName:"H",eloRating:1420,fifaRanking:78,confederation:"CAF",worldCupAppearances:0,bestResult:"N/A",updatedAt:now},
    {id:"t31",name:"Saudi Arabia",flagCode:"SA",groupName:"H",eloRating:1720,fifaRanking:45,confederation:"AFC",worldCupAppearances:7,bestResult:"Round of 16",updatedAt:now},
    {id:"t32",name:"Uruguay",flagCode:"UY",groupName:"H",eloRating:1898,fifaRanking:14,confederation:"CONMEBOL",worldCupAppearances:14,bestResult:"Champions",updatedAt:now},
    {id:"t33",name:"France",flagCode:"FR",groupName:"I",eloRating:2062,fifaRanking:3,confederation:"UEFA",worldCupAppearances:17,bestResult:"Champions",updatedAt:now},
    {id:"t34",name:"Senegal",flagCode:"SN",groupName:"I",eloRating:1855,fifaRanking:23,confederation:"CAF",worldCupAppearances:4,bestResult:"Quarter-finals",updatedAt:now},
    {id:"t35",name:"Iraq",flagCode:"IQ",groupName:"I",eloRating:1560,fifaRanking:63,confederation:"AFC",worldCupAppearances:1,bestResult:"Group stage",updatedAt:now},
    {id:"t36",name:"Norway",flagCode:"NO",groupName:"I",eloRating:1835,fifaRanking:27,confederation:"UEFA",worldCupAppearances:4,bestResult:"Round of 16",updatedAt:now},
    {id:"t37",name:"Argentina",flagCode:"AR",groupName:"J",eloRating:2113,fifaRanking:2,confederation:"CONMEBOL",worldCupAppearances:18,bestResult:"Champions",updatedAt:now},
    {id:"t38",name:"Algeria",flagCode:"DZ",groupName:"J",eloRating:1610,fifaRanking:54,confederation:"CAF",worldCupAppearances:5,bestResult:"Round of 16",updatedAt:now},
    {id:"t39",name:"Austria",flagCode:"AT",groupName:"J",eloRating:1840,fifaRanking:26,confederation:"UEFA",worldCupAppearances:8,bestResult:"Third place",updatedAt:now},
    {id:"t40",name:"Jordan",flagCode:"JO",groupName:"J",eloRating:1510,fifaRanking:66,confederation:"AFC",worldCupAppearances:0,bestResult:"N/A",updatedAt:now},
    {id:"t41",name:"Portugal",flagCode:"PT",groupName:"K",eloRating:1975,fifaRanking:6,confederation:"UEFA",worldCupAppearances:9,bestResult:"Third place",updatedAt:now},
    {id:"t42",name:"DR Congo",flagCode:"CD",groupName:"K",eloRating:1540,fifaRanking:61,confederation:"CAF",worldCupAppearances:2,bestResult:"Quarter-finals",updatedAt:now},
    {id:"t43",name:"Uzbekistan",flagCode:"UZ",groupName:"K",eloRating:1570,fifaRanking:59,confederation:"AFC",worldCupAppearances:0,bestResult:"N/A",updatedAt:now},
    {id:"t44",name:"Colombia",flagCode:"CO",groupName:"K",eloRating:1910,fifaRanking:12,confederation:"CONMEBOL",worldCupAppearances:7,bestResult:"Quarter-finals",updatedAt:now},
    {id:"t45",name:"England",flagCode:"GB-ENG",groupName:"L",eloRating:2020,fifaRanking:4,confederation:"UEFA",worldCupAppearances:17,bestResult:"Champions",updatedAt:now},
    {id:"t46",name:"Croatia",flagCode:"HR",groupName:"L",eloRating:1930,fifaRanking:10,confederation:"UEFA",worldCupAppearances:7,bestResult:"Runners-up",updatedAt:now},
    {id:"t47",name:"Ghana",flagCode:"GH",groupName:"L",eloRating:1600,fifaRanking:58,confederation:"CAF",worldCupAppearances:4,bestResult:"Quarter-finals",updatedAt:now},
    {id:"t48",name:"Panama",flagCode:"PA",groupName:"L",eloRating:1620,fifaRanking:56,confederation:"CONCACAF",worldCupAppearances:2,bestResult:"Group stage",updatedAt:now},
  ];

  console.log("Inserting", teams.length, "teams...");
  const r1 = await post("teams", teams);
  console.log("Teams:", r1.status, r1.body.substring(0, 150));

  if (r1.status >= 400) return;

  // Generate 72 group matches
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
      matches.push({
        id: "m" + String(idx + 1).padStart(3, "0"),
        round: "Group Stage",
        groupName: g,
        matchday: f.md,
        homeTeamId: teams[off + f.h].id,
        awayTeamId: teams[off + f.a].id,
        matchTime: t.toISOString(),
        status: "scheduled",
        stadium: v.stadium,
        city: v.city,
        eloHome: teams[off + f.h].eloRating,
        eloAway: teams[off + f.a].eloRating,
        isFinished: false,
        updatedAt: now
      });
      idx++;
    }
  }

  console.log("Inserting", matches.length, "matches...");
  const r2 = await post("matches", matches);
  console.log("Matches:", r2.status, r2.body.substring(0, 150));

  if (r2.status < 400) {
    console.log("Done! Teams:", teams.length, "Matches:", matches.length);
  }
}

main().catch(console.error);
