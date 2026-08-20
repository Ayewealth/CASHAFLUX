const { readFileSync, existsSync } = require("node:fs");

let failed = false;
function assert(cond, msg) {
  if (cond) { console.log("  PASS: " + msg); }
  else { console.log("  FAIL: " + msg); failed = true; }
}

const schemaPath = "shared/schema.ts";
const schema = readFileSync(schemaPath, "utf-8");

console.log("TASK 3 VERIFICATION");
console.log("====================\n");
console.log("[Better Auth Tables in schema]");
var authTables = ["user", "session", "account", "verification"];
authTables.forEach(function(t) {
  var dq = 'pgTable("' + t + '"';
  var sq = "pgTable('" + t + "'";
  assert(schema.includes(dq) || schema.includes(sq), "auth table: " + t);
});
console.log("\n[Better Auth comment block]");
var hasComment = schema.includes("Better Auth") || schema.includes("managed by Better Auth");
assert(hasComment, "Better Auth comment marking auth tables");
console.log("\n" + (failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED"));
process.exit(failed ? 1 : 0);