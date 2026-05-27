import { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/variant-loadouts/Loadouts.scss';

const StandardLoadout = ({
                             currentKiller,
                             selectedPerks,
                             setSelectedPerks,
                             selectedAddons,
                             setSelectedAddons
                         }) => {
    // --- Data States (From Backend) ---
    const [allPerks, setAllPerks] = useState([]);
    const [killerAddons, setKillerAddons] = useState([]);

    // --- UI States ---
    const [activeInventory, setActiveInventory] = useState('PERKS'); // 'ADDONS' or 'PERKS'
    const [searchQuery, setSearchQuery] = useState('');

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15; // 5 columns x 3 rows

    // --- Fetch Inventory Data ---
    useEffect(() => {
        // Fetch all universal and killer perks
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
        // Fetch add-ons specific to the currently selected killer
        const fetchAddons = async () => {
            if (!currentKiller) return;
            try {
                const response = await api.get('/reference-data/addons?killerId=' + currentKiller.killerId);
                setKillerAddons(response.data);

                // Reset selected add-ons if the killer changes!
                setSelectedAddons([]);
            } catch (err) {
                console.error("Failed to fetch addons:", err);
            }
        };
        fetchAddons();
    }, [currentKiller]);

    // Reset to page 1 if they switch tabs or type in the search bar
    useEffect(() => {
        setCurrentPage(1);
    }, [activeInventory, searchQuery]);

    // --- Toggle Logic ---
    const handleToggleItem = (item, type) => {
        if (type === 'ADDONS') {
            setSelectedAddons(prev => {
                // If already selected, remove it
                if (prev.find(a => a.id === item.id)) {
                    return prev.filter(a => a.id !== item.id);
                }
                // If not selected and we have room, add it
                if (prev.length < 2) {
                    return [...prev, item];
                }
                // If full, do nothing
                return prev;
            });
        } else if (type === 'PERKS') {
            setSelectedPerks(prev => {
                if (prev.find(p => p.id === item.id)) {
                    return prev.filter(p => p.id !== item.id);
                }
                if (prev.length < 4) {
                    return [...prev, item];
                }
                return prev;
            });
        }
    };

    // --- Filter Active Inventory ---
    const activeData = activeInventory === 'ADDONS' ? killerAddons : allPerks;
    const filteredData = activeData.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate how many pages we need
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    // Slice the array to only show the current 18 items
    const currentItems = filteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="standard-loadout">

            {/* === TOP: EQUIPPED LOADOUT === */}
            <div className="equipped-section">

                {/* ADD-ONS ROW */}
                <div className="loadout-row">
                    <h3 className="inter-text-normal text-muted ">Add Ons</h3>
                    <div className="slots-container" onClick={() => setActiveInventory('ADDONS')}>
                        {/* Map a fixed array of 2 to always render 2 boxes */}
                        {[0, 1].map(index => {
                            const addon = selectedAddons[index];
                            return (
                                <div key={index} className="addon-slot square-slot">
                                    {addon && <img src={`/assets/Addons/${currentKiller.killerName}/${addon.name}.png`} alt={addon.name} />}
                                </div>
                            );
                        })}
                    </div>
                </div>


                {/* PERKS ROW */}
                <div className="loadout-row">
                    <h3 className="inter-text-normal text-muted">Perks</h3>
                    <div className="slots-container perks-container" onClick={() => setActiveInventory('PERKS')}>
                        {/* We map a fixed array of 4 to always render 4 diamonds */}
                        {[0, 1, 2, 3].map(index => {
                            const perk = selectedPerks[index];
                            return (
                                <div key={index} className="perk-slot diamond-slot">
                                    {perk && (
                                        <div className="diamond-content">
                                            <img src={`/assets/Perks/${perk.name}.png`} alt={perk.name} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* === BOTTOM: INVENTORY SELECTION === */}
            <div className="inventory-section">

                <div className="inventory-header">
                    <div className="text">
                        <h2 className="inter-text-normal">Inventory</h2>
                        <p className="inter-text-small text-muted">{activeInventory === 'ADDONS' ? 'Add-ons' : 'Perks'}</p>
                    </div>
                    <input
                        type="text"
                        className="inventory-search"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="divider-line"></div>

                {/* Added the dynamic classes for grid-diamonds and grid-squares */}
                <div className={`inventory-grid ${activeInventory === 'PERKS' ? 'grid-diamonds' : 'grid-squares'}`}>
                    {/* Map over currentItems instead of filteredData */}
                    {currentItems.map(item => {
                        const isSelected = activeInventory === 'ADDONS'
                            ? selectedAddons.some(a => a.id === item.id)
                            : selectedPerks.some(p => p.id === item.id);

                        // Calculate the exact image path before returning the JSX
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
                    })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
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

export default StandardLoadout;
