import { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/variant-loadouts/Loadouts.scss';

const MasterLoadout = ({
                           currentKiller,
                           selectedPerks,
                           setSelectedPerks,
                           selectedAddons,
                           setSelectedAddons,
                           season
                       }) => {

    // ==========================================
    // 1. RULES ENGINE (Driven by Variant Type)
    // ==========================================
    const variantType = season?.variantType || 'STANDARD';
    const currentGrade = season?.currentGrade || 'ASH_IV';
    const isAshGrade = currentGrade.startsWith("ASH");

    const rules = {
        maxPerks: variantType === 'ADEPT' ? 3 : 4,
        maxAddons: 2, // Standard across most variants
        perksLocked: variantType === 'ADEPT', // Can the user manually change perks?
        addonsLocked: variantType === 'ADEPT' && !isAshGrade, // Can the user manually change addons?
        defaultTab: variantType === 'ADEPT' ? 'ADDONS' : 'PERKS'
    };

    // ==========================================
    // 2. STATE & FETCHING
    // ==========================================
    const [allPerks, setAllPerks] = useState([]);
    const [killerAddons, setKillerAddons] = useState([]);
    const [activeInventory, setActiveInventory] = useState(rules.defaultTab);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    useEffect(() => {
        const fetchPerks = async () => {
            try {
                const response = await api.get('/reference-data/perks');
                setAllPerks(response.data);
            } catch (err) { console.error("Failed to fetch perks:", err); }
        };
        fetchPerks();
    }, []);

    useEffect(() => {
        const fetchAddons = async () => {
            if (!currentKiller) return;
            try {
                const response = await api.get('/reference-data/addons?killerId=' + currentKiller.killerId);
                setKillerAddons(response.data);
                setSelectedAddons([]); // Reset addons when killer changes
            } catch (err) { console.error("Failed to fetch addons:", err); }
        };
        fetchAddons();
    }, [currentKiller, setSelectedAddons]);

    // ==========================================
    // 3. VARIANT SPECIFIC ENFORCEMENT
    // ==========================================

    // Auto-Equip Adept Perks
    useEffect(() => {
        if (variantType === 'ADEPT' && allPerks.length > 0 && currentKiller) {
            const adeptPerks = allPerks.filter(p =>
                p.killerName === currentKiller.killerName || p.killer?.name === currentKiller.killerName
            );
            setSelectedPerks(adeptPerks);
        }
    }, [variantType, currentKiller, allPerks, setSelectedPerks]);

    // Force clear addons if they become locked (e.g. Adept ranking up to Bronze)
    useEffect(() => {
        if (rules.addonsLocked && selectedAddons.length > 0) {
            setSelectedAddons([]);
            setActiveInventory('PERKS'); // Kick them out of the addons tab if they were in it
        }
    }, [rules.addonsLocked, selectedAddons, setSelectedAddons]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeInventory, searchQuery]);

    // ==========================================
    // 4. INTERACTION LOGIC
    // ==========================================
    const handleToggleItem = (item, type) => {
        if (type === 'ADDONS') {
            if (rules.addonsLocked) return;
            setSelectedAddons(prev => {
                if (prev.find(a => a.id === item.id)) return prev.filter(a => a.id !== item.id);
                if (prev.length < rules.maxAddons) return [...prev, item];
                return prev;
            });
        } else if (type === 'PERKS') {
            if (rules.perksLocked) return;
            setSelectedPerks(prev => {
                if (prev.find(p => p.id === item.id)) return prev.filter(p => p.id !== item.id);
                if (prev.length < rules.maxPerks) return [...prev, item];
                return prev;
            });
        }
    };

    // ==========================================
    // 5. RENDER HELPERS
    // ==========================================
    const activeData = activeInventory === 'ADDONS' ? killerAddons : allPerks;
    const filteredData = activeData.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const currentItems = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="loadout">
            <div className="equipped-section">

                {/* === ADD-ONS ROW === */}
                <div className="loadout-row">
                    <h3 className="inter-text-normal text-muted">Add Ons</h3>
                    <div
                        className="slots-container"
                        onClick={() => !rules.addonsLocked && setActiveInventory('ADDONS')}
                        style={{ cursor: rules.addonsLocked ? 'not-allowed' : 'pointer' }}
                    >
                        {[0, 1].map(index => {
                            const addon = selectedAddons[index];
                            return (
                                <div key={index} className="addon-slot square-slot">
                                    {addon && <img src={`/assets/Addons/${currentKiller?.killerName}/${addon.name.replace('%', '')}.png`} alt={addon.name} />}
                                    {rules.addonsLocked && !addon && <img className="locked-indicator" src="/assets/Image Overlays/locked.png" alt="AddOn Slot Locked" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* === PERKS ROW === */}
                <div className="loadout-row">
                    <h3 className="inter-text-normal text-muted">Perks</h3>
                    <div
                        className="slots-container perks-container"
                        onClick={() => !rules.perksLocked && setActiveInventory('PERKS')}
                        style={{ cursor: rules.perksLocked ? 'not-allowed' : 'pointer' }}
                    >
                        {[0, 1, 2, 3].map(index => {
                            const isSlotLocked = index >= rules.maxPerks;
                            const perk = selectedPerks[index];

                            return (
                                <div key={index} className="perk-slot diamond-slot" style={{ pointerEvents: rules.perksLocked ? 'none' : 'auto'}}>
                                    {perk && !isSlotLocked && (
                                        <div className="diamond-content" title={perk.name}>
                                            <img src={`/assets/Perks/${perk.name}.png`} alt={perk.name}/>
                                        </div>
                                    )}
                                    {isSlotLocked && (
                                        <div className="diamond-content flex items-center justify-center">
                                            <img className="locked-indicator" src="/assets/Image Overlays/locked.png" alt="Perk Slot Locked" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* === INVENTORY SECTION === */}
            <div className="inventory-section">
                <div className="inventory-header">
                    <div className="text">
                        <h2 className="inter-text-normal">Inventory</h2>
                        <p className="inter-text-small text-muted">
                            {activeInventory === 'ADDONS' ? 'Add-ons' : 'Perks'}
                            {(activeInventory === 'ADDONS' && rules.addonsLocked) || (activeInventory === 'PERKS' && rules.perksLocked) ? " (Locked)" : ""}
                        </p>
                    </div>
                    {!(rules.perksLocked && rules.addonsLocked) && (
                        <input
                            type="text"
                            className="inventory-search"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={(activeInventory === 'ADDONS' && rules.addonsLocked) || (activeInventory === 'PERKS' && rules.perksLocked)}
                        />
                    )}

                </div>

                <div className="divider-line"></div>

                <div className={`inventory-grid ${activeInventory === 'PERKS' ? 'grid-diamonds' : 'grid-squares'}`}>
                    {/* Empty State Checks */}
                    {activeInventory === 'PERKS' && rules.perksLocked ? (
                        <div className="col-span-full flex justify-center py-10">
                            <p className="text-muted inter-text-normal text-center">Perks are automatically locked for the {variantType} challenge.</p>
                        </div>
                    ) : activeInventory === 'ADDONS' && rules.addonsLocked ? (
                        <div className="col-span-full flex justify-center py-10">
                            <p className="text-muted inter-text-normal text-center">Add-ons are strictly forbidden at your current grade.</p>
                        </div>
                    ) : (
                        /* Normal Inventory Mapping */
                        currentItems.map(item => {
                            const isSelected = activeInventory === 'ADDONS'
                                ? selectedAddons.some(a => a.id === item.id)
                                : selectedPerks.some(p => p.id === item.id);

                            const imagePath = activeInventory === 'ADDONS'
                                ? `/assets/Addons/${currentKiller?.killerName}/${item.name.replace('%', '')}.png`
                                : `/assets/Perks/${item.name}.png`;

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleToggleItem(item, activeInventory)}
                                    className={`inventory-item ${activeInventory === 'ADDONS' ? 'square-slot' : 'diamond-slot'} ${isSelected ? 'selected' : ''}`}
                                >
                                    <div className={activeInventory === 'PERKS' ? 'diamond-content' : ''}>
                                        <img src={imagePath} alt={item.name} title={item.name} />
                                    </div>
                                    {isSelected && <div className="active-check"></div>}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && !(activeInventory === 'ADDONS' && rules.addonsLocked) && !(activeInventory === 'PERKS' && rules.perksLocked) && (
                    <div className="pagination-controls">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MasterLoadout;
