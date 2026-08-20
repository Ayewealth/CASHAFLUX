const { readFileSync } = require("node:fs");
let failed = false;
function assert(cond, msg) {
  if (cond) { console.log("  PASS: " + msg); }
  else { console.log("  FAIL: " + msg); failed = true; }
}

const expectedTables = ["users","sessions","organizations","org_members","clients","invoices",
  "invoice_line_items","expenses","bank_accounts","bank_transactions",
  "recurring_invoices","mileage_logs","blog_posts","contact_submissions","activity_log"];
const expectedEnums = ["planEnum","orgTypeEnum","memberRoleEnum","invoiceStatusEnum",
  "bankAccountTypeEnum","transactionTypeEnum","frequencyEnum"];
const expectedTypes = ["User","InsertUser","Organization","InsertOrganization","Client",
  "InsertClient","Invoice","InsertInvoice","InvoiceLineItem","Expense","InsertExpense",
  "BankAccount","InsertBankAccount","BankTransaction","InsertBankTransaction",
  "RecurringInvoice","MileageLog","BlogPost","InsertBlogPost","ContactSubmission","ActivityLog"];

const schema = readFileSync("shared/schema.ts", "utf-8");

console.log("TASK 2 VERIFICATION");
console.log("====================\n");
console.log("[Tables]");
expectedTables.forEach(function(t) {
  var dq = "pgTable(\"" + t + "\"";
  var sq = "pgTable('" + t + "'";
  assert(schema.includes(dq) || schema.includes(sq), "table: " + t);
});
console.log("\n[Enums]");
expectedEnums.forEach(function(e) {
  assert(schema.includes("export const " + e), "enum: " + e);
});
console.log("\n[Types]");
expectedTypes.forEach(function(t) {
  assert(schema.includes("export type " + t), "type: " + t);
});
console.log("\n[No posts table]");
assert(!schema.includes("posts"), "no posts table in schema");
console.log("\n" + (failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED"));
process.exit(failed ? 1 : 0);