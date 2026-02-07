
import type { OrderPlacementItem } from "../types/orderPlacement";

const brands = ["VANS", "POLARIS", "CONVERSE", "U.S. POLO ASSN.", "ADIDAS", "LUMBERJACK", "NINE WEST"];
const categories = ["LEISURE", "DRESS", "CASUAL", "ATHLETIC", "COMFORT"];
const classes = ["AYAKKABI", "BOT", "TERLIK", "SANDALET", "LOAFER", "BABET"];
const genders = ["ERKEK", "KADIN", "KIZ COCUK", "UNISEX COCUK", "ERKEK COCUK"];
const materials = ["SUET", "PVC", "TEKSTIL (KETEN)", "KANVAS", "PU", "PU/MESH", "PU (KROKO)"];

const modelNames = ["V-600", "P-100", "C-200", "U-300", "A-400", "L-500", "N-700", "S-800", "T-900"];

export const mockOrders: OrderPlacementItem[] = Array.from({ length: 65 }).map((_, index) => {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const cls = classes[Math.floor(Math.random() * classes.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const material = materials[Math.floor(Math.random() * materials.length)];
    const modelName = modelNames[Math.floor(Math.random() * modelNames.length)];
    const productionTypes = ["ATOM", "CALIFORNIA", "MAKINA MONTA", "ENJEKSIYON"];
    const productDesc = productionTypes[index % productionTypes.length];

    const isCarryover = index % 5 === 2; // Roughly 20% Carryover
    const productStatus = isCarryover ? 'Carryover' : 'New';
    const previousGeneric = isCarryover ? `999${Math.floor(Math.random() * 9000000 + 1000000)}` : undefined;

    const brandGroup = (brand === "VANS" || brand === "CONVERSE" || brand === "ADIDAS") ? "FLO" : brand;

    return {
        id: (index + 1).toString(),
        purchaseRequest: `900000${7077 + index}`,
        genericModel: `101${Math.floor(Math.random() * 9000000 + 1000000)}`,
        modelName: modelName,
        productDescription: productDesc,
        gender: gender,
        brandGroup: brandGroup,
        brandName: brand,
        productGroup: index % 3 === 0 ? "AKTIFCOCUK" : (index % 3 === 1 ? "ERKEK" : "KADIN"),
        productMainGroup: cls === "BOT" ? "BOT" : "AYAKKABI",
        category: category,
        class: cls,
        stockGroup: cls === "AYAKKABI" ? "SNEAKER" : (cls === "BOT" ? "SNEAKER HI" : (cls === "TERLIK" ? "TERLIK" : "SANDALET")),
        stockGroupDetail: cls === "AYAKKABI" ? "SNEAKER" : (cls === "BOT" ? "SNEAKER HI" : "TERLIK DUZ"),
        upperMaterial: material,
        pairQuantity: 3000 + (Math.floor(Math.random() * 7) * 500),
        t1Date: `${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}.${(Math.floor(Math.random() * 6) + 6).toString().padStart(2, '0')}.2026`,
        floPsf: Math.floor(Math.random() * 3000) + 500,
        currency: "₺",
        assignedSupplierName: index % 5 === 0 ? "Modern Ayakkabı A.Ş." : undefined,
        productStatus: productStatus,
        previousGeneric: previousGeneric
    };
});
