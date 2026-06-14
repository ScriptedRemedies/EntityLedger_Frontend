import { useEffect, useState } from 'react';
import api from "../services/api.js";
import '../styles/DashboardPage.scss';
import ReactMarkdown from 'react-markdown';
import fm from 'front-matter';
import latestNotes from '../data/latest-update.md?raw';
import {useCinematicNavigate} from "../hooks/NavigationContext.jsx";
import {GuidebookModal, VersionModal} from "./modals/AppModals.jsx";

const DashboardPage = () => {

    const navigate = useCinematicNavigate();

    // --- RESTORED: State to handle the cascade menu ---
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);

    // --- NEW: Dynamic Season States ---
    const [activeSeasonId, setActiveSeasonId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // State to handle the version info overlay
    const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
    const [isGuidebookOpen, setIsGuidebookOpen] = useState(false);

    // Getting the updated version notes and parsing them
    const parsedNotes = fm(latestNotes);
    const { version, date } = parsedNotes.attributes;
    const content = parsedNotes.body;

    // --- Check for active season silently on mount ---
    useEffect(() => {
        const checkActiveSeason = async () => {
            try {
                const response = await api.get('/seasons/active');
                const targetId = response.data?.id || response.data?.seasonId;

                if (targetId) {
                    setActiveSeasonId(targetId);
                }
            } catch (error) {
                // If it fails, they just don't have an active season. Do nothing.
            } finally {
                setIsLoading(false);
            }
        };

        checkActiveSeason();
    }, []);

    // --- Auto-show Guidebook on first login ---
    useEffect(() => {
        const hasSeenGuidebook = localStorage.getItem('hasSeenGuidebook');

        // If the key doesn't exist, it's their first time!
        if (!hasSeenGuidebook) {
            setIsGuidebookOpen(true);
            // Immediately set the flag so reloading the page doesn't trigger it again
            localStorage.setItem('hasSeenGuidebook', 'true');
        }
    }, []);

    // Returns users to page they were on before auto logout
    useEffect(() => {
        const returnPath = localStorage.getItem('returnPath');
        if (returnPath && returnPath !== '/dashboard') {
            localStorage.removeItem('returnPath');
            navigate(returnPath);
        }
    }, [navigate]);

    // Handle the dynamic sub-menu button
    const handleDynamicSubMenuClick = () => {
        if (activeSeasonId) {
            navigate(`/current-season/${activeSeasonId}`);
        } else {
            navigate('/start-challenge');
        }
    };

    return (
        <div className="dashboard-container fade-in">

            {/* Main Content Wrapper */}
            <div className="dashboard-content">

                {/* Top Section: Title & Menu */}
                <div className="top-section">
                    <h1 className="bebas-header-1 dashboard-title uppercase">
                        The Entities Ledger
                    </h1>

                    {/* Accordion Menu */}
                    <div className="menu-wrapper">

                        {/* RESTORED: Primary Menu Toggle Button */}
                        <button
                            onClick={() => setIsMenuExpanded(!isMenuExpanded)}
                            className="inter-text-normal primary-menu-btn"
                        >
                            <div className="menu-icon-wrapper">
                                <img
                                    src="/assets/killerIcon.png"
                                    alt="Killer Icon"
                                    className="menu-icon"
                                />
                            </div>
                            <span>Killer Challenges</span>
                        </button>

                        {/* RESTORED: Cascading Sub-Menu */}
                        <div className={`sub-menu-container ${isMenuExpanded ? 'expanded' : 'collapsed'}`}>

                            {/* DYNAMIC BUTTON: Changes based on fetch results */}
                            <button
                                onClick={handleDynamicSubMenuClick}
                                className="inter-text-normal sub-menu-item"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Checking Entity...' : (activeSeasonId ? 'Continue Season' : 'Start a New Challenge')}
                            </button>

                            <button
                                onClick={() => navigate('/review-challenges')}
                                className="inter-text-normal sub-menu-item"
                            >
                                Review Challenges
                            </button>
                        </div>

                    </div>
                </div>

                {/* Bottom Section: Version Info */}
                <div className="bottom-section">

                    {/* Guidebook Modal */}
                    <button
                        onClick={() => setIsGuidebookOpen(true)}
                        className="inter-text-small guidebook-btn"
                    >
                        <div className="version-icon-wrapper">
                            <img
                                src="/assets/observer.png"
                                alt="Observer Icon"
                                className="menu-icon"
                            />
                        </div>
                        <div className="version-text-wrapper">
                            <div className="inter-text-small version-number">Guidebook</div>
                        </div>
                    </button>

                    {/* Version Modal */}
                    <button
                        onClick={() => setIsVersionModalOpen(true)}
                        className="inter-text-small version-btn"
                    >
                        <div className="version-icon-wrapper">
                            <img
                                src="/assets/killerIcon.png"
                                alt="Killer Icon"
                                className="menu-icon"
                            />
                        </div>
                        <div className="version-text-wrapper">
                            <div className="inter-text-small version-number">{version}</div>
                            <div className="inter-text-small version-label">Version Info</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Guidebook */}
            {isGuidebookOpen && (
                <GuidebookModal
                    onClose={() => setIsGuidebookOpen(false)}
                />
            )}

            {/* Version Info Modal Overlay */}
            {isVersionModalOpen && (
                <VersionModal
                    version={version} date={date} content={content}
                    onClose={() => setIsVersionModalOpen(false)}
                />
            )}

        </div>
    );
};

export default DashboardPage;
