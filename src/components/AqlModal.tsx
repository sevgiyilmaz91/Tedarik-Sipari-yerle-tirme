import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { StoreQualityRecord, AqlFormState } from "../types/storeQuality";
import { storeQualityService } from "../services/storeQuality";

interface Props {
  record: StoreQualityRecord;
  onClose: () => void;
  onSave: (updatedRecord: StoreQualityRecord) => void;
}

const AqlModal: React.FC<Props> = ({ record, onClose, onSave }) => {
  const [aqlForm, setAqlForm] = useState<AqlFormState>(() => {
    if (record.aqlForm) return { ...record.aqlForm };
    return storeQualityService.getDefaultAqlForm();
  });

  const [inspectedQty, setInspectedQty] = useState(aqlForm.inspectedQty || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set()); // Açık kategoriler

  const toggleCategory = (catId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(catId)) {
      newExpanded.delete(catId);
    } else {
      newExpanded.add(catId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleItemChange = (catId: string, itemId: string, field: "critical" | "major" | "minor", value: number) => {
    setAqlForm((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => {
        if (cat.id === catId) {
          return {
            ...cat,
            items: cat.items.map((item) => {
              if (item.id === itemId) {
                return { ...item, [field]: Math.max(0, value) };
              }
              return item;
            }),
          };
        }
        return cat;
      }),
    }));
  };

  const handleGeneralNoteChange = (value: string) => {
    setAqlForm((prev) => ({ ...prev, generalNote: value }));
  };

  const handleSave = async () => {
    setError("");

    // Validation
    if (!inspectedQty || Number(inspectedQty) < 1) {
      setError("Kontrol edilen adet 1'den küçük olamaz ve zorunludur!");
      return;
    }

    const qty = Number(inspectedQty);
    if (qty > record.orderQty) {
      const warned = window.confirm(
        `Kontrol edilen adet (${qty}) sipariş adedinden (${record.orderQty}) büyük. Devam etmek istiyor musunuz?`
      );
      if (!warned) return;
    }

    setSaving(true);
    try {
      const formToSave: AqlFormState = {
        ...aqlForm,
        inspectedQty: qty,
      };

      const updated = await storeQualityService.saveAql(record.id, formToSave);
      onSave(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || "Kaydetme başarısız");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="bg-white rounded-lg w-11/12 max-w-5xl max-h-[90vh] overflow-y-auto z-10 shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Görsel Kontrol ve Ölçü Kontrolü</h2>
            <p className="text-sm text-gray-600 mt-1">AQL: {record.barcode}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => alert("Excel indir (dummy)")} className="px-3 py-2 text-sm border rounded hover:bg-gray-50">
              Excel İndir
            </button>
            <button onClick={onClose} className="px-3 py-2 text-sm border rounded hover:bg-gray-50">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Ürün Bilgileri */}
          <div className="bg-blue-50 rounded p-4 text-sm">
            <p>
              <strong>Generic:</strong> {record.generic} | <strong>Model:</strong> {record.modelName} | <strong>Mağaza:</strong> {record.storeName}
            </p>
          </div>

          {/* Kategoriler - Accordion Style */}
          {aqlForm.categories.map((category) => (
            <div key={category.id} className="border rounded overflow-hidden">
              {/* Başlık - Tıklanabilir */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition font-semibold text-gray-800"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${expandedCategories.has(category.id) ? "rotate-180" : ""}`}
                  />
                  <span>{category.name}</span>
                </div>
                <div className="text-sm text-gray-600 font-normal">
                  {category.items.reduce((sum, item) => sum + item.critical + item.major + item.minor, 0)} Hata
                </div>
              </button>

              {/* Detaylar - Açılıp Kapanabilir */}
              {expandedCategories.has(category.id) && (
                <div className="p-4 space-y-3 bg-white border-t">
                  {category.items.map((item) => (
                    <div key={item.id} className="border rounded p-3 bg-gray-50">
                      <p className="font-medium text-sm mb-2">{item.title}</p>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div>
                          <label className="text-xs block mb-1">Kritik</label>
                          <input
                            type="number"
                            min="0"
                            value={item.critical}
                            onChange={(e) =>
                              handleItemChange(category.id, item.id, "critical", parseInt(e.target.value) || 0)
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs block mb-1">Majör</label>
                          <input
                            type="number"
                            min="0"
                            value={item.major}
                            onChange={(e) =>
                              handleItemChange(category.id, item.id, "major", parseInt(e.target.value) || 0)
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs block mb-1">Minör</label>
                          <input
                            type="number"
                            min="0"
                            value={item.minor}
                            onChange={(e) =>
                              handleItemChange(category.id, item.id, "minor", parseInt(e.target.value) || 0)
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      </div>
                      {item.note && <p className="text-xs text-gray-600">{item.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Genel Açıklama */}
          <div className="border rounded p-4">
            <label className="block text-sm font-medium mb-2">Genel Açıklama</label>
            <textarea
              value={aqlForm.generalNote}
              onChange={(e) => handleGeneralNoteChange(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              rows={4}
              placeholder="Tespit edilen sorunları açıklayınız..."
            />
          </div>

          {/* Mağazada kontrol edilen ürün adedi */}
          <div className="border rounded p-4 bg-yellow-50">
            <label className="block text-sm font-medium mb-2">
              Mağazada Kontrol Edilen Ürün Adedi <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={inspectedQty}
              onChange={(e) => setInspectedQty(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Lütfen adet giriniz"
            />
            <p className="text-xs text-gray-600 mt-1">Sipariş Adedi: {record.orderQty}</p>
          </div>

          {/* Error Message */}
          {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400 hover:bg-green-700"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AqlModal;
