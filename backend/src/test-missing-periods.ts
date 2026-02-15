import { detectMissingPeriods } from "./services/missingPeriods";


const result = detectMissingPeriods(
  [
    { date: "2025-01-05", accountKey: "1234" },
    { date: "2025-03-10", accountKey: "1234" }
  ],
  "2025-01-01",
  "2025-03-31"
);

console.log(JSON.stringify(result, null, 2));
