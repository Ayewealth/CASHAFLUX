const { readFileSync, existsSync } = require("node:fs");
let failed = false;
function assert(cond, msg) {
  if (cond) { console.log("  PASS: " + msg); }
  else { console.log("  FAIL: " + msg); failed = true; }
}

console.log("TASK 6 VERIFICATION");
console.log("====================\n");
console.log("[.env exists]");
assert(existsSync(".env"), ".env file exists");
console.log("[BETTER_AUTH_SECRET set]");
if (existsSync(".env")) {
  var env = readFileSync(".env", "utf-8");
  assert(env.includes("BETTER_AUTH_SECRET="), "BETTER_AUTH_SECRET defined");
  assert(!env.includes("change-me"), "not using placeholder secret");
}
console.log("\n[Quality Gate: tsc]");
try { require("child_process").execSync("pnpm tsc --noEmit"); assert(true, "tsc passes"); }
catch { assert(false, "tsc passes"); }
console.log("\n[Quality Gate: build]");
try { require("child_process").execSync("pnpm build"); assert(true, "build succeeds"); }
catch { assert(false, "build succeeds"); }
console.log("\n" + (failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED"));
process.exit(failed ? 1 : 0);