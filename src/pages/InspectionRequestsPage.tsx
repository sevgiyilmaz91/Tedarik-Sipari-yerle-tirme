import React, { useMemo, useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { useInspectionStore } from "../features/inspector/store/useInspectionStore";
import InspectionFiltersBar from "../features/inspector/components/FiltersBar";
import InspectionRequestsTable from "../features/inspector/components/RequestsTable";
import CreateRequestModal from "../features/inspector/components/CreateRequestModal";
import EditRequestModal from "../features/inspector/components/EditRequestModal";

const InspectionRequestsPage: React.FC = () => {
  const { requests } = useInspectionStore();
  const [filters, setFilters] = useState<{ productGroup?: string; start?: string; end?: string; supplier?: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);

  const filtered = useMemo(() => {
    if (!filters) return requests;
    return requests.filter((r) => {
      if (filters.supplier && filters.supplier !== "" && r.ureticiAdi !== filters.supplier) return false;
      if (filters.start && r.kontrolTarihi < filters.start) return false;
      if (filters.end && r.kontrolTarihi > filters.end) return false;
      return true;
    });
  }, [requests, filters]);

  const onApply = (f: any) => {
    setFilters(f);
  };

  const onExport = () => {
    const rows = filtered.map((r) => ({
      id: r.id,
      model: r.modelAdi,
      supplier: r.ureticiAdi,
      generic: r.generic,
      islemTarihi: r.islemTarihi,
      inspector: r.inspector || "",
      statu: r.statu,
    }));
    const csv = [Object.keys(rows[0] || {}).join(","), ...rows.map((row) => Object.values(row).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inspection_requests.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRowDoubleClick = (id: string) => {
    setEditingId(id);
  };

  return (
    <>
      <TopNav />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Inspection Talepleri</h2>
        <InspectionFiltersBar onApply={(f) => onApply(f)} />

        <div className="mb-4 flex justify-between">
          <div />
          <div className="flex gap-2">
            <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded">Talep Oluştur</button>
            <button onClick={onExport} className="px-4 py-2 border rounded">Excel İndir</button>
          </div>
        </div>

        <InspectionRequestsTable items={filtered} onRowDoubleClick={handleRowDoubleClick} />

        {showCreateModal && <CreateRequestModal onClose={() => setShowCreateModal(false)} />}
        {editingId && <EditRequestModal id={editingId} onClose={() => setEditingId(undefined)} />}
      </div>
    </>
  );
};

export default InspectionRequestsPage;
