
import { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, Star } from 'lucide-react';
import { SupplierService } from '../services/supplierService';
import type { SupplierCapacityItem } from '../types/supplier';
import type { OrderPlacementItem } from '../types/orderPlacement';
import { RFQService } from '../services/rfqService';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface RFQSupplierDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    satItem: OrderPlacementItem;
    onSuccess?: () => void;
}

export default function RFQSupplierDrawer({ isOpen, onClose, satItem, onSuccess }: RFQSupplierDrawerProps) {
    const [suppliers, setSuppliers] = useState<SupplierCapacityItem[]>([]);
    const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    // Template Modal States
    const [quoteStartDate, setQuoteStartDate] = useState(satItem.t1Date);
    const [quoteEndDate, setQuoteEndDate] = useState(satItem.t1Date);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchSuppliers();
        }
    }, [isOpen, satItem]);

    const fetchSuppliers = async () => {
        setLoading(true);
        const data = await SupplierService.getSuitableSuppliers(satItem);
        setSuppliers(data);
        setLoading(false);
    };

    const toggleSupplier = (id: string) => {
        setSelectedSupplierIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleSendRFQ = () => {
        const selectedSuppliers = suppliers
            .filter(s => selectedSupplierIds.includes(s.id))
            .map(s => ({
                supplierId: s.id,
                supplierName: s.supplierName,
                status: 'Pending' as const
            }));

        RFQService.createRFQ({
            satId: satItem.id,
            satNo: satItem.purchaseRequest,
            genericModel: satItem.genericModel,
            modelName: satItem.modelName,
            brand: satItem.brandName,
            productType: satItem.productDescription,
            category: satItem.category,
            quantity: satItem.pairQuantity,
            t1Date: satItem.t1Date,
            t2Date: satItem.t1Date, // Mocking T2 as same or slightly later
            quoteStartDate: quoteStartDate,
            quoteEndDate: quoteEndDate,
            deadlineDate: quoteEndDate, // For now, use end date as deadline
            notes: notes,
            suppliers: selectedSuppliers
        });

        toast.success('Fiyat teklifi talebi başarıyla gönderildi.');
        onSuccess?.();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-[450px] bg-white shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Uygun Tedarikçiler</h2>
                        <p className="text-sm text-slate-500">RFQ için tedarikçi seçiniz</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <span className="text-indigo-600 font-medium whitespace-nowrap">SAT No:</span>
                            <span className="text-indigo-900 font-bold ml-1">{satItem.purchaseRequest}</span>
                            <span className="text-indigo-600 font-medium whitespace-nowrap">Model:</span>
                            <span className="text-indigo-900 font-bold ml-1">{satItem.modelName}</span>
                            <span className="text-indigo-600 font-medium whitespace-nowrap">Miktar:</span>
                            <span className="text-indigo-900 font-bold ml-1">{satItem.pairQuantity} Çift</span>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Tedarikçi Listesi</h3>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-slate-500 font-medium">Tedarikçiler yükleniyor...</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {suppliers.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => toggleSupplier(s.id)}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedSupplierIds.includes(s.id)
                                        ? 'border-indigo-600 bg-indigo-50/50'
                                        : 'border-slate-100 hover:border-slate-200 bg-white'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${selectedSupplierIds.includes(s.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                                        }`}>
                                        {selectedSupplierIds.includes(s.id) && <CheckCircle2 size={16} className="text-white" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="font-bold text-slate-700">{s.supplierName}</div>
                                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                                <span className="text-[11px] font-black text-amber-700">{s.rating || 9.5}/10</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold border border-indigo-100 uppercase tracking-tighter">
                                                {s.productMainGroup}
                                            </span>
                                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200 uppercase tracking-tighter">
                                                {s.productionType}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium ml-auto self-center">Mesafe: 120km</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <Button
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
                        disabled={selectedSupplierIds.length === 0}
                        onClick={() => setIsTemplateModalOpen(true)}
                    >
                        <Send size={18} className="mr-2" />
                        Fiyat Teklifi Al ({selectedSupplierIds.length})
                    </Button>
                </div>
            </div>

            {/* RFQ Template Modal */}
            {isTemplateModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsTemplateModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100">
                            <h2 className="text-2xl font-black text-slate-800">RFQ Şablonu</h2>
                            <p className="text-slate-500">Tedarikçilere gidecek detayları belirleyin</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SAT No</label>
                                    <div className="font-bold text-slate-700">{satItem.purchaseRequest}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Model / Marka</label>
                                    <div className="font-bold text-slate-700">{satItem.modelName} / {satItem.brandName}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">T1 / T2</label>
                                    <div className="font-bold text-slate-700">{satItem.t1Date} - {satItem.t1Date}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Miktar</label>
                                    <div className="font-bold text-slate-700">{satItem.pairQuantity} Çift</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700">Teklif İstenen Tarih Aralığı</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-indigo-600 uppercase tracking-widest z-10">Başlangıç</label>
                                        <input
                                            type="date"
                                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-indigo-600 focus:outline-none font-medium text-slate-600"
                                            value={quoteStartDate.split('.').reverse().join('-')}
                                            onChange={(e) => setQuoteStartDate(e.target.value.split('-').reverse().join('.'))}
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-indigo-600 uppercase tracking-widest z-10">Bitiş</label>
                                        <input
                                            type="date"
                                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-indigo-600 focus:outline-none font-medium text-slate-600"
                                            value={quoteEndDate.split('.').reverse().join('-')}
                                            onChange={(e) => setQuoteEndDate(e.target.value.split('-').reverse().join('.'))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700">Not (Opsiyonel)</label>
                                <textarea
                                    className="w-full min-h-[100px] p-4 rounded-xl border-2 border-slate-100 focus:border-indigo-600 focus:outline-none font-medium text-slate-600 resize-none"
                                    placeholder="Tedarikçilere iletmek istediğiniz notlar..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 flex gap-4">
                            <Button
                                variant="ghost"
                                className="flex-1 h-12 font-bold text-slate-500 hover:bg-slate-200"
                                onClick={() => setIsTemplateModalOpen(false)}
                            >
                                Vazgeç
                            </Button>
                            <Button
                                className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200"
                                onClick={handleSendRFQ}
                            >
                                Gönder
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
