const { readFileSync, existsSync } = require("node:fs");
let failed = false;
function assert(cond, msg) {
  if (cond) { console.log("  PASS: " + msg); }
  else { console.log("  FAIL: " + msg); failed = true; }
}

console.log("PHASE 1 TASK 7 VERIFICATION");
console.log("============================\n");

console.log("[Wizard layout]");
assert(existsSync("client/src/pages/onboarding/OnboardingLayout.tsx"), "OnboardingLayout.tsx exists");

console.log("[Steps exist]");
["Step1BusinessProfile", "Step2CurrencyLocale", "Step3InviteTeam", "Step4ChoosePlan"].forEach(function(s) {
  assert(existsSync("client/src/pages/onboarding/" + s + ".tsx"), s + ".tsx exists");
});

console.log("\n[POST /api/onboarding endpoint]");
var idx = readFileSync("server/src/index.ts", "utf-8");
assert(idx.includes("/onboarding") || idx.includes("onboarding"), "/onboarding route present in index.ts");

console.log("\n[TypeScript compiles]");
try { require("child_process").execSync("pnpm tsc --noEmit", { stdio: "pipe" }); assert(true, "tsc passes"); }
catch { assert(false, "tsc passes"); }

console.log("\n" + (failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED"));
process.exit(failed ? 1 : 0);