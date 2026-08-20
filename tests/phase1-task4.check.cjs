const { readFileSync, existsSync } = require("node:fs");
let failed = false;
function assert(cond, msg) {
  if (cond) { console.log("  PASS: " + msg); }
  else { console.log("  FAIL: " + msg); failed = true; }
}

console.log("PHASE 1 TASK 4 VERIFICATION");
console.log("============================\n");

console.log("[auth-client.ts]");
assert(existsSync("client/src/lib/auth-client.ts"), "auth-client.ts exists");
if (existsSync("client/src/lib/auth-client.ts")) {
  var ac = readFileSync("client/src/lib/auth-client.ts", "utf-8");
  assert(ac.includes("createAuthClient"), "imports createAuthClient");
  assert(ac.includes("authClient"), "exports authClient");
}

console.log("\n[AuthGuard component]");
assert(existsSync("client/src/components/AuthGuard.tsx"), "AuthGuard.tsx exists");
if (existsSync("client/src/components/AuthGuard.tsx")) {
  var ag = readFileSync("client/src/components/AuthGuard.tsx", "utf-8");
  assert(ag.includes("useSession"), "uses useSession hook");
  assert(ag.includes("/login"), "redirects to /login");
  assert(ag.includes("Outlet"), "renders Outlet");
}

console.log("\n[router.tsx updated]");
var rt = readFileSync("client/src/lib/router.tsx", "utf-8");
assert(rt.includes("AuthGuard"), "AuthGuard imported in router");

console.log("\n[Onboarding routes in router]");
assert(rt.includes("/onboarding"), "/onboarding route present");
assert(rt.includes("step-2"), "step-2 route present");
assert(rt.includes("step-3"), "step-3 route present");
assert(rt.includes("step-4"), "step-4 route present");

console.log("\n[TypeScript compiles]");
try { require("child_process").execSync("pnpm tsc --noEmit", { stdio: "pipe" }); assert(true, "tsc passes"); }
catch { assert(false, "tsc passes"); }

console.log("\n" + (failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED"));
process.exit(failed ? 1 : 0);