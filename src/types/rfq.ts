
export interface RFQItem {
    id: string;
    satId: string;
    satNo: string;
    genericModel: string;
    modelName: string;
    brand: string;
    productType: string;
    category: string;
    quantity: number;
    t1Date: string;
    t2Date: string;
    quoteStartDate: string;
    quoteEndDate: string;
    deadlineDate: string;
    notes?: string;
    suppliers: RFQSupplierStatus[];
    status: 'Draft' | 'Sent' | 'Completed';
    createdAt: string;
}

export interface RFQSupplierStatus {
    supplierId: string;
    supplierName: string;
    status: 'Pending' | 'Offered' | 'RevisionRequested';
    bidPrice?: number;
    currency?: string;
    deliveryNote?: string;
    offerDate?: string;
}
