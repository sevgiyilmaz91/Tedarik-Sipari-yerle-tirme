export interface Band {
    id: string;
    line: string;
    theoreticalCapacity: number;
    allocatedCapacityForFlo: number;
}

export interface SupplierCapacityItem {
    id: string;
    season: string;
    supplierCode: string;
    supplierName: string;
    rating: number;
    productMainGroup: string;
    productionType: string;
    bands: Band[];
    isSingleProduction: boolean;
    productGroups: string[];
    brands: string[];
    categories: string[];
    stockGroups: string[];
    classificationGroups: string[];
    upperMaterials: string[];
    soleMaterials: string[];
    gbb?: 'Good' | 'Better' | 'Best';
}

export interface MonthlyCapacityData {
    month: string;
    plannedQuantity: number;
    monthlyCapacity: number;
}

export interface BandCalendarResponse {
    monthlyData: MonthlyCapacityData[];
}
