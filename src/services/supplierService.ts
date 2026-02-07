import type { SupplierCapacityItem } from "../types/supplier";
import { mockSupplierCapacities } from "../data/mockSupplierCapacity";

export class SupplierService {
    static async getSupplierCapacities(): Promise<SupplierCapacityItem[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockSupplierCapacities;
    }

    static async getSuitableSuppliers(satItem: { productMainGroup: string; brandName: string; category: string; productDescription: string }): Promise<SupplierCapacityItem[]> {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Attempt strict filtering first
        let results = mockSupplierCapacities.filter(supplier => {
            const matchesMainGroup = supplier.productMainGroup === satItem.productMainGroup;
            const matchesBrand = supplier.brands.includes(satItem.brandName);
            const matchesCategory = supplier.categories.includes(satItem.category);
            const matchesProductionType = supplier.productionType === satItem.productDescription;

            return matchesMainGroup && matchesBrand && matchesCategory && matchesProductionType;
        });

        // Fallback: If no results, broaden search to Main Group and at least Brand OR Production Type
        if (results.length === 0) {
            results = mockSupplierCapacities.filter(supplier => {
                const matchesMainGroup = supplier.productMainGroup === satItem.productMainGroup;
                const matchesBrand = supplier.brands.includes(satItem.brandName);
                const matchesProductionType = supplier.productionType === satItem.productDescription;

                return matchesMainGroup && (matchesBrand || matchesProductionType);
            });
        }

        // Final Fallback: Just Main Group
        if (results.length === 0) {
            results = mockSupplierCapacities.filter(supplier =>
                supplier.productMainGroup === satItem.productMainGroup
            );
        }

        return results;
    }

    static async getUniqueValues(field: keyof SupplierCapacityItem): Promise<string[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        const values = new Set<string>();
        mockSupplierCapacities.forEach(item => {
            const val = item[field];
            if (Array.isArray(val)) val.forEach(v => values.add(String(v)));
            else if (val !== undefined && val !== null) values.add(String(val));
        });
        return Array.from(values).filter(Boolean).sort();
    }
}
