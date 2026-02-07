import { useState, useEffect, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import type {
    ColumnDef,
    ColumnFiltersState,
    FilterFn,
} from '@tanstack/react-table';
import { Filter, X, ChevronDown, ChevronUp, ChevronsUpDown, Check, Calendar, Send } from 'lucide-react';
import type { OrderPlacementItem, SearchCriteria } from '../types/orderPlacement';
import { OrderPlacementService } from '../services/orderPlacementService';
import { RFQService } from '../services/rfqService';
import { TopNav } from '@/components/layout/TopNav';
import SuitableSuppliersView from '../components/SuitableSuppliersView';
import RFQSupplierDrawer from '../components/RFQSupplierDrawer';
import RFQReviewDrawer from '../components/RFQReviewDrawer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import '../components/OrderPlacement.css';
import './OrderPlacementPage.css';
import { HelpCircle, FileText, LayoutGrid, LayoutList } from 'lucide-react';

const seasons = ['25AW', '26SS', '25SS', '24FW'];

// Custom filter functions
const multiSelectFilter: FilterFn<OrderPlacementItem> = (row, id, filterValue) => {
    if (!filterValue || filterValue.length === 0) return true;
    return filterValue.includes(String(row.getValue(id)));
};

const rangeFilter: FilterFn<OrderPlacementItem> = (row, id, filterValue) => {
    const [min, max] = filterValue as [number | undefined, number | undefined];
    const value = row.getValue(id) as number;
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
};

export default function OrderPlacementPage() {
    // Check URL hash immediately for initial state
    const getInitialView = () => {
        const hash = window.location.hash;
        return hash.includes('view=list') ? 'supplier' : 'list';
    };

    const [view, setView] = useState<'list' | 'supplier'>(getInitialView());
    const [selectedItem, setSelectedItem] = useState<OrderPlacementItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<OrderPlacementItem[]>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalSearchValue, setGlobalSearchValue] = useState('');
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>('genericModel');
    const [panelSearchValue, setPanelSearchValue] = useState('');
    const [selectedSeason, setSelectedSeason] = useState('25AW');
    const [pageSize] = useState(20);
    const [displayMode, setDisplayMode] = useState<'grid' | 'card'>('grid');

    // RFQ States
    const [isRFQPromptOpen, setIsRFQPromptOpen] = useState(false);
    const [isRFQDrawerOpen, setIsRFQDrawerOpen] = useState(false);
    const [isRFQReviewOpen, setIsRFQReviewOpen] = useState(false);
    const [rfqTargetItem, setRfqTargetItem] = useState<OrderPlacementItem | null>(null);
    const [rfqSats, setRfqSats] = useState<Set<string>>(new Set());
    const [acceptedSupplierId, setAcceptedSupplierId] = useState<string | null>(null);

    useEffect(() => {
        if (view === 'list') {
            fetchInitialData();
        }
    }, [view]);



    const fetchInitialData = async () => {
        setLoading(true);
        const data = await OrderPlacementService.getOrders();

        // Fetch existing RFQs to mark status
        const existingRfqs = RFQService.getRFQs();
        const rfqSatIds = new Set(existingRfqs.map(r => r.satId as string));
        setRfqSats(rfqSatIds);

        setOrders(data);
        setLoading(false);
    };

    const criteriaConfig: Record<SearchCriteria, { label: string, field: string }> = {
        genericModel: { label: 'Jenerik', field: 'genericModel' },
        modelName: { label: 'Model Adı', field: 'modelName' },
        category: { label: 'Kategori', field: 'category' },
        class: { label: 'Klasman', field: 'class' },
        productDescription: { label: 'Ürün Tipi / Tanımı', field: 'productDescription' },
    };

    const handleSearch = () => {
        setGlobalSearchValue(panelSearchValue);
    };

    const getUniqueValues = (field: keyof OrderPlacementItem) => {
        return Array.from(new Set(orders.map(o => String(o[field])))).filter(Boolean).sort();
    };

    const columns = useMemo<ColumnDef<OrderPlacementItem>[]>(() => [
        {
            id: 'rfqActions',
            header: 'Teklifler',
            cell: ({ row }) => {
                const item = row.original as OrderPlacementItem;
                const hasRfq = rfqSats.has(item.id);

                return hasRfq ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-amber-500 text-amber-600 hover:bg-amber-50 font-bold flex items-center gap-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setIsRFQReviewOpen(true);
                        }}
                    >
                        <FileText size={14} />
                        Teklifi İncele
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-indigo-600 hover:bg-indigo-50 font-bold flex items-center gap-2 border border-indigo-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setIsRFQDrawerOpen(true);
                        }}
                    >
                        <Send size={14} />
                        Teklif Gönder
                    </Button>
                );
            },
        },
        {
            accessorKey: 'purchaseRequest',
            header: 'Satınalma Talebi',
            cell: info => <span style={{ fontWeight: 600, color: '#2563eb' }}>{info.getValue() as string}</span>,
        },
        {
            accessorKey: 'assignedSupplierName',
            header: 'Tedarikçi Adı',
            cell: info => <span style={{ fontWeight: 500, color: '#4B3B8B' }}>{info.getValue() as string || '-'}</span>,
        },
        {
            accessorKey: 'genericModel',
            header: 'Jenerik',
        },
        {
            accessorKey: 'modelName',
            header: 'Model Adı',
        },
        {
            accessorKey: 'productDescription',
            header: 'Ürün Tipi / Tanımı',
            cell: ({ row }) => {
                const item = row.original as OrderPlacementItem;
                const isCarryover = item.productStatus === 'Carryover';
                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${isCarryover ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                                {item.productStatus === 'Carryover' ? 'Carryover' : 'New'}
                            </span>
                            <span className="font-bold text-slate-700">{item.productDescription}</span>
                        </div>
                        {isCarryover && item.previousGeneric && (
                            <span className="text-[10px] font-bold text-slate-400 italic">
                                Eşlenik: <span className="underline decoration-slate-300 decoration-dotted">{item.previousGeneric}</span>
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: 'gender',
            header: 'Cinsiyet',
        },
        {
            accessorKey: 'brandGroup',
            header: 'Marka Grubu',
        },
        {
            accessorKey: 'brandName',
            header: 'Marka Adı',
        },
        {
            accessorKey: 'productGroup',
            header: 'Ürün Grubu',
        },
        {
            accessorKey: 'category',
            header: 'Kategori',
            filterFn: multiSelectFilter,
        },
        {
            accessorKey: 'class',
            header: 'Klasman',
            filterFn: multiSelectFilter,
        },
        {
            accessorKey: 'stockGroup',
            header: 'Stok Grubu',
            filterFn: multiSelectFilter,
        },
        {
            accessorKey: 'stockGroupDetail',
            header: 'Stok Grubu Detayı',
            filterFn: multiSelectFilter,
        },
        {
            accessorKey: 'upperMaterial',
            header: 'Saya Malzemesi',
            filterFn: multiSelectFilter,
        },
        {
            accessorKey: 'pairQuantity',
            header: 'Çift Miktarı',
            cell: info => <span className="qty-badge">{info.getValue() as number}</span>,
            filterFn: rangeFilter,
        },
        {
            accessorKey: 't1Date',
            header: 'T1 Tarihi',
        },
        {
            accessorKey: 'floPsf',
            header: 'FLO PSF',
            cell: info => <span className="price-badge">₺{(info.getValue() as number).toLocaleString()}</span>,
            filterFn: rangeFilter,
        },
        {
            id: 'capacityActions',
            header: 'Kapasite',
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-[#6D28D9] text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white font-semibold flex items-center gap-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(row.original as OrderPlacementItem);
                        setView('supplier');
                    }}
                >
                    <Calendar size={14} />
                    Kapasite Gör
                </Button>
            ),
        },
    ], [orders]);

    const table = useReactTable({
        data: orders,
        columns,
        state: {
            columnFilters,
            globalFilter: globalSearchValue,
        },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        globalFilterFn: (row, _columnId, filterValue) => {
            if (!filterValue) return true;
            const field = criteriaConfig[searchCriteria]?.field || 'genericModel';
            const value = String((row.original as any)[field] || '').toLowerCase();
            return value.includes(filterValue.toLowerCase());
        },
    });

    useEffect(() => {
        table.setPageSize(pageSize);
    }, [pageSize, table]);

    const removeFilter = (id: string) => {
        setColumnFilters(prev => prev.filter(f => f.id !== id));
    };

    const clearAllFilters = () => {
        setColumnFilters([]);
        setGlobalSearchValue('');
    };

    const renderFilterUI = (column: any) => {
        const columnId = column.id as keyof OrderPlacementItem;
        const currentFilter: any = column.getFilterValue();
        const type = typeof orders[0]?.[columnId];
        const isNumeric = type === 'number';
        const isCategoric = !!column.columnDef.filterFn && column.columnDef.filterFn === 'multiSelect';

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className={`filter-icon-btn ${currentFilter ? 'active' : ''}`}>
                        <Filter size={14} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="filter-popup" align="start">
                    <div className="filter-popup-header">
                        <span>{column.columnDef.header as string} Filtrele</span>
                    </div>

                    {isCategoric ? (
                        <div className="filter-options-list">
                            {getUniqueValues(columnId).map(val => {
                                const isChecked = (currentFilter || []).includes(val);
                                return (
                                    <div
                                        key={val}
                                        className={`filter-option-item ${isChecked ? 'selected' : ''}`}
                                        onClick={() => {
                                            const nextValues = isChecked
                                                ? (currentFilter as string[]).filter(v => v !== val)
                                                : [...(currentFilter as string[] || []), val];
                                            column.setFilterValue(nextValues.length ? nextValues : undefined);
                                        }}
                                    >
                                        <div className="checkbox-box">
                                            {isChecked && <Check size={12} />}
                                        </div>
                                        <span>{val}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : isNumeric ? (
                        <div className="filter-range-inputs">
                            <div className="range-input-group">
                                <label>Min</label>
                                <input
                                    type="number"
                                    value={(currentFilter as [number, number])?.[0] || ''}
                                    onChange={e => column.setFilterValue((prev: any) => [e.target.value ? Number(e.target.value) : undefined, prev?.[1]])}
                                    placeholder="0"
                                />
                            </div>
                            <div className="range-input-group">
                                <label>Max</label>
                                <input
                                    type="number"
                                    value={(currentFilter as [number, number])?.[1] || ''}
                                    onChange={e => column.setFilterValue((prev: any) => [prev?.[0], e.target.value ? Number(e.target.value) : undefined])}
                                    placeholder="99999"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="filter-search-input">
                            <Input
                                placeholder="Arayın..."
                                value={(currentFilter as string) || ''}
                                onChange={e => column.setFilterValue(e.target.value)}
                                className="h-9"
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="filter-popup-footer">
                        <Button variant="ghost" size="sm" onClick={() => column.setFilterValue(undefined)}>Temizle</Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
        <div className="min-h-screen bg-[#F9F7FD]">
            <TopNav />

            <main className="container px-6 py-4 max-w-full">
                <div className="breadcrumb">
                    <span className="breadcrumb-icon">🏠</span>
                    <span className="breadcrumb-separator">/</span>
                    <span>Numune Kayıt</span>
                    <span className="breadcrumb-separator">/</span>
                    <span>...</span>
                    <span className="breadcrumb-separator">/</span>
                    <span>Sipariş Yerleştirme</span>
                </div>

                <h1 className="page-title">Sipariş Yerleştirme</h1>
                <p className="page-subtitle">Your current sales summary and activity.</p>

                {view === 'list' ? (
                    <>
                        <div className="search-panel">
                            <div className="search-field">
                                <label className="search-label">Sezon</label>
                                <select className="search-select" value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)}>
                                    {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="search-field">
                                <label className="search-label">Arama Kriteri</label>
                                <select
                                    className="search-select"
                                    value={searchCriteria}
                                    onChange={(e) => {
                                        setSearchCriteria(e.target.value as SearchCriteria);
                                        setPanelSearchValue('');
                                    }}
                                >
                                    {Object.entries(criteriaConfig).map(([k, v]: any) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="search-field search-field-grow">
                                <label className="search-label">{criteriaConfig[searchCriteria].label}</label>
                                {searchCriteria === 'genericModel' || searchCriteria === 'modelName' ? (
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder={`${criteriaConfig[searchCriteria].label} giriniz...`}
                                        value={panelSearchValue}
                                        onChange={(e) => setPanelSearchValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                ) : (
                                    <select
                                        className="search-select"
                                        value={panelSearchValue}
                                        onChange={(e) => setPanelSearchValue(e.target.value)}
                                    >
                                        <option value="">Seçiniz...</option>
                                        {getUniqueValues(searchCriteria as keyof OrderPlacementItem).map(val => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <button className="search-button" onClick={handleSearch}>
                                <Filter size={20} />
                                Ara
                            </button>
                        </div>

                        {/* Filter Chips */}
                        {(columnFilters.length > 0 || globalSearchValue) && (
                            <div className="filter-chips-container">
                                {globalSearchValue && (
                                    <div className="filter-chip">
                                        <span>Arama: {globalSearchValue}</span>
                                        <button onClick={() => setGlobalSearchValue('')}><X size={14} /></button>
                                    </div>
                                )}
                                {columnFilters.map(filter => (
                                    <div className="filter-chip" key={filter.id}>
                                        <span>{columns.find(c => (c as any).accessorKey === filter.id)?.header as string}: {Array.isArray(filter.value) ? filter.value.join(', ') : filter.value as string}</span>
                                        <button onClick={() => removeFilter(filter.id)}><X size={14} /></button>
                                    </div>
                                ))}
                                <button className="clear-all-btn" onClick={clearAllFilters}>Tümünü Temizle</button>
                            </div>
                        )}

                        <div className="results-header">
                            <div className="flex items-center gap-4">
                                <span className="results-label text-slate-700">SAT Arama</span>
                                <span className="results-count-badge bg-indigo-50 text-indigo-600 border-indigo-100">{orders.length} Kayıt</span>
                                <div className="h-6 w-[1px] bg-slate-200 mx-2" />
                                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                    <button
                                        className={`p-1.5 rounded-md transition-all ${displayMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                        onClick={() => setDisplayMode('grid')}
                                    >
                                        <LayoutList size={18} />
                                    </button>
                                    <button
                                        className={`p-1.5 rounded-md transition-all ${displayMode === 'card' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                        onClick={() => setDisplayMode('card')}
                                    >
                                        <LayoutGrid size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2">
                            </div>
                        </div>

                        {displayMode === 'grid' ? (
                            <div className="table-container shadow-xl shadow-indigo-100/20 border border-slate-100 rounded-2xl overflow-hidden">
                                {loading && (
                                    <div className="loading-overlay">
                                        <div className="spinner"></div>
                                    </div>
                                )}

                                <table className="data-table">
                                    <thead>
                                        {table.getHeaderGroups().map(headerGroup => (
                                            <tr key={headerGroup.id} className="bg-slate-50/80">
                                                {headerGroup.headers.map(header => (
                                                    <th key={header.id}>
                                                        <div className="header-content">
                                                            <div className="header-sort text-[11px] font-black uppercase tracking-wider text-slate-400" onClick={header.column.getToggleSortingHandler()}>
                                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                                {{
                                                                    asc: <ChevronUp size={14} className="text-indigo-600" />,
                                                                    desc: <ChevronDown size={14} className="text-indigo-600" />,
                                                                }[header.column.getIsSorted() as string] ?? <ChevronsUpDown size={12} className="sort-icon-muted" />}
                                                            </div>
                                                            {renderFilterUI(header.column)}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {table.getRowModel().rows.map(row => (
                                            <tr
                                                key={row.id}
                                                onDoubleClick={() => {
                                                    setSelectedItem(row.original as OrderPlacementItem);
                                                    setRfqTargetItem(row.original as OrderPlacementItem);
                                                    setIsRFQPromptOpen(true);
                                                }}
                                                className={`clickable transition-colors ${row.original.assignedSupplierName ? 'row-placed' : ''} ${rfqSats.has(row.original.id) ? 'row-rfq-active' : ''} hover:bg-slate-50/80`}
                                                title="İşlem seçeneklerini görmek için çift tıklayın"
                                            >
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id} className="py-4">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!loading && table.getRowModel().rows.length === 0 && (
                                    <div className="empty-state py-20">
                                        <div className="empty-state-icon text-5xl mb-4">🔍</div>
                                        <h3 className="text-xl font-bold text-slate-400">Kayıt Bulunamadı</h3>
                                        <p className="text-slate-300">Arama kriterlerinize uygun sonuç bulunmamaktadır.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {table.getRowModel().rows.map(row => {
                                    const item = row.original as OrderPlacementItem;
                                    return (
                                        <div
                                            key={row.id}
                                            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                                            onDoubleClick={() => {
                                                setSelectedItem(item);
                                                setRfqTargetItem(item);
                                                setIsRFQPromptOpen(true);
                                            }}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                    #{item.purchaseRequest}
                                                </span>
                                                <span className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                    ₺{item.floPsf.toLocaleString()}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">{item.modelName}</h3>
                                            <p className="text-slate-400 text-xs font-bold mb-6 truncate">{item.brandName} • {item.productDescription}</p>

                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="bg-slate-50 p-3 rounded-2xl">
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Miktar</span>
                                                    <span className="font-black text-slate-700">{item.pairQuantity}</span>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-2xl">
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">T1</span>
                                                    <span className="font-black text-slate-700">{item.t1Date}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-auto">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 h-11 rounded-xl border-amber-200 text-amber-600 font-bold hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedItem(item);
                                                        setIsRFQReviewOpen(true);
                                                    }}
                                                >
                                                    <FileText size={16} /> İncele
                                                </Button>
                                                <Button
                                                    className="flex-1 h-11 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedItem(item);
                                                        setView('supplier');
                                                    }}
                                                >
                                                    <Calendar size={16} /> Kapasite
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="pagination-container">
                            <button
                                className="back-btn"
                                disabled={!table.getCanPreviousPage()}
                                onClick={() => table.previousPage()}
                            >
                                ← Previous
                            </button>
                            <div className="pagination-center">
                                <span className="pagination-page-info">
                                    {Array.from({ length: Math.min(table.getPageCount(), 5) }).map((_, i) => (
                                        <button
                                            key={i}
                                            className={`tab-btn ${table.getState().pagination.pageIndex === i ? 'active' : ''}`}
                                            onClick={() => table.setPageIndex(i)}
                                            style={{ minWidth: '32px', padding: '4px 8px' }}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    {table.getPageCount() > 5 && <span>...</span>}
                                    {table.getPageCount() > 5 && (
                                        <button
                                            className={`tab-btn ${table.getState().pagination.pageIndex === table.getPageCount() - 1 ? 'active' : ''}`}
                                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                            style={{ minWidth: '32px', padding: '4px 8px' }}
                                        >
                                            {table.getPageCount()}
                                        </button>
                                    )}
                                </span>
                            </div>
                            <button
                                className="back-btn"
                                disabled={!table.getCanNextPage()}
                                onClick={() => table.nextPage()}
                            >
                                Next →
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="suitable-suppliers-view-wrapper" style={{ height: 'calc(100vh - 200px)', marginTop: '20px' }}>
                        <SuitableSuppliersView
                            satItem={selectedItem || undefined}
                            onBack={() => {
                                setView('list');
                                setAcceptedSupplierId(null);
                            }}
                            restrictedSupplierId={acceptedSupplierId || undefined}
                        />
                    </div>
                )}
            </main>

            {/* RFQ Prompt Modal */}
            {isRFQPromptOpen && rfqTargetItem && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsRFQPromptOpen(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <HelpCircle size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2">Fiyat Teklifi Alınmalı mı?</h2>
                            <p className="text-slate-500 font-medium mb-10 px-4">
                                Siparişi yerleştirmeden önce tedarikçilerden fiyat teklifi almak ister misin?
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="ghost"
                                    className="h-14 font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl"
                                    onClick={() => {
                                        setIsRFQPromptOpen(false);
                                        setView('supplier');
                                    }}
                                >
                                    Hayır, Direkt Yerleştir
                                </Button>
                                <Button
                                    className="h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100"
                                    onClick={() => {
                                        setIsRFQPromptOpen(false);
                                        setIsRFQDrawerOpen(true);
                                    }}
                                >
                                    Evet, RFQ Başlat
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Drawers */}
            {selectedItem && (
                <>
                    <RFQSupplierDrawer
                        isOpen={isRFQDrawerOpen}
                        onClose={() => setIsRFQDrawerOpen(false)}
                        satItem={selectedItem}
                        onSuccess={fetchInitialData}
                    />
                    <RFQReviewDrawer
                        isOpen={isRFQReviewOpen}
                        onClose={() => setIsRFQReviewOpen(false)}
                        satId={selectedItem.id}
                        onContinue={(supplierId) => {
                            setIsRFQReviewOpen(false);
                            if (supplierId) setAcceptedSupplierId(supplierId);
                            setView('supplier');
                        }}
                    />
                </>
            )}
        </div>
    );
}
