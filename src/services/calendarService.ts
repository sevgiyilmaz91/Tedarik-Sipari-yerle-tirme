import type { BandCalendarResponse } from "../types/supplier";

export class CalendarService {
    static async getBandCalendar(params: {
        season: string;
        supplierCode: string;
        productionType: string;
        line: string;
    }): Promise<BandCalendarResponse> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const months = [
            "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
            "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
        ];

        // Seeded random based on params to stay consistent
        const seed = params.supplierCode.length + params.line.length;

        const monthlyData = months.map((month, idx) => {
            // Random planned quantity between 40% and 95% of monthly capacity
            // Assuming monthlyCapacity is calculated in the component (daily * 22)
            // But here we just provide the planned quantity

            // For variety, let's assume a baseline daily capacity of 1000
            const baseMonthlyCap = 1000 * 22;
            const factor = 0.4 + (Math.sin(seed + idx) * 0.3 + 0.3); // 0.4 to 1.0

            return {
                month,
                plannedQuantity: Math.floor(baseMonthlyCap * factor),
                monthlyCapacity: baseMonthlyCap
            };
        });

        return {
            monthlyData
        };
    }
}
