import React, { useState, useMemo } from "react";
import type { StoreGeneralRow, InspectorBreakdown } from "@/types/storeGeneralControl";

interface Props {
  row: StoreGeneralRow;
}

const StoreGeneralRowDetails: React.FC<Props> = ({ row }) => {
  const [viewMode, setViewMode] = useState<"store" | "inspector">("store");

  // Inspectör bazlı kırılım
  const inspectorBreakdown = useMemo((): InspectorBreakdown[] => {
    const map = new Map<string, InspectorBreakdown>();
    row.details.forEach((detail) => {
      const existing = map.get(detail.inspectorName);
      if (!existing) {
        map.set(detail.inspectorName, {
          inspectorName: detail.inspectorName,
          controlCount: 1,
          totalCritical: detail.totalCritical,
          totalMajor: detail.totalMajor,
          totalMinor: detail.totalMinor,
          successRate: detail.result === "GECTI" ? 100 : 0,
          lastControlDate: detail.controlDateISO,
        });
      } else {
        existing.controlCount++;
        existing.totalCritical += detail.totalCritical;
        existing.totalMajor += detail.totalMajor;
        existing.totalMinor += detail.totalMinor;
        existing.successRate = existing.successRate > 0 && detail.result === "GECTI" ? existing.successRate : detail.result === "GECTI" ? 100 : 0;
        if (new Date(detail.controlDateISO) > new Date(existing.lastControlDate)) {
          existing.lastControlDate = detail.controlDateISO;
        }
      }
    });
    const results = Array.from(map.values());
    // successRate düzeltme: geçen kontrol sayısı
    results.forEach((r) => {
      const passedCount = row.details.filter(
        (d) => d.inspectorName === r.inspectorName && d.result === "GECTI"
      ).length;
      r.successRate = r.controlCount > 0 ? (passedCount / r.controlCount) * 100 : 0;
    });
    return results;
  }, [row.details]);

  return (
    <div className="space-y-4">
      {/* Görünüm Seçici */}
      <div className="flex gap-4 border-b border-gray-200 pb-3">
        <button
          onClick={() => {
            setViewMode("store");
          }}
          className={`px-4 py-2 rounded transition ${
            viewMode === "store"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Mağaza Bazlı
        </button>
        <button
          onClick={() => {
            setViewMode("inspector");
          }}
          className={`px-4 py-2 rounded transition ${
            viewMode === "inspector"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Inspectör Bazlı
        </button>
      </div>

      {/* Detaylı Kayıtlar - Full Width */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">
          {viewMode === "store" ? "Mağaza Kayıtları" : "Inspectör Kırılımı"}
        </h3>

        {/* Mağaza Bazlı Görünüm */}
        {viewMode === "store" && (
          <div className="space-y-2 overflow-y-auto max-h-96">
            {row.details.map((detail) => (
              <div key={detail.id} className="bg-white p-3 rounded border border-gray-200 text-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{detail.storeName}</p>
                    <p className="text-xs text-gray-500">{detail.locationText}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      detail.result === "GECTI"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {detail.result === "GECTI" ? "GEÇTİ" : "KALDI"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                  <p>
                    <span className="font-semibold">Tarih:</span> {new Date(detail.controlDateISO).toLocaleDateString("tr-TR")}
                  </p>
                  <p>
                    <span className="font-semibold">İncelenmiş:</span> {detail.inspectedQty}
                  </p>
                </div>
                <div className="flex gap-1">
                  {detail.totalCritical > 0 && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                      {detail.totalCritical}K
                    </span>
                  )}
                  {detail.totalMajor > 0 && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700">
                      {detail.totalMajor}M
                    </span>
                  )}
                  {detail.totalMinor > 0 && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-700">
                      {detail.totalMinor}Mn
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="font-semibold">Gözlemci:</span> {detail.inspectorName}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Inspectör Bazlı Görünüm */}
        {viewMode === "inspector" && (
          <div className="space-y-2 overflow-y-auto max-h-96">
            {inspectorBreakdown.map((inspector) => (
              <div key={inspector.inspectorName} className="bg-white p-3 rounded border border-gray-200 text-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{inspector.inspectorName}</p>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {inspector.controlCount} kontrol
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                  <p>
                    <span className="font-semibold">Başarı:</span> {inspector.successRate.toFixed(0)}%
                  </p>
                  <p>
                    <span className="font-semibold">Son Kontrol:</span>{" "}
                    {new Date(inspector.lastControlDate).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div className="flex gap-1">
                  {inspector.totalCritical > 0 && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                      {inspector.totalCritical}K
                    </span>
                  )}
                  {inspector.totalMajor > 0 && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700">
                      {inspector.totalMajor}M
                    </span>
                  )}
                  {inspector.totalMinor > 0 && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-700">
                      {inspector.totalMinor}Mn
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreGeneralRowDetails;
