import React, { useMemo, useState } from "react";
import { useLocation, useMatch, useNavigate } from "react-router-dom";
import { useInspectionStore } from "../store/useInspectionStore";
import FiltersBar from "../components/FiltersBar";
import RequestsTable from "../components/RequestsTable";
import CreateRequestModal from "../components/CreateRequestModal";
import EditRequestModal from "../components/EditRequestModal";

const RequestsListPage: React.FC = () => {
  const { requests } = useInspectionStore();
  const [filters, setFilters] = useState<{ productGroup?: string; start?: string; end?: string; supplier?: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isNew = location.pathname.endsWith("/new");
  const matchId = useMatch("/inspector/requests/:id");
  const editId = matchId?.params.id;

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
    // If Excel İndir used, handle CSV generation when no navigation
    if (location.pathname.endsWith("/inspector/requests") || location.pathname.endsWith("/inspector/requests/")) {
      // nothing
    }
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

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Inspection Talepleri</h2>
      <FiltersBar onApply={(f) => onApply(f)} />

      <div className="mb-4 flex justify-between">
        <div />
        <div className="flex gap-2">
          <button onClick={() => navigate('/inspector/requests/new')} className="px-4 py-2 bg-purple-600 text-white rounded">Talep Oluştur</button>
          <button onClick={onExport} className="px-4 py-2 border rounded">Excel İndir</button>
        </div>
      </div>

      <RequestsTable items={filtered} />

      {isNew && <CreateRequestModal onClose={() => navigate('/inspector/requests')} />}
      {editId && <EditRequestModal onClose={() => navigate('/inspector/requests')} />}
    </div>
  );
};

export default RequestsListPage;
