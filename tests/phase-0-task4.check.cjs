const { readFileSync, existsSync } = require("node:fs");
let failed = false;
function assert(cond, msg) {
  if (cond) { console.log("  PASS: " + msg); }
  else { console.log("  FAIL: " + msg); failed = true; }
}

console.log("TASK 4 VERIFICATION");
console.log("====================\n");
console.log("[env.ts vars]");
var envTs = readFileSync("server/src/env.ts", "utf-8");
["RESEND_API_KEY", "EMAIL_FROM", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET",
 "STRIPE_PRICE_PRO_MONTHLY", "STRIPE_PRICE_PRO_ANNUAL", "STRIPE_PRICE_BUSINESS_MONTHLY", "STRIPE_PRICE_BUSINESS_ANNUAL",
 "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID",
 "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "SUPPORT_EMAIL", "BETTER_AUTH_URL"].forEach(function(k) {
  assert(envTs.includes(k), "env var: " + k);
});
console.log("\n[.env.example vars]");
var envEx = readFileSync(".env.example", "utf-8");
assert(envEx.includes("RESEND_API_KEY"), ".env.example has RESEND_API_KEY");
assert(envEx.includes("STRIPE_SECRET_KEY"), ".env.example has STRIPE keys");
assert(envEx.includes("R2_"), ".env.example has R2 vars");
assert(envEx.includes("SUPPORT_EMAIL"), ".env.example has SUPPORT_EMAIL");
console.log("\n[emails directory]");
assert(existsSync("server/src/emails"), "emails dir exists");
console.log("\n" + (failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED"));
process.exit(failed ? 1 : 0);