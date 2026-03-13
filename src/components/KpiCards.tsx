import React from "react";
import type { KpiData } from "@/types/storeGeneralControl";

interface Props {
  kpiData: KpiData | null;
  loading?: boolean;
}

const KpiCards: React.FC<Props> = ({ kpiData, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-200 rounded-lg p-4 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!kpiData) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Toplam Kontrol */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase">Toplam Kontrol</p>
        <p className="text-3xl font-bold text-blue-600 mt-2">{kpiData.totalInspected}</p>
        <p className="text-xs text-gray-500 mt-2">incelenen ürün</p>
      </div>

      {/* Kritik Hata */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase">Kritik Hata</p>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-3xl font-bold text-red-600">{kpiData.criticalErrorCount}</p>
          <p className="text-sm font-semibold text-red-600">(%{kpiData.criticalErrorRate.toFixed(1)})</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">kontrol edilen ürünün</p>
      </div>

      {/* Majör Hata */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase">Majör Hata</p>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-3xl font-bold text-orange-600">{kpiData.majorErrorCount}</p>
          <p className="text-sm font-semibold text-orange-600">(%{kpiData.majorErrorRate.toFixed(1)})</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">kontrol edilen ürünün</p>
      </div>

      {/* Başarı Yüzdesi */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase">Başarı Yüzdesi</p>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-3xl font-bold text-green-600">{kpiData.successRate.toFixed(2)}</p>
          <p className="text-lg text-gray-500">%</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">geçti kontrolleri</p>
      </div>
    </div>
  );
};

export default KpiCards;
