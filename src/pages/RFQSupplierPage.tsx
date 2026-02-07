
import { useState, useEffect } from 'react';
import { RFQService } from '../services/rfqService';
import type { RFQItem, RFQSupplierStatus } from '../types/rfq';
import { TopNav } from '@/components/layout/TopNav';
import { Button } from "@/components/ui/button";
import { X, Send, Clock, Package, Calendar, ChevronRight, History } from 'lucide-react';
import { toast } from 'sonner';

export default function RFQSupplierPage() {
    const [rfqs, setRfqs] = useState<RFQItem[]>([]);
    const [selectedRFQ, setSelectedRFQ] = useState<RFQItem | null>(null);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    // Offer Form States
    const [bidPrice, setBidPrice] = useState('');
    const [deliveryNote, setDeliveryNote] = useState('');

    useEffect(() => {
        fetchRFQs();
    }, []);

    const fetchRFQs = () => {
        const allRFQs = RFQService.getRFQs();
        // For testing/POC: Flatten RFQs so each supplier assignment appears as a separate card
        const flattened = allRFQs.flatMap(rfq =>
            rfq.suppliers.map(s => ({
                ...rfq,
                targetSupplier: s
            }))
        );
        setRfqs(flattened as any);
    };

    const handleOpenOfferModal = (rfq: any) => {
        setSelectedRFQ(rfq);
        const myOffer = rfq.targetSupplier;
        setBidPrice(myOffer.bidPrice?.toString() || '');
        setDeliveryNote(myOffer.deliveryNote || '');
        setIsOfferModalOpen(true);
    };

    const handleSendOffer = () => {
        if (!selectedRFQ) return;

        const rfq = selectedRFQ as any;
        const supplierId = rfq.targetSupplier.supplierId;

        RFQService.updateSupplierOffer(rfq.id, supplierId, {
            bidPrice: Number(bidPrice),
            deliveryNote: deliveryNote
        });

        toast.success(`${rfq.targetSupplier.supplierName} adına teklif gönderildi.`);
        setIsOfferModalOpen(false);
        fetchRFQs();
    };

    const getMyStatus = (rfq: any) => {
        return rfq.targetSupplier.status;
    };

    const getStatusStyle = (status: RFQSupplierStatus['status']) => {
        switch (status) {
            case 'Offered': return 'bg-green-50 text-green-600 border-green-100';
            case 'RevisionRequested': return 'bg-orange-50 text-orange-600 border-orange-100 animate-pulse';
            default: return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <TopNav />
            <main className="container px-6 py-8 max-w-full">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tekliflerim / İhaleler</h1>
                        <p className="text-slate-500 font-medium">Gelen fiyat teklifi taleplerini yönetin</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rfqs.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                            <Clock size={48} className="mx-auto mb-4 text-slate-300" />
                            <h3 className="text-xl font-bold text-slate-400">Henüz bir talep gelmedi</h3>
                        </div>
                    ) : (
                        rfqs.map(rfq => {
                            const status = getMyStatus(rfq);
                            return (
                                <div key={rfq.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(status)}`}>
                                                {status === 'Offered' ? 'Teklif Verildi' : status === 'RevisionRequested' ? 'Revize Gerekli' : 'Yeni Talep'}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">#{rfq.satNo}</div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Tedarikçi</div>
                                            <div className="text-sm font-bold text-slate-700">{(rfq as any).targetSupplier.supplierName}</div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Marka / Jenerik</div>
                                            <div className="flex gap-2">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase">{rfq.brand}</span>
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase">{rfq.genericModel}</span>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{rfq.modelName}</h3>
                                        <p className="text-slate-400 text-xs font-bold uppercase mb-6 tracking-tight">{rfq.productType} • {rfq.category}</p>

                                        <div className="grid grid-cols-2 gap-3 mb-8">
                                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                                    <Package size={14} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Miktar</span>
                                                </div>
                                                <div className="text-sm font-black text-slate-700">{rfq.quantity.toLocaleString()} Çift</div>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                                    <Calendar size={14} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">T1 / T2</span>
                                                </div>
                                                <div className="text-sm font-black text-slate-700">{rfq.t1Date} / {rfq.t2Date}</div>
                                            </div>
                                            <div className="col-span-2 p-3 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                                                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                                                    <Clock size={14} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Teklif Geçerlilik Aralığı</span>
                                                </div>
                                                <div className="text-sm font-black text-indigo-600">{rfq.quoteStartDate} - {rfq.quoteEndDate}</div>
                                            </div>
                                        </div>

                                        <Button
                                            className={`w-full h-12 font-black rounded-2xl shadow-lg transition-all ${status === 'Offered'
                                                ? 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow-indigo-100'
                                                : status === 'RevisionRequested'
                                                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'
                                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                                                }`}
                                            onClick={() => handleOpenOfferModal(rfq)}
                                        >
                                            {status === 'Offered' ? 'Teklifi Güncelle' : status === 'RevisionRequested' ? 'Revize Gönder' : 'Teklif Gir'}
                                            <ChevronRight size={18} className="ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* Offer Modal */}
            {isOfferModalOpen && selectedRFQ && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsOfferModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 border-b border-slate-50">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Teklif Girişi</h2>
                                    <p className="text-slate-500 font-medium">{selectedRFQ.modelName} için fiyat belirleyin</p>
                                </div>
                                <button onClick={() => setIsOfferModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">BİRİM FİYAT (TL)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full h-16 pl-6 pr-12 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white focus:outline-none text-2xl font-black text-slate-800 transition-all"
                                            placeholder="0.00"
                                            value={bidPrice}
                                            onChange={(e) => setBidPrice(e.target.value)}
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">₺</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">TERMIN / NOT</label>
                                    <input
                                        type="text"
                                        className="w-full h-16 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white focus:outline-none font-bold text-slate-800 transition-all"
                                        placeholder="Örn: 45 Gün"
                                        value={deliveryNote}
                                        onChange={(e) => setDeliveryNote(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                <h4 className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-3">
                                    <History size={16} /> Talep Detayları
                                </h4>
                                <div className="grid grid-cols-2 gap-y-2 text-xs font-medium text-slate-500">
                                    <span>İstenen Miktar:</span>
                                    <span className="text-slate-700 font-bold text-right">{selectedRFQ?.quantity.toLocaleString()} Çift</span>
                                    <span>Teklif Aralığı:</span>
                                    <span className="text-slate-700 font-bold text-right">{(selectedRFQ as any)?.quoteStartDate} - {(selectedRFQ as any)?.quoteEndDate}</span>
                                    <span className="pt-2">Notlar:</span>
                                    <span className="pt-2 text-slate-700 font-bold text-right italic">{selectedRFQ?.notes || '-'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-slate-50/50 flex gap-4">
                            <Button
                                variant="ghost"
                                className="flex-1 h-14 font-black text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-2xl transition-all"
                                onClick={() => setIsOfferModalOpen(false)}
                            >
                                Vazgeç
                            </Button>
                            <Button
                                className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                                onClick={handleSendOffer}
                            >
                                <Send size={20} /> Teklifi Gönder
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
