import { useEffect, useState } from 'react';
import api from "../services/api.js";
import '../styles/DashboardPage.scss';
import ReactMarkdown from 'react-markdown';
import fm from 'front-matter';
import latestNotes from '../data/latest-update.md?raw';
import {useCinematicNavigate} from "../hooks/NavigationContext.jsx";

const DashboardPage = () => {

    const navigate = useCinematicNavigate();

    // --- RESTORED: State to handle the cascade menu ---
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);

    // --- NEW: Dynamic Season States ---
    const [activeSeasonId, setActiveSeasonId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // State to handle the version info overlay
    const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
    const [isVersionClosing, setIsVersionClosing] = useState(false);
    const handleCloseVersionModal = () => {
        setIsVersionClosing(true);
        setTimeout(() => {
            setIsVersionModalOpen(false);
            setIsVersionClosing(false);
        }, 300);
    }

    // Getting the updated version notes and parsing them
    const parsedNotes = fm(latestNotes);
    const { version, date } = parsedNotes.attributes;
    const content = parsedNotes.body;

    // --- NEW: Check for active season silently on mount ---
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

            {/* Version Info Modal Overlay */}
            {isVersionModalOpen && (
                <div className={`modal-backdrop ${isVersionClosing ? 'fade-out' : 'fade-in'}`}>
                    <div className={`modal-content-box hide-scrollbar ${isVersionClosing ? 'modal-slam-out' : 'modal-slam'}`}>
                        <button
                            onClick={handleCloseVersionModal}
                            className="close-modal-btn"
                        >
                            ✕
                        </button>

                        {/* Version # */}
                        <h2 className="inter-text-small modal-title text-normal">
                            Version {version} Information
                        </h2>

                        {/* Release Date */}
                        <p className="inter-text-small modal-date title-iri uppercase">
                            Released: {date}
                        </p>

                        {/* Body of the md file */}
                        <div className="markdown-content">
                            <ReactMarkdown>
                                {content}
                            </ReactMarkdown>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default DashboardPage;
