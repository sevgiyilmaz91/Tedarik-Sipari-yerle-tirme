import React, { useState, useEffect, useMemo } from 'react';
import { SupplierService } from '../services/supplierService';
import type { OrderPlacementItem } from '../types/orderPlacement';
import type { SupplierCapacityItem } from '../types/supplier';
import { ArrowLeft, Check, Trash2, Calendar as CalendarIcon, Folder, X, Star } from 'lucide-react';
import { toast } from 'sonner';
import './SuitableSuppliersView.css';

import { DistributionService } from '../services/distributionService';
import type { DistributionRecord } from '../services/distributionService';

interface SuitableSuppliersViewProps {
    satItem?: OrderPlacementItem;
    onBack: () => void;
    restrictedSupplierId?: string;
}

interface DaySlot {
    date: Date;
    dayKey: string;
    isWeekend: boolean;
}

const monthsTR = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

const SuitableSuppliersView: React.FC<SuitableSuppliersViewProps> = ({ satItem, onBack, restrictedSupplierId }) => {
    const [loading, setLoading] = useState(true);
    const [suppliers, setSuppliers] = useState<SupplierCapacityItem[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierCapacityItem | null>(null);

    // Planning States
    const [startDateSelection, setStartDateSelection] = useState<string | null>(null);
    const [assignedSlots, setAssignedSlots] = useState<Record<string, number>>({});
    const [savedAssignments, setSavedAssignments] = useState<Record<string, number>>({});
    const [activeMonthTab, setActiveMonthTab] = useState<number>(0);
    const [overviewTab, setOverviewTab] = useState<'heatmap' | 'details'>('heatmap');

    // Modal States
    const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
    const [distributionQty, setDistributionQty] = useState<number>(satItem?.pairQuantity || 0);
    const [selectedBandId, setSelectedBandId] = useState<string>('all');

    const hasExistingDistribution = useMemo(() => {
        if (!satItem?.id) return false;
        return DistributionService.getRecords().some(r => String(r.satId) === String(satItem.id));
    }, [savedAssignments, satItem?.id]);

    useEffect(() => {
        loadSavedAssignments();
    }, [satItem]);

    const loadSavedAssignments = () => {
        const records = DistributionService.getRecords();
        const assignments: Record<string, number> = {};
        records.forEach(r => {
            if (r.dailyAssignments) {
                Object.entries(r.dailyAssignments).forEach(([key, val]) => {
                    assignments[key] = (assignments[key] || 0) + val;
                });
            }
        });
        setSavedAssignments(assignments);
    };

    useEffect(() => {
        if (satItem) {
            setDistributionQty(satItem.pairQuantity);
            fetchSuppliers();
        } else {
            setLoading(false);
        }
    }, [satItem, restrictedSupplierId]);

    const fetchSuppliers = async () => {
        if (!satItem) return;
        setLoading(true);

        // 1. Get filtered list
        let data = await SupplierService.getSuitableSuppliers(satItem);

        // 2. If we have a restriction (accepted offer), show ONLY that supplier
        if (restrictedSupplierId) {
            // Try in current filtered list first
            let target = data.find(s => s.id === restrictedSupplierId);

            if (!target) {
                // Not in filtered list, try in ALL suppliers
                const allSuppliers = await SupplierService.getSupplierCapacities();
                target = allSuppliers.find(s => s.id === restrictedSupplierId);

                // Last resort: If ID changed (mock data), try finding by name if we have it? 
                // We don't have the name here easily, but we can assume ID should usually work.
                // Let's at least make sure data is updated.
                data = target ? [target] : [];
            } else {
                data = [target];
            }
        }
        // 3. Otherwise, if there is an assigned supplier, ensure it's in the list
        else if (satItem.assignedSupplierName) {
            const isAlreadyInList = data.find(s => s.supplierName === satItem.assignedSupplierName);
            if (!isAlreadyInList) {
                const allSuppliers = await SupplierService.getSupplierCapacities();
                const assignedSupplier = allSuppliers.find(s => s.supplierName === satItem.assignedSupplierName);
                if (assignedSupplier) {
                    data = [assignedSupplier, ...data];
                }
            }
        }

        setSuppliers(data);

        // 4. Default selection logic
        if (data.length > 0) {
            // Set the first one as selected by default
            const newSelection = data[0];
            setSelectedSupplier(newSelection);

            // Set first band or 'all'
            if (newSelection.bands && newSelection.bands.length > 0) {
                setSelectedBandId('all');
            }
        } else {
            setSelectedSupplier(null);
        }

        setLoading(false);
    };

    const t1DateObj = useMemo(() => {
        if (!satItem) return new Date();
        const parts = satItem.t1Date.split('.');
        if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return new Date();
    }, [satItem]);

    const displayMonths = useMemo(() => {
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
    }, [t1DateObj]);

    useEffect(() => {
        if (displayMonths.length > 0) setActiveMonthTab(0);
    }, [displayMonths]);

    const getBandMetrics = (supplier: SupplierCapacityItem, band: any, month: number, year: number, day: number, dayKey: string) => {
        const isWeekend = new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6;
        if (isWeekend) return { preUsed: 0, dailyCap: band.allocatedCapacityForFlo };

        const dailyCap = band.allocatedCapacityForFlo;
        let preUsed = 0;
        const isSecondMonth = displayMonths.length > 1 &&
            month === displayMonths[1].month &&
            year === displayMonths[1].year;

        if (!isSecondMonth) {
            const seed = parseInt(supplier.supplierCode.slice(-3)) + month + day + (band.id.includes('B2') ? 10 : 0);
            const randomValue = (Math.sin(seed) + 1) / 2;
            if (randomValue > 0.4) {
                preUsed = Math.floor(dailyCap * (0.3 + randomValue * 0.5));
            } else if (randomValue > 0.2) {
                preUsed = Math.floor(dailyCap * 0.15);
            }
        }

        const savedKey = `${supplier.id}_${band.id}_${dayKey}`;
        const savedVal = savedAssignments[savedKey] || 0;

        // Check if this SAT is already assigned here
        const records = DistributionService.getRecords();
        const curSatRecord = records.find(r => r.satId === satItem?.id);
        let curSatVal = 0;
        if (curSatRecord?.dailyAssignments) {
            curSatVal = curSatRecord.dailyAssignments[savedKey] || 0;
        }

        preUsed += savedVal;

        return { preUsed, dailyCap, curSatVal };
    };

    const generateMonthSlots = (month: number, year: number) => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const slots: DaySlot[] = [];

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dayKey = `${year}-${month + 1}-${d}`;
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            slots.push({
                date,
                dayKey,
                isWeekend
            });
        }
        return slots;
    };

    const getAssignedForBand = (bandId: string, dayKey: string) => {
        return assignedSlots[`${bandId}_${dayKey}`] || 0;
    };

    const handleAutoDistribute = () => {
        if (!satItem || !startDateSelection || !selectedSupplier || !selectedBandId) {
            toast.error("Gerekli bilgiler eksik. Başlangıç tarihi seçtiğinizden emin olun.");
            return;
        }

        toast.info("Dağıtım hesaplanıyor...");
        let remaining = distributionQty;
        // Start with a clean state for the NEW assignments being calculated now
        const newAssignments: Record<string, number> = {};

        const bandsToUse = selectedBandId === 'all'
            ? selectedSupplier.bands
            : [selectedSupplier.bands.find(b => b.id === selectedBandId)!];

        const daysToProcess: any[] = [];
        displayMonths.forEach(m => {
            const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(m.year, m.month, d);
                const dayKey = `${m.year}-${m.month + 1}-${d}`;
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                daysToProcess.push({ dayKey, isWeekend, month: m.month, year: m.year, day: d });
            }
        });

        const startIndex = daysToProcess.findIndex(d => d.dayKey === startDateSelection);
        if (startIndex === -1) {
            toast.error("Seçili tarih bulunamadı.");
            return;
        }

        for (let i = startIndex; i < daysToProcess.length && remaining > 0; i++) {
            const day = daysToProcess[i];
            if (day.isWeekend) continue;

            for (const band of bandsToUse) {
                if (remaining <= 0) break;

                const dailyCap = band.allocatedCapacityForFlo;

                // Simulate pre-used logic consistent with generateMonthSlots
                let preUsed = 0;
                const isSecondMonth = displayMonths.length > 1 &&
                    day.month === displayMonths[1].month &&
                    day.year === displayMonths[1].year;

                if (!isSecondMonth) {
                    const seed = parseInt(selectedSupplier.supplierCode.slice(-3)) + day.month + day.day + (band.id.includes('B2') ? 10 : 0);
                    const randomValue = (Math.sin(seed) + 1) / 2;
                    if (randomValue > 0.4) {
                        preUsed = Math.floor(dailyCap * (0.3 + randomValue * 0.5));
                    } else if (randomValue > 0.2) {
                        preUsed = Math.floor(dailyCap * 0.15);
                    }
                }

                const savedKey = `${selectedSupplier.id}_${band.id}_${day.dayKey}`;
                preUsed += savedAssignments[savedKey] || 0;

                const freeSpace = Math.max(0, dailyCap - preUsed);
                if (freeSpace <= 0) continue;

                const toAssign = Math.min(remaining, freeSpace);
                newAssignments[`${band.id}_${day.dayKey}`] = toAssign;
                remaining -= toAssign;
            }
        }

        setAssignedSlots(newAssignments);
        setIsAutoModalOpen(false);
        if (remaining > 0) {
            toast.warning(`Kapasite yetmedi. ${remaining} adet açıkta kaldı.`);
        } else {
            toast.success("Otomatik yerleştirme tamamlandı.");
        }
    };

    const handleClear = () => {
        setAssignedSlots({});
        setStartDateSelection(null);
    };

    const handleSave = () => {
        if (!selectedSupplier || !selectedBandId || Object.keys(assignedSlots).length === 0) {
            toast.error("Kaydedilecek bir yerleştirme yok.");
            return;
        }

        const newSaved = { ...savedAssignments };
        Object.entries(assignedSlots).forEach(([combinedKey, val]) => {
            const [bandId, ...rest] = combinedKey.split('_');
            const dayKey = rest.join('_');
            const savedKey = `${selectedSupplier.id}_${bandId}_${dayKey}`;
            newSaved[savedKey] = (newSaved[savedKey] || 0) + val;
        });

        setSavedAssignments(newSaved);

        const sortedDayKeys = Array.from(new Set(Object.keys(assignedSlots).map(k => k.split('_').slice(1).join('_')))).sort((a, b) => a.localeCompare(b));
        const start = sortedDayKeys[0];
        const end = sortedDayKeys[sortedDayKeys.length - 1];
        const totalQty = Object.values(assignedSlots).reduce((a: number, b: number) => a + b, 0);

        const monthlyBreakdown: Record<string, number> = {};
        Object.entries(assignedSlots).forEach(([combinedKey, val]) => {
            const dayKey = combinedKey.split('_').slice(1).join('_');
            const parts = dayKey.split('-');
            const mKey = `${parts[0]}-${parts[1]}`;
            monthlyBreakdown[mKey] = (monthlyBreakdown[mKey] || 0) + val;
        });

        const currentSatDailyAssignments: Record<string, number> = {};
        Object.entries(assignedSlots).forEach(([combinedKey, val]) => {
            const [bandId, ...rest] = combinedKey.split('_');
            const dayKey = rest.join('_');
            const savedKey = `${selectedSupplier.id}_${bandId}_${dayKey}`;
            currentSatDailyAssignments[savedKey] = val;
        });

        const activeBands = selectedBandId === 'all'
            ? selectedSupplier.bands.map(b => b.line).join(', ')
            : (selectedSupplier.bands.find(b => b.id === selectedBandId)?.line || 'Unknown');

        const newRecord: DistributionRecord = {
            id: Math.random().toString(36).substr(2, 9),
            modelName: satItem?.modelName || 'Unknown',
            brandName: satItem?.brandName || 'Unknown',
            supplierName: selectedSupplier.supplierName,
            line: activeBands,
            quantity: totalQty,
            startDate: start,
            endDate: end,
            duration: sortedDayKeys.length,
            monthlyBreakdown,
            satId: satItem?.id,
            dailyAssignments: currentSatDailyAssignments
        };

        DistributionService.addRecord(newRecord);
        toast.success("Yerleştirme başarıyla kaydedildi.");
        loadSavedAssignments();

        setAssignedSlots({});
        setStartDateSelection(null);
    };

    const handleDeleteDistribution = () => {
        if (!satItem?.id) return;
        DistributionService.removeRecordBySatId(satItem.id);
        toast.success("Dağıtım silindi.");
        loadSavedAssignments();
        setAssignedSlots({});
        setStartDateSelection(null);
    };

    const groupedSuppliers = suppliers.reduce((acc: Record<string, SupplierCapacityItem[]>, curr: SupplierCapacityItem) => {
        if (!acc[curr.productionType]) acc[curr.productionType] = [];
        acc[curr.productionType].push(curr);
        return acc;
    }, {});

    return (
        <div className="suitable-suppliers-container">
            {isAutoModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setIsAutoModalOpen(false)}>
                            <X size={24} />
                        </button>
                        <div className="modal-header">
                            <div className="modal-icon-bg">
                                <Folder size={32} />
                            </div>
                            <h3>Otomatik Yerleştir</h3>
                            <p>Lütfen yerleştirilecek miktar ve bant seçimini yapın.</p>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Miktar</label>
                                <input
                                    type="number"
                                    className="modal-input"
                                    placeholder="Miktar yazın..."
                                    value={distributionQty}
                                    onChange={(e) => setDistributionQty(Number(e.target.value))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Bant seçimi</label>
                                <select
                                    className="modal-select"
                                    value={selectedBandId}
                                    onChange={(e) => setSelectedBandId(e.target.value)}
                                >
                                    <option value="all">Tüm Bantlara Dağıt</option>
                                    {selectedSupplier?.bands.map(b => (
                                        <option key={b.id} value={b.id}>{b.line}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-cancel" onClick={() => setIsAutoModalOpen(false)}>Vazgeç</button>
                                <button className="btn-confirm" onClick={handleAutoDistribute}>Kaydet</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="suitable-suppliers-header">
                <div className="header-top-row">
                    <button className="back-btn" onClick={onBack}>
                        <ArrowLeft size={20} />
                    </button>
                    {satItem && (
                        <div className="sat-summary">
                            <div className="sat-summary-item">
                                <span className="label">Sat No</span>
                                <span className="value">{satItem.purchaseRequest}</span>
                            </div>
                            <div className="sat-summary-item">
                                <span className="label">Generic</span>
                                <span className="value">{satItem.genericModel}</span>
                            </div>
                            <div className="sat-summary-item">
                                <span className="label">Miktar</span>
                                <span className="value">{satItem.pairQuantity}</span>
                            </div>
                            <div className="sat-summary-item">
                                <span className="label">T1 Tarihi</span>
                                <span className="value">{satItem.t1Date}</span>
                            </div>
                            {satItem.assignedSupplierName && (
                                <div className="sat-summary-item" style={{ borderLeft: '2px solid #fdba74', paddingLeft: '16px', marginLeft: '16px' }}>
                                    <span className="label" style={{ color: '#ea580c' }}>Mevcut Tedarikçi</span>
                                    <span className="value" style={{ color: '#ea580c' }}>{satItem.assignedSupplierName}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="suitable-suppliers-content">
                <div className="suppliers-list-panel">
                    <div className="panel-title-row">
                        <h3>Uygun Tedarikçiler</h3>
                    </div>

                    {loading ? (
                        <div className="loading-state"><div className="spinner"></div></div>
                    ) : (
                        <div className="grouped-list">
                            {Object.entries(groupedSuppliers).map(([type, items]: [string, any]) => (
                                <React.Fragment key={type}>
                                    {items.map((s: SupplierCapacityItem) => (
                                        <div
                                            key={s.id}
                                            className={`supplier-row-mini ${selectedSupplier?.id === s.id ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedSupplier(s);
                                                setSelectedBandId(s.bands[0].id);
                                                handleClear();
                                            }}
                                        >
                                            <div className="sup-main">
                                                <div className="sup-header">
                                                    <span className="sup-name">{s.supplierName}</span>
                                                    <div className="sup-rating">
                                                        <Star size={10} className="fill-amber-400 text-amber-400" />
                                                        <span>{s.rating || '9.2'}</span>
                                                    </div>
                                                </div>
                                                <div className="sup-badges">
                                                    <span className={`gbb-badge gbb-${(s.gbb || 'Good').toLowerCase()}`}>{s.gbb || 'Good'}</span>
                                                    <span className="type-badge">{s.productionType}</span>
                                                </div>
                                                <div className="sup-meta">
                                                    <span>{s.productMainGroup}</span>
                                                </div>
                                            </div>
                                            <div className="sup-caps">
                                                {s.bands.map(b => (
                                                    <div key={b.id} className="sup-cap">
                                                        <span className="cap-label">{b.line.toUpperCase()}</span>
                                                        <div className="cap-values">
                                                            <span>KAP</span> <strong>{b.theoreticalCapacity}</strong>
                                                            <span className="separator">-</span>
                                                            <span>FLO</span> <strong>{b.allocatedCapacityForFlo}</strong>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>

                <div className="calendar-panel-daily">
                    {!selectedSupplier ? (
                        <div className="empty-calendar-state">
                            <CalendarIcon size={48} />
                            <p>Lütfen bir tedarikçi hattı seçin.</p>
                        </div>
                    ) : (
                        <div className="daily-calendar-wrapper">
                            <div className="calendar-action-bar">
                                <div className="selected-info-expanded">
                                    <div className="selected-sup-title-group">
                                        <h3>{selectedSupplier.supplierName}</h3>
                                        <div className="selected-sup-meta">
                                            <span className={`gbb-badge gbb-${(selectedSupplier.gbb || 'Good').toLowerCase()}`}>{selectedSupplier.gbb || 'Good'}</span>
                                            <span className="type-badge">{selectedSupplier.productionType}</span>
                                            <span className="group-badge">{selectedSupplier.productMainGroup}</span>
                                            <div className="rating-badge">
                                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                                <span>{selectedSupplier.rating}/10</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cap-summary-mini">
                                        {selectedSupplier.bands.map(b => (
                                            <div key={b.id} className="band-row">
                                                <span>{b.line.toUpperCase()} KAP <strong>{b.theoreticalCapacity}</strong></span>
                                                <span className="separator">-</span>
                                                <span>FLO <strong>{b.allocatedCapacityForFlo}</strong></span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="action-buttons">
                                    <button
                                        className="btn-base btn-delete"
                                        onClick={handleDeleteDistribution}
                                        disabled={!hasExistingDistribution}
                                    >
                                        <Trash2 size={18} />
                                        Dağıtımı Sil
                                    </button>
                                    <button className="btn-base btn-clear" onClick={handleClear}>
                                        <X size={18} />
                                        Seçimi Temizle
                                    </button>
                                    <button
                                        className="btn-base btn-auto"
                                        onClick={() => {
                                            if (!startDateSelection) {
                                                toast.error("Lütfen önce takvimden bir başlangıç tarihi seçin.");
                                                return;
                                            }
                                            setIsAutoModalOpen(true);
                                        }}
                                    >
                                        <CalendarIcon size={18} />
                                        Otomatik Yerleştir
                                    </button>
                                    <button className="btn-base btn-save" onClick={handleSave}>
                                        <Check size={18} />
                                        Kaydet
                                    </button>
                                </div>
                            </div>

                            <div className="calendar-tabs">
                                {displayMonths.map((m, idx) => (
                                    <button
                                        key={`${m.year}-${m.month}`}
                                        className={`tab-btn ${activeMonthTab === idx ? 'active' : ''}`}
                                        onClick={() => setActiveMonthTab(idx)}
                                    >
                                        {monthsTR[m.month].toUpperCase()}
                                        {activeMonthTab === idx && <span className="tab-badge">%20</span>}
                                    </button>
                                ))}
                            </div>

                            <div className="daily-grid-container">
                                {displayMonths.map(({ month, year }: any, idx) => {
                                    if (idx !== activeMonthTab) return null;
                                    const slots = generateMonthSlots(month, year);

                                    return (
                                        <div key={`${year}-${month}`} className="month-section">
                                            <div className="day-grid">
                                                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(h => (
                                                    <div key={h} className="day-header">{h.toUpperCase()}</div>
                                                ))}
                                                {Array.from({ length: (new Date(year, month, 1).getDay() + 6) % 7 }).map((_, i) => (
                                                    <div key={`empty-${i}`} className="day-slot empty"></div>
                                                ))}
                                                {slots.map(slot => {
                                                    const isSelected = startDateSelection === slot.dayKey;

                                                    return (
                                                        <div
                                                            key={slot.dayKey}
                                                            className={`day-slot ${slot.isWeekend ? 'weekend' : ''} ${isSelected ? 'selected' : ''}`}
                                                            onClick={() => {
                                                                if (slot.isWeekend) return;
                                                                setStartDateSelection(slot.dayKey);
                                                                setAssignedSlots({});
                                                            }}
                                                        >
                                                            <div className="date-info">
                                                                <span>{slot.date.getDate()}</span>
                                                                <span className="month-name">{monthsTR[month].toUpperCase()}</span>
                                                            </div>
                                                            {!slot.isWeekend && (
                                                                <div className="slot-metrics">
                                                                    {selectedSupplier.bands.map((b, bIdx) => {
                                                                        const isCurrentBand = selectedBandId === 'all' || b.id === selectedBandId;
                                                                        const bandAssigned = getAssignedForBand(b.id, slot.dayKey);
                                                                        const { preUsed, dailyCap, curSatVal = 0 } = getBandMetrics(selectedSupplier, b, month, year, slot.date.getDate(), slot.dayKey);
                                                                        const totalUsed = isCurrentBand ? (preUsed + bandAssigned) : (preUsed);
                                                                        const occRate = totalUsed / dailyCap;
                                                                        let occClass = '';
                                                                        if (isCurrentBand) {
                                                                            if ((curSatVal || 0) > 0) occClass = 'occ-current-sat';
                                                                            else if (occRate >= 1) occClass = 'occ-full';
                                                                            else if (bandAssigned > 0) occClass = 'occ-assigned';
                                                                        }

                                                                        return (
                                                                            <React.Fragment key={b.id}>
                                                                                {bIdx > 0 && <div className="bant-divider" />}
                                                                                <div className={`bant-section ${isCurrentBand ? 'active-bant' : 'inactive-bant'} ${occClass}`}>
                                                                                    <div className="metric-row">
                                                                                        <span className="label">D</span>
                                                                                        <span className="value">
                                                                                            {Math.round(totalUsed)}
                                                                                            {isCurrentBand && bandAssigned > 0 && (
                                                                                                <span className="assigned-plus">+{bandAssigned}</span>
                                                                                            )}
                                                                                        </span>
                                                                                        <span className={`bant-badge ${bIdx === 0 ? 'bant-b1' : 'bant-b2'}`}>
                                                                                            {bIdx === 0 ? 'B1' : 'B2'}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="metric-row">
                                                                                        <span className="label">KAP</span>
                                                                                        <span className="value">{dailyCap}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </React.Fragment>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="overview-section-v2">
                                <div className="overview-header-tabs">
                                    <button
                                        className={`overview-tab ${overviewTab === 'heatmap' ? 'active' : ''}`}
                                        onClick={() => setOverviewTab('heatmap')}
                                    >
                                        12 Aylık Görünüm
                                    </button>
                                    <button
                                        className={`overview-tab ${overviewTab === 'details' ? 'active' : ''}`}
                                        onClick={() => setOverviewTab('details')}
                                    >
                                        Detaylar
                                    </button>
                                </div>

                                {overviewTab === 'heatmap' ? (
                                    <div className="heatmap-grid-v2">
                                        {monthsTR.map((monthName, idx) => {
                                            const year = 2026;
                                            let totalCap = 0;
                                            let totalPlanned = 0;

                                            const dmIdx = displayMonths.findIndex((dm: any) => dm.month === idx && dm.year === year);
                                            if (dmIdx !== -1) {
                                                const daysInMonth = new Date(year, idx + 1, 0).getDate();
                                                for (let d = 1; d <= daysInMonth; d++) {
                                                    const dayKey = `${year}-${idx + 1}-${d}`;
                                                    selectedSupplier.bands.forEach(b => {
                                                        const { preUsed, dailyCap } = getBandMetrics(selectedSupplier, b, idx, year, d, dayKey);
                                                        totalCap += dailyCap;
                                                        totalPlanned += preUsed;
                                                    });
                                                }
                                            } else {
                                                const seed = parseInt(selectedSupplier.supplierCode.slice(-3)) + idx;
                                                const randomOcc = 5 + (Math.sin(seed) * 40 + 40);
                                                const avgDays = 22;
                                                selectedSupplier.bands.forEach(b => {
                                                    const cap = b.allocatedCapacityForFlo * avgDays;
                                                    totalCap += cap;
                                                    totalPlanned += Math.round(cap * (randomOcc / 100));
                                                });
                                            }

                                            const remaining = totalCap - totalPlanned;
                                            const occupancy = totalCap > 0 ? Math.round((totalPlanned / totalCap) * 100) : 0;

                                            const getHeatmapClass = (occ: number) => {
                                                if (occ < 60) return 'occ-low';
                                                if (occ < 80) return 'occ-medium';
                                                if (occ < 95) return 'occ-high';
                                                return 'occ-critical';
                                            };

                                            return (
                                                <div key={monthName} className={`heatmap-box ${getHeatmapClass(occupancy)}`}>
                                                    <div className="h-header">
                                                        <span className="h-month">{monthName.toUpperCase()}</span>
                                                        <span className="h-percent">%{occupancy}</span>
                                                    </div>
                                                    <div className="h-stats">
                                                        <div className="h-stat-row">
                                                            <span className="h-label">KAPASİTE</span>
                                                            <span className="h-val">{totalCap.toLocaleString()}</span>
                                                        </div>
                                                        <div className="h-stat-row">
                                                            <span className="h-label">PLANLANAN</span>
                                                            <span className="h-val">{totalPlanned.toLocaleString()}</span>
                                                        </div>
                                                        <div className="h-stat-row">
                                                            <span className="h-label">KALAN</span>
                                                            <span className={`h-val ${remaining < 0 ? 'text-red' : 'text-green'}`}>
                                                                {remaining.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="details-table-container">
                                        <table className="details-table">
                                            <thead>
                                                <tr>
                                                    <th>AY</th>
                                                    <th>KAPASİTE</th>
                                                    <th>PLANLANAN</th>
                                                    <th>KALAN</th>
                                                    <th>DOLULUK</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {monthsTR.map((monthName, idx) => {
                                                    const year = 2026;
                                                    let totalCap = 0;
                                                    let totalPlanned = 0;

                                                    const dmIdx = displayMonths.findIndex((dm: any) => dm.month === idx && dm.year === year);
                                                    if (dmIdx !== -1) {
                                                        const daysInMonth = new Date(year, idx + 1, 0).getDate();
                                                        for (let d = 1; d <= daysInMonth; d++) {
                                                            const dayKey = `${year}-${idx + 1}-${d}`;
                                                            selectedSupplier.bands.forEach(b => {
                                                                const { preUsed, dailyCap } = getBandMetrics(selectedSupplier, b, idx, year, d, dayKey);
                                                                totalCap += dailyCap;
                                                                totalPlanned += preUsed;
                                                            });
                                                        }
                                                    } else {
                                                        const seed = parseInt(selectedSupplier.supplierCode.slice(-3)) + idx;
                                                        const randomOcc = 5 + (Math.sin(seed) * 40 + 40);
                                                        const avgDays = 22;
                                                        selectedSupplier.bands.forEach(b => {
                                                            const cap = b.allocatedCapacityForFlo * avgDays;
                                                            totalCap += cap;
                                                            totalPlanned += Math.round(cap * (randomOcc / 100));
                                                        });
                                                    }

                                                    const remaining = totalCap - totalPlanned;
                                                    const occupancy = totalCap > 0 ? Math.round((totalPlanned / totalCap) * 100) : 0;

                                                    const getProgressBarColor = (occ: number) => {
                                                        if (occ < 60) return '#22c55e';
                                                        if (occ < 80) return '#eab308';
                                                        if (occ < 95) return '#f97316';
                                                        return '#ef4444';
                                                    };

                                                    return (
                                                        <tr key={monthName}>
                                                            <td className="font-medium text-slate-700">{monthName}</td>
                                                            <td className="font-bold text-slate-900">{totalCap.toLocaleString()}</td>
                                                            <td className="font-bold text-slate-900">{totalPlanned.toLocaleString()}</td>
                                                            <td className={remaining < 0 ? 'text-red-500 font-bold' : 'text-slate-600 font-medium'}>
                                                                {remaining.toLocaleString()}
                                                            </td>
                                                            <td className="w-1/3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full rounded-full transition-all duration-500"
                                                                            style={{
                                                                                width: `${Math.min(occupancy, 100)}%`,
                                                                                backgroundColor: getProgressBarColor(occupancy)
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs font-bold w-9 text-right">%{occupancy}</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};

export default SuitableSuppliersView;
