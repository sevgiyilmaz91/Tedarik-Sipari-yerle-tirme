import React, { useState, useEffect, useMemo } from 'react';
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
import { Filter, ChevronDown, ChevronUp, ChevronsUpDown, Check, ArrowLeft, Calendar, X } from 'lucide-react';
import { SupplierService } from '../services/supplierService';
import { CalendarService } from '../services/calendarService';
import type { SupplierCapacityItem, BandCalendarResponse } from '../types/supplier';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import '../pages/OrderPlacementPage.css';

interface SupplierCapacityGridProps {
    onBack: () => void;
    title?: string;
}

const multiSelectFilter: FilterFn<SupplierCapacityItem> = (row, id, filterValue) => {
    if (!filterValue || filterValue.length === 0) return true;
    const rowValue = row.getValue(id);
    if (Array.isArray(rowValue)) {
        return rowValue.some(v => filterValue.includes(String(v)));
    }
    return filterValue.includes(String(rowValue));
};

const rangeFilter: FilterFn<SupplierCapacityItem> = (row, id, filterValue) => {
    const [min, max] = filterValue as [number | undefined, number | undefined];
    const value = row.getValue(id) as number;
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
};

const SupplierCapacityGrid: React.FC<SupplierCapacityGridProps> = ({ onBack, title }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<SupplierCapacityItem[]>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [pageSize, setPageSize] = useState(20);

    // New states for selection and drawer
    const [selectedBand, setSelectedBand] = useState<SupplierCapacityItem | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [calendarData, setCalendarData] = useState<BandCalendarResponse | null>(null);
    const [isCalendarLoading, setIsCalendarLoading] = useState(false);

    // Order Placement Wizard States
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [startDate, setStartDate] = useState("2026-10-30");
    const [requiredQty, setRequiredQty] = useState(30000);
    const [dailyAssignments, setDailyAssignments] = useState<{ [key: string]: number }>({});
    const [temporaryAssignments, setTemporaryAssignments] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const capacities = await SupplierService.getSupplierCapacities();
        setData(capacities);
        setLoading(false);
    };

    // Watch selectedBand to update calendar data if drawer is open
    useEffect(() => {
        if (selectedBand && isDrawerOpen) {
            fetchCalendar();
            // Reset wizard and temporary assignments when changing band
            setIsWizardOpen(false);
            setTemporaryAssignments({});
        }
    }, [selectedBand, isDrawerOpen]);

    const fetchCalendar = async () => {
        if (!selectedBand) return;
        setIsCalendarLoading(true);
        try {
            const response = await CalendarService.getBandCalendar({
                season: selectedBand.season,
                supplierCode: selectedBand.supplierCode,
                productionType: selectedBand.productionType,
                line: (selectedBand as any).line || ""
            });
            setCalendarData(response);
        } catch (error) {
            console.error("Failed to fetch calendar", error);
        } finally {
            setIsCalendarLoading(false);
        }
    };

    const handleOpenCalendar = () => {
        if (!selectedBand) {
            alert("Lütfen bir tedarikçi/bant seçin.");
            return;
        }
        setIsDrawerOpen(true);
    };

    const handleAutoDistribute = () => {
        if (!selectedBand) return;

        const assignments: { [key: string]: number } = {};
        let remaining = requiredQty;
        let currentDate = new Date(startDate);
        const dailyCap = (selectedBand as any).allocatedCapacityForFlo || 0;

        // Simplified pre-planned logic for POC: 
        // 20% on Mon/Wed/Fri, 80% on Tue/Thu
        const getPrePlanned = (date: Date) => {
            const day = date.getDay();
            if (day === 2 || day === 4) return dailyCap * 0.8; // Tue, Thu
            if (day === 0 || day === 6) return 0; // Weekend
            return dailyCap * 0.2; // Mon, Wed, Fri
        };

        const isWeekend = (date: Date) => {
            const day = date.getDay();
            return day === 0 || day === 6;
        };

        let safetyCounter = 0;
        while (remaining > 0 && safetyCounter < 1000) {
            safetyCounter++;
            if (!isWeekend(currentDate)) {
                const dateKey = currentDate.toISOString().split('T')[0];
                const prePlanned = getPrePlanned(currentDate);
                const freeCap = Math.max(0, dailyCap - prePlanned);
                const toAssign = Math.min(remaining, freeCap);

                if (toAssign > 0) {
                    assignments[dateKey] = toAssign;
                    remaining -= toAssign;
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        setTemporaryAssignments(assignments);
        if (remaining > 0) {
            alert(`Dikkat: Kapasite yetersizliği nedeniyle ${remaining} adet yerleştirilemedi.`);
        }
    };

    const handleSavePlacement = () => {
        // Merge temporary into persistent state for this band
        setDailyAssignments(prev => ({ ...prev, ...temporaryAssignments }));
        setIsWizardOpen(false);
        setTemporaryAssignments({});
    };

    // Helper to get added quantity for a specific month
    const getAddedQtyForMonth = (monthName: string) => {
        const monthMap: { [key: string]: number } = {
            "Ocak": 0, "Şubat": 1, "Mart": 2, "Nisan": 3, "Mayıs": 4, "Haziran": 5,
            "Temmuz": 6, "Ağustos": 7, "Eylül": 8, "Ekim": 9, "Kasım": 10, "Aralık": 11
        };
        const targetMonthIdx = monthMap[monthName];

        let total = 0;
        const allAssignments = { ...dailyAssignments, ...temporaryAssignments };

        Object.entries(allAssignments).forEach(([dateStr, qty]) => {
            const d = new Date(dateStr);
            if (d.getMonth() === targetMonthIdx && d.getFullYear() === 2026) {
                total += qty;
            }
        });
        return total;
    };

    const getOccupancyClass = (planned: number, total: number) => {
        const ratio = planned / total;
        if (ratio < 0.6) return 'occupancy-low';
        if (ratio < 0.8) return 'occupancy-medium';
        if (ratio < 0.95) return 'occupancy-high';
        return 'occupancy-critical';
    };

    const columns = useMemo<ColumnDef<SupplierCapacityItem>[]>(() => [
        { accessorKey: 'season', header: 'Season', filterFn: multiSelectFilter },
        { accessorKey: 'supplierCode', header: 'SupplierCode' },
        { accessorKey: 'supplierName', header: 'SupplierName' },
        { accessorKey: 'productMainGroup', header: 'ProductMainGroup', filterFn: multiSelectFilter },
        { accessorKey: 'productionType', header: 'ProductionType', filterFn: multiSelectFilter },
        { accessorKey: 'line', header: 'Line' },
        { accessorKey: 'theoreticalCapacity', header: 'TheoreticalCapacity', filterFn: rangeFilter },
        { accessorKey: 'allocatedCapacityForFlo', header: 'AllocatedCapacityForFlo', filterFn: rangeFilter },
        {
            accessorKey: 'isSingleProduction',
            header: 'IsSingleProduction',
            cell: info => info.getValue() ? 'Evet' : 'Hayır'
        },
        {
            accessorKey: 'productGroups',
            header: 'ProductGroups',
            cell: info => (
                <div className="tag-container">
                    {(info.getValue() as string[]).map(tag => <span key={tag} className="tag-chip">{tag}</span>)}
                </div>
            ),
            filterFn: multiSelectFilter
        },
        {
            accessorKey: 'brands',
            header: 'Brands',
            cell: info => (
                <div className="tag-container">
                    {(info.getValue() as string[]).map(tag => <span key={tag} className="tag-chip">{tag}</span>)}
                </div>
            ),
            filterFn: multiSelectFilter
        },
        {
            accessorKey: 'categories',
            header: 'Categories',
            cell: info => (
                <div className="tag-container">
                    {(info.getValue() as string[]).map(tag => <span key={tag} className="tag-chip">{tag}</span>)}
                </div>
            ),
            filterFn: multiSelectFilter
        },
        {
            accessorKey: 'stockGroups',
            header: 'StockGroups',
            cell: info => (
                <div className="tag-container">
                    {(info.getValue() as string[]).map(tag => <span key={tag} className="tag-chip">{tag}</span>)}
                </div>
            ),
            filterFn: multiSelectFilter
        },
        {
            accessorKey: 'classificationGroups',
            header: 'ClassificationGroups',
            cell: info => (
                <div className="tag-container">
                    {(info.getValue() as string[]).map(tag => <span key={tag} className="tag-chip">{tag}</span>)}
                </div>
            ),
            filterFn: multiSelectFilter
        },
        {
            accessorKey: 'upperMaterials',
            header: 'UpperMaterials',
            cell: info => (
                <div className="tag-container">
                    {(info.getValue() as string[]).map(tag => <span key={tag} className="tag-chip">{tag}</span>)}
                </div>
            ),
            filterFn: multiSelectFilter
        },
        {
            accessorKey: 'soleMaterials',
            header: 'SoleMaterials',
            cell: info => (
                <div className="tag-container">
                    {(info.getValue() as string[]).map(tag => <span key={tag} className="tag-chip">{tag}</span>)}
                </div>
            ),
            filterFn: multiSelectFilter
        },
    ], [data]);

    const table = useReactTable({
        data,
        columns,
        state: { columnFilters },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    useEffect(() => { table.setPageSize(pageSize); }, [pageSize]);

    const getUniqueValues = (field: keyof SupplierCapacityItem) => {
        const values = new Set<string>();
        data.forEach(item => {
            const val = item[field];
            if (Array.isArray(val)) val.forEach(v => values.add(String(v)));
            else if (val !== undefined && val !== null) values.add(String(val));
        });
        return Array.from(values).filter(Boolean).sort();
    };

    const renderFilterUI = (column: any) => {
        const columnId = column.id as keyof SupplierCapacityItem;
        const currentFilter: any = column.getFilterValue();
        const firstRowValue = data[0] ? (data[0] as any)[columnId] : undefined;
        const type = typeof firstRowValue;
        const isNumeric = type === 'number';
        const isCategoric = !!column.columnDef.filterFn && column.columnDef.filterFn === multiSelectFilter;

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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const nextValues = isChecked
                                                ? (currentFilter as string[]).filter(v => v !== val)
                                                : [...(currentFilter as string[] || []), val];
                                            column.setFilterValue(nextValues.length ? nextValues : undefined);
                                        }}
                                    >
                                        <div className="checkbox-box">{isChecked && <Check size={12} />}</div>
                                        <span>{val}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : isNumeric ? (
                        <div className="filter-range-inputs" onClick={e => e.stopPropagation()}>
                            <div className="range-input-group">
                                <label>Min</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={(currentFilter as [number, number])?.[0] || ''}
                                    onChange={e => column.setFilterValue((prev: any) => [e.target.value ? Number(e.target.value) : undefined, prev?.[1]])}
                                />
                            </div>
                            <div className="range-input-group">
                                <label>Max</label>
                                <input
                                    type="number"
                                    placeholder="99999"
                                    value={(currentFilter as [number, number])?.[1] || ''}
                                    onChange={e => column.setFilterValue((prev: any) => [prev?.[0], e.target.value ? Number(e.target.value) : undefined])}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="filter-search-input" onClick={e => e.stopPropagation()}>
                            <Input
                                placeholder="Arayın..."
                                value={(currentFilter as string) || ''}
                                onChange={e => column.setFilterValue(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="filter-popup-footer">
                        <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            column.setFilterValue(undefined);
                        }}>Temizle</Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
        <div className="supplier-grid-view">
            <div className="supplier-grid-header">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={18} />
                    Geri Dön
                </button>
                <div style={{ flex: 1 }}>
                    <h2>{title || 'Tedarikçi Kapasiteleri'}</h2>
                </div>
                <div className="grid-actions-wrapper" style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="calendar-trigger-btn"
                        onClick={() => {
                            if (!selectedBand) {
                                alert("Lütfen bir tedarikçi/bant seçin.");
                                return;
                            }
                            setIsDrawerOpen(true);
                            setIsWizardOpen(true);
                        }}
                        style={{ background: '#10b981' }}
                    >
                        <Check size={18} />
                        Sipariş Yerleştir
                    </button>
                    <button className="calendar-trigger-btn" onClick={handleOpenCalendar}>
                        <Calendar size={18} />
                        Takvim
                    </button>
                </div>
            </div>

            <div className="table-container">
                {loading && <div className="loading-overlay"><div className="spinner"></div></div>}

                <table className="data-table">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}>
                                        <div className="header-content">
                                            <div className="header-sort" onClick={header.column.getToggleSortingHandler()}>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {{
                                                    asc: <ChevronUp size={14} />,
                                                    desc: <ChevronDown size={14} />,
                                                }[header.column.getIsSorted() as string] ?? <ChevronsUpDown size={12} className="sort-icon-muted" />}
                                            </div>
                                            {renderFilterUI(header.column)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr
                                key={row.id}
                                className={`clickable ${selectedBand?.id === (row.original as SupplierCapacityItem).id ? 'row-selected' : ''}`}
                                onClick={() => setSelectedBand(row.original as SupplierCapacityItem)}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && data.length === 0 && <div className="empty-state">Kayıt bulunamadı.</div>}
            </div>

            <div className="pagination-container">
                <div className="pagination-info-text">
                    Sayfa Boyutu
                    <select className="page-size-select" value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                        {[10, 20, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="pagination-center">
                    <span>{table.getFilteredRowModel().rows.length} Kayıt</span>
                </div>
                <div className="pagination-controls-right">
                    <button className="pagination-arrow" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>&lt;</button>
                    <span className="pagination-page-info">Sayfa {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}</span>
                    <button className="pagination-arrow" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>&gt;</button>
                </div>
            </div>

            {/* Side Drawer Component */}
            <div className={`side-drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)} />
            <div className={`side-drawer ${isDrawerOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <div className="drawer-title-group">
                        <h3 className="drawer-title">Kapasite Takvimi</h3>
                        <span className="drawer-subtitle">
                            {selectedBand?.supplierName} · {selectedBand?.productionType} · {(selectedBand as any)?.line || "—"}
                        </span>
                    </div>
                    <div className="header-actions">
                        {!isWizardOpen && (
                            <button className="place-order-trigger-btn" onClick={() => setIsWizardOpen(true)}>
                                Sipariş Yerleştir
                            </button>
                        )}
                        <button className="close-drawer-btn" onClick={() => setIsDrawerOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {isWizardOpen && (
                    <div className="order-placement-overlay">
                        <div className="wizard-step">
                            <h4 className="wizard-title">Sipariş Yerleştirme</h4>
                            <div className="wizard-field">
                                <label className="wizard-label">Üretimin başlayacağı tarih</label>
                                <input
                                    type="date"
                                    className="wizard-input"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <p className="wizard-help">Otomatik dağıtım bu başlangıç tarihinden itibaren kapasiteye göre gün gün planlar.</p>
                            </div>
                            <div className="wizard-field">
                                <label className="wizard-label">Sipariş Miktarı (Çift)</label>
                                <input
                                    type="number"
                                    className="wizard-input"
                                    value={requiredQty}
                                    onChange={(e) => setRequiredQty(Number(e.target.value))}
                                />
                            </div>
                            <button className="auto-distribute-btn" onClick={handleAutoDistribute}>
                                Otomatik Dağıt (Başlangıca göre)
                            </button>
                            <div className="wizard-footer">
                                <button className="wizard-cancel-btn" onClick={() => { setIsWizardOpen(false); setTemporaryAssignments({}); }}>
                                    Vazgeç
                                </button>
                                <button className="wizard-save-btn" onClick={handleSavePlacement}>
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="drawer-content">
                    {selectedBand && (
                        <>
                            <div className="capacity-stats">
                                <div className="stat-card">
                                    <span className="stat-label">Günlük Kapasite</span>
                                    <span className="stat-value">{((selectedBand as any).allocatedCapacityForFlo || 0).toLocaleString()} Çift</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Aylık Kapasite (22G)</span>
                                    <span className="stat-value">{(((selectedBand as any).allocatedCapacityForFlo || 0) * 22).toLocaleString()} Çift</span>
                                </div>
                            </div>

                            <div className="heatmap-section">
                                <h4 className="section-title">12 Aylık Doluluk Görünümü</h4>
                                <div className="heatmap-grid">
                                    {isCalendarLoading ? (
                                        <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '20px' }}>Yükleniyor...</div>
                                    ) : calendarData?.monthlyData.map(m => {
                                        const monthlyCap = ((selectedBand as any).allocatedCapacityForFlo || 0) * 22;
                                        const addedQty = getAddedQtyForMonth(m.month);
                                        const totalPlanned = m.plannedQuantity + addedQty;
                                        const percentage = Math.round((totalPlanned / monthlyCap) * 100);
                                        return (
                                            <div
                                                key={m.month}
                                                className={`heatmap-cell ${getOccupancyClass(totalPlanned, monthlyCap)}`}
                                                title={`${m.month}: ${totalPlanned.toLocaleString()} / ${monthlyCap.toLocaleString()} (${percentage}%)`}
                                            >
                                                <span className="heatmap-month">{m.month}</span>
                                                <span className="heatmap-percentage">%{percentage}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="calendar-table-section">
                                <h4 className="section-title">Aylık Detay Listesi</h4>
                                <table className="calendar-mini-table">
                                    <thead>
                                        <tr>
                                            <th>Ay</th>
                                            <th>Kapasite</th>
                                            <th>Planlanan</th>
                                            <th>Kalan</th>
                                            <th>Doluluk</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {calendarData?.monthlyData.map(m => {
                                             const monthlyCap = ((selectedBand as any).allocatedCapacityForFlo || 0) * 22;
                                            const addedQty = getAddedQtyForMonth(m.month);
                                            const totalPlanned = m.plannedQuantity + addedQty;
                                            const remaining = monthlyCap - totalPlanned;
                                            const util = Math.round((totalPlanned / monthlyCap) * 100);
                                            return (
                                                <tr key={m.month}>
                                                    <td>{m.month}</td>
                                                    <td>{monthlyCap.toLocaleString()}</td>
                                                    <td>{totalPlanned.toLocaleString()}</td>
                                                    <td style={{ color: remaining < 0 ? '#ef4444' : 'inherit' }}>
                                                        {remaining.toLocaleString()}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div className="utilization-bar-bg">
                                                                <div
                                                                    className="utilization-bar-fill"
                                                                    style={{
                                                                        width: `${Math.min(util, 100)}%`,
                                                                        background: util > 95 ? '#ef4444' : util > 80 ? '#f97316' : '#6D28D9'
                                                                    }}
                                                                />
                                                            </div>
                                                            <span>%{util}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupplierCapacityGrid;
