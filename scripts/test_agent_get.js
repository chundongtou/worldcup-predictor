const http = require("http");
const fs = require("fs");

const env = fs.readFileSync(".env", "utf8");
const keyMatch = env.match(/AGENT_SECRET_KEY=([^\n]+)/);
const key = keyMatch ? keyMatch[1] : "";

function testGet(path) {
  return new Promise((resolve) => {
    const r = http.request(
      { hostname: "localhost", port: 3000, path, method: "GET", headers: { Authorization: "Bearer " + key } },
      (x) => {
        let d = "";
        x.on("data", (c) => (d += c));
        x.on("end", () => {
          if (x.statusCode === 200) {
            console.log(`\n${path}: [${x.statusCode}]`);
            console.log(d.substring(0, 300));
          } else {
            const match = d.match(/"message":"([^"]+)"/);
            const details = d.match(/"details":"([^"]+)"/);
            console.log(`\n${path}: [${x.statusCode}]`);
            if (match) console.log("Error:", match[1]);
            if (details) console.log("Details:", details[1]);
            if (!match && !details) console.log("HTML error page, length:", d.length);
          }
          resolve();
        });
      }
    );
    r.end();
  });
}

async function main() {
  console.log("=== Agent GET API Test ===");
  await testGet("/api/agent/predictions-status");
  await testGet("/api/agent/accuracy-report");
}

main().catch(console.error);
