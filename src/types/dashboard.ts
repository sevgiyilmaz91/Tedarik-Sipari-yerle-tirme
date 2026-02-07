export interface KpiData {
    id: string;
    title: string;
    value: string | number;
    description: string;
    icon: string;
}

export interface DailyStat {
    date: string;
    incoming: number;
    completed: number;
    amount: number;
}

export interface SupplierStat {
    name: string;
    amount: number;
    color: string;
}
