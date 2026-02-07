
import type { RFQItem, RFQSupplierStatus } from "../types/rfq";

const STORAGE_KEY = 'floxo_rfq_data';

export class RFQService {
    private static getStorageData(): RFQItem[] {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    private static saveStorageData(data: RFQItem[]) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    static getRFQs(): RFQItem[] {
        return this.getStorageData();
    }

    static getRFQsBySatId(satId: string): RFQItem[] {
        return this.getStorageData().filter(r => r.satId === satId);
    }

    static createRFQ(rfq: Omit<RFQItem, 'id' | 'createdAt' | 'status'>): RFQItem {
        const data = this.getStorageData();
        const newRFQ: RFQItem = {
            ...rfq,
            id: Math.random().toString(36).substr(2, 9),
            status: 'Sent',
            createdAt: new Date().toISOString()
        };
        data.push(newRFQ);
        this.saveStorageData(data);
        return newRFQ;
    }

    static updateSupplierOffer(rfqId: string, supplierId: string, offer: Partial<RFQSupplierStatus>) {
        const data = this.getStorageData();
        const rfqIndex = data.findIndex(r => r.id === rfqId);
        if (rfqIndex > -1) {
            const supplierIndex = data[rfqIndex].suppliers.findIndex(s => s.supplierId === supplierId);
            if (supplierIndex > -1) {
                data[rfqIndex].suppliers[supplierIndex] = {
                    ...data[rfqIndex].suppliers[supplierIndex],
                    ...offer,
                    status: 'Offered',
                    offerDate: new Date().toISOString()
                };
                this.saveStorageData(data);
            }
        }
    }

    static requestRevision(rfqId: string, supplierId: string) {
        const data = this.getStorageData();
        const rfqIndex = data.findIndex(r => r.id === rfqId);
        if (rfqIndex > -1) {
            const supplierIndex = data[rfqIndex].suppliers.findIndex(s => s.supplierId === supplierId);
            if (supplierIndex > -1) {
                data[rfqIndex].suppliers[supplierIndex].status = 'RevisionRequested';
                this.saveStorageData(data);
            }
        }
    }
}
