import React, { useEffect, useState } from "react";
import type { StoreOption } from "../types/storeQuality";
import { storeQualityService } from "../services/storeQuality";

interface Props {
  selectedStoreId?: string;
  onStoreChange: (storeId: string, storeName: string) => void;
}

const StoreSelect: React.FC<Props> = ({ selectedStoreId, onStoreChange }) => {
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    storeQualityService.getStores().then((data) => {
      setStores(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">Mağaza Seçiniz:</label>
      <select
        value={selectedStoreId || ""}
        onChange={(e) => {
          const store = stores.find((s) => s.id === e.target.value);
          if (store) onStoreChange(store.id, store.name);
        }}
        disabled={loading}
        className="px-3 py-2 border rounded bg-white text-sm"
      >
        <option value="">-- Lütfen Seçiniz --</option>
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name} ({store.code})
          </option>
        ))}
      </select>
    </div>
  );
};

export default StoreSelect;
