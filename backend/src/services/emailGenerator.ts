type MissingPeriodsByAccount = {
    accountKey: string;
    missingMonths: string[]; // e.g. ["February 2025"]
  };
  
  export type GeneratedEmail = {
    subject: string;
    body: string;
  };
  
  export function generateMissingPeriodEmail(params: {
    businessName: string;
    periodStart: string; // DD-MM-YYYY
    periodEnd: string;   // DD-MM-YYYY
    statementType: "Bank Statement" | "Credit Card Statement";
    missing: MissingPeriodsByAccount[];
  }): GeneratedEmail {
    const {
      businessName,
      periodStart,
      periodEnd,
      statementType,
      missing
    } = params;
  
    const subject = `${businessName} - missing period`;
  
    if (missing.length === 1) {
      return {
        subject,
        body: singleAccountEmail({
          businessName,
          periodStart,
          periodEnd,
          statementType,
          accountKey: missing[0].accountKey,
          months: missing[0].missingMonths
        })
      };
    }
  
    return {
      subject,
      body: multiAccountEmail({
        businessName,
        periodStart,
        periodEnd,
        missing
      })
    };
  }
  
  /* ---------- Templates ---------- */
  
  function singleAccountEmail(params: {
    businessName: string;
    periodStart: string;
    periodEnd: string;
    statementType: string;
    accountKey: string;
    months: string[];
  }): string {
    return `
  Dear ${params.businessName},
  
  We have reviewed the ${params.statementType} provided for the accounting period ${params.periodStart} to ${params.periodEnd} for account number ${params.accountKey}.
  
  We have identified missing statement periods. Please find the missing periods listed below:
  
  ${params.months.join("\n")}
  
  Please provide the missing statements so we can complete the consolidation process.
  
  Kind regards,
  `.trim();
  }
  
  function multiAccountEmail(params: {
    businessName: string;
    periodStart: string;
    periodEnd: string;
    missing: MissingPeriodsByAccount[];
  }): string {
    const blocks = params.missing
      .map(m => {
        return `
  ${m.accountKey}
  ${m.missingMonths.join("\n")}
  `.trim();
      })
      .join("\n\n");
  
    return `
  Dear ${params.businessName},
  
  We have reviewed the submitted statements for the accounting period ${params.periodStart} to ${params.periodEnd}.
  
  We have identified missing statement periods for the following accounts:
  
  ${blocks}
  
  Please provide the missing statements so we can complete the consolidation process.
  
  Kind regards,
  `.trim();
  }
  