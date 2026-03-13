import React, { useState, useMemo } from "react";
import type { StoreQualityRecord } from "../types/storeQuality";
import type { KpiData } from "../types/storeGeneralControl";
import { List, Filter, X, Search, Mail } from "lucide-react";

interface Props {
  items: StoreQualityRecord[];
  onRowDoubleClick?: (record: StoreQualityRecord) => void;
  loading?: boolean;
  kpiData?: KpiData | null;
}

const StoreQualityTable: React.FC<Props> = ({ items, onRowDoubleClick, loading, kpiData }) => {
  const [viewMode, setViewMode] = useState<"grid" | "card">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    generic: "",
    brand: "",
    storeName: "",
    defectSummary: "",
  });

  // Unique values for filter dropdowns
  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(items.map((item) => item.status))];
    return statuses.sort();
  }, [items]);

  const uniqueGenerics = useMemo(() => {
    const generics = [...new Set(items.map((item) => item.generic))];
    return generics.sort();
  }, [items]);

  const uniqueBrands = useMemo(() => {
    const brands = [...new Set(items.map((item) => item.brand))];
    return brands.sort();
  }, [items]);

  const uniqueStores = useMemo(() => {
    const stores = [...new Set(items.map((item) => item.storeName))];
    return stores.sort();
  }, [items]);

  const uniqueDefects = useMemo(() => {
    const defects = [...new Set(items.map((item) => item.defectSummary).filter(Boolean))];
    return defects.sort();
  }, [items]);

  // Filter items based on active filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.status && item.status !== filters.status) return false;
      if (filters.generic && !item.generic.toLowerCase().includes(filters.generic.toLowerCase())) return false;
      if (filters.brand && !item.brand.toLowerCase().includes(filters.brand.toLowerCase())) return false;
      if (filters.storeName && !item.storeName.toLowerCase().includes(filters.storeName.toLowerCase())) return false;
      if (filters.defectSummary && item.defectSummary !== filters.defectSummary) return false;
      return true;
    });
  }, [items, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: "",
      generic: "",
      brand: "",
      storeName: "",
      defectSummary: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TAMAMLANDI":
        return { bg: "bg-green-100", text: "text-green-700", label: "Tamamlandı" };
      case "IADE_SURECI_BASLATILDI":
        return { bg: "bg-red-100", text: "text-red-700", label: "İade Süreci Başlatıldı" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", label: "Bekliyor" };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Kayıt bulunamadı.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with View Mode Toggle and Filter Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              showFilters ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title="Filtreleri göster/gizle"
          >
            <Filter size={20} />
            <span>Filtreler</span>
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-3 py-2 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 transition"
              title="Filtreleri temizle"
            >
              <X size={18} />
              <span className="text-sm">Temizle</span>
            </button>
          )}
          <span className="text-sm text-gray-600 ml-2">
            {filteredItems.length} / {items.length} kayıt
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded transition ${
              viewMode === "grid" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title="Grid görünümü"
          >
            <Search size={20} />
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`p-2 rounded transition ${
              viewMode === "card" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title="Kart görünümü"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4 border border-purple-200">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">DURUM</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tümü</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {getStatusColor(status).label}
                  </option>
                ))}
              </select>
            </div>

            {/* Generic Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">GENERIC</label>
              <select
                value={filters.generic}
                onChange={(e) => handleFilterChange("generic", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tümü</option>
                {uniqueGenerics.map((generic) => (
                  <option key={generic} value={generic}>
                    {generic}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">MARKA</label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange("brand", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tümü</option>
                {uniqueBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Store Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">MAĞAZA</label>
              <select
                value={filters.storeName}
                onChange={(e) => handleFilterChange("storeName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tümü</option>
                {uniqueStores.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </div>

            {/* Defect Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">HATA TANIMI</label>
              <select
                value={filters.defectSummary}
                onChange={(e) => handleFilterChange("defectSummary", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tümü</option>
                {uniqueDefects.map((defect) => (
                  <option key={defect} value={defect}>
                    {defect}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-300">
                <th className="px-2 py-2 w-8 text-center"></th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-left text-xs whitespace-nowrap">GENERIC</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-left text-xs whitespace-nowrap">ASORTI KODU</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-left text-xs whitespace-nowrap">MARKA</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-left text-xs whitespace-nowrap">ÜRÜN GRUBU</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-left text-xs whitespace-nowrap">MODEL ADI</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-left text-xs whitespace-nowrap">RENK</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-left text-xs whitespace-nowrap">ÜRETİCİ</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-right text-xs whitespace-nowrap">SİPARİŞ ADEDİ</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-right text-xs whitespace-nowrap">KONTROL EDILEN ADET</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-left text-xs whitespace-nowrap">MENŞEI</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-left text-xs whitespace-nowrap">KONTROLTARİHİ</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-left text-xs whitespace-nowrap">MAĞAZA</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-left text-xs whitespace-nowrap">KK İNSPECTÖR</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-left text-xs whitespace-nowrap">İNSPECTÖR</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-left text-xs whitespace-nowrap">HATA TANIMI</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-center text-xs whitespace-nowrap">KRİTİK</th>
                {kpiData && (
                  <th className="px-3 py-2 font-semibold text-gray-700 text-center text-xs whitespace-nowrap">KRİTİK %</th>
                )}
                <th className="px-3 py-2 font-semibold text-gray-700 text-center text-xs whitespace-nowrap">MAJÖR</th>
                {kpiData && (
                  <th className="px-3 py-2 font-semibold text-gray-700 text-center text-xs whitespace-nowrap">MAJÖR %</th>
                )}
                <th className="px-3 py-2 font-semibold text-gray-700 text-center text-xs whitespace-nowrap">MINÖR</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-left text-xs whitespace-nowrap">HATA AÇIKLAMA</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-center text-xs whitespace-nowrap sticky right-0 bg-gradient-to-r from-gray-100 to-gray-50 border-l-2 border-gray-300">STATÜ</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((record, index) => {
                return (
                  <>
                    {/* Ana Satır */}
                    <tr
                      key={record.id}
                      className={`border-b hover:bg-blue-50 cursor-pointer transition text-xs ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                      onDoubleClick={() => onRowDoubleClick?.(record)}
                      title="AQL Girmek için çift tıklayın"
                    >
                      <td className="px-2 py-2 text-center text-purple-600">
                        <Mail size={16} />
                      </td>
                      <td className="px-3 py-2 text-gray-800">{record.generic}</td>
                      <td className="px-3 py-2 text-gray-800">{record.asortiCode}</td>
                      <td className="px-3 py-2 text-gray-800">{record.brand}</td>
                      <td className="px-3 py-2 text-gray-800">{record.productGroup}</td>
                      <td className="px-3 py-2 text-gray-800">{record.modelName}</td>
                      <td className="px-3 py-2 text-gray-800">{record.color}</td>
                      <td className="px-3 py-2 text-gray-800">{record.manufacturer}</td>
                      <td className="px-3 py-2 text-right text-gray-800 font-semibold">{record.orderQty}</td>
                      <td className="px-3 py-2 text-right text-gray-800 font-semibold">
                        {record.inspectedQty ? (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
                            {record.inspectedQty}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-800">{record.origin || "-"}</td>
                      <td className="px-3 py-2 text-gray-800">{record.controlDate || "-"}</td>
                      <td className="px-3 py-2 text-gray-800">{record.storeName}</td>
                      <td className="px-3 py-2 text-gray-800">{record.supplierQcInspector || "-"}</td>
                      <td className="px-3 py-2 text-gray-800">{record.inspectorName || "-"}</td>
                      <td className="px-3 py-2 text-gray-800">{record.defectSummary || "-"}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${record.totalCritical > 0 ? "bg-red-100 text-red-700" : "text-gray-600"}`}>
                          {record.totalCritical}
                        </span>
                      </td>
                      {kpiData && (
                        <td className="px-3 py-2 text-center">
                          <span className="text-sm font-semibold text-red-600">
                            {kpiData.totalInspected > 0 ? ((record.totalCritical / kpiData.totalInspected) * 100).toFixed(1) : "0.0"}%
                          </span>
                        </td>
                      )}
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${record.totalMajor > 0 ? "bg-orange-100 text-orange-700" : "text-gray-600"}`}>
                          {record.totalMajor}
                        </span>
                      </td>
                      {kpiData && (
                        <td className="px-3 py-2 text-center">
                          <span className="text-sm font-semibold text-orange-600">
                            {kpiData.totalInspected > 0 ? ((record.totalMajor / kpiData.totalInspected) * 100).toFixed(1) : "0.0"}%
                          </span>
                        </td>
                      )}
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${record.totalMinor > 0 ? "bg-yellow-100 text-yellow-700" : "text-gray-600"}`}>
                          {record.totalMinor}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <p className="text-gray-700 max-w-xs">
                          {record.aqlForm?.generalNote ? (
                            <span>{record.aqlForm.generalNote}</span>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </p>
                      </td>
                      <td className="px-3 py-2 text-center sticky right-0 bg-white border-l-2 border-gray-200">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(record.status).bg} ${getStatusColor(record.status).text}`}>
                          {getStatusColor(record.status).label}
                        </span>
                      </td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Filtre kriterlerine uygun kayıt bulunamadı.</p>
            </div>
          )}
        </div>
      )}

      {/* Card View */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredItems.map((record) => {
            const statusColor = getStatusColor(record.status);
            return (
              <div
                key={record.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border border-gray-200"
                onDoubleClick={() => onRowDoubleClick?.(record)}
                title="AQL Girmek için çift tıklayın"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-t-lg">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{record.generic}</h3>
                      <p className="text-xs text-blue-100 truncate">{record.asortiCode}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${statusColor.bg} ${statusColor.text}`}>
                      {statusColor.label.split(" ")[0]}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  {/* Row 1: Marka ve Model */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">MARKA</p>
                      <p className="text-xs text-gray-800 truncate">{record.brand}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">MODEL</p>
                      <p className="text-xs text-gray-800 truncate">{record.modelName}</p>
                    </div>
                  </div>

                  {/* Row 2: Ürün Grubu ve Renk */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">ÜRÜN</p>
                      <p className="text-xs text-gray-800 truncate">{record.productGroup}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">RENK</p>
                      <p className="text-xs text-gray-800 truncate">{record.color || "-"}</p>
                    </div>
                  </div>

                  {/* Row 3: Üretici ve Menşei */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">ÜRETİCİ</p>
                      <p className="text-xs text-gray-800 truncate">{record.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">MENŞEI</p>
                      <p className="text-xs text-gray-800 truncate">{record.origin || "-"}</p>
                    </div>
                  </div>

                  {/* Row 4: Mağaza */}
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">MAĞAZA</p>
                    <p className="text-xs text-gray-800 truncate">{record.storeName}</p>
                  </div>

                  {/* Row 5: Sipariş Adedi */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">SİPARİŞ</p>
                      <p className="text-xs text-gray-800">{record.orderQty}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">TARİH</p>
                      <p className="text-xs text-gray-800">{record.controlDate || "-"}</p>
                    </div>
                  </div>

                  {/* Row 6: Inspectorlar */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">KK İNSP.</p>
                      <p className="text-xs text-gray-800 truncate">{record.supplierQcInspector || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">İNSP.</p>
                      <p className="text-xs text-gray-800 truncate">{record.inspectorName || "-"}</p>
                    </div>
                  </div>

                  {/* Row 7: Hata Tanımı */}
                  {record.defectSummary && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">HATA</p>
                      <p className="text-xs text-gray-800 truncate">{record.defectSummary}</p>
                    </div>
                  )}

                  {/* Row 8: Defect Counts */}
                  <div className="pt-2 border-t border-gray-200 grid grid-cols-3 gap-1">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-semibold">KRİTİK</p>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${record.totalCritical > 0 ? "bg-red-100 text-red-700" : "text-gray-600"}`}>
                        {record.totalCritical}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-semibold">MAJÖR</p>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${record.totalMajor > 0 ? "bg-orange-100 text-orange-700" : "text-gray-600"}`}>
                        {record.totalMajor}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-semibold">MINÖR</p>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${record.totalMinor > 0 ? "bg-yellow-100 text-yellow-700" : "text-gray-600"}`}>
                        {record.totalMinor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p>Filtre kriterlerine uygun kayıt bulunamadı.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreQualityTable;
