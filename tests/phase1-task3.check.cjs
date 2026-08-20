const { readFileSync, existsSync } = require("node:fs");
let failed = false;
function assert(cond, msg) {
  if (cond) { console.log("  PASS: " + msg); }
  else { console.log("  FAIL: " + msg); failed = true; }
}

console.log("PHASE 1 TASK 3 VERIFICATION");
console.log("============================\n");

console.log("[auth middleware]");
assert(existsSync("server/src/middleware/auth.ts"), "middleware/auth.ts exists");
if (existsSync("server/src/middleware/auth.ts")) {
  var mw = readFileSync("server/src/middleware/auth.ts", "utf-8");
  assert(mw.includes("requireAuth"), "exports requireAuth");
  assert(mw.includes("getSession"), "calls auth.api.getSession");
  assert(mw.includes("401"), "returns 401 on no session");
}

console.log("\n[index.ts wired]");
var idx = readFileSync("server/src/index.ts", "utf-8");
assert(idx.includes("requireAuth"), "requireAuth imported in index.ts");

console.log("\n[TypeScript compiles]");
try { require("child_process").execSync("pnpm tsc --noEmit", { stdio: "pipe" }); assert(true, "tsc passes"); }
catch { assert(false, "tsc passes"); }

console.log("\n" + (failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED"));
process.exit(failed ? 1 : 0);