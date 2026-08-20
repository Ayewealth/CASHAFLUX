const { readFileSync, existsSync } = require("node:fs");
const { execSync } = require("node:child_process");

let failed = false;
function assert(condition, msg) {
  if (condition) console.log(`  PASS: ${msg}`);
  else { console.log(`  FAIL: ${msg}`); failed = true; }
}

console.log("TASK 1 VERIFICATION");
console.log("====================");

console.log("\n[Build]");
try {
  execSync("pnpm build", { stdio: "pipe" });
  assert(true, "pnpm build succeeds");
} catch {
  assert(false, "pnpm build succeeds");
}

console.log("\n[shadcn]");
assert(existsSync("components.json"), "components.json exists after shadcn init");

console.log("\n[Brand Tokens]");
if (existsSync("client/src/index.css")) {
  const css = readFileSync("client/src/index.css", "utf-8");
  assert(css.includes("#1E3A5F"), "brand navy #1E3A5F in CSS");
  assert(css.includes("#2563EB"), "brand blue #2563EB in CSS");
  assert(css.includes("@theme"), "@theme block defined");
} else {
  assert(false, "client/src/index.css exists");
  assert(false, "brand navy in CSS");
  assert(false, "brand blue in CSS");
  assert(false, "@theme block defined");
}

console.log("\n[Dependencies]");
if (existsSync("package.json")) {
  const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  assert(!!deps.tailwindcss, "tailwindcss installed");
  assert(!!deps["react-router"], "react-router installed");
  assert(!!deps["@tanstack/react-query"], "@tanstack/react-query installed");
} else {
  assert(false, "package.json exists");
}

console.log(`\n${failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED"}`);
process.exit(failed ? 1 : 0);
