const { readFileSync, existsSync } = require("node:fs");
let failed = false;
function assert(cond, msg) {
  if (cond) { console.log("  PASS: " + msg); }
  else { console.log("  FAIL: " + msg); failed = true; }
}

console.log("TASK 5 VERIFICATION");
console.log("====================\n");
console.log("[Query Client]");
var qc = existsSync("client/src/lib/queryClient.ts");
assert(qc, "queryClient.ts exists");
if (qc) {
  var content = readFileSync("client/src/lib/queryClient.ts", "utf-8");
  assert(content.includes("QueryClient"), "exports QueryClient");
}
console.log("\n[Router]");
var rtr = existsSync("client/src/lib/router.tsx");
assert(rtr, "router.tsx exists");
if (rtr) {
  var rc = readFileSync("client/src/lib/router.tsx", "utf-8");
  assert(rc.includes("createBrowserRouter"), "uses createBrowserRouter");
  assert(rc.includes("'/dashboard'"), "has dashboard route");
  assert(rc.includes("'/'"), "has home route");
  assert(rc.includes("'/login'"), "has login route");
}
console.log("\n[App Shell]");
var app = readFileSync("client/src/App.tsx", "utf-8");
assert(app.includes("QueryClientProvider"), "uses QueryClientProvider");
assert(app.includes("RouterProvider"), "uses RouterProvider");
console.log("\n[Placeholder Pages]");
["HomePage","LoginPage","SignupPage","AboutPage","PricingPage","ContactPage",
 "PrivacyPage","TermsPage","BlogIndexPage","BlogPostPage","ForgotPasswordPage",
 "ResetPasswordPage","FeaturesPage"].forEach(function(p) {
  assert(existsSync("client/src/pages/" + p + ".tsx"), "page: " + p);
});
console.log("\n[Dashboard Pages]");
["dashboard/Layout","dashboard/DashboardPage"].forEach(function(p) {
  assert(existsSync("client/src/pages/" + p + ".tsx"), "page: " + p);
});
console.log("\n" + (failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED"));
process.exit(failed ? 1 : 0);