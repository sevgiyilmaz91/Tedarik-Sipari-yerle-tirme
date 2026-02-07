import { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { History, Mail, Download, X, Box, MapPin, Check } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import './ShoppingSampleRegistration.css';

interface SampleHistory {
    previousStatus: string;
    nextStatus: string;
    user: string;
    date: string;
    location: string;
    description: string;
}

interface ShoppingSampleItem {
    id: string;
    esinlenenModelKodu: string;
    ad: string;
    tanım: string;
    fiyat: string;
    olusturan: string;
    markaGrubu: string;
    marka: string;
    cinsiyet: string;
    esinlenmeTipi: string;
    mensei: string;
    sezon: string;
    stokGrubu: string;
    klasman: string;
    anaMalzeme: string;
    urunAciklamasi: string;
    recentComments: string;
    zayifNoktalar: string;
    gucluNoktalar: string;
    status: string;
    fiziki: string;
    fizikiLokasyon: string;
    history: SampleHistory[];
}

const initialHistory: SampleHistory = {
    previousStatus: '-',
    nextStatus: 'Yeni',
    user: 'PLM',
    date: new Date().toLocaleString('tr-TR'),
    location: '-',
    description: "PLM'den geldi"
};

const initialMockData: ShoppingSampleItem[] = [
    {
        id: '1',
        esinlenenModelKodu: '0000085',
        ad: 'Nova Sprint',
        tanım: 'NS-402138_01',
        fiyat: '110',
        olusturan: 'OKAN.CIBOGLU',
        markaGrubu: 'GRP-SPORT',
        marka: 'NOVA',
        cinsiyet: 'Erkek',
        esinlenmeTipi: 'Shopping Numune',
        mensei: 'TR',
        sezon: 'SK-2026',
        stokGrubu: 'Sneaker',
        klasman: 'Ayakkabı',
        anaMalzeme: 'Tekstil+EVA',
        urunAciklamasi: 'Günlük koşu sneaker',
        recentComments: 'Form iyi, burun dar',
        zayifNoktalar: 'Burun kalıbı dar',
        gucluNoktalar: 'Hafif taban',
        status: 'Yeni',
        fiziki: '-',
        fizikiLokasyon: '-',
        history: [initialHistory]
    },
    {
        id: '2',
        esinlenenModelKodu: '0000084',
        ad: 'Luma Street',
        tanım: 'LM-118833_02',
        fiyat: '999,99',
        olusturan: 'FLOXO.PLM20',
        markaGrubu: 'GRP-URBAN',
        marka: 'LUMA',
        cinsiyet: 'Kadın',
        esinlenmeTipi: 'Rakip Analizi',
        mensei: 'CN',
        sezon: 'FW-2025',
        stokGrubu: 'Sneaker',
        klasman: 'Ayakkabı',
        anaMalzeme: 'Sentetik',
        urunAciklamasi: 'Urban sneaker',
        recentComments: 'Renk opsiyonu güzel',
        zayifNoktalar: 'Üst saya kolay kirleniyor',
        gucluNoktalar: 'Renk/kolay kombin',
        status: 'Yeni',
        fiziki: '-',
        fizikiLokasyon: '-',
        history: [initialHistory]
    },
    {
        id: '3',
        esinlenenModelKodu: '0000083',
        ad: 'Kora Basic Tee',
        tanım: 'KR-TEE-009',
        fiyat: '5',
        olusturan: 'FLOXO.PLM20',
        markaGrubu: 'GRP-APPAREL',
        marka: 'KORA',
        cinsiyet: 'Kadın',
        esinlenmeTipi: 'Competitive',
        mensei: 'TR',
        sezon: 'SS-2026',
        stokGrubu: 'Polo T-Shirt',
        klasman: 'Üst Grup',
        anaMalzeme: 'Pamuk',
        urunAciklamasi: 'Basic tişört',
        recentComments: 'Kalıp standart',
        zayifNoktalar: 'Kumaş gramajı düşük',
        gucluNoktalar: 'Fiyat avantajı',
        status: 'Yeni',
        fiziki: '-',
        fizikiLokasyon: '-',
        history: [initialHistory]
    },
    {
        id: '4',
        esinlenenModelKodu: '0000082',
        ad: 'Vexo Cabin Bag',
        tanım: 'VX-CB-210',
        fiyat: '8999',
        olusturan: 'FLOXO.PLM20',
        markaGrubu: 'GRP-TRAVEL',
        marka: 'VEXO',
        cinsiyet: 'Unisex',
        esinlenmeTipi: 'Rakip Analizi',
        mensei: 'VN',
        sezon: 'FW-2025',
        stokGrubu: 'Valiz',
        klasman: 'Seyahat',
        anaMalzeme: 'ABS',
        urunAciklamasi: 'Kabin boy valiz',
        recentComments: 'Tekerler sessiz',
        zayifNoktalar: 'Tutma kolu boşluk yapıyor',
        gucluNoktalar: 'Sessiz teker',
        status: 'Yeni',
        fiziki: '-',
        fizikiLokasyon: '-',
        history: [initialHistory]
    },
    {
        id: '5',
        esinlenenModelKodu: '102026772',
        ad: 'Kinetix Model 1',
        tanım: 'K-MOD-1',
        fiyat: '1250',
        olusturan: 'FLOXO.PLM20',
        markaGrubu: 'GRP-SPORT',
        marka: 'KINETIX',
        cinsiyet: 'Kadın',
        esinlenmeTipi: 'Shopping Numune',
        mensei: 'TR',
        sezon: '26SS',
        stokGrubu: 'Sneaker',
        klasman: 'Ayakkabı',
        anaMalzeme: 'Sentetik',
        urunAciklamasi: 'Spor ayakkabı',
        recentComments: 'Gayet iyi',
        zayifNoktalar: 'Yok',
        gucluNoktalar: 'Hafif',
        status: 'Yeni',
        fiziki: '-',
        fizikiLokasyon: '-',
        history: [initialHistory]
    },
    {
        id: '6',
        esinlenenModelKodu: '0000075',
        ad: 'Adidas Tokyo',
        tanım: 'AD-TK-01',
        fiyat: '4500',
        olusturan: 'FLOXO.PLM20',
        markaGrubu: 'GRP-SPORT',
        marka: 'ADIDAS',
        cinsiyet: 'Erkek',
        esinlenmeTipi: 'Rakip Analizi',
        mensei: 'VN',
        sezon: '26SS',
        stokGrubu: 'Koşu',
        klasman: 'Ayakkabı',
        anaMalzeme: 'Tekstil',
        urunAciklamasi: 'Koşu ayakkabısı',
        recentComments: 'Performans ürünü',
        zayifNoktalar: 'Fiyat yüksek',
        gucluNoktalar: 'Çok rahat',
        status: 'Yeni',
        fiziki: '-',
        fizikiLokasyon: '-',
        history: [initialHistory]
    }
];

export default function ShoppingSampleRegistration() {
    const [data, setData] = useState<ShoppingSampleItem[]>(initialMockData);
    const [searchValue, setSearchValue] = useState('');
    const [globalFilter, setGlobalFilter] = useState('');

    // Modal States
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ShoppingSampleItem | null>(null);

    // Form States
    const [hasDamaged, setHasDamaged] = useState(false);
    const [description, setDescription] = useState('');
    const [newLocation, setNewLocation] = useState('ARGE');

    const columns = useMemo<ColumnDef<ShoppingSampleItem>[]>(() => [
        {
            id: 'icons',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <History
                        className="h-4 w-4 text-[#6D28D9] cursor-pointer opacity-60 hover:opacity-100"
                        onClick={() => {
                            setSelectedItem(row.original);
                            setIsHistoryModalOpen(true);
                        }}
                    />
                    <Mail className="h-4 w-4 text-[#6D28D9] cursor-pointer opacity-60 hover:opacity-100" />
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Statü',
            cell: info => (
                <span className={`status-badge ${info.getValue() === 'İşlemde' ? 'processing' : 'new'}`}>
                    {info.getValue() as string}
                </span>
            ),
        },
        {
            accessorKey: 'fizikiLokasyon',
            header: 'Fiziki',
            cell: ({ row }) => {
                const value = row.original.fizikiLokasyon;
                return (
                    <div className="flex items-center gap-2">
                        {value !== '-' && <MapPin size={14} className="text-slate-400" />}
                        <span className={value !== '-' ? 'font-semibold text-slate-700' : 'text-slate-300'}>
                            {value}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'fesinlenenModelKodu',
            header: 'Model',
            accessorFn: row => row.esinlenenModelKodu,
            cell: info => <span className="font-semibold text-[#4B3B8B]">{info.getValue() as string}</span>,
        },
        {
            accessorKey: 'ad',
            header: 'Ad',
        },
        {
            accessorKey: 'marka',
            header: 'Marka',
        },
        {
            accessorKey: 'cinsiyet',
            header: 'Cinsiyet',
        },
        {
            accessorKey: 'sezon',
            header: 'Sezon',
        },
        {
            id: 'actions',
            header: 'İşlemler',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    {row.original.fiziki === '-' ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-bold border-[#6D28D9] text-[#6D28D9]"
                            onClick={() => {
                                setSelectedItem(row.original);
                                setHasDamaged(false);
                                setDescription('');
                                setIsRegisterModalOpen(true);
                            }}
                        >
                            Kayıt
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-bold border-orange-400 text-orange-600"
                            onClick={() => {
                                setSelectedItem(row.original);
                                setNewLocation(row.original.fizikiLokasyon);
                                setDescription('');
                                setIsLocationModalOpen(true);
                            }}
                        >
                            Yer Değiştir
                        </Button>
                    )}
                </div>
            )
        }
    ], []);

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const handleSearch = () => {
        setGlobalFilter(searchValue);
    };

    const handleRegisterSave = () => {
        if (!selectedItem || !hasDamaged) return;
        const now = new Date().toLocaleString('tr-TR');
        const newHistoryRecord: SampleHistory = {
            previousStatus: 'Yeni',
            nextStatus: 'Yeni',
            user: 'MUSTAFA TEKİN',
            date: now,
            location: '- -> Numune Kayıt',
            description: description || 'Numune fiziki kayıt yapıldı (hasar işaretlendi)'
        };

        const updatedData = data.map(item => {
            if (item.id === selectedItem.id) {
                return {
                    ...item,
                    status: 'Yeni',
                    fiziki: 'Var',
                    fizikiLokasyon: 'Numune Kayıt',
                    history: [...item.history, newHistoryRecord]
                };
            }
            return item;
        });

        setData(updatedData);
        setIsRegisterModalOpen(false);
    };

    const handleLocationChange = () => {
        if (!selectedItem) return;
        const now = new Date().toLocaleString('tr-TR');
        const newHistoryRecord: SampleHistory = {
            previousStatus: 'İşlemde',
            nextStatus: 'İşlemde',
            user: 'MUSTAFA TEKİN',
            date: now,
            location: `${selectedItem.fizikiLokasyon} -> ${newLocation}`,
            description: description || 'Fiziki lokasyon güncellendi'
        };

        const updatedData = data.map(item => {
            if (item.id === selectedItem.id) {
                return {
                    ...item,
                    fizikiLokasyon: newLocation,
                    history: [...item.history, newHistoryRecord]
                };
            }
            return item;
        });

        setData(updatedData);
        setIsLocationModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <TopNav />
            <main className="container px-6 py-6 max-w-full">
                <div className="breadcrumb text-sm text-slate-400 mb-4 items-center flex gap-2">
                    <span className="text-lg">🏠</span> / <span>Shopping Numune Kayıt</span>
                </div>

                <h1 className="page-title text-2xl font-extrabold mb-6">Shopping Numune Kayıt</h1>

                <div className="search-panel mb-8">
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="text-white text-[10px] font-bold uppercase tracking-wider">Arama Kriteri</label>
                        <select className="h-11 px-4 rounded-lg bg-white border-none text-sm font-semibold">
                            <option>Model Kodu</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 flex-[3]">
                        <label className="text-white text-[10px] font-bold uppercase tracking-wider">Model Kodu</label>
                        <Input
                            className="search-input"
                            placeholder="102026772"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button className="orange-btn h-11 px-8 rounded-lg font-bold" onClick={handleSearch}>ARA</Button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="font-bold text-slate-700">Shopping Numune Kayıt <span className="ml-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{data.length} Kayıt</span></h2>
                        <Button variant="outline" className="h-9 gap-2 text-slate-600"><Download size={16} /> Excel İndir</Button>
                    </div>
                    <table className="data-table w-full text-sm">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="bg-slate-50">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-4 text-left font-bold text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-100">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr
                                    key={row.id}
                                    className="hover:bg-slate-50 border-b border-slate-50 cursor-pointer"
                                    onDoubleClick={() => {
                                        setSelectedItem(row.original);
                                        if (row.original.fiziki === '-') {
                                            setHasDamaged(false);
                                            setDescription('');
                                            setIsRegisterModalOpen(true);
                                        } else {
                                            setNewLocation(row.original.fizikiLokasyon);
                                            setDescription('');
                                            setIsLocationModalOpen(true);
                                        }
                                    }}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-3 whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Numune Kayıt Modal */}
            {isRegisterModalOpen && selectedItem && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <div className="modal-icon">
                                <Box size={28} className="text-indigo-600" />
                            </div>
                            <h2 className="modal-title">Numune Kayıt</h2>
                            <p className="modal-subtitle">PLM'den gelen shopping numunesi için fiziki kayıt</p>
                            <button className="close-btn" onClick={() => setIsRegisterModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-content">
                            {/* Left Column */}
                            <div>
                                <span className="col-label">Mevcut seçim</span>
                                <div className="badge-row">
                                    <span className="status-badge new">Yeni</span>
                                </div>

                                <div className="product-card">
                                    <div className="product-img">
                                        <Box size={24} className="text-slate-300" />
                                    </div>
                                    <div className="product-info">
                                        <h3>{selectedItem.ad}</h3>
                                        <p>{selectedItem.tanım}</p>
                                    </div>
                                </div>

                                <div className="detail-table">
                                    <div className="detail-row">
                                        <span className="detail-label">Marka</span>
                                        <span className="detail-value">{selectedItem.marka}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Cinsiyet</span>
                                        <span className="detail-value">{selectedItem.cinsiyet}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Sezon</span>
                                        <span className="detail-value">{selectedItem.sezon}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Esinlenen Model Kodu</span>
                                        <span className="detail-value mono">{selectedItem.esinlenenModelKodu}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div>
                                <span className="col-label">Kayıt bilgileri</span>

                                <div
                                    className="damage-checkbox-group"
                                    onClick={() => setHasDamaged(!hasDamaged)}
                                >
                                    <div className={`check-square ${hasDamaged ? 'active' : ''}`}>
                                        {hasDamaged && <Check size={16} className="text-white" />}
                                    </div>
                                    <div className="checkbox-label">
                                        <span className="title">Hasar verdim</span>
                                        <span className="desc">Bu seçim zorunludur. İşaretlenmeden kayıt yapılamaz.</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Açıklama</label>
                                    <textarea
                                        className="custom-textarea"
                                        placeholder="İstersen kısa bir not ekleyebilirsin..."
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="kaydedince-box">
                                    <span className="label">Kaydedince</span>
                                    <div className="badges">
                                        <span className="status-badge new">Statü: Yeni</span>
                                        <span className="status-badge loc">Fiziki: Numune Kayıt</span>
                                    </div>
                                    <p>Sonrasında fiziki lokasyonu değiştirmek için satıra çift tıklayabilir veya "Yer Değiştir" aksiyonunu kullanabilirsin.</p>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-ghost" onClick={() => setIsRegisterModalOpen(false)}>
                                Vazgeç
                            </button>
                            <button
                                className="btn-primary"
                                disabled={!hasDamaged}
                                onClick={handleRegisterSave}
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fiziki Yer Değiştir Modal */}
            {isLocationModalOpen && selectedItem && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <div className="modal-icon blue">
                                <MapPin size={28} className="text-blue-600" />
                            </div>
                            <h2 className="modal-title">Fiziki Yer Değiştir</h2>
                            <p className="modal-subtitle">Numunenin fiziki lokasyonunu güncelle</p>
                            <button className="close-btn" onClick={() => setIsLocationModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-content">
                            {/* Left Column */}
                            <div>
                                <span className="col-label">Mevcut durum</span>
                                <div className="badge-row">
                                    <span className="status-badge new">Yeni</span>
                                    <span className="status-badge loc">Fiziki: {selectedItem.fizikiLokasyon}</span>
                                </div>

                                <div className="product-card">
                                    <div className="product-img">
                                        <Box size={24} className="text-slate-300" />
                                    </div>
                                    <div className="product-info">
                                        <h3>{selectedItem.ad}</h3>
                                        <p>{selectedItem.tanım}</p>
                                    </div>
                                </div>

                                <div className="detail-table">
                                    <div className="detail-row">
                                        <span className="detail-label">Marka</span>
                                        <span className="detail-value">{selectedItem.marka}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Sezon</span>
                                        <span className="detail-value">{selectedItem.sezon}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Esinlenen Model Kodu</span>
                                        <span className="detail-value mono">{selectedItem.esinlenenModelKodu}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div>
                                <span className="col-label">Yeni fiziki lokasyon</span>

                                <div className="form-group">
                                    <select
                                        className="custom-select"
                                        value={newLocation}
                                        onChange={e => setNewLocation(e.target.value)}
                                    >
                                        {['ARGE', 'Çin Ofis', 'Üretici', 'Arşiv', 'İmha'].map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Açıklama</label>
                                    <textarea
                                        className="custom-textarea"
                                        placeholder="Örn: Çin ofise gönderildi / arşive kaldırıldı / imha edildi..."
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-ghost" onClick={() => setIsLocationModalOpen(false)}>
                                Vazgeç
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleLocationChange}
                            >
                                Değiştir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Statü Geçmişi Modal */}
            {isHistoryModalOpen && selectedItem && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ width: '1000px' }}>
                        <div className="modal-header">
                            <div className="header-title-group">
                                <div className="header-icon-box purple"><History size={24} /></div>
                                <div>
                                    <h2>Statü Geçmişi</h2>
                                    <p>Kim, ne zaman, hangi statü/lokasyon değişikliğini yaptı</p>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setIsHistoryModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className="modal-content" style={{ display: 'block' }}>
                            <div className="border border-slate-100 rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4 text-left">Önceki Statü</th>
                                            <th className="px-6 py-4 text-left">Şimdiki Statü</th>
                                            <th className="px-6 py-4 text-left">Kullanıcı</th>
                                            <th className="px-6 py-4 text-left">Tarih</th>
                                            <th className="px-6 py-4 text-left">Lokasyon</th>
                                            <th className="px-6 py-4 text-left">Açıklama</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {[...selectedItem.history].reverse().map((h, i) => (
                                            <tr key={i}>
                                                <td className="px-6 py-4"><span className={`status-badge ${h.previousStatus === 'İşlemde' ? 'processing' : h.previousStatus === 'Yeni' ? 'new' : ''}`} style={h.previousStatus === '-' ? { background: 'none', border: 'none', color: '#cbd5e1' } : {}}>{h.previousStatus}</span></td>
                                                <td className="px-6 py-4"><span className={`status-badge ${h.nextStatus === 'İşlemde' ? 'processing' : 'new'}`}>{h.nextStatus}</span></td>
                                                <td className="px-6 py-4 font-bold color-slate-700">{h.user}</td>
                                                <td className="px-6 py-4 text-slate-500">{h.date}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-600">{h.location}</td>
                                                <td className="px-6 py-4 text-slate-500">{h.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer justify-center"><button className="btn-ghost border-slate-200" style={{ maxWidth: '200px' }} onClick={() => setIsHistoryModalOpen(false)}>Tamam</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
