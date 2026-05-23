import { useState } from 'react';

interface Report {
  id: string;
  weekStartDate: string;
  totalScans: number;
  safeCount: number;
  flaggedCount: number;
  blockedCount: number;
  safetyScore: number;
  totalMinutes: number;
  topCategories: Record<string, number>;
}

export function useReports() {
  const [reports] = useState<Report[]>([]);

  return {
    reports,
    isLoading: false,
    latestReport: reports[0] ?? null,
  };
}
