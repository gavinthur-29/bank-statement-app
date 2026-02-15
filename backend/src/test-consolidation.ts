import { consolidateTransactions } from "./services/consolidation";
import { TransactionRow } from "./parsers/types";

const rows: TransactionRow[] = [
  {
    date: "2025-01-01",
    description: "Opening",
    amount: 0,
    accountKey: "1234"
  },
  {
    date: "2025-01-02",
    description: "Coffee",
    amount: -3.5,
    accountKey: "1234"
  },
  {
    date: "2025-01-05",
    description: "Salary",
    amount: 2000,
    accountKey: "1234"
  }
];

const result = consolidateTransactions(rows, "1234", 1000);

console.log(JSON.stringify(result, null, 2));
