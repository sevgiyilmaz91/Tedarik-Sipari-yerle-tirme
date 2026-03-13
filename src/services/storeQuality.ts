import type { StoreOption, StoreQualityRecord, AqlFormState, Category, Item } from "../types/storeQuality";

const mockStores: StoreOption[] = [
  { id: "1", code: "IST-001", name: "İstanbul - Forum", city: "İstanbul" },
  { id: "2", code: "IST-002", name: "İstanbul - İstinye", city: "İstanbul" },
  { id: "3", code: "ANK-001", name: "Ankara - Armada", city: "Ankara" },
  { id: "4", code: "IZM-001", name: "İzmir - Optimum", city: "İzmir" },
];

const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Görsel Kontrol",
    items: [
      { id: "item-1", title: "Dış Görünüş Kusurları", critical: 0, major: 0, minor: 0 },
      { id: "item-2", title: "Renk Uygunluğu", critical: 0, major: 0, minor: 0 },
      { id: "item-3", title: "İç Desen Hassas.", critical: 0, major: 0, minor: 0 },
    ],
  },
  {
    id: "cat-2",
    name: "Ölçü Kontrolü",
    items: [
      { id: "item-4", title: "Uzunluk", critical: 0, major: 0, minor: 0 },
      { id: "item-5", title: "Genişlik", critical: 0, major: 0, minor: 0 },
      { id: "item-6", title: "Kalınlık", critical: 0, major: 0, minor: 0 },
    ],
  },
  {
    id: "cat-3",
    name: "İşçilik Kontrol",
    items: [
      { id: "item-7", title: "Dikiş Kalitesi", critical: 0, major: 0, minor: 0 },
      { id: "item-8", title: "Kontrol Noktaları", critical: 0, major: 0, minor: 0 },
    ],
  },
];

let storeQualityRecords: StoreQualityRecord[] = [
  {
    id: "rec-1",
    storeId: "1",
    storeName: "İstanbul - Forum",
    barcode: "8697643210001",
    generic: "102033134",
    asortiCode: "ML M039 3LU",
    brand: "FLOXO",
    productGroup: "Ayakkabı",
    modelName: "ML M039 3LU 34US4 5PR",
    color: "Siyah",
    manufacturer: "Klotho Tekstil San.ve Tic.Ltd.Şti.",
    orderQty: 539,
    origin: "Turkiye",
    supplierQcInspector: "Kader Kesgin",
    inspectorName: undefined,
    controlDate: undefined,
    defectSummary: undefined,
    defectDescription: undefined,
    totalCritical: 0,
    totalMajor: 0,
    totalMinor: 0,
    inspectedQty: undefined,
    status: "BEKLIYOR",
  },
  {
    id: "rec-2",
    storeId: "1",
    storeName: "İstanbul - Forum",
    barcode: "8697643210002",
    generic: "102037120",
    asortiCode: "ML M039 2LU",
    brand: "FLOXO",
    productGroup: "Ayakkabı",
    modelName: "ML M039 2LU 34US",
    color: "Beyaz",
    manufacturer: "İstikbal Ayakkabı San.Ve Tic.",
    orderQty: 1550,
    origin: "Turkiye",
    supplierQcInspector: "Harun Atay",
    inspectorName: undefined,
    controlDate: undefined,
    defectSummary: undefined,
    defectDescription: undefined,
    totalCritical: 0,
    totalMajor: 0,
    totalMinor: 0,
    inspectedQty: undefined,
    status: "BEKLIYOR",
  },
];

export const storeQualityService = {
  getStores: async (): Promise<StoreOption[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockStores), 300);
    });
  },

  searchByBarcode: async (storeId: string, barcode: string): Promise<StoreQualityRecord[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = storeQualityRecords.filter(
          (r) => r.storeId === storeId && r.barcode.includes(barcode)
        );
        resolve(results.length > 0 ? results : []);
      }, 500);
    });
  },

  saveAql: async (recordId: string, aqlForm: AqlFormState): Promise<StoreQualityRecord> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recordIndex = storeQualityRecords.findIndex((r) => r.id === recordId);
        if (recordIndex >= 0) {
          const totalCrit = aqlForm.categories.reduce((sum, cat) => sum + cat.items.reduce((s, item) => s + item.critical, 0), 0);
          const totalMaj = aqlForm.categories.reduce((sum, cat) => sum + cat.items.reduce((s, item) => s + item.major, 0), 0);
          const totalMin = aqlForm.categories.reduce((sum, cat) => sum + cat.items.reduce((s, item) => s + item.minor, 0), 0);

          const today = new Date();
          const controlDate = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;

          const defectSummary =
            totalCrit > 0
              ? "Kritik"
              : totalMaj > 0
                ? "Majör"
                : totalMin > 0
                  ? "Minör"
                  : "Hata yok";

          // Determine status: if critical or major errors, start return process; otherwise completed
          const status = totalCrit > 0 || totalMaj > 0 ? "IADE_SURECI_BASLATILDI" : "TAMAMLANDI";

          const updated: StoreQualityRecord = {
            ...storeQualityRecords[recordIndex],
            totalCritical: totalCrit,
            totalMajor: totalMaj,
            totalMinor: totalMin,
            defectSummary,
            defectDescription: aqlForm.generalNote,
            inspectorName: "Mevcut Kullanıcı",
            inspectedQty: aqlForm.inspectedQty,
            status,
            controlDate,
            aqlForm,
          };

          storeQualityRecords[recordIndex] = updated;
          resolve(updated);
        } else {
          reject(new Error("Record not found"));
        }
      }, 400);
    });
  },

  getDefaultAqlForm: (): AqlFormState => {
    return {
      categories: JSON.parse(JSON.stringify(mockCategories)),
      generalNote: "",
      inspectedQty: 0,
    };
  },
};
