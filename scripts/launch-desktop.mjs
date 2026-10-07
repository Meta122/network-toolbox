import { spawn } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const runtime = join(root, ".network-toolbox-runtime");
const profile = join(runtime, "browser-profile");
const config = join(root, "dist", "server", "wrangler.json");
const wrangler = join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const url = "http://127.0.0.1:8787";

function browserPath() {
  const candidates = [
    join(process.env["ProgramFiles(x86)"] || "", "Microsoft", "Edge", "Application", "msedge.exe"),
    join(process.env.ProgramFiles || "", "Microsoft", "Edge", "Application", "msedge.exe"),
    join(process.env.ProgramFiles || "", "Google", "Chrome", "Application", "chrome.exe"),
  ];
  return candidates.find(existsSync);
}

async function ready() {
  try {
    const response = await fetch(`${url}/api/echo`, { signal: AbortSignal.timeout(1500) });
    return response.ok;
  } catch {
    return false;
  }
}

if (!existsSync(config) || !existsSync(wrangler)) {
  console.error("Installation incomplète. Consulte le fichier README.md.");
  process.exit(1);
}
if (await ready()) {
  console.error("Le port local 8787 est déjà occupé. Ferme l'autre instance puis réessaie.");
  process.exit(1);
}
const browser = browserPath();
if (!browser) {
  console.error("Microsoft Edge ou Google Chrome est nécessaire pour la fenêtre de l'application.");
  process.exit(1);
}

mkdirSync(runtime, { recursive: true });
const log = createWriteStream(join(runtime, "server.log"), { flags: "a" });
const server = spawn(process.execPath, [
  "--import", "./scripts/sites-env.mjs", wrangler, "dev", "--config", config,
  "--local", "--persist-to", join(root, ".wrangler", "state"),
  "--ip", "127.0.0.1", "--port", "8787", "--inspector-port", "0",
], { cwd: root, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
server.stdout.pipe(log, { end: false });
server.stderr.pipe(log, { end: false });

let available = false;
for (let i = 0; i < 60; i++) {
  if (server.exitCode !== null) break;
  if (await ready()) { available = true; break; }
  await delay(500);
}
if (!available) {
  console.error(`Le serveur local n'a pas démarré. Détails : ${join(runtime, "server.log")}`);
  server.kill();
  process.exit(1);
}

console.log("Network Toolbox est ouverte dans sa propre fenêtre.");
console.log("Ferme cette fenêtre de l'application pour arrêter le serveur local.");
const app = spawn(browser, [
  `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", `--app=${url}`,
], { cwd: root, stdio: "ignore" });
app.on("exit", () => server.kill());
app.on("error", (error) => {
  console.error(`Impossible d'ouvrir l'application : ${error.message}`);
  server.kill();
  process.exitCode = 1;
});
process.on("SIGINT", () => { app.kill(); server.kill(); });
process.on("SIGTERM", () => { app.kill(); server.kill(); });
