import React from "react";
import type { InspectionRequest } from "../store/useInspectionStore";

interface Props {
  items: InspectionRequest[];
  onRowDoubleClick?: (id: string) => void;
}

const RequestsTable: React.FC<Props> = ({ items, onRowDoubleClick }) => {
  return (
    <div className="bg-white rounded shadow">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-3">Üretim A...</th>
            <th className="p-3">Tedarikçi Adı</th>
            <th className="p-3">Alt Tedarikçiler</th>
            <th className="p-3">Generic</th>
            <th className="p-3">İşlem Tarihi</th>
            <th className="p-3">Statü</th>
            <th className="p-3">Inspector</th>
            <th className="p-3">Adet</th>
            <th className="p-3">Açıklama</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr
              key={it.id}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onDoubleClick={() => onRowDoubleClick?.(it.id)}
              title="Detay için çift tıklayın"
            >
              <td className="p-3">{it.modelAdi}</td>
              <td className="p-3">{it.ureticiAdi}</td>
              <td className="p-3">{it.kontrolTuru === "MAGAZA" ? (it.magazalar || []).join(", ") : it.altTedarikci || "—"}</td>
              <td className="p-3">{it.generic}</td>
              <td className="p-3">{it.islemTarihi || it.kontrolTarihi}</td>
              <td className="p-3">{it.statu}</td>
              <td className="p-3">{it.inspector || "-"}</td>
              <td className="p-3">{it.siparisAdedi ?? it.kaliteKontrolPartiAdedi ?? "-"}</td>
              <td className="p-3">{it.aciklama}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestsTable;
