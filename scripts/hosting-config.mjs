import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Keep an existing Sites deployment private; fresh clones use neutral defaults.
export function hostingConfigPath(root = fileURLToPath(new URL("../", import.meta.url))) {
  const local = join(root, ".openai", "hosting.json");
  return existsSync(local) ? local : join(root, ".openai", "hosting.example.json");
}

export function readHostingConfig() {
  return JSON.parse(readFileSync(hostingConfigPath(), "utf8"));
}
