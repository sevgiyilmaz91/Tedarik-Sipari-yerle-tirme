import React, { useState } from "react";
import { useInspectionStore } from "../store/useInspectionStore";

interface Props {
  onApply: (filters: { productGroup?: string; start?: string; end?: string; supplier?: string }) => void;
}

const FiltersBar: React.FC<Props> = ({ onApply }) => {
  const { suppliers } = useInspectionStore();
  const [productGroup, setProductGroup] = useState<string>("Ayakkabı");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [supplier, setSupplier] = useState<string>("");

  const exportCsv = () => {
    onApply({ productGroup, start, end, supplier });
    // Let parent handle export via filtered data; here we emit apply only
  };

  return (
    <div className="bg-yellow-500 rounded p-4 mb-4 flex items-end gap-4">
      <div>
        <label className="block text-xs mb-1">Ürün Ana Grubu</label>
        <select value={productGroup} onChange={(e) => setProductGroup(e.target.value)} className="px-3 py-2 rounded">
          <option>Ayakkabı</option>
          <option>Tekstil</option>
        </select>
      </div>
      <div>
        <label className="block text-xs mb-1">Başlama Tarihi</label>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="px-3 py-2 rounded" />
      </div>
      <div>
        <label className="block text-xs mb-1">Bitiş Tarihi</label>
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="px-3 py-2 rounded" />
      </div>
      <div>
        <label className="block text-xs mb-1">Tedarikçi</label>
        <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className="px-3 py-2 rounded">
          <option value="">Tümü</option>
          {suppliers.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="ml-auto flex gap-2">
        <button onClick={() => onApply({ productGroup, start, end, supplier })} className="px-4 py-2 bg-purple-600 text-white rounded">
          ARA
        </button>
        <button onClick={exportCsv} className="px-4 py-2 bg-white rounded border">
          Excel İndir
        </button>
      </div>
    </div>
  );
};

export default FiltersBar;
