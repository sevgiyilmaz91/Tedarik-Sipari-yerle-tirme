import { useState, useEffect, useMemo, useRef } from 'react';
import { TopNav } from '@/components/layout/TopNav';
import { DistributionService } from '../services/distributionService';
import type { DistributionRecord } from '../services/distributionService';
import { Download, Search, Folder, ChevronDown, Check } from 'lucide-react';

import '../components/SuitableSuppliersView.css';
import './OrderPlacementPage.css';

const monthsTR = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

const seasons = ['25AW', '26SS', '25SS', '24FW'];
type DistributionSearchCriteria = 'supplierName' | 'brandName' | 'modelName';

const criteriaConfig: Record<DistributionSearchCriteria, { label: string }> = {
    supplierName: { label: 'Tedarikçi' },
    brandName: { label: 'Marka' },
    modelName: { label: 'Model' },
};

export default function DistributionListPage() {
    const [distributionRecords, setDistributionRecords] = useState<DistributionRecord[]>([]);
    const [selectedSeason, setSelectedSeason] = useState('25AW');
    const [searchCriteria, setSearchCriteria] = useState<DistributionSearchCriteria>('supplierName');
    const [panelSearchValue, setPanelSearchValue] = useState('');
    const [globalSearchValue, setGlobalSearchValue] = useState('');

    // Searchable Dropdown States
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownSearch, setDropdownSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setDistributionRecords(DistributionService.getRecords());
    }, []);

    // Handle outside clicks to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = () => {
        setGlobalSearchValue(panelSearchValue);
    };

    const uniqueSuppliers = useMemo(() => {
        const suppliers = distributionRecords.map(r => r.supplierName);
        return Array.from(new Set(suppliers)).sort();
    }, [distributionRecords]);

    const filteredSuppliers = useMemo(() => {
        return uniqueSuppliers.filter(s =>
            s.toLowerCase().includes(dropdownSearch.toLowerCase())
        );
    }, [uniqueSuppliers, dropdownSearch]);

    const displayMonths = useMemo(() => {
        const t1DateObj = new Date(2026, 6, 22);
        const startDate = new Date(t1DateObj);
        startDate.setDate(startDate.getDate() - 60);

        const startMonth = startDate.getMonth();
        const startYear = startDate.getFullYear();

        const result = [];
        for (let i = 0; i < 3; i++) {
            const m = (startMonth + i) % 12;
            const y = startYear + Math.floor((startMonth + i) / 12);
            result.push({ month: m, year: y });
        }
        return result;
    }, []);

    const filteredRecords = useMemo(() => {
        return distributionRecords.filter(record => {
            if (!globalSearchValue) return true;
            const val = record[searchCriteria]?.toString().toLowerCase() || '';
            return val.includes(globalSearchValue.toLowerCase());
        });
    }, [distributionRecords, globalSearchValue, searchCriteria]);

    return (
        <div className="min-h-screen bg-[#F9FBFF]">
            <TopNav />

            <main className="container px-6 py-4 max-w-full">
                <div className="breadcrumb">
                    <span className="breadcrumb-icon">🏠</span>
                    <span>Tedarikçi Sipariş Dağıtım Listesi</span>
                </div>

                <div className="mb-6">
                    <h1 className="page-title text-3xl font-bold text-slate-800">Tedarikçi Sipariş Dağıtım Listesi</h1>
                    <p className="page-subtitle text-slate-500 mt-2">Tedarikçilere atanan siparişlerin dağılımını buradan takip edebilirsiniz.</p>
                </div>

                {/* Filter Header Panel - Horizontal Layout */}
                <div className="search-panel" style={{ overflow: 'visible' }}>
                    <div className="search-field" style={{ flex: '0 0 200px' }}>
                        <label className="search-label" style={{ color: 'white' }}>Sezon</label>
                        <select
                            className="search-select"
                            value={selectedSeason}
                            onChange={(e) => setSelectedSeason(e.target.value)}
                        >
                            {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="search-field" style={{ flex: '0 0 200px' }}>
                        <label className="search-label" style={{ color: 'white' }}>Arama Kriteri</label>
                        <select
                            className="search-select"
                            value={searchCriteria}
                            onChange={(e) => {
                                setSearchCriteria(e.target.value as DistributionSearchCriteria);
                                setPanelSearchValue(''); // Reset search on criteria change
                            }}
                        >
                            {Object.entries(criteriaConfig).map(([key, cfg]) => (
                                <option key={key} value={key}>{cfg.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="search-field search-field-grow relative" ref={dropdownRef}>
                        <label className="search-label" style={{ color: 'white' }}>Arama Metni</label>

                        {searchCriteria === 'supplierName' ? (
                            <div className="relative">
                                <div
                                    className="search-input flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-white/30"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span className={panelSearchValue ? 'text-slate-900' : 'text-slate-400'}>
                                        {panelSearchValue || 'Tedarikçi seçin...'}
                                    </span>
                                    <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] max-h-[320px] flex flex-col overflow-hidden">
                                        <div className="p-3 border-b border-slate-100 bg-slate-50">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Tedarikçi ara..."
                                                    value={dropdownSearch}
                                                    onChange={(e) => setDropdownSearch(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        <div className="overflow-y-auto py-1">
                                            {filteredSuppliers.length > 0 ? (
                                                filteredSuppliers.map(s => (
                                                    <div
                                                        key={s}
                                                        className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between group"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPanelSearchValue(s);
                                                            setIsDropdownOpen(false);
                                                            // Trigger search immediately for better UX with dropdowns
                                                            setGlobalSearchValue(s);
                                                        }}
                                                    >
                                                        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">{s}</span>
                                                        {panelSearchValue === s && <Check size={14} className="text-blue-600" />}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-6 text-center text-slate-400 text-sm">
                                                    Eşleşen tedarikçi bulunamadı.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder={`${criteriaConfig[searchCriteria].label} giriniz...`}
                                    value={panelSearchValue}
                                    onChange={(e) => setPanelSearchValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                        )}
                    </div>
                    <button className="search-button" onClick={handleSearch}>
                        <Search size={20} />
                        Ara
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Folder size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Sas Arama</h3>
                                <p className="text-xs text-slate-500 font-medium">Manage your team members and their account permissions here.</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-2 bg-[#F0FDF4] text-[#16A34A] rounded-lg text-sm font-bold border border-[#DCFCE7] hover:bg-[#DCFCE7] transition-all shadow-sm">
                            <Download size={18} />
                            EXCEL'E AKTAR
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="text-left py-4 px-6 font-bold text-slate-400 uppercase tracking-widest text-[11px] border-b border-slate-100">Model Adı</th>
                                    <th className="text-left py-4 px-6 font-bold text-slate-400 uppercase tracking-widest text-[11px] border-b border-slate-100">Marka</th>
                                    <th className="text-left py-4 px-6 font-bold text-slate-400 uppercase tracking-widest text-[11px] border-b border-slate-100">Tedarikçi</th>
                                    <th className="text-left py-4 px-6 font-bold text-slate-400 uppercase tracking-widest text-[11px] border-b border-slate-100">Line</th>
                                    <th className="text-left py-4 px-6 font-bold text-slate-400 uppercase tracking-widest text-[11px] border-b border-slate-100">Miktar</th>
                                    <th className="text-left py-4 px-6 font-bold text-slate-400 uppercase tracking-widest text-[11px] border-b border-slate-100">Başlangıç</th>
                                    <th className="text-left py-4 px-6 font-bold text-slate-400 uppercase tracking-widest text-[11px] border-b border-slate-100">Bitiş</th>
                                    <th className="text-center py-4 px-6 font-bold text-slate-400 uppercase tracking-widest text-[11px] border-b border-slate-100">Süre</th>
                                    {displayMonths.map(m => (
                                        <th key={`${m.year}-${m.month}`} className="text-left py-4 px-6 font-bold text-slate-400 uppercase tracking-widest text-[11px] border-b border-slate-100">
                                            {monthsTR[m.month].toUpperCase()} {m.year}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map(record => (
                                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6 text-slate-900 font-bold border-b border-slate-50">{record.modelName}</td>
                                        <td className="py-4 px-6 text-slate-600 border-b border-slate-50">{record.brandName}</td>
                                        <td className="py-4 px-6 text-slate-800 font-medium border-b border-slate-50">{record.supplierName}</td>
                                        <td className="py-4 px-6 border-b border-slate-50">
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-purple-50 text-purple-700 text-[10px] font-bold uppercase">
                                                {record.line}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-900 font-black border-b border-slate-50">{record.quantity.toLocaleString()}</td>
                                        <td className="py-4 px-6 text-slate-500 border-b border-slate-50">{record.startDate}</td>
                                        <td className="py-4 px-6 text-slate-500 border-b border-slate-50">{record.endDate}</td>
                                        <td className="py-4 px-6 text-slate-500 border-b border-slate-50 text-center">{record.duration}</td>
                                        {displayMonths.map(m => {
                                            const key = `${m.year}-${m.month + 1}`;
                                            const val = record.monthlyBreakdown[key] || 0;
                                            return (
                                                <td key={`${m.year}-${m.month}`} className={`py-4 px-6 font-black border-b border-slate-50 ${val > 0 ? 'text-indigo-600' : 'text-slate-200'}`}>
                                                    {val > 0 ? val.toLocaleString() : '-'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                {filteredRecords.length === 0 && (
                                    <tr>
                                        <td colSpan={8 + displayMonths.length} className="py-20 text-center text-slate-400">
                                            <p>Sonuç bulunamadı.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredRecords.length > 0 && (
                        <div className="px-6 py-4 flex justify-between items-center bg-white border-t border-slate-100">
                            <button className="back-btn" style={{ padding: '6px 12px' }}>← Previous</button>
                            <div className="flex items-center gap-1">
                                <button className="w-8 h-8 rounded bg-indigo-600 text-white text-xs font-bold">1</button>
                                <button className="w-8 h-8 rounded text-slate-400 text-xs font-medium hover:bg-slate-50">2</button>
                                <button className="w-8 h-8 rounded text-slate-400 text-xs font-medium hover:bg-slate-50">3</button>
                                <span className="px-1 text-slate-300">...</span>
                                <button className="w-8 h-8 rounded text-slate-400 text-xs font-medium hover:bg-slate-50">10</button>
                            </div>
                            <button className="back-btn" style={{ padding: '6px 12px' }}>Next →</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
