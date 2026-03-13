import React, { useState } from "react";
import type { InspectionType } from "../store/useInspectionStore";
import { useInspectionStore } from "../store/useInspectionStore";

interface Props {
  onClose?: () => void;
}

const CreateRequestModal: React.FC<Props> = ({ onClose }) => {
  const { suppliers, subSuppliers, stores, createRequest } = useInspectionStore();

  const [sezon, setSezon] = useState("26SS");
  const [modelAdi, setModelAdi] = useState("");
  const [generic, setGeneric] = useState("");
  const [renk, setRenk] = useState("");
  const [kontrolTarihi, setKontrolTarihi] = useState("");
  const [kontrolSaati] = useState("");
  const [kontrolTuru, setKontrolTuru] = useState<InspectionType>("INLINE");
  const [siparisAdedi, setSiparisAdedi] = useState<number | undefined>(undefined);
  const [kaliteAdet, setKaliteAdet] = useState<number | undefined>(undefined);
  const [alt, setAlt] = useState("");
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [aciklama, setAciklama] = useState("");

  const onSubmit = () => {
    // validation
    if (!sezon || !generic || !kontrolTarihi || !kontrolTuru) {
      alert("Lütfen zorunlu alanları doldurun");
      return;
    }
    if ((kontrolTuru === "INLINE" || kontrolTuru === "KALITE") && !alt) {
      alert("Alt tedarikçi seçin");
      return;
    }
    if (kontrolTuru === "MAGAZA" && selectedStores.length === 0) {
      alert("En az bir mağaza seçin");
      return;
    }

    createRequest({
      sezon,
      modelAdi,
      generic,
      renk,
      kontrolTarihi,
      kontrolSaati: kontrolSaati || undefined,
      kontrolTuru,
      siparisAdedi,
      kaliteKontrolPartiAdedi: kaliteAdet,
      ureticiAdi: suppliers[0],
      altTedarikci: alt || undefined,
      magazalar: kontrolTuru === "MAGAZA" ? selectedStores : undefined,
      aciklama,
    });

    alert("Talep oluşturuldu");
    onClose?.();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="bg-white rounded-lg w-3/4 max-w-3xl p-6 z-10 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Inspection Talebi Oluştur</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Sezon</label>
            <input value={sezon} onChange={(e) => setSezon(e.target.value)} className="w-full px-3 py-2 rounded border" />

            <label className="block text-sm mt-3">Generic</label>
            <input value={generic} onChange={(e) => setGeneric(e.target.value)} className="w-full px-3 py-2 rounded border" />

            <label className="block text-sm mt-3">Kontrol Tarihi</label>
            <input type="date" value={kontrolTarihi} onChange={(e) => setKontrolTarihi(e.target.value)} className="w-full px-3 py-2 rounded border" />

            <label className="block text-sm mt-3">Kontrol Türü</label>
            <select value={kontrolTuru} onChange={(e) => setKontrolTuru(e.target.value as InspectionType)} className="w-full px-3 py-2 rounded border">
              <option value="INLINE">Inline</option>
              <option value="KALITE">Kalite</option>
              <option value="MAGAZA">Mağaza</option>
            </select>

            <label className="block text-sm mt-3">Kalite Kontrol Parti Adedi</label>
            <input type="number" value={kaliteAdet ?? ""} onChange={(e) => setKaliteAdet(e.target.value ? Number(e.target.value) : undefined)} className="w-full px-3 py-2 rounded border" />
          </div>

          <div>
            <label className="block text-sm">Model Adı</label>
            <input value={modelAdi} onChange={(e) => setModelAdi(e.target.value)} className="w-full px-3 py-2 rounded border" />

            <label className="block text-sm mt-3">Renk</label>
            <input value={renk} onChange={(e) => setRenk(e.target.value)} className="w-full px-3 py-2 rounded border" />

            <label className="block text-sm mt-3">Sipariş Adedi</label>
            <input type="number" value={siparisAdedi ?? ""} onChange={(e) => setSiparisAdedi(e.target.value ? Number(e.target.value) : undefined)} className="w-full px-3 py-2 rounded border" />

            <div className="mt-3">
              {kontrolTuru === "INLINE" || kontrolTuru === "KALITE" ? (
                <>
                  <label className="block text-sm">Alt Tedarikçi</label>
                  <select value={alt} onChange={(e) => setAlt(e.target.value)} className="w-full px-3 py-2 rounded border">
                    <option value="">Seçiniz</option>
                    {subSuppliers.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <label className="block text-sm">Mağazalar</label>
                  <div className="max-h-40 overflow-auto border rounded p-2">
                    {stores.map((st) => (
                      <label key={st} className="flex items-center gap-2">
                        <input type="checkbox" checked={selectedStores.includes(st)} onChange={(e) => {
                          if (e.target.checked) setSelectedStores(s => [...s, st]);
                          else setSelectedStores(s => s.filter(x => x !== st));
                        }} />
                        <span>{st}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm">Açıklama</label>
          <textarea value={aciklama} onChange={(e) => setAciklama(e.target.value)} className="w-full px-3 py-2 rounded border" />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Vazgeç</button>
          <button onClick={onSubmit} className="px-4 py-2 rounded bg-purple-600 text-white">Talep Oluştur</button>
        </div>
      </div>
    </div>
  );
};

export default CreateRequestModal;
