// backend/src/services/missingPeriod.ts

export type MissingPeriodsResult = {
    accountKey: string;
    missingMonths: string[]; // e.g. "February 2025"
  };
  
  function monthRange(startISO: string, endISO: string): string[] {
    const months: string[] = [];
  
    const current = new Date(startISO + "T00:00:00Z");
    current.setUTCDate(1);
  
    const end = new Date(endISO + "T00:00:00Z");
    end.setUTCDate(1);
  
    while (current <= end) {
      const year = current.getUTCFullYear();
      const month = String(current.getUTCMonth() + 1).padStart(2, "0");
      months.push(`${year}-${month}`);
      current.setUTCMonth(current.getUTCMonth() + 1);
    }
  
    return months;
  }
  
  function formatMonthHuman(ym: string): string {
    const [y, m] = ym.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleString("en-GB", { month: "long", year: "numeric" });
  }
  
  export function detectMissingPeriods(
    rows: {
      date: string;       // ISO YYYY-MM-DD
      accountKey: string;
    }[],
    periodStartISO: string,
    periodEndISO: string
  ): MissingPeriodsResult[] {
    const expectedMonths = monthRange(periodStartISO, periodEndISO);
  
    const accountMonthMap = new Map<string, Set<string>>();
  
    for (const row of rows) {
      const month = row.date.slice(0, 7); // YYYY-MM
      if (!accountMonthMap.has(row.accountKey)) {
        accountMonthMap.set(row.accountKey, new Set());
      }
      accountMonthMap.get(row.accountKey)!.add(month);
    }
  
    const results: MissingPeriodsResult[] = [];
  
    for (const [accountKey, presentMonths] of accountMonthMap.entries()) {
      const missingMonths = expectedMonths
        .filter(m => !presentMonths.has(m))
        .map(formatMonthHuman);
  
      results.push({
        accountKey,
        missingMonths
      });
    }
  
    return results;
  }
  