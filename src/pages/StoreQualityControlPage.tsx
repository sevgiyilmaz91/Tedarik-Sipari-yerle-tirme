import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/layout/TopNav";
import StoreSelect from "@/components/StoreSelect";
import BarcodeSearch from "@/components/BarcodeSearch";
import StoreQualityTable from "@/components/StoreQualityTable";
import AqlModal from "@/components/AqlModal";
import type { StoreQualityRecord } from "@/types/storeQuality";
import type { KpiData } from "@/types/storeGeneralControl";
import { storeQualityService } from "@/services/storeQuality";

const StoreQualityControlPage: React.FC = () => {
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null); // Başta boş
  const [records, setRecords] = useState<StoreQualityRecord[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StoreQualityRecord | undefined>();
  const [showAqlModal, setShowAqlModal] = useState(false);
  const [showStoreWarning, setShowStoreWarning] = useState(false); // Popup uyarı göstermek için
  const [kpiData, setKpiData] = useState<KpiData | null>(null);

  // Mağaza seçilince otomatik olarak boş arama yap ve KPI hesapla
  useEffect(() => {
    if (selectedStoreId) {
      const performSearch = async () => {
        setSearchLoading(true);
        try {
          const results = await storeQualityService.searchByBarcode(selectedStoreId, "");
          setRecords(results);

          // KPI hesapla - Kontrol edilen adet ve hataları toplayarak
          const totalInspected = results.reduce((sum, r) => sum + (r.inspectedQty || r.orderQty || 0), 0);
          const totalCritical = results.reduce((sum, r) => sum + (r.totalCritical || 0), 0);
          const totalMajor = results.reduce((sum, r) => sum + (r.totalMajor || 0), 0);
          const totalMinor = results.reduce((sum, r) => sum + (r.totalMinor || 0), 0);

          const criticalErrorRate = totalInspected > 0 ? (totalCritical / totalInspected) * 100 : 0;
          const majorErrorRate = totalInspected > 0 ? (totalMajor / totalInspected) * 100 : 0;
          const minorErrorRate = totalInspected > 0 ? (totalMinor / totalInspected) * 100 : 0;

          const kpis: KpiData = {
            totalInspected,
            majorErrorCount: totalMajor,
            majorErrorRate: Math.round(majorErrorRate * 100) / 100,
            criticalErrorCount: totalCritical,
            criticalErrorRate: Math.round(criticalErrorRate * 100) / 100,
            minorErrorRate: Math.round(minorErrorRate * 100) / 100,
            successRate: 0,
          };
          setKpiData(kpis);
        } catch (error) {
          console.error("Store selection search error:", error);
          setKpiData(null);
        } finally {
          setSearchLoading(false);
        }
      };
      performSearch();
    } else {
      setRecords([]);
      setKpiData(null);
    }
  }, [selectedStoreId]);

  const handleStoreChange = (storeId: string) => {
    setSelectedStoreId(storeId);
    setShowStoreWarning(false); // Uyarıyı kapat
  };

  const handleBarcodeSearch = async (barcode: string) => {
    // Mağaza seçilmemişse popup uyarı göster
    if (!selectedStoreId) {
      setShowStoreWarning(true);
      return;
    }

    if (!barcode.trim()) return; // Boş barkod ignore et

    setSearchLoading(true);
    try {
      const results = await storeQualityService.searchByBarcode(selectedStoreId, barcode);
      if (results.length === 0) {
        alert("Bu barkoda ait kayıt bulunamadı.");
      }
      setRecords(results);

      // KPI hesapla - Kontrol edilen adet ve hataları toplayarak
      const totalInspected = results.reduce((sum, r) => sum + (r.inspectedQty || r.orderQty || 0), 0);
      const totalCritical = results.reduce((sum, r) => sum + (r.totalCritical || 0), 0);
      const totalMajor = results.reduce((sum, r) => sum + (r.totalMajor || 0), 0);
      const totalMinor = results.reduce((sum, r) => sum + (r.totalMinor || 0), 0);

      const criticalErrorRate = totalInspected > 0 ? (totalCritical / totalInspected) * 100 : 0;
      const majorErrorRate = totalInspected > 0 ? (totalMajor / totalInspected) * 100 : 0;
      const minorErrorRate = totalInspected > 0 ? (totalMinor / totalInspected) * 100 : 0;

      const kpis: KpiData = {
        totalInspected,
        majorErrorCount: totalMajor,
        majorErrorRate: Math.round(majorErrorRate * 100) / 100,
        criticalErrorCount: totalCritical,
        criticalErrorRate: Math.round(criticalErrorRate * 100) / 100,
        minorErrorRate: Math.round(minorErrorRate * 100) / 100,
        successRate: 0,
      };
      setKpiData(kpis);
    } catch (error: any) {
      alert("Arama sırasında hata oluştu: " + error.message);
      setKpiData(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRowDoubleClick = (record: StoreQualityRecord) => {
    if (record.status === "TAMAMLANDI") {
      alert("Bu kayıt zaten tamamlanmıştır.");
      return;
    }
    setSelectedRecord(record);
    setShowAqlModal(true);
  };

  const handleAqlSave = (updatedRecord: StoreQualityRecord) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
    setShowAqlModal(false);
    setSelectedRecord(undefined);
  };

  return (
    <>
      <TopNav />
      <div className="p-6 space-y-6">
        {/* Page Title + Store Select (sağ üste) */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mağaza Kalite Kontrol</h1>
            <p className="text-sm text-gray-600 mt-2">
              Adımlar: Barkod okut → Kaydı bul → Satıra çift tıkla → AQL gir → Kaydet
            </p>
          </div>
          <div className="flex-shrink-0">
            <StoreSelect selectedStoreId={selectedStoreId || ""} onStoreChange={handleStoreChange} />
          </div>
        </div>

        {/* Controls - Barkod arama */}
        <div className="bg-gradient-to-r from-yellow-200 via-amber-100 to-yellow-200 rounded-lg p-8 space-y-4 shadow-lg border border-yellow-300">
          <h2 className="text-center text-2xl font-bold text-gray-800">Barkod ile Ara</h2>
          <p className="text-center text-sm text-gray-700 mb-4">Barkod okutarak ya da numarayla numune ara</p>

          <div className="flex justify-center items-center gap-3">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <BarcodeSearch disabled={!selectedStoreId} onSearch={handleBarcodeSearch} loading={searchLoading} />
            <button
              onClick={() => handleBarcodeSearch("")}
              className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold rounded transition"
              title="Ara"
              disabled={!selectedStoreId}
            >
              ARA
            </button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-3">
            💡 Örnek barkod: <strong>8697643210001</strong> veya <strong>8697643210002</strong>
          </p>
        </div>

        {/* Popup Uyarı - Mağaza Seçilmedi */}
        {showStoreWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm animate-bounce">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Mağaza Seçiniz!</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Barkod okutmadan önce lütfen <strong>sağ üstten bir mağaza seçiniz</strong>.
              </p>
              <button
                onClick={() => setShowStoreWarning(false)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition"
              >
                Tamam
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <StoreQualityTable items={records} onRowDoubleClick={handleRowDoubleClick} loading={searchLoading} kpiData={kpiData} />

        {/* AQL Modal */}
        {showAqlModal && selectedRecord && (
          <AqlModal
            record={selectedRecord}
            onClose={() => {
              setShowAqlModal(false);
              setSelectedRecord(undefined);
            }}
            onSave={handleAqlSave}
          />
        )}
      </div>
    </>
  );
};

export default StoreQualityControlPage;
