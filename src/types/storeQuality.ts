export interface StoreOption {
  id: string;
  code: string;
  name: string;
  city?: string;
}

export interface Item {
  id: string;
  title: string;
  critical: number;
  major: number;
  minor: number;
  note?: string;
  photos?: string[];
}

export interface Category {
  id: string;
  name: string;
  items: Item[];
}

export interface AqlFormState {
  categories: Category[];
  generalNote: string;
  inspectedQty: number;
}

export interface StoreQualityRecord {
  id: string;
  storeId: string;
  storeName: string;
  barcode: string;
  generic: string;
  asortiCode: string;
  brand: string;
  productGroup: string;
  modelName: string;
  color: string;
  manufacturer: string;
  orderQty: number;
  origin?: string;
  supplierQcInspector?: string;
  inspectorName?: string;
  controlDate?: string;
  defectSummary?: string;
  defectDescription?: string;
  totalCritical: number;
  totalMajor: number;
  totalMinor: number;
  inspectedQty?: number;
  status: "BEKLIYOR" | "TAMAMLANDI" | "IADE_SURECI_BASLATILDI";
  aqlForm?: AqlFormState;
}
