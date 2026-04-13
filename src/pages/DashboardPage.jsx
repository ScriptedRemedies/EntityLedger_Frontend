import { useState } from 'react';
import './DashboardPage.scss';

const DashboardPage = () => {
    // State to handle the cascade menu
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);
    // State to handle the version info overlay
    const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

    return (
        <div className="dashboard-container min-h-screen bg-[#040507] text-[#a0a0a0] relative overflow-hidden">

            {/* Background Image / Fog Layer (Hooked via SCSS) */}
            <div className="bg-overlay absolute inset-0 z-0 pointer-events-none"></div>

            {/* Main Content Wrapper */}
            <div className="z-10 relative h-screen p-8 md:p-16 flex flex-col justify-between">

                {/* Top Section: Title & Menu */}
                <div className="flex flex-col items-start">
                    <h1 className="text-white uppercase tracking-wide mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '50px', lineHeight: '1' }}>
                        The Entities Ledger
                    </h1>

                    {/* Accordion Menu */}
                    <div className="menu-wrapper w-full max-w-sm">

                        {/* Primary Menu Button */}
                        <button
                            onClick={() => setIsMenuExpanded(!isMenuExpanded)}
                            className="w-full flex items-center gap-4 bg-[#111111]/80 hover:bg-[#1a1a1a] transition-colors p-4 border-l-4 border-transparent hover:border-[#BC1919]"
                            style={{ fontFamily: "'Inter', sans-serif", fontSize: '17px' }}
                        >
                            {/* Icon Placeholder */}
                            <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                                💀
                            </div>
                            <span className="text-white">Killer Challenges</span>
                        </button>

                        {/* Cascading Sub-Menu */}
                        {/* The 'expanded' class triggers your SCSS cascade logic */}
                        <div className={`sub-menu-container flex flex-col ${isMenuExpanded ? 'expanded' : 'collapsed'}`}>
                            {['Start a New Challenge', 'Continue Challenge', 'Review Challenges'].map((item, index) => (
                                <button
                                    key={index}
                                    className="sub-menu-item text-left pl-16 pr-4 py-4 bg-[#0a0a0a]/80 hover:bg-[#1a1a1a] hover:text-white transition-colors border-l-4 border-transparent hover:border-gray-500"
                                    style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px' }}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Bottom Section: Version Info */}
                <div className="mt-auto">
                    <button
                        onClick={() => setIsVersionModalOpen(true)}
                        className="flex items-center gap-4 bg-gradient-to-r from-[#111111]/80 to-transparent p-4 hover:text-white transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                            💀
                        </div>
                        <div className="text-left leading-tight">
                            <div className="text-white font-bold text-sm">1.2.1</div>
                            <div className="text-xs">Version Info</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Version Info Modal Overlay */}
            {isVersionModalOpen && (
                <div className="modal-backdrop absolute inset-0 bg-black/80 z-50 flex items-center justify-center transition-opacity duration-300">
                    <div className="modal-content bg-[#111111] border border-[#2F2F2F] p-8 w-full max-w-md relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsVersionModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            ✕
                        </button>

                        <h2 className="text-white text-2xl mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                            Version Information
                        </h2>
                        <p className="text-sm leading-relaxed">
                            The Entities Ledger v1.2.1<br/>
                            Connected to live database.<br/>
                            Add your specific release notes here.
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
};

export default DashboardPage;
