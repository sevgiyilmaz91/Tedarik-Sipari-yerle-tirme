import { kpiMockData, dailyStatsData, supplierSamplesData } from "../data/mockDashboard";
import { KpiData, DailyStat, SupplierStat } from "../types/dashboard";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dashboardService = {
    async getKpiData(): Promise<KpiData[]> {
        await delay(600);
        return kpiMockData;
    },

    async getDailyStats(): Promise<DailyStat[]> {
        await delay(400);
        return dailyStatsData;
    },

    async getSupplierStats(): Promise<SupplierStat[]> {
        await delay(500);
        return supplierSamplesData;
    }
};
