const { readFileSync, existsSync } = require("node:fs");
let failed = false;
function assert(cond, msg) {
  if (cond) { console.log("  PASS: " + msg); }
  else { console.log("  FAIL: " + msg); failed = true; }
}

console.log("PHASE 1 TASK 5 VERIFICATION");
console.log("============================\n");

console.log("[LoginPage]");
assert(existsSync("client/src/pages/LoginPage.tsx"), "LoginPage.tsx exists");
if (existsSync("client/src/pages/LoginPage.tsx")) {
  var lp = readFileSync("client/src/pages/LoginPage.tsx", "utf-8");
  assert(lp.includes("email"), "has email field");
  assert(lp.includes("password"), "has password field");
  assert(lp.includes("signIn.email"), "calls authClient.signIn.email");
  assert(lp.includes("/dashboard"), "redirects to /dashboard");
  assert(lp.includes("/forgot-password") || lp.includes("forgot-password"), "links to forgot-password");
  assert(lp.includes("/signup"), "links to signup");
}

console.log("\n[SignupPage]");
assert(existsSync("client/src/pages/SignupPage.tsx"), "SignupPage.tsx exists");
if (existsSync("client/src/pages/SignupPage.tsx")) {
  var sp = readFileSync("client/src/pages/SignupPage.tsx", "utf-8");
  assert(sp.includes("name"), "has name field");
  assert(sp.includes("email"), "has email field");
  assert(sp.includes("password"), "has password field");
  assert(sp.includes("confirmPassword") || sp.includes("confirm-password"), "has confirm password field");
  assert(sp.includes("signUp.email"), "calls authClient.signUp.email");
  assert(sp.includes("Check your email"), "shows verification message");
  assert(sp.includes("/login"), "links to login");
}

console.log("\n[Password validation present]");
var lp2 = readFileSync("client/src/pages/LoginPage.tsx", "utf-8");
var sp2 = readFileSync("client/src/pages/SignupPage.tsx", "utf-8");
// Check that password validation references the shared function
assert(lp2.includes("validatePassword") || sp2.includes("validatePassword") || 
       (lp2.includes("\\d") && sp2.includes("\\d")), "password digit validation referenced");

console.log("\n[TypeScript compiles]");
try { require("child_process").execSync("pnpm tsc --noEmit", { stdio: "pipe" }); assert(true, "tsc passes"); }
catch { assert(false, "tsc passes"); }

console.log("\n" + (failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED"));
process.exit(failed ? 1 : 0);