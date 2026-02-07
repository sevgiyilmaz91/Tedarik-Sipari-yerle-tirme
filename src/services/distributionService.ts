
export interface DistributionRecord {
    id: string;
    modelName: string;
    brandName: string;
    supplierName: string;
    line: string;
    quantity: number;
    startDate: string;
    endDate: string;
    duration: number;
    monthlyBreakdown: Record<string, number>;
    satId?: string;
    dailyAssignments?: Record<string, number>;
}

// Global variable to persist shared state in the POC session
let memoryRecords: DistributionRecord[] = [];

export const DistributionService = {
    getRecords: (): DistributionRecord[] => {
        return [...memoryRecords];
    },
    addRecord: (record: DistributionRecord) => {
        memoryRecords = [record, ...memoryRecords.filter(r => r.satId !== record.satId)];
    },
    removeRecordBySatId: (satId: string) => {
        memoryRecords = memoryRecords.filter(r => r.satId !== satId);
    }
};
