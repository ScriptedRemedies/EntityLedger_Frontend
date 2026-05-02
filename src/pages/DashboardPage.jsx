import {useEffect, useState} from 'react';
import './DashboardPage.scss';
import ReactMarkdown from 'react-markdown';
import fm from 'front-matter';
import latestNotes from '../data/latest-update.md?raw';
import {useNavigate} from "react-router-dom";

const DashboardPage = () => {

    // State to handle the cascade menu
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);
    const navigate = useNavigate();
    const menuItems =[
        { name: 'Start a New Challenge', path: '/start-challenge' },
        { name: 'Continue Challenge', path: '' },
        { name: 'Review Challenges', path: '/review-challenges'}
    ]

    // State to handle the version info overlay
    const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

    // Getting the updated version notes and parsing them
    const parsedNotes = fm(latestNotes);
    const { version, date } = parsedNotes.attributes;
    const content = parsedNotes.body;

    // Returns users to page they were on before auto logout
    useEffect(() => {
        const returnPath = localStorage.getItem('returnPath');
        if (returnPath && returnPath !== '/dashboard') {
            localStorage.removeItem('returnPath');
            navigate(returnPath);
        }
    });

    return (
        <div className="dashboard-container">

            {/* Main Content Wrapper */}
            <div className="dashboard-content">

                {/* Top Section: Title & Menu */}
                <div className="top-section">
                    <h1 className="bebas-header-1 dashboard-title uppercase">
                        The Entities Ledger
                    </h1>

                    {/* Accordion Menu */}
                    <div className="menu-wrapper">

                        {/* Primary Menu Button */}
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

                        {/* Cascading Sub-Menu */}
                        <div className={`sub-menu-container ${isMenuExpanded ? 'expanded' : 'collapsed'}`}>
                            {menuItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => navigate(item.path)}
                                    className="inter-text-normal sub-menu-item"
                                >
                                    {item.name}
                                </button>
                            ))}
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
                <div className="modal-backdrop">
                    <div className="modal-content-box hide-scrollbar">

                        <button
                            onClick={() => setIsVersionModalOpen(false)}
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
