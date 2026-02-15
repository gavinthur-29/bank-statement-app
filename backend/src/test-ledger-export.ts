import { generateLedgerCsv } from "./services/ledgerExport";

const testRows = [
  {
    date: "2025-01-01",
    description: "Opening balance",
    amount: 0,
    balance: 1000,
    accountKey: "1234",
    path: "BANK" as const
  },
  {
    date: "2025-01-02",
    description: "Coffee Shop",
    amount: -3.5,
    balance: 996.5,
    accountKey: "1234",
    path: "BANK" as const
  },
  {
    date: "2025-01-05",
    description: "Salary",
    amount: 2000,
    balance: 2996.5,
    accountKey: "1234",
    path: "BANK" as const
  }
];

const result = generateLedgerCsv(testRows, "Test Business Ltd");

console.log("----- PAY.csv -----");
console.log(result.payCsv);

console.log("\n----- REC.csv -----");
console.log(result.recCsv);
