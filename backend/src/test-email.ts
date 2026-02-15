import { generateMissingPeriodEmail } from "./services/emailGenerator";

const result = generateMissingPeriodEmail({
  businessName: "Test Business Ltd",
  periodStart: "01-01-2025",
  periodEnd: "31-03-2025",
  statementType: "Bank Statement",
  missing: [
    {
      accountKey: "1234",
      missingMonths: ["February 2025"]
    }
  ]
});

console.log(result.subject);
console.log("-----");
console.log(result.body);
