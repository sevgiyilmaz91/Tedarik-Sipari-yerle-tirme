import React from "react";
import type { StoreGeneralRow } from "@/types/storeGeneralControl";
import StoreGeneralRowDetails from "./StoreGeneralRowDetails";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  rows: StoreGeneralRow[];
  expandedRowId: string | null;
  onExpandRow: (rowId: string | null) => void;
  loading?: boolean;
}

const StoreGeneralTable: React.FC<Props> = ({ rows, expandedRowId, onExpandRow, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-center text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-center text-gray-500">Kayıt bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700 text-left w-8" />
              <th className="px-4 py-3 font-semibold text-gray-700 text-left">Generic / Barkod</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-left">Model Adı</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-left">Marka</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-left">Ürün Grubu</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-right">Toplam Sipariş</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-center">Hatalar</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-center">Mağaza Sayısı</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <React.Fragment key={row.id}>
                <tr
                  className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                  onClick={() => onExpandRow(expandedRowId === row.id ? null : row.id)}
                >
                  <td className="px-4 py-3 text-center">
                    {expandedRowId === row.id ? (
                      <ChevronUp size={18} className="text-blue-600" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{row.generic}</p>
                    <p className="text-xs text-gray-500">{row.barcode}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{row.modelName}</td>
                  <td className="px-4 py-3 text-gray-800">{row.brand}</td>
                  <td className="px-4 py-3 text-gray-800">{row.productGroup}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{row.totalOrderQty}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      {row.totalCritical > 0 && (
                        <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">
                          {row.totalCritical}K
                        </span>
                      )}
                      {row.totalMajor > 0 && (
                        <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700">
                          {row.totalMajor}M
                        </span>
                      )}
                      {row.totalMinor > 0 && (
                        <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-700">
                          {row.totalMinor}Mn
                        </span>
                      )}
                      {row.totalCritical === 0 && row.totalMajor === 0 && row.totalMinor === 0 && (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-blue-600">{row.storeCount}</td>
                </tr>

                {/* Detay Panel */}
                {expandedRowId === row.id && (
                  <tr className="bg-blue-50 border-b border-gray-200">
                    <td colSpan={8} className="px-4 py-4">
                      <StoreGeneralRowDetails row={row} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreGeneralTable;
