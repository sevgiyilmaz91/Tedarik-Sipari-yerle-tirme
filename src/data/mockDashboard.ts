import { KpiData, DailyStat, SupplierStat } from "../types/dashboard";

export const kpiMockData: KpiData[] = [
    {
        id: "total-samples",
        title: "Toplam Gelen Numune Adet",
        value: "3,805",
        description: "Tekil olarak 2263",
        icon: "LayoutList",
    },
    {
        id: "success-samples",
        title: "Numune Başarılı Adet",
        value: "1,867",
        description: "Testleri başarı ile sonuçlanan",
        icon: "CheckCircle2",
    },
    {
        id: "failed-samples",
        title: "Numune Başarısız Adet",
        value: "230",
        description: "Toplam başarısız işlem 1658",
        icon: "XCircle",
    },
    {
        id: "ongoing-samples",
        title: "Numune Devam Eden Adet",
        value: "166",
        description: "İşlemleri devam eden",
        icon: "Clock",
    },
    {
        id: "test-duration",
        title: "Numune Test Süresi",
        value: "45.23 Hour(s)",
        description: "Ortalama | Min: 1.00h - Max: 552.00h",
        icon: "Activity",
    },
    {
        id: "qc-count",
        title: "Kalite Kontrol Adedi",
        value: "2,321",
        description: "Başarılı: 2032 | Başarısız: 287",
        icon: "ClipboardCheck",
    },
    {
        id: "qc-success-products",
        title: "Başarılı Kalite Kontrol Ürün Adedi",
        value: "2,219,458",
        description: "Başarısız: 157,744 - Hold: 110,700 adet ürün",
        icon: "ShieldCheck",
    },
];

export const dailyStatsData: DailyStat[] = [
    { date: "18.09.2025", incoming: 120, completed: 8, amount: 8 },
    { date: "16.12.2025", incoming: 150, completed: 78, amount: 78 },
    { date: "22.12.2025", incoming: 130, completed: 75, amount: 75 },
    { date: "06.11.2025", incoming: 90, completed: 34, amount: 34 },
    { date: "10.01.2026", incoming: 110, completed: 45, amount: 45 },
    { date: "15.01.2026", incoming: 140, completed: 60, amount: 60 },
];

export const supplierSamplesData: SupplierStat[] = [
    { name: "Urfa Fabrika", amount: 380, color: "#2563eb" },
    { name: "3Gen Taban ve Ayakkabı Yan. (Ayakkabı)", amount: 167, color: "#f59e0b" },
    { name: "Enova Ayak. Ter. Deri ve Aks. İth. İhr.", amount: 111, color: "#ef4444" },
    { name: "El-Di Poliüretan San. Tic. Ltd. Şti.", amount: 99, color: "#10b981" },
    { name: "MY Free life Ayakkabı San. Tic. Ltd. Şti.", amount: 85, color: "#8b5cf6" },
];
