const { readFileSync, existsSync } = require("node:fs");
let failed = false;
function assert(cond, msg) {
  if (cond) { console.log("  PASS: " + msg); }
  else { console.log("  FAIL: " + msg); failed = true; }
}

console.log("PHASE 1 TASK 2 VERIFICATION");
console.log("============================\n");

console.log("[send.ts email service]");
assert(existsSync("server/src/emails/send.ts"), "send.ts exists");
if (existsSync("server/src/emails/send.ts")) {
  var send = readFileSync("server/src/emails/send.ts", "utf-8");
  assert(send.includes("Resend"), "imports Resend SDK");
  assert(send.includes("sendEmail"), "exports sendEmail function");
  assert(send.includes("RESEND_API_KEY"), "uses RESEND_API_KEY");
  assert(send.includes("EMAIL_FROM"), "uses EMAIL_FROM");
}

console.log("\n[Email templates]");
assert(existsSync("server/src/emails/templates/verify-email.html"), "verify-email.html exists");
assert(existsSync("server/src/emails/templates/reset-password.html"), "reset-password.html exists");
assert(existsSync("server/src/emails/templates/welcome.html"), "welcome.html exists");

if (existsSync("server/src/emails/templates/verify-email.html")) {
  var vt = readFileSync("server/src/emails/templates/verify-email.html", "utf-8");
  assert(vt.includes("Cashaflux"), "verify template branded");
  assert(vt.includes("{{VERIFY_URL}}"), "verify template has URL placeholder");
}
if (existsSync("server/src/emails/templates/reset-password.html")) {
  var rt = readFileSync("server/src/emails/templates/reset-password.html", "utf-8");
  assert(rt.includes("Cashaflux"), "reset template branded");
  assert(rt.includes("{{RESET_URL}}"), "reset template has URL placeholder");
}

console.log("\n[.gitkeep removed]");
assert(!existsSync("server/src/emails/.gitkeep"), ".gitkeep removed");

console.log("\n[TypeScript compiles]");
try { require("child_process").execSync("pnpm tsc --noEmit", { stdio: "pipe" }); assert(true, "tsc passes"); }
catch { assert(false, "tsc passes"); }

console.log("\n" + (failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED"));
process.exit(failed ? 1 : 0);