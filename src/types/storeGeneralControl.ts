export interface StoreControlDetail {
  id: string;
  storeId: string;
  storeName: string;
  locationText: string; // city/region
  inspectorName: string;
  inspectedQty: number;
  controlDateISO: string; // ISO timestamp
  totalCritical: number;
  totalMajor: number;
  totalMinor: number;
  result: "GECTI" | "KALDI";
}

export interface StoreGeneralRow {
  id: string;
  generic: string;
  barcode: string;
  modelName: string;
  brand: string;
  productGroup: string;
  totalOrderQty: number;
  storeCount: number;
  totalCritical: number;
  totalMajor: number;
  totalMinor: number;
  details: StoreControlDetail[];
}

export interface KpiData {
  totalInspected: number;
  majorErrorCount: number;
  majorErrorRate: number; // %
  criticalErrorCount: number;
  criticalErrorRate: number; // %
  minorErrorRate: number; // %
  successRate: number; // %
}

export interface StoreGeneralFilters {
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;
  searchQuery: string;
}

export interface InspectorAnalysis {
  inspectorName: string;
  storeCount: number;
  controlCount: number;
}

export interface InspectorBreakdown {
  inspectorName: string;
  controlCount: number;
  totalCritical: number;
  totalMajor: number;
  totalMinor: number;
  successRate: number;
  lastControlDate: string;
}
