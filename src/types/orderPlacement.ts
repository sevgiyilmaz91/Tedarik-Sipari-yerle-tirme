
export interface OrderPlacementItem {
    id: string;
    purchaseRequest: string;
    genericModel: string;
    modelName: string;
    productDescription: string;
    gender: string;
    brandGroup: string;
    brandName: string;
    productGroup: string;
    productMainGroup: string;
    category: string;
    class: string;
    stockGroup: string;
    stockGroupDetail: string;
    upperMaterial: string;
    pairQuantity: number;
    t1Date: string;
    floPsf: number;
    currency: string;
    assignedSupplierName?: string;
    productStatus: 'New' | 'Carryover';
    previousGeneric?: string;
}

export type SearchCriteria = 'genericModel' | 'modelName' | 'category' | 'class' | 'productDescription';

export interface OrderFilter {
    criteria: SearchCriteria;
    value: string;
}
