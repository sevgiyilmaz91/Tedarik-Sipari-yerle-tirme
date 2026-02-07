
import React, { useState, useEffect, useMemo } from 'react';
import type { OrderPlacementItem, SearchCriteria } from '../types/orderPlacement';
import { OrderPlacementService } from '../services/orderPlacementService';
import SuitableSuppliersView from './SuitableSuppliersView';
import './OrderPlacement.css';

interface OrderPlacementProps {
    onClose: () => void;
}

const PAGE_SIZE = 10;

const OrderPlacement: React.FC<OrderPlacementProps> = ({ onClose }) => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<OrderPlacementItem[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<OrderPlacementItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter States
    const [season, setSeason] = useState('Tüm Sezonlar');
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>('genericModel');
    const [searchValue, setSearchValue] = useState('');
    const [dynamicOptions, setDynamicOptions] = useState<string[]>([]);

    // Workflow State
    const [workflowStep, setWorkflowStep] = useState<1 | 2>(1);
    const [selectedSatItem, setSelectedSatItem] = useState<OrderPlacementItem | null>(null);

    // Criteria metadata
    interface ConfigItem {
        label: string;
        type: 'text' | 'select';
        field?: keyof OrderPlacementItem;
        placeholder?: string;
    }

    const criteriaConfig: Record<SearchCriteria, ConfigItem> = {
        genericModel: { label: 'Generic', type: 'text', placeholder: 'Arama metni girin...' },
        modelName: { label: 'Model Adı', type: 'text', placeholder: 'Model adı girin...' },
        category: { label: 'Kategori', type: 'select', field: 'category' },
        class: { label: 'Klasman', type: 'select', field: 'class' },
        productDescription: { label: 'Ürün Tipi / Tanımı', type: 'select', field: 'productDescription' }, // Changed to select based on user hint "Diğerlerinde dropdown olacak"
    };

    // User rule: Generic & Model -> Input, Others -> Dropdown
    // I need to ensure Product Description behaves correctly. The user said "Generic ile model ile arandığında input. Diğerlrinde dropdown olacak."
    // So 'productDescription' should technically be a dropdown if it falls under "others".

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        // When criteria changes to a select type, fetch dynamic values
        const config = criteriaConfig[searchCriteria];
        if (config.type === 'select' && config.field) {
            OrderPlacementService.getUniqueValues(config.field).then(setDynamicOptions);
        }
        setSearchValue(''); // Reset value on criteria change
    }, [searchCriteria]);

    useEffect(() => {
        handleSearch();
    }, [searchValue, searchCriteria, orders, season]);

    const fetchInitialData = async () => {
        setLoading(true);
        const data = await OrderPlacementService.getOrders();
        setOrders(data);
        setFilteredOrders(data);
        setLoading(false);
    };

    const handleSearch = () => {
        let filtered = orders;

        // Filter by Season (Mock logic as dataset doesn't have season explicitly shown in screenshot columns, but assuming it exists or ignore strictly)
        // For now, if season is not "Tüm Sezonlar", we could filter if we had the field. 
        // Keeping it pass-through since data is "do not change".

        if (searchValue) {
            filtered = filtered.filter(order => {
                const val = order[searchCriteria as keyof OrderPlacementItem]?.toString().toLowerCase();
                return val?.includes(searchValue.toLowerCase());
            });
        }

        setFilteredOrders(filtered);
        setCurrentPage(1);
    };

    const handleRowDoubleClick = (order: OrderPlacementItem) => {
        setSelectedSatItem(order);
        setWorkflowStep(2);
    };

    // Pagination Logic
    const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredOrders.slice(start, start + PAGE_SIZE);
    }, [filteredOrders, currentPage]);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    if (workflowStep === 2 && selectedSatItem) {
        return (
            <div className="order-placement-modal-overlay" onClick={onClose}>
                <div className="order-placement-container full-width-split" onClick={e => e.stopPropagation()}>
                    <SuitableSuppliersView
                        satItem={selectedSatItem}
                        onBack={() => setWorkflowStep(1)}
                    />
                </div>
            </div>
        );
    }

    const currentConfig = criteriaConfig[searchCriteria];

    return (
        <div className="order-placement-modal-overlay" onClick={onClose}>
            <div className="order-placement-main-wrapper" onClick={e => e.stopPropagation()}>

                {/* Page Header */}
                <div className="op-page-header">
                    <div>
                        <h1>Sipariş Yerleştirme</h1>
                        <p>Your current sales summary and activity.</p>
                    </div>
                    {/* Close button relocated if needed, or kept absolute */}
                    <button className="op-close-btn" onClick={onClose}>&times;</button>
                </div>

                {/* Blue Filter Section */}
                <div className="op-filter-container">
                    <div className="op-filter-group">
                        <label>Sezon</label>
                        <div className="op-select-wrapper">
                            <select
                                value={season}
                                onChange={(e) => setSeason(e.target.value)}
                                className="op-select"
                            >
                                <option>Tüm Sezonlar</option>
                                <option>2024 Yaz</option>
                                <option>2024 Kış</option>
                            </select>
                            <span className="op-select-arrow">▼</span>
                        </div>
                    </div>

                    <div className="op-filter-group">
                        <label>Arama Kriteri</label>
                        <div className="op-select-wrapper">
                            <select
                                value={searchCriteria}
                                onChange={(e) => setSearchCriteria(e.target.value as SearchCriteria)}
                                className="op-select"
                            >
                                {Object.entries(criteriaConfig).map(([key, cfg]) => (
                                    <option key={key} value={key}>{cfg.label}</option>
                                ))}
                            </select>
                            <span className="op-select-arrow">▼</span>
                        </div>
                    </div>

                    <div className="op-filter-group" style={{ flex: 1.5 }}>
                        <label>{currentConfig.label}</label>
                        <div className="op-search-input-group">
                            {currentConfig.type === 'text' ? (
                                <div className="op-input-wrapper">
                                    <span className="op-input-icon">🔍</span>
                                    <input
                                        type="text"
                                        className="op-input"
                                        placeholder={currentConfig.placeholder}
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="op-select-wrapper width-full">
                                    <select
                                        className="op-select"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                    >
                                        <option value="">Seçiniz...</option>
                                        {dynamicOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <span className="op-select-arrow">▼</span>
                                </div>
                            )}
                            <button className="op-search-btn" onClick={handleSearch}>
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Ara
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Card */}
                <div className="op-content-card">
                    <div className="op-card-header">
                        <div className="header-title-group">
                            <h2>Sas Arama</h2>
                            <span className="op-badge-purple">10/20 seats</span>
                        </div>
                        <p className="op-card-subtitle">Manage your team members and their account permissions here.</p>
                    </div>

                    <div className="op-table-container">
                        {loading && <div className="op-loading">Yükleniyor...</div>}

                        <table className="op-table">
                            <thead>
                                <tr>
                                    <th>Satınalma Talebi <span className="sort-icon">↕</span></th>
                                    <th>Generic <span className="sort-icon">↕</span></th>
                                    <th>Marka <span className="sort-icon">↕</span></th>
                                    <th>Model Adı <span className="sort-icon">↕</span></th>
                                    <th>Ürün Tipi / Tanımı <span className="sort-icon">↕</span></th>
                                    <th>Klasman <span className="sort-icon">↕</span></th>
                                    <th>Cinsiyet <span className="sort-icon">↕</span></th>
                                    <th>Marka Grubu <span className="sort-icon">↕</span></th>
                                    <th>Marka Adı <span className="sort-icon">↕</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((order, idx) => (
                                    <tr
                                        key={order.id || idx}
                                        onClick={() => { }}
                                        onDoubleClick={() => handleRowDoubleClick(order)}
                                        className="op-table-row"
                                    >
                                        <td className="font-bold">{order.purchaseRequest || 'Sonbahar'}</td> {/* Image shows 'Sonbahar' or similar, but keeping data intact for now unless it's purchaseRequest */}
                                        <td className="font-medium text-dark">{order.genericModel}</td>
                                        <td className="text-gray">{order.brandName}</td>
                                        <td className="font-medium text-dark">{order.modelName}</td>
                                        <td className="font-medium text-dark">{order.productDescription}</td>
                                        <td className="font-medium text-dark">{order.class}</td>
                                        <td className="font-medium text-dark">{order.gender}</td>
                                        <td className="text-gray">{order.brandGroup}</td>
                                        <td className="text-gray">{order.brandName /* Repeating brand name as per column list, or generic */}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {!loading && paginatedData.length === 0 && (
                            <div className="op-empty-state">Kayıt Bulunamadı</div>
                        )}
                    </div>

                    <div className="op-pagination-footer">
                        <button
                            className="op-page-nav-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Previous
                        </button>

                        <div className="op-page-numbers">
                            {getPageNumbers().map((p, i) => (
                                <button
                                    key={i}
                                    className={`op-page-number ${p === currentPage ? 'active' : ''}`}
                                    onClick={() => typeof p === 'number' && setCurrentPage(p)}
                                    disabled={typeof p !== 'number'}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <button
                            className="op-page-nav-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        >
                            Next
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderPlacement;
