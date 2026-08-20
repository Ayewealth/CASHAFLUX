const { readFileSync, existsSync } = require("node:fs");
let failed = false;
function assert(cond, msg) {
  if (cond) { console.log("  PASS: " + msg); }
  else { console.log("  FAIL: " + msg); failed = true; }
}

console.log("PHASE 1 TASK 1 VERIFICATION");
console.log("============================\n");

console.log("[Packages installed]");
var pkg = JSON.parse(readFileSync("package.json", "utf-8"));
var deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
assert(!!deps["resend"], "resend package installed");
assert(!!deps["express-rate-limit"], "express-rate-limit installed");

console.log("\n[auth.ts config]");
var auth = readFileSync("server/src/auth.ts", "utf-8");
assert(auth.includes("emailVerification"), "emailVerification configured");
assert(auth.includes("sendVerificationEmail"), "sendVerificationEmail hook");
assert(auth.includes("forgotPassword"), "forgotPassword configured");
assert(auth.includes("sendResetPassword"), "sendResetPassword hook");
assert(auth.includes("databaseHooks"), "databaseHooks configured");
assert(auth.includes("requireEmailVerification"), "requireEmailVerification enabled");

console.log("\n[index.ts rate limiting]");
var idx = readFileSync("server/src/index.ts", "utf-8");
assert(idx.includes("express-rate-limit") || idx.includes("rateLimit"), "rate limiting middleware added");

console.log("\n[TypeScript compiles]");
try { require("child_process").execSync("pnpm tsc --noEmit", { stdio: "pipe" }); assert(true, "tsc passes"); }
catch { assert(false, "tsc passes"); }

console.log("\n" + (failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED"));
process.exit(failed ? 1 : 0);