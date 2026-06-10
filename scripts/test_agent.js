const http = require("http");
const fs = require("fs");

const env = fs.readFileSync(".env", "utf8");
const lines = env.split("\n");
let key = "";
for (const l of lines) {
  if (l.startsWith("AGENT_SECRET_KEY=")) {
    key = l.split("=")[1];
    break;
  }
}

function test(name, method, path, body) {
  return new Promise((resolve) => {
    const b = body ? JSON.stringify(body) : "";
    const r = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path,
        method,
        headers: {
          Authorization: "Bearer " + key,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(b),
        },
      },
      (x) => {
        let d = "";
        x.on("data", (c) => (d += c));
        x.on("end", () => {
          console.log(`\n${name}: [${x.statusCode}]`);
          console.log(d.substring(0, 200));
          resolve();
        });
      }
    );
    if (b) r.write(b);
    r.end();
  });
}

async function main() {
  console.log("=== Agent API Test ===");

  await test("1. Trigger Review", "POST", "/api/agent/trigger", {
    action: "review",
  });
  await test("2. Trigger Tune", "POST", "/api/agent/trigger", {
    action: "tune",
  });
  await test("3. Predictions Status", "GET", "/api/agent/predictions-status");
  await test("4. Accuracy Report", "GET", "/api/agent/accuracy-report");
  await test("5. Write Log", "POST", "/api/agent/write-log", {
    matchId: "m001",
    reviewText: "Test review: Mexico dominated as expected",
    tags: ["#correct", "#expected"],
    directionCorrect: true,
    scoreCorrect: false,
    surpriseLevel: 2,
  });
}

main().catch(console.error);
