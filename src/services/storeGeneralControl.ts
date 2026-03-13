import type { StoreGeneralRow, StoreGeneralFilters, KpiData } from "@/types/storeGeneralControl";

// Mock data
const mockGeneralData: StoreGeneralRow[] = [
  {
    id: "gen-001",
    generic: "1001",
    barcode: "8697643210001",
    modelName: "ML M039 3LU 34US4 5PR",
    brand: "KLOTHO",
    productGroup: "Ayakkabı",
    totalOrderQty: 1200,
    storeCount: 4,
    totalCritical: 2,
    totalMajor: 8,
    totalMinor: 15,
    details: [
      {
        id: "det-001",
        storeId: "1",
        storeName: "İstanbul - Forum",
        locationText: "İstanbul",
        inspectorName: "Kader Kesgin",
        inspectedQty: 300,
        controlDateISO: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        totalCritical: 0,
        totalMajor: 2,
        totalMinor: 5,
        result: "GECTI",
      },
      {
        id: "det-002",
        storeId: "2",
        storeName: "Ankara - Metropol",
        locationText: "Ankara",
        inspectorName: "Ahmet Yılmaz",
        inspectedQty: 280,
        controlDateISO: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        totalCritical: 1,
        totalMajor: 3,
        totalMinor: 4,
        result: "KALDI",
      },
      {
        id: "det-003",
        storeId: "3",
        storeName: "İzmir - Alsancak",
        locationText: "İzmir",
        inspectorName: "Kader Kesgin",
        inspectedQty: 320,
        controlDateISO: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalCritical: 1,
        totalMajor: 2,
        totalMinor: 4,
        result: "KALDI",
      },
      {
        id: "det-004",
        storeId: "4",
        storeName: "Bursa - Nilüfer",
        locationText: "Bursa",
        inspectorName: "Fatih Demir",
        inspectedQty: 300,
        controlDateISO: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        totalCritical: 0,
        totalMajor: 1,
        totalMinor: 2,
        result: "GECTI",
      },
    ],
  },
  {
    id: "gen-002",
    generic: "2002",
    barcode: "8697643210002",
    modelName: "İK-2024-COMFORT",
    brand: "İSTİKBAL",
    productGroup: "Mobilya",
    totalOrderQty: 850,
    storeCount: 3,
    totalCritical: 0,
    totalMajor: 4,
    totalMinor: 8,
    details: [
      {
        id: "det-005",
        storeId: "1",
        storeName: "İstanbul - Forum",
        locationText: "İstanbul",
        inspectorName: "Ahmet Yılmaz",
        inspectedQty: 280,
        controlDateISO: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        totalCritical: 0,
        totalMajor: 2,
        totalMinor: 3,
        result: "GECTI",
      },
      {
        id: "det-006",
        storeId: "2",
        storeName: "Ankara - Metropol",
        locationText: "Ankara",
        inspectorName: "Fatih Demir",
        inspectedQty: 290,
        controlDateISO: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        totalCritical: 0,
        totalMajor: 1,
        totalMinor: 3,
        result: "GECTI",
      },
      {
        id: "det-007",
        storeId: "3",
        storeName: "İzmir - Alsancak",
        locationText: "İzmir",
        inspectorName: "Kader Kesgin",
        inspectedQty: 280,
        controlDateISO: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        totalCritical: 0,
        totalMajor: 1,
        totalMinor: 2,
        result: "GECTI",
      },
    ],
  },
  {
    id: "gen-003",
    generic: "3003",
    barcode: "8697643210003",
    modelName: "AKTIF-RUNNER-PRO",
    brand: "AKTIF",
    productGroup: "Ayakkabı",
    totalOrderQty: 650,
    storeCount: 2,
    totalCritical: 1,
    totalMajor: 6,
    totalMinor: 10,
    details: [
      {
        id: "det-008",
        storeId: "1",
        storeName: "İstanbul - Forum",
        locationText: "İstanbul",
        inspectorName: "Fatih Demir",
        inspectedQty: 320,
        controlDateISO: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        totalCritical: 0,
        totalMajor: 3,
        totalMinor: 5,
        result: "GECTI",
      },
      {
        id: "det-009",
        storeId: "4",
        storeName: "Bursa - Nilüfer",
        locationText: "Bursa",
        inspectorName: "Ahmet Yılmaz",
        inspectedQty: 330,
        controlDateISO: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        totalCritical: 1,
        totalMajor: 3,
        totalMinor: 5,
        result: "KALDI",
      },
    ],
  },
];

export const storeGeneralControlService = {
  fetchStoreGeneralList: async (filters: StoreGeneralFilters): Promise<StoreGeneralRow[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Tarih filtrelemesi
        const dateFrom = new Date(filters.dateFrom);
        const dateTo = new Date(filters.dateTo);

        let filtered = mockGeneralData.map((row) => ({
          ...row,
          details: row.details.filter((detail) => {
            const controlDate = new Date(detail.controlDateISO);
            return controlDate >= dateFrom && controlDate <= dateTo;
          }),
        }));

        // Boş detail olması varsa satırı kaldır
        filtered = filtered.filter((row) => row.details.length > 0);

        // Search filtrelemesi
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();

          // Mağaza bazında arama
          if (q.startsWith("store:")) {
            const storeName = q.replace("store:", "").trim();
            filtered = filtered.map((row) => ({
              ...row,
              details: row.details.filter((detail) =>
                detail.storeName.toLowerCase().includes(storeName) ||
                detail.locationText.toLowerCase().includes(storeName)
              ),
            })).filter((row) => row.details.length > 0);
          }
          // Inspectör bazında arama
          else if (q.startsWith("inspector:")) {
            const inspectorName = q.replace("inspector:", "").trim();
            filtered = filtered.map((row) => ({
              ...row,
              details: row.details.filter((detail) =>
                detail.inspectorName.toLowerCase().includes(inspectorName)
              ),
            })).filter((row) => row.details.length > 0);
          }
          // Generic/Barkod bazında arama (default)
          else {
            filtered = filtered.filter(
              (row) =>
                row.generic.toLowerCase().includes(q) ||
                row.barcode.includes(q) ||
                row.modelName.toLowerCase().includes(q)
            );
          }
        }

        resolve(filtered);
      }, 300);
    });
  },

  calculateKpis: async (data: StoreGeneralRow[]): Promise<KpiData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalInspected = data.reduce((sum, row) => sum + row.details.reduce((s, d) => s + d.inspectedQty, 0), 0);
        const totalCritical = data.reduce((sum, row) => sum + row.details.reduce((s, d) => s + d.totalCritical, 0), 0);
        const totalMajor = data.reduce((sum, row) => sum + row.details.reduce((s, d) => s + d.totalMajor, 0), 0);
        const totalMinor = data.reduce((sum, row) => sum + row.details.reduce((s, d) => s + d.totalMinor, 0), 0);
        const totalSuccess = data.reduce((sum, row) => sum + row.details.filter((d) => d.result === "GECTI").length, 0);
        const totalControls = data.reduce((sum, row) => sum + row.details.length, 0);

        const majorErrorRate = totalInspected > 0 ? (totalMajor / totalInspected) * 100 : 0;
        const criticalErrorRate = totalInspected > 0 ? (totalCritical / totalInspected) * 100 : 0;
        const minorErrorRate = totalInspected > 0 ? (totalMinor / totalInspected) * 100 : 0;
        const successRate = totalControls > 0 ? (totalSuccess / totalControls) * 100 : 0;

        resolve({
          totalInspected,
          majorErrorCount: totalMajor,
          majorErrorRate: Math.round(majorErrorRate * 100) / 100,
          criticalErrorCount: totalCritical,
          criticalErrorRate: Math.round(criticalErrorRate * 100) / 100,
          minorErrorRate: Math.round(minorErrorRate * 100) / 100,
          successRate: Math.round(successRate * 100) / 100,
        });
      }, 200);
    });
  },

  getStoreList: async (): Promise<Array<{ id: string; name: string; location: string }>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storeMap = new Map<string, { name: string; location: string }>();
        mockGeneralData.forEach((row) => {
          row.details.forEach((detail) => {
            if (!storeMap.has(detail.storeId)) {
              storeMap.set(detail.storeId, {
                name: detail.storeName,
                location: detail.locationText,
              });
            }
          });
        });
        const stores = Array.from(storeMap.entries()).map(([id, data]) => ({
          id,
          name: data.name,
          location: data.location,
        }));
        resolve(stores);
      }, 100);
    });
  },
};
