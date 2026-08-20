const { readFileSync, existsSync } = require("node:fs");
let failed = false;
function assert(cond, msg) {
  if (cond) { console.log("  PASS: " + msg); }
  else { console.log("  FAIL: " + msg); failed = true; }
}

console.log("PHASE 1 TASK 6 VERIFICATION");
console.log("============================\n");

console.log("[ForgotPasswordPage]");
assert(existsSync("client/src/pages/ForgotPasswordPage.tsx"), "ForgotPasswordPage.tsx exists");
if (existsSync("client/src/pages/ForgotPasswordPage.tsx")) {
  var fp = readFileSync("client/src/pages/ForgotPasswordPage.tsx", "utf-8");
  assert(fp.includes("email"), "has email field");
  assert(fp.includes("forgotPassword") || fp.includes("forgot-password"), "uses forgotPassword API");
  assert(fp.includes("/login"), "links to login");
}

console.log("\n[ResetPasswordPage]");
assert(existsSync("client/src/pages/ResetPasswordPage.tsx"), "ResetPasswordPage.tsx exists");
if (existsSync("client/src/pages/ResetPasswordPage.tsx")) {
  var rp = readFileSync("client/src/pages/ResetPasswordPage.tsx", "utf-8");
  assert(rp.includes("newPassword") || rp.includes("password"), "has new password field");
  assert(rp.includes("confirmPassword") || rp.includes("confirm-password"), "has confirm password field");
  assert(rp.includes("resetPassword") || rp.includes("reset-password"), "uses resetPassword API");
  assert(rp.includes("searchParams") || rp.includes("searchParams"), "reads token from URL params");
  assert(rp.includes("/login"), "redirects to /login on success");
}

console.log("\n[TypeScript compiles]");
try { require("child_process").execSync("pnpm tsc --noEmit", { stdio: "pipe" }); assert(true, "tsc passes"); }
catch { assert(false, "tsc passes"); }

console.log("\n" + (failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED"));
process.exit(failed ? 1 : 0);