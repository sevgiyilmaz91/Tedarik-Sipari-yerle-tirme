
import { useState, useEffect } from 'react';
import { X, Clock, CheckCircle2, RefreshCw, ChevronRight } from 'lucide-react';
import { RFQService } from '../services/rfqService';
import type { RFQItem } from '../types/rfq';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface RFQReviewDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    satId: string;
    onContinue: (supplierId?: string) => void;
}

export default function RFQReviewDrawer({ isOpen, onClose, satId, onContinue }: RFQReviewDrawerProps) {
    const [rfqs, setRfqs] = useState<RFQItem[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchRFQs();
        }
    }, [isOpen, satId]);

    const fetchRFQs = () => {
        const data = RFQService.getRFQsBySatId(satId);
        setRfqs(data);
    };

    const handleRequestRevision = (rfqId: string, supplierId: string) => {
        RFQService.requestRevision(rfqId, supplierId);
        toast.info('Revize talebi tedarikçiye iletildi.');
        fetchRFQs();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150]">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="absolute right-0 top-0 h-full w-[600px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">Teklifleri İncele</h2>
                        <p className="text-slate-500 font-medium">Satınalma Talebi #{rfqs[0]?.satNo || '-'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {rfqs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-40 text-center">
                            <Clock size={64} className="mb-4" />
                            <h3 className="text-xl font-bold">Teklif Bulunamadı</h3>
                            <p className="max-w-xs">Bu SAT için henüz bir RFQ süreci başlatılmamış.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {rfqs[0].suppliers.map((s, idx) => (
                                <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                    <div className="p-5 flex items-center justify-between bg-slate-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                {s.supplierName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700">{s.supplierName}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {s.status === 'Offered' ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                            <CheckCircle2 size={10} /> Teklif Geldi
                                                        </span>
                                                    ) : s.status === 'RevisionRequested' ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                            <RefreshCw size={10} /> Revize İstendi
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                            <Clock size={10} /> Bekleniyor
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {s.status === 'Offered' && (
                                            <div className="text-right">
                                                <div className="text-lg font-black text-indigo-600">₺{s.bidPrice?.toLocaleString()}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BİRİM FİYAT</div>
                                            </div>
                                        )}
                                    </div>

                                    {s.status === 'Offered' && (
                                        <div className="p-5 border-t border-slate-50 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 bg-slate-50 rounded-xl">
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Termin Notu</span>
                                                    <span className="text-sm font-medium text-slate-600">{s.deliveryNote || '-'}</span>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl">
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Teklif Tarihi</span>
                                                    <span className="text-sm font-medium text-slate-600">
                                                        {s.offerDate ? new Date(s.offerDate).toLocaleDateString('tr-TR') : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 h-10 border-orange-200 text-orange-600 hover:bg-orange-50 font-bold text-xs"
                                                    onClick={() => handleRequestRevision(rfqs[0].id, s.supplierId)}
                                                >
                                                    <RefreshCw size={14} className="mr-2" /> Revize İste
                                                </Button>
                                                <Button
                                                    className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                                                    onClick={() => onContinue(s.supplierId)}
                                                >
                                                    Kabul Et & İlerle <ChevronRight size={14} className="ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                    <Button
                        className="w-full h-12 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-slate-200"
                        onClick={() => onContinue()}
                    >
                        Yerleştirme Adımına Geç
                    </Button>
                </div>
            </div>
        </div>
    );
}
