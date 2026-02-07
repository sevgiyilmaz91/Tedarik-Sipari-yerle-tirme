
import type { OrderPlacementItem, OrderFilter } from "../types/orderPlacement";
import { mockOrders } from "../data/mockOrderPlacement";
import { DistributionService } from "./distributionService";

export class OrderPlacementService {
    static async getOrders(filter?: OrderFilter): Promise<OrderPlacementItem[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const distributions = DistributionService.getRecords();
        const mergedOrders = mockOrders.map(order => {
            const dist = distributions.find(d => String(d.satId) === String(order.id));
            if (dist) {
                return { ...order, assignedSupplierName: dist.supplierName };
            }
            return order;
        });

        if (!filter || !filter.value) {
            return mergedOrders;
        }

        const searchTerm = filter.value.toLowerCase();
        return mergedOrders.filter(order => {
            const field = order[filter.criteria as keyof OrderPlacementItem];
            return field?.toString().toLowerCase().includes(searchTerm);
        });
    }

    static async getUniqueValues(field: keyof OrderPlacementItem): Promise<string[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        const values = mockOrders.map(order => order[field]?.toString() || "");
        return Array.from(new Set(values)).filter(Boolean).sort();
    }
}
