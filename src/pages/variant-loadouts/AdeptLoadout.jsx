import { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/variant-loadouts/Loadouts.scss';

const AdeptLoadout = ({
                          currentKiller,
                          selectedPerks,
                          setSelectedPerks,
                          selectedAddons,
                          setSelectedAddons,
                          season
                      }) => {
    const [allPerks, setAllPerks] = useState([]);
    const [killerAddons, setKillerAddons] = useState([]);

    // Default to ADDONS since PERKS are permanently locked for Adept
    const [activeInventory, setActiveInventory] = useState('ADDONS');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    // Determine if add-ons are strictly locked by Adept rules
    const isAshGrade = season?.currentGrade?.startsWith("ASH");

    useEffect(() => {
        const fetchPerks = async () => {
            try {
                const response = await api.get('/reference-data/perks');
                setAllPerks(response.data);
            } catch (err) {
                console.error("Failed to fetch perks:", err);
            }
        };
        fetchPerks();
    }, []);

    useEffect(() => {
        const fetchAddons = async () => {
            if (!currentKiller) return;
            try {
                const response = await api.get('/reference-data/addons?killerId=' + currentKiller.killerId);
                setKillerAddons(response.data);
                setSelectedAddons([]);
            } catch (err) {
                console.error("Failed to fetch addons:", err);
            }
        };
        fetchAddons();
    }, [currentKiller, setSelectedAddons]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeInventory, searchQuery]);

    // Force clear addons if they grade up while having them equipped
    useEffect(() => {
        if (!isAshGrade && selectedAddons.length > 0) {
            setSelectedAddons([]);
        }
    }, [isAshGrade, selectedAddons, setSelectedAddons]);

    const handleToggleItem = (item, type) => {
        if (type === 'ADDONS') {
            if (!isAshGrade) return; // Hard lock interaction
            setSelectedAddons(prev => {
                if (prev.find(a => a.id === item.id)) return prev.filter(a => a.id !== item.id);
                if (prev.length < 2) return [...prev, item];
                return prev;
            });
        }
        // Perks are fully automated now, no manual toggle logic needed!
    };

    const activeData = activeInventory === 'ADDONS' ? killerAddons : allPerks;
    const filteredData = activeData.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const currentItems = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="standard-loadout adept-loadout">
            <div className="equipped-section">
                {/* ADD-ONS ROW */}
                <div className="loadout-row">
                    <h3 className="inter-text-normal text-muted">Add Ons</h3>
                    <div
                        className="slots-container"
                        onClick={() => isAshGrade && setActiveInventory('ADDONS')}
                        style={{ cursor: isAshGrade ? 'pointer' : 'not-allowed', opacity: isAshGrade ? 1 : 0.5 }}
                    >
                        {[0, 1].map(index => {
                            const addon = selectedAddons[index];
                            return (
                                <div key={index} className="addon-slot square-slot">
                                    {addon && <img src={`/assets/Addons/${currentKiller.killerName}/${addon.name}.png`} alt={addon.name} />}
                                    {!isAshGrade && !addon && <div>
                                        <img className="locked-slot" src="/assets/Image Overlays/locked.png" alt=""/>
                                    </div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PERKS ROW */}
                <div className="loadout-row">
                    <h3 className="inter-text-normal text-muted">Perks</h3>
                    {/* The onClick is completely removed, locking the view to Add-ons only */}
                    <div className="slots-container perks-container" style={{ cursor: 'not-allowed' }}>
                        {[0, 1, 2].map(index => {
                            const perk = selectedPerks[index];
                            return (
                                <div key={index} className="perk-slot diamond-slot">
                                    {perk && (
                                        <div className="diamond-content" title={perk.name}>
                                            <img src={`/assets/Perks/${perk.name}.png`} alt={perk.name}/>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {/* Render a locked 4th slot for visual feedback */}
                        <div className="perk-slot diamond-slot" style={{pointerEvents: 'none'}}>
                            <div className="diamond-content flex items-center justify-center">
                                <img className="locked-slot" src="/assets/Image Overlays/locked.png" alt=""/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="inventory-section">
                <div className="inventory-header">
                    <div className="text">
                        <h2 className="inter-text-normal">Inventory</h2>
                        <p className="inter-text-small text-muted">
                            {activeInventory === 'ADDONS' ? 'Add-ons' : 'Perks'}
                            {!isAshGrade && activeInventory === 'ADDONS' && " (Locked)"}
                        </p>
                    </div>
                    <input
                        type="text"
                        className="inventory-search"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={activeInventory === 'ADDONS' && !isAshGrade}
                    />
                </div>

                <div className="divider-line"></div>

                <div className={`inventory-grid ${activeInventory === 'PERKS' ? 'grid-diamonds' : 'grid-squares'}`}>
                    {activeInventory === 'PERKS' ? (
                        <div className="col-span-full flex justify-center py-10">
                            <p className="text-muted inter-text-normal text-center">Adept perks are automatically locked to your selected killer and cannot be changed.</p>
                        </div>
                    ) : activeInventory === 'ADDONS' && !isAshGrade ? (
                        <div className="col-span-full flex justify-center py-10">
                            <p className="text-muted inter-text-normal text-center">Add-ons are strictly forbidden at Bronze grade and higher in the Adept Challenge.</p>
                        </div>
                    ) : (
                        currentItems.map(item => {
                            const isSelected = activeInventory === 'ADDONS'
                                ? selectedAddons.some(a => a.id === item.id)
                                : selectedPerks.some(p => p.id === item.id);

                            const imagePath = activeInventory === 'ADDONS'
                                ? `/assets/Addons/${currentKiller.killerName}/${item.name.replace('%', '')}.png`
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

                {totalPages > 1 && activeInventory === 'ADDONS' && isAshGrade && (
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

export default AdeptLoadout;
