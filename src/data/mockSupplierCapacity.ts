import type { SupplierCapacityItem } from "../types/supplier";

// Predefined set of suppliers to ensure each has 2 lines
const suppliers = [
    { code: "1200001", name: "ACME AYAKKABICILIK" },
    { code: "1200002", name: "BETA SHOES" },
    { code: "1200003", name: "GAMA AYAKKABI" },
    { code: "1200004", name: "DELTA URETIM" },
    { code: "1200005", name: "EPSILON SHOE CO" },
    { code: "1200006", name: "ZETA MODA" },
    { code: "1200007", name: "ETA FABRIKA" },
    { code: "1200008", name: "THETA DIZAYN" },
    { code: "1200009", name: "IOTA INDUSTRIAL" },
    { code: "1200010", name: "KAPPA KUNDURA" },
];

const brandsList = ["VANS", "POLARIS", "CONVERSE", "U.S. POLO ASSN.", "ADIDAS", "LUMBERJACK", "NINE WEST", "FLO", "KINETIX"];
const categoriesList = ["LEISURE", "DRESS", "CASUAL", "ATHLETIC", "COMFORT"];

export const mockSupplierCapacities: SupplierCapacityItem[] = [];

let idCounter = 1;

suppliers.forEach((s, idx) => {
    const hasSecondBand = idx % 3 !== 0; // Every 3rd supplier has only 1 band

    const bands = [
        {
            id: `${s.code}-B1`,
            line: "BANT 1",
            theoreticalCapacity: idx % 2 === 0 ? 1500 : 2000,
            allocatedCapacityForFlo: idx % 2 === 0 ? 1000 : 1500,
        }
    ];

    if (hasSecondBand) {
        bands.push({
            id: `${s.code}-B2`,
            line: "BANT 2",
            theoreticalCapacity: idx % 2 === 0 ? 1000 : 1500,
            allocatedCapacityForFlo: idx % 2 === 0 ? 500 : 1000,
        });
    }

    mockSupplierCapacities.push({
        id: (idCounter++).toString(),
        season: "FW-2026",
        supplierCode: s.code,
        supplierName: s.name,
        rating: 7 + (idx % 4), // Generates ratings 7, 8, 9, 10
        productMainGroup: idx % 2 === 0 ? "AYAKKABI" : "BOT",
        productionType: ["ATOM", "CALIFORNIA", "MAKINA MONTA", "ENJEKSIYON"][idx % 4],
        bands: bands,
        isSingleProduction: idx % 2 === 0,
        productGroups: ["KADIN", "ERKEK"].slice(0, (idx % 2) + 1),
        brands: brandsList.slice(0, (idx % 5) + 3),
        categories: categoriesList.slice(0, (idx % 3) + 2),
        stockGroups: [`SG-0${(idx % 5) + 1}`],
        classificationGroups: [`CG-0${(idx % 3) + 1}`],
        upperMaterials: ["SUNI", "DERI", "TEKSTIL"].slice(0, (idx % 3) + 1),
        soleMaterials: ["PU", "TPU", "EVA"].slice(0, (idx % 3) + 1),
        gbb: (['Good', 'Better', 'Best'] as const)[idx % 3]
    });
});
