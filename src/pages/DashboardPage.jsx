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
    const { version, date } = parsedNotes.attributes; // Extracts version number and date
    const content = parsedNotes.body;

    // Returns users to page they were on before auto logout
    useEffect(() => {
        const returnPath = localStorage.getItem('returnPath');
        if (returnPath && returnPath !== '/dashboard') {
            localStorage.removeItem('returnPath'); // Clean up
            navigate(returnPath); // Send them to where they were!
        }
    });

    return (
        <div className="dashboard-container min-h-screen bg-[#040507] text-[#a0a0a0] relative overflow-hidden">

            {/* Background Image / Fog Layer (Hooked via SCSS) */}
            <div className="bg-overlay absolute inset-0 z-0 pointer-events-none"></div>

            {/* Main Content Wrapper */}
            <div className="z-10 relative h-screen p-8 md:p-16 flex flex-col justify-between">

                {/* Top Section: Title & Menu */}
                <div className="flex flex-col items-start">
                    <h1 className="bebas-header-1 uppercase mb-8">
                        The Entities Ledger
                    </h1>

                    {/* Accordion Menu */}
                    <div className="menu-wrapper w-full max-w-sm">

                        {/* Primary Menu Button */}
                        <button
                            onClick={() => setIsMenuExpanded(!isMenuExpanded)}
                            className="inter-text-normal w-full flex items-center gap-4 bg-60-background hover:bg-full-background transition-colors p-4 border-l-4 border-transparent hover:text-white hover:border-iri hover:cursor-pointer"
                        >
                            {/* Icon Placeholder */}
                            <div className="w-8 h-8 flex items-center justify-center">
                                <img
                                    src="/assets/killerIcon.png"
                                    alt="Killer Icon"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span>Killer Challenges</span>
                        </button>

                        {/* Cascading Sub-Menu */}
                        {/* The 'expanded' class triggers SCSS cascade logic */}
                        <div className={`sub-menu-container flex flex-col ${isMenuExpanded ? 'expanded' : 'collapsed'}`}>

                            {/* Mapping over the menu items array which holds name and route */}
                            {menuItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => navigate(item.path)}
                                    className="inter-text-normal sub-menu-item text-left pl-16 pr-4 py-4 bg-60-background hover:bg-full-background hover:text-white transition-colors border-l-4 border-transparent hover:border-ash hover:cursor-pointer"
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Bottom Section: Version Info */}
                <div className="mt-auto">
                    <button
                        onClick={() => setIsVersionModalOpen(true)}
                        className="inter-text-small flex items-center gap-4 bg-60-background p-4 pr-10 transition-colors border-l-4 border-transparent hover:cursor-pointer hover:border-ash"
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center">
                            <img
                                src="/assets/killerIcon.png"
                                alt="Killer Icon"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-left leading-tight">
                            <div className="inter-text-small font-bold text-sm">{version}</div>
                            <div className="inter-text-small text-xs">Version Info</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Version Info Modal Overlay */}
            {isVersionModalOpen && (
                <div className="modal-backdrop absolute inset-0 bg-60-background z-50 flex items-center justify-center transition-opacity duration-300">
                    <div className="modal-content bg-full-background p-8 max-w-[60vw] relative overflow-y-auto max-h-[80vh]">

                        <button
                            onClick={() => setIsVersionModalOpen(false)}
                            className="absolute top-4 right-4 text-normal hover:text-white hover:cursor-pointer"
                        >
                            ✕
                        </button>

                        {/* Version # */}
                        <h2 className="inter-text-small text-normal mb-2">
                            Version {version} Information
                        </h2>

                        {/* Release Date */}
                        <p className="inter-text-small text-iri mb-6 uppercase">
                            Released: {date}
                        </p>

                        {/* Body of the md file */}
                        {/* The prose class names is what styles the content */}
                        <div className="
                            prose prose-invert prose-sm max-w-none
                            prose-headings:font-bebas prose-headings:text-white
                            prose-h3:text-entity-iri prose-h3:mt-6
                            prose-p:text-normal prose-p:font-inter
                            prose-a:text-iri prose-a:no-underline hover:prose-a:text-white hover:prose-a:transition-colors
                            prose-ul:font-inter prose-ul:text-normal prose-ul:list-square prose-li:marker:text-border-dark
                            prose-strong:text-white
                        ">
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
