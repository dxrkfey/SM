declare module '../stores/smoke' {
    export interface SmokeStore {
      selectedSmoke: Record<string, any>; // Define this according to the actual structure
      blackCount: number;
      whiteCount: number;
      normalData: Record<string, any>[];
      dailyData: { Black: number; White: number };
      monthlyData: { Black: number; White: number };
      yearlyData: { Black: number; White: number };
      loadSmoke: () => Promise<void>;
      filterSmoke: (startDate: string, endDate: string) => Promise<void>;
    }
  
    export const useSmokeStore: () => SmokeStore;
  }
  