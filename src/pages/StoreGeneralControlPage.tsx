import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/layout/TopNav";
import StoreGeneralFilters from "@/components/StoreGeneralFilters";
import KpiCards from "@/components/KpiCards";
import StoreGeneralTable from "@/components/StoreGeneralTable";
import StoreGeneralRowDetails from "@/components/StoreGeneralRowDetails";
import type { StoreGeneralRow, KpiData } from "@/types/storeGeneralControl";
import { storeGeneralControlService } from "@/services/storeGeneralControl";

const StoreGeneralControlPage: React.FC = () => {
  const [rows, setRows] = useState<StoreGeneralRow[]>([]);
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Default: Son 15 gün
  const today = new Date();
  const fifteenDaysAgo = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);
  const defaultDateFrom = fifteenDaysAgo.toISOString().split("T")[0];
  const defaultDateTo = today.toISOString().split("T")[0];

  // İlk yükleme
  useEffect(() => {
    performSearch(defaultDateFrom, defaultDateTo, "generic", "");
  }, []);

  const performSearch = async (dateFrom: string, dateTo: string, filterType: string, searchQuery: string) => {
    setLoading(true);
    setExpandedRowId(null);
    try {
      // Filtre tipine göre query hazırla
      let query = searchQuery;
      if (filterType === "store" && searchQuery) {
        query = `store:${searchQuery}`;
      } else if (filterType === "inspector" && searchQuery) {
        query = `inspector:${searchQuery}`;
      }

      const data = await storeGeneralControlService.fetchStoreGeneralList({
        dateFrom,
        dateTo,
        searchQuery: query,
      });
      setRows(data);

      // KPI hesapla
      const kpis = await storeGeneralControlService.calculateKpis(data);
      setKpiData(kpis);
    } catch (error) {
      console.error("Search error:", error);
      setRows([]);
      setKpiData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopNav />
      <div className="p-6 space-y-6">
        {/* Başlık */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mağaza Genel Kontrol</h1>
          <p className="text-sm text-gray-600 mt-2">Kalite trendleri ve mağaza bazlı kontrol analizleri.</p>
        </div>

        {/* Filtre Barı */}
        <StoreGeneralFilters
          onFilter={performSearch}
          loading={loading}
        />

        {/* KPI Kartları */}
        <KpiCards kpiData={kpiData} loading={loading} />

        {/* Ana Tablo */}
        <StoreGeneralTable
          rows={rows}
          expandedRowId={expandedRowId}
          onExpandRow={setExpandedRowId}
          loading={loading}
        />

        {/* Detay Panel (açık ise) */}
        {expandedRowId && rows.find((r) => r.id === expandedRowId) && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <StoreGeneralRowDetails row={rows.find((r) => r.id === expandedRowId)!} />
          </div>
        )}
      </div>
    </>
  );
};

export default StoreGeneralControlPage;
