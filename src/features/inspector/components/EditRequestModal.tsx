import React, { useEffect, useState } from "react";
import { useInspectionStore } from "../store/useInspectionStore";

interface Props {
  id: string;
  onClose?: () => void;
}

const EditRequestModal: React.FC<Props> = ({ id, onClose }) => {
  const { getById, inspectors, updateRequest } = useInspectionStore();

  const req = getById(id);

  const [kontrolTarihi, setKontrolTarihi] = useState(req?.kontrolTarihi ?? "");
  const [kontrolSaati, setKontrolSaati] = useState(req?.kontrolSaati ?? "");
  const [inspector, setInspector] = useState(req?.inspector ?? "");
  const [kaliteAdet, setKaliteAdet] = useState<number | undefined>(req?.kaliteKontrolPartiAdedi);
  const [aciklama, setAciklama] = useState(req?.aciklama ?? "");

  useEffect(() => {
    if (!req) {
      // nothing
    }
  }, [req]);

  if (!req) return null;

  const onSubmit = () => {
    const patch: any = {
      kontrolTarihi,
      kontrolSaati,
      inspector: inspector || undefined,
      kaliteKontrolPartiAdedi: kaliteAdet,
      aciklama,
    };
    if (inspector) patch.statu = "Atandı";
    updateRequest(req.id, patch);
    alert("Güncellendi");
    onClose?.();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="bg-white rounded-lg w-3/4 max-w-3xl p-6 z-10 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Inspection Talebi Güncelle</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Sezon</label>
            <input value={req.sezon} readOnly className="w-full px-3 py-2 rounded border bg-gray-50" />

            <label className="block text-sm mt-3">Alt Tedarikçiler</label>
            <input value={req.altTedarikci ?? "-"} readOnly className="w-full px-3 py-2 rounded border bg-gray-50" />

            <label className="block text-sm mt-3">Kontrol Tarihi</label>
            <input type="date" value={kontrolTarihi} onChange={(e) => setKontrolTarihi(e.target.value)} className="w-full px-3 py-2 rounded border" />

            <label className="block text-sm mt-3">Inspectör Seçiniz</label>
            <select value={inspector} onChange={(e) => setInspector(e.target.value)} className="w-full px-3 py-2 rounded border">
              <option value="">Seçiniz</option>
              {inspectors.map((ins) => (
                <option key={ins} value={ins}>{ins}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">Üretici</label>
            <input value={req.ureticiAdi ?? "-"} readOnly className="w-full px-3 py-2 rounded border bg-gray-50" />

            <label className="block text-sm mt-3">Kalite Kontrol Parti Adedi</label>
            <input type="number" value={kaliteAdet ?? ""} onChange={(e) => setKaliteAdet(e.target.value ? Number(e.target.value) : undefined)} className="w-full px-3 py-2 rounded border" />

            <label className="block text-sm mt-3">Kontrol Saati</label>
            <input type="time" value={kontrolSaati} onChange={(e) => setKontrolSaati(e.target.value)} className="w-full px-3 py-2 rounded border" />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm">Açıklama</label>
          <textarea value={aciklama} onChange={(e) => setAciklama(e.target.value)} className="w-full px-3 py-2 rounded border" />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Vazgeç</button>
          <button onClick={onSubmit} className="px-4 py-2 rounded bg-purple-600 text-white">Güncelle</button>
        </div>
      </div>
    </div>
  );
};

export default EditRequestModal;
