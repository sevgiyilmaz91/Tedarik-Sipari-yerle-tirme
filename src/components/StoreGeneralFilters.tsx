import React, { useState, useEffect } from "react";
import { Search, Download } from "lucide-react";
import { storeGeneralControlService } from "@/services/storeGeneralControl";

interface Props {
  onFilter: (dateFrom: string, dateTo: string, filterType: string, query: string) => void;
  loading?: boolean;
}

interface Store {
  id: string;
  name: string;
  location: string;
}

const StoreGeneralFilters: React.FC<Props> = ({ onFilter, loading }) => {
  const today = new Date();
  const fifteenDaysAgo = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);

  const [dateFrom, setDateFrom] = useState(fifteenDaysAgo.toISOString().split("T")[0]);
  const [dateTo, setDateTo] = useState(today.toISOString().split("T")[0]);
  const [filterType, setFilterType] = useState<"generic" | "store" | "inspector">("generic");
  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);

  // Mağaza listesini yükle
  useEffect(() => {
    const loadStores = async () => {
      setLoadingStores(true);
      try {
        const storeList = await storeGeneralControlService.getStoreList();
        setStores(storeList);
      } catch (error) {
        console.error("Failed to load stores:", error);
      } finally {
        setLoadingStores(false);
      }
    };
    loadStores();
  }, []);

  const handleSearch = () => {
    onFilter(dateFrom, dateTo, filterType, searchQuery);
  };

  const handleStoreSelect = (storeName: string) => {
    setSearchQuery(storeName);
    // Otomatik olarak arama yap
    onFilter(dateFrom, dateTo, filterType, storeName);
  };

  const getPlaceholder = () => {
    switch (filterType) {
      case "store":
        return "Mağaza seçin...";
      case "inspector":
        return "Inspectör adı...";
      case "generic":
      default:
        return "Generic / Barkod / Model / Asorti";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Row 1: Date inputs + Filter Type + Search + Buttons */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Tarih Aralığı */}
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">BAŞLANGIÇ TARİHİ</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">BİTİŞ TARİHİ</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Type Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">ARAMA TİPİ</label>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as "generic" | "store" | "inspector");
              setSearchQuery("");
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="generic">Generic / Barkod</option>
            <option value="store">Mağaza</option>
            <option value="inspector">Inspectör</option>
          </select>
        </div>

        {/* Hızlı Arama - Mağaza Seçili ise Dropdown, Yoksa Input */}
        <div className="flex-1 min-w-xs">
          <label className="block text-xs font-semibold text-gray-700 mb-1">HIZLI ARAMA</label>
          <div className="flex gap-2">
            {filterType === "store" ? (
              // Mağaza Dropdown
              <div className="flex-1 relative">
                <select
                  value={searchQuery}
                  onChange={(e) => handleStoreSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer bg-white"
                  disabled={loadingStores}
                >
                  <option value="">{loadingStores ? "Yükleniyor..." : "Mağaza seçin..."}</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.name}>
                      {store.name} ({store.location})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            ) : (
              // Text Input (Generic / Inspector)
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {/* Sorgula Button (Mağaza değilse veya input boş değilse göster) */}
            {filterType !== "store" && (
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition disabled:bg-gray-400 flex items-center gap-2"
              >
                <Search size={18} />
                {loading ? "Sorgulanıyor..." : "Ara"}
              </button>
            )}
          </div>
        </div>

        {/* Rapor İndir Button */}
        <button
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition flex items-center gap-2"
          title="Rapor İndir (Dummy)"
        >
          <Download size={18} />
          <span>Rapor İndir</span>
        </button>
      </div>
    </div>
  );
};

export default StoreGeneralFilters;
