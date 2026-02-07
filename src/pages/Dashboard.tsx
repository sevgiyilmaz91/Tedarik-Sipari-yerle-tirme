import { useState, useEffect } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { KpiCard } from "@/components/kpi/KpiCard";
import { DataTable } from "@/components/tables/DataTable";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { PieChartCard } from "@/components/charts/PieChartCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { kpiMockData, dailyStatsData, supplierSamplesData } from "@/lib/mockData";

export default function Dashboard() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#F9F7FD] pb-10"> {/* Adjusted to a very light lavender background */}
            <TopNav />

            <main className="container px-4 py-6 max-w-full space-y-6">
                {/* Filter Section */}
                <div className="flex items-center -mt-2">
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[140px] bg-white border-purple-100 h-10 rounded-lg text-sm font-bold text-[#4B3B8B] shadow-sm">
                            <SelectValue placeholder="Tümü" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-purple-50 shadow-lg">
                            <SelectItem value="all" className="font-semibold text-[#4B3B8B]">Tümü</SelectItem>
                            <SelectItem value="active" className="font-semibold text-[#4B3B8B]">Aktif</SelectItem>
                            <SelectItem value="completed" className="font-semibold text-[#4B3B8B]">Tamamlanan</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {loading
                        ? Array.from({ length: 7 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-xl bg-purple-100/30" />
                        ))
                        : kpiMockData.map((kpi) => (
                            <KpiCard
                                key={kpi.id}
                                title={kpi.title}
                                value={kpi.value}
                                description={kpi.description}
                                iconName={kpi.icon as any}
                            />
                        ))
                    }
                </div>

                {/* Tables Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {loading ? (
                        <>
                            <Skeleton className="h-[400px] w-full rounded-xl bg-purple-100/30" />
                            <Skeleton className="h-[400px] w-full rounded-xl bg-purple-100/30" />
                        </>
                    ) : (
                        <>
                            <DataTable
                                title="Günlük Sayılar"
                                columns={[
                                    { key: "date", label: "Tarih" },
                                    { key: "amount", label: "Miktar" },
                                ]}
                                data={dailyStatsData}
                            />
                            <DataTable
                                title="Tedarikçi - Numune Adet (En fazla 20)"
                                columns={[
                                    { key: "name", label: "İsim" },
                                    { key: "amount", label: "Miktar" },
                                ]}
                                data={supplierSamplesData}
                            />
                        </>
                    )}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {loading ? (
                        <>
                            <Skeleton className="h-[350px] w-full rounded-xl bg-purple-100/30" />
                            <Skeleton className="h-[350px] w-full rounded-xl bg-purple-100/30" />
                        </>
                    ) : (
                        <>
                            <LineChartCard title="Günlük Sayılar" data={dailyStatsData} />
                            <PieChartCard title="Tedarikçi - Numune Adet (En fazla 20)" data={supplierSamplesData} />
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
