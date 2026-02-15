/**
 * Input passed to AI enrichment for a single transaction
 */
export type EnrichmentInput = {
    description: string;
    amount: number;
  };
  
  /**
   * Output returned by AI enrichment
   */
  export type EnrichmentResult = {
    category: string;
    merchant: string | null;
    confidence: number; // 0–1
  };
  