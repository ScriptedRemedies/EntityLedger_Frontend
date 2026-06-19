import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import EntityLoader from "../small-components/EntityLoader.jsx";
import '../../styles/small-components/Modals.scss';

// ==========================================
// VERSION INFO MODAL
// ==========================================
export const VersionModal = ({ version, date, content, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300); // Triggers parent unmount AFTER animation
    };

    return (
        <div className={`modal-backdrop ${isClosing ? 'fade-out' : 'fade-in'}`}>
            <div className={`modal-content-box ${isClosing ? 'modal-slam-out' : 'modal-slam'}`} style={{ width: '600px' }}>
                <div className="modal-header">
                    <div>
                        <h2 className="bebas-header-1 text-2xl m-0">Version {version} Information</h2>
                        <p className="inter-text-small title-iri uppercase m-0">Released: {date}</p>
                    </div>
                    <button onClick={handleClose} className="close-modal-btn">✕</button>
                </div>
                <div className="modal-body hide-scrollbar" style={{ maxHeight: '75vh' }}>
                    <div className="markdown-content">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                    <p className="inter-text-small text-muted uppercase" style={{ fontSize: '11px'}}>
                        © {new Date().getFullYear()} The Entity's Ledger | Developed by Sam Bushey | <a target="_blank" href="http://scriptedremedies.com">Scripted Remedies</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// THE ENTITY'S GUIDEBOOK MODAL
// ==========================================
const GUIDEBOOK_TABS = [
    { id: 'OVERVIEW', label: 'The Overview' },
    { id: 'CHALLENGES', label: 'The Challenges' },
    { id: 'TRIALS', label: 'The Trials' },
    { id: 'ROSTER', label: 'The Roster' },
    { id: 'ECONOMY', label: 'The Economy' },
    { id: 'IRON_MAN', label: 'The Iron Man' },
    { id: 'CHAOS', label: 'The Chaos' },
    { id: 'SUPPORT', label: 'The Support' }
];
export const GuidebookModal = ({ onClose }) => {
    const [isClosing, setIsClosing] = useState(false);

    // Controls which content pane is visible on the right
    const [activeTab, setActiveTab] = useState('OVERVIEW');

    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [activeTab]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    return (
        <div className={`modal-backdrop ${isClosing ? 'fade-out' : 'fade-in'}`}>
            <div className={`modal-content-box ${isClosing ? 'modal-slam-out' : 'modal-slam'}`} style={{ width: '850px', maxWidth: '90vw' }}>

                {/* MODAL HEADER */}
                <div className="modal-header">
                    <h2 className="bebas-header-1 title-white text-3xl m-0">THE ENTITY'S GUIDEBOOK</h2>
                    <button onClick={handleClose} className="close-modal-btn">✕</button>
                </div>

                {/* MODAL BODY (2-Column Override) */}
                <div className="modal-body guidebook-body">

                    {/* LEFT COLUMN: NAVIGATION */}
                    <div className="guidebook-sidebar hide-scrollbar">
                        {GUIDEBOOK_TABS.map(tab => (
                            <button
                                key={tab.id}
                                className={`guidebook-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* RIGHT COLUMN: CONTENT */}
                    <div className="guidebook-content hide-scrollbar" ref={contentRef}>

                        {/* --- OVERVIEW & CREDITS --- */}
                        {activeTab === 'OVERVIEW' && (
                            <div className="fade-in">
                                <h3 className="bebas-header-1 title-white text-3xl">WELCOME TO THE FOG</h3>
                                <p className="inter-text-normal">
                                    The Entity's Ledger is an independent, passion-driven companion app created by Sam Bushey <a target="_blank" href="http://scriptedremedies.com">(Scripted Remedies)</a>. The variants featured within are solely driven by the incredible rogue-like gauntlets, financial economies, and custom rulesets created by the Dead by Daylight community.
                                </p>
                                <p className="inter-text-normal mb-8">
                                    Whether you are racing against the clock in Iron Man or managing a brutal budget in Blood Money, the Ledger mathematically tracks your pip progression and roster mortality to create a completely new way to survive the trials.
                                </p>

                                {/* Flow of app */}
                                <h3 className="bebas-header-2 title-white text-2xl">THE SURVIVAL LOOP</h3>
                                <div className="inter-text-normal mb-8" style={{ paddingLeft: '1rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                                    <p className="mb-2 text-white">To successfully run a challenge, follow this exact workflow:</p>
                                    <ol style={{ listStyleType: 'decimal', paddingLeft: '1.2rem', margin: 0 }}>
                                        <li className="mb-1">When your Dead by Daylight grade resets, open the Ledger and start your new challenge variant.</li>
                                        <li className="mb-1">While still in the app, select your Killer and build your loadout.</li>
                                        <li className="mb-1">Open Dead by Daylight, mirror that exact loadout, and play your match.</li>
                                        <li className="mb-1">When the trial finishes, <span className="title-iri">stop at the endgame results screen! Do not continue.</span></li>
                                        <li className="mb-1">Open the Ledger, copy your exact emblems and survivor outcomes into the app, and submit.</li>
                                        <li>Repeat this cycle until the challenge ends or the Entity claims your run.</li>
                                    </ol>
                                </div>

                                <h3 className="bebas-header-2 title-iri text-2xl">LEGAL ACKNOWLEDGMENTS</h3>
                                <p className="inter-text-small text-muted mb-8">
                                    Dead by Daylight, The Entity, and all associated characters, perks, and terminology are trademarks and copyright of Behaviour Interactive Inc. This application is strictly an unofficial, non-commercial fan project and is not affiliated with, endorsed by, or sponsored by Behaviour Interactive.
                                </p>

                                <h3 className="bebas-header-2 title-iri text-2xl">ASSET CREDITS</h3>
                                <ul className="inter-text-small" style={{ listStyleType: 'square', paddingLeft: '20px' }}>
                                    <li className="mb-2">
                                        <span className="text-white">Portraits, Perks, & Add-ons:</span> Sourced from the stunning <a href="https://nightlight.gg/packs/red-scratch-pack" target="_blank" rel="noopener noreferrer" className="title-iri" style={{ textDecoration: 'underline' }}>Red Scratch Pack</a> available on Nightlight.gg.
                                    </li>
                                    <li className="mb-2">
                                        <span className="text-white">Full-Body Killers:</span> Captured directly in-game on PlayStation 5 by the developer.
                                    </li>
                                    <li className="mb-2">
                                        <span className="text-white">UI Icons:</span> Survivor statuses and DbD logos sourced from the official Dead by Daylight Wiki.
                                    </li>
                                    <li className="mb-2">
                                        <span className="text-white">Background Scenery:</span> Official Dead by Daylight promotional artwork and community-sourced imagery.
                                    </li>
                                </ul>
                            </div>
                        )}

                        {/* --- CHALLENGES --- */}
                        {activeTab === 'CHALLENGES' && (
                            <div className="fade-in">

                                {/* 1. SELECTING A VARIANT */}
                                <h3 className="bebas-header-1 title-white text-3xl">SELECTING A VARIANT</h3>
                                <p className="inter-text-normal">
                                    To begin a run, click on any variant icon in the left navigation menu. Each variant offers a drastically different ruleset, difficulty level, and survival condition.
                                </p>

                                <div className="guide-image-placeholder">
                                    {/* Placeholder for the video you are going to make! */}
                                    <video
                                        src="/assets/Videos/selecting-variants.mp4"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="guide-video"
                                    />
                                </div>

                                {/* 2. THE VARIANTS EXPLAINED */}
                                <h3 className="bebas-header-2 title-iri text-2xl mt-8">THE VARIANTS EXPLAINED</h3>
                                <ul className="inter-text-normal" style={{ listStyleType: 'square', paddingLeft: '20px' }}>
                                    <li className="mb-2"><span className="text-white">Standard:</span> The classic gauntlet. Try to survive as long as possible. If a killer dies, they are locked out permanently.</li>
                                    <li className="mb-2"><span className="text-white">Adept:</span> A true test of mastery. You may only use the 3 unique perks specifically assigned to the killer you are playing.</li>
                                    <li className="mb-2"><span className="text-white">Blood Money:</span> A brutal financial economy. Buy killers and loadouts using a limited budget. Earn cash through kills and hooks.</li>
                                    <li className="mb-2"><span className="text-white">Afterburn:</span> A New Game+ mode for Blood Money. Inherit your surviving killers and leftover budget from a previously completed Blood Money run.</li>
                                    <li className="mb-2"><span className="text-white">Chaos Shuffle:</span> The Entity spins the roulette. You must play with whatever randomized perks the Ledger assigns you.</li>
                                    <li className="mb-2"><span className="text-white">Iron Man:</span> A literal race against time. You have 75 minutes between trials to complete your next trial or the run instantly collapses.</li>
                                </ul>

                                {/* 3. STARTING THE TRIAL & DESELECTING */}
                                <h3 className="bebas-header-2 title-white text-2xl mt-8">BUILDING YOUR ROSTER</h3>
                                <p className="inter-text-normal">
                                    Before officially starting a challenge, you must establish your available roster. Click a killer's portrait to deselect them if you do not own them or do not wish to play them. The Entity will ignore them for the duration of the season.
                                </p>

                                <div className="guide-image-placeholder">
                                    <video
                                        src="/assets/Videos/deselecting-killers.mp4"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="guide-video"
                                    />
                                </div>

                                {/* 4. THE REVIEW PAGE */}
                                <h3 className="bebas-header-2 title-iri text-2xl mt-8">REVIEWING YOUR HISTORY</h3>
                                <p className="inter-text-normal mb-8">
                                    Once a run concludes—whether in victory or defeat—it is permanently archived in the Review Challenges tab. Here, you can view the complete match history and detail for every past season, check your overall win/loss statistics, and see which killers earned prestigious Roster Performance Awards like "Most Valuable" or "Weakest Link."
                                </p>

                                <div className="guide-image-placeholder">
                                    <video
                                        src="/assets/Videos/review-page.mp4"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="guide-video"
                                    />
                                </div>

                            </div>
                        )}

                        {/* --- THE TRIALS --- */}
                        {activeTab === 'TRIALS' && (
                            <div className="fade-in">

                                <h3 className="bebas-header-1 title-white text-3xl">THE CRITICAL WORKFLOW</h3>
                                <p className="inter-text-normal mb-6">
                                    Because the Ledger does not interact directly with the Dead by Daylight game files, your run relies entirely on the Honor System and your accuracy in reporting.
                                </p>

                                <div className="inter-text-normal mb-8" style={{ paddingLeft: '1rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                                    <ol style={{ listStyleType: 'decimal', paddingLeft: '1.2rem', margin: 0 }}>
                                        <li className="mb-2">
                                            <strong className="title-white font-normal">Mirror the Loadout:</strong> Check your active loadout in the Ledger. Boot up Dead by Daylight and equip the exact same Killer, Perks, and Add-ons.
                                            <div className="guide-image-placeholder">
                                                <video
                                                    src="/assets/Videos/loadout.mp4"
                                                    autoPlay
                                                    loop
                                                    muted
                                                    playsInline
                                                    className="guide-video"
                                                />
                                            </div>
                                        </li>
                                        <li className="mb-2"><strong className="title-white font-normal">Survive the Fog:</strong> Play your match normally.</li>
                                        <li className="mb-2"><strong className="title-iri font-normal">The Critical Stop:</strong> When the match concludes, click through to the final Results Screen showing your Emblems and the Survivor scoreboard. Do not click continue.</li>
                                        <li className="mb-2">
                                            <strong className="title-white font-normal">Log the Data:</strong> Return to the Ledger, click "Start Trial", and input the exact results you see on your screen.
                                            <div className="guide-image-placeholder">
                                                <video
                                                    src="/assets/Videos/results.mp4"
                                                    autoPlay
                                                    loop
                                                    muted
                                                    playsInline
                                                    className="guide-video"
                                                />
                                            </div>
                                        </li>
                                    </ol>
                                </div>

                                <h3 className="bebas-header-2 title-iri text-2xl mt-8">PRECISION REPORTING</h3>
                                <p className="inter-text-normal">
                                    The Entity's Ledger is built on the authentic Dead by Daylight algorithm. To accurately track your grade progression, you must log three specific elements:
                                </p>

                                <ul className="inter-text-normal mt-4" style={{ listStyleType: 'square', paddingLeft: '20px' }}>
                                    <li className="mb-3"><span className="text-white">Emblem Quality:</span> You must log the exact color (None, Bronze, Silver, Gold, Iridescent) of all four emblems (Gatekeeper, Devout, Malicious, Chaser). A single missed emblem will alter your pip calculation.</li>
                                    <li className="mb-3"><span className="text-white">Survivor Outcomes:</span> Log exactly how each survivor exited the trial (Sacrificed, Killed/Mori, Escaped through Hatch, or Escaped through Gates).</li>
                                    <li className="mb-3"><span className="text-white">Variant Specifics:</span> Certain variants like Iron Man or Blood Money require you to log the exact number of Generators remaining or if you successfully closed the hatch.</li>
                                </ul>

                                <h3 className="bebas-header-2 title-white text-2xl mt-8">DEATH & COOLDOWNS</h3>
                                <p className="inter-text-normal mb-8">
                                    If a survivor escapes through an Exit Gate, the Entity considers that Killer <span className="title-iri">DEAD</span>. Dead killers are permanently locked out of your roster for the remainder of the season. If you achieve a flawless 4-Kill or 3-Kill with Hatch escape, the killer survives, but may be placed on a Cooldown depending on the variant's rules.
                                </p>

                            </div>
                        )}

                        {/* --- THE ROSTER --- */}
                        {activeTab === 'ROSTER' && (
                            <div className="fade-in">

                                <h3 className="bebas-header-1 title-white text-3xl">THE KILLER ROSTER</h3>
                                <p className="inter-text-normal mb-8">
                                    Throughout a challenge, your roster of killers will dynamically update based on your trial results and your variant's specific ruleset. Understanding the status of each killer is essential to managing your survival.
                                </p>

                                <h3 className="bebas-header-2 title-iri text-2xl">STATUS EFFECTS</h3>
                                <ul className="inter-text-normal" style={{ listStyleType: 'square', paddingLeft: '20px' }}>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">AVAILABLE:</strong> The killer is healthy, affordable, and ready to be used in a trial.
                                    </li>
                                    <li className="mb-4">
                                        <strong className="title-iri font-normal">DEAD:</strong> The killer failed to secure a victory or succumbed to a variant's specific death condition (such as a survivor escaping through an Exit Gate). They are permanently locked for the remainder of the season.
                                    </li>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">COOLDOWN:</strong> The killer successfully survived their trial but requires rest. They are temporarily locked. You must play a set number of trials with other killers before they become available again.
                                    </li>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">SOLD:</strong> (Blood Money & Afterburn Only) The killer's contract was permanently liquidated to inject cash into your budget. They cannot be used again this season.
                                    </li>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">UNAFFORDABLE:</strong> (Blood Money & Afterburn Only) The killer is technically alive, but your current bank balance is too low to afford their deployment cost. They will remain locked out until you generate enough revenue to afford them.
                                    </li>
                                </ul>

                                <p className="inter-text-normal mt-6">
                                    When you select a killer for a new trial, the Ledger will automatically filter your roster, greying out or stamping any portrait that is currently restricted. You cannot override the Entity's lock.
                                </p>

                            </div>
                        )}

                        {/* --- THE ECONOMY --- */}
                        {activeTab === 'ECONOMY' && (
                            <div className="fade-in">

                                <h3 className="bebas-header-1 title-white text-3xl">THE BLOOD ECONOMY</h3>
                                <p className="inter-text-normal mb-8">
                                    In the Blood Money and Afterburn variants, survival is not enough. You must manage a brutal financial ledger. Every decision you make—from your loadout to your performance in the trial—has a direct monetary consequence.
                                </p>

                                <h3 className="bebas-header-2 title-iri text-2xl">FINANCING A TRIAL</h3>
                                <ul className="inter-text-normal" style={{ listStyleType: 'square', paddingLeft: '20px' }}>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">DEPLOYMENT COSTS:</strong> Nothing is free. Deploying a Killer costs a base fee, and equipping higher-tier Perks or Add-ons drastically increases the price of your trial.
                                    </li>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">PROFIT & LOSS:</strong> Kills and hooks generate revenue. Escaped survivors and completed generators incur massive financial penalties. If you play poorly, you will lose money on the trial.
                                    </li>
                                </ul>

                                <h3 className="bebas-header-2 title-iri text-2xl mt-8">BANKRUPTCY & LIQUIDATION</h3>
                                <ul className="inter-text-normal mb-8" style={{ listStyleType: 'square', paddingLeft: '20px' }}>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">THE BANKRUPTCY LOCK:</strong> If your Ledger balance falls below zero, or if you cannot afford the absolute cheapest killer on your roster, the Entity will lock you out. The "Start Trial" button will be disabled until the debt is paid.
                                    </li>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">LIQUIDATING ASSETS:</strong> The only way to escape bankruptcy is to sell your remaining survivors. Click on an available killer's portrait while bankrupt to permanently sell their contract for an instant cash injection. If you have no killers left to sell, the run collapses.
                                    </li>
                                </ul>
                            </div>
                        )}

                        {/* --- IRON MAN --- */}
                        {activeTab === 'IRON_MAN' && (
                            <div className="fade-in">

                                <h3 className="bebas-header-1 title-white text-3xl">RACING THE CLOCK</h3>
                                <p className="inter-text-normal mb-8">
                                    The Iron Man variant is a test of endurance and speed. You are not just fighting the survivors; you are fighting the Entity's Doomsday Clock.
                                </p>

                                <h3 className="bebas-header-2 title-iri text-2xl">THE DOOMSDAY CLOCK</h3>
                                <ul className="inter-text-normal mb-8" style={{ listStyleType: 'square', paddingLeft: '20px' }}>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">75-MINUTE DEADLINE:</strong> From the moment you finish a trial, you have exactly 75 minutes to start and log your next match.
                                    </li>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">PERSISTENT TICKING:</strong> The clock is tied to the server, meaning it continues to tick down even if you close the Ledger or turn off your computer.
                                    </li>
                                    <li className="mb-4">
                                        <strong className="title-iri font-normal">INSTANT FAILURE:</strong> If the clock reaches 00:00 before you log your next trial, the active season immediately collapses and is marked as FAILED.
                                    </li>
                                </ul>

                                <h3 className="bebas-header-2 title-white text-2xl">MULLIGAN TOKENS</h3>
                                <p className="inter-text-normal mb-4">
                                    Because a single escaped survivor ordinarily kills a run, Iron Man offers a rare lifeline: the Mulligan Token.
                                </p>
                                <ul className="inter-text-normal" style={{ listStyleType: 'square', paddingLeft: '20px' }}>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">EARNING TOKENS:</strong> You earn one Mulligan Token by achieving a Flawless Trial—sacrificing all 4 survivors with exactly 5 generators remaining.
                                    </li>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">AUTOMATIC CONSUMPTION:</strong> If you suffer a loss and have a Mulligan Token banked, the Entity will automatically consume it, resurrecting your dead killer and allowing the run to continue.
                                    </li>
                                </ul>
                            </div>
                        )}

                        {/* --- CHAOS SHUFFLE --- */}
                        {activeTab === 'CHAOS' && (
                            <div className="fade-in">

                                <h3 className="bebas-header-1 title-white text-3xl">EMBRACING THE CHAOS</h3>
                                <p className="inter-text-normal mb-8">
                                    In the Chaos Shuffle variant, your strategy is entirely at the mercy of the Entity. You do not get to bring your favorite meta build; you must survive with whatever random perks the Ledger assigns you.
                                </p>

                                <h3 className="bebas-header-2 title-iri text-2xl">THE ROULETTE LOCK</h3>
                                <ul className="inter-text-normal mb-8" style={{ listStyleType: 'square', paddingLeft: '20px' }}>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">FORCED ROLLS:</strong> When you set up your trial, the "Start Trial" button is intentionally disabled. You cannot proceed until you navigate to your Loadout and physically spin the perk roulette.
                                    </li>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">MIRRORING THE ROLL:</strong> Once the Ledger assigns your four random perks, you must mirror that exact build in Dead by Daylight before queuing up for your match.
                                    </li>
                                </ul>

                                <h3 className="bebas-header-2 title-white text-2xl">RE-ROLL TOKENS</h3>
                                <p className="inter-text-normal mb-4">
                                    If the Entity gives you a completely unsynergistic or broken build, you have one single opportunity to alter your fate.
                                </p>
                                <ul className="inter-text-normal" style={{ listStyleType: 'square', paddingLeft: '20px' }}>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">ONE PER MATCH:</strong> You are granted exactly one Re-Roll Token per trial.
                                    </li>
                                    <li className="mb-4">
                                        <strong className="title-white font-normal">SEALING YOUR FATE:</strong> If you choose to spend your Re-Roll token, the old perks are permanently discarded and a new set is spun. You cannot undo a re-roll, and you are locked into the second result.
                                    </li>
                                </ul>
                            </div>
                        )}

                        {/* --- TAB 8: CONTACT & SUPPORT --- */}
                        {activeTab === 'SUPPORT' && (
                            <div className="fade-in">

                                <h3 className="bebas-header-1 title-white text-3xl">THE ENTITY LISTENS</h3>
                                <p className="inter-text-normal mb-8">
                                    While the Ledger operates autonomously, the Entity is always seeking ways to perfect its trials. If you encounter an anomaly in the Fog or have a suggestion to improve a challenge, your voice will be heard.
                                </p>

                                <h3 className="bebas-header-2 title-iri text-2xl">REPORT A BUG</h3>
                                <p className="inter-text-normal mb-4">
                                    If the UI glitches, a pip is miscalculated, or a variant's ruleset does not enforce correctly, please reach out directly. Provide as much detail as possible about what happened and what variant you were running.
                                </p>

                                <div className="inter-text-normal mb-8" style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--color-IRIDESCENT)' }}>
                                    <a
                                        href="mailto:scriptedremedies@gmail.com?subject=The Entity Ledger: Bug Report"
                                        className="title-white"
                                        style={{ textDecoration: 'underline', fontSize: '1.1rem' }}
                                    >
                                        Send a Bug Report
                                    </a>
                                </div>

                                <h3 className="bebas-header-2 title-white text-2xl mt-8">COMMUNITY SUBMISSIONS</h3>
                                <p className="inter-text-normal">
                                    In the future, this section will host an official portal where you can submit your own custom DbD variants. Until then, hold onto your wildest, most punishing challenge ideas—the Entity will be ready for them soon.
                                </p>

                            </div>
                        )}

                    </div>
                </div>

                {/* MODAL FOOTER */}
                <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
                    <button className="squareBtn" onClick={handleClose}>Acknowledge</button>
                </div>

            </div>
        </div>
    );
};

// ==========================================
// SELL KILLER MODAL
// ==========================================
export const SellKillerModal = ({ killer, projectedBalance, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const handleClose = (confirmSale) => {
        setIsClosing(true);
        setTimeout(() => onClose(confirmSale), 300);
    };

    return (
        <div className={`modal-backdrop ${isClosing ? 'fade-out' : 'fade-in'}`}>
            <div className={`modal-content-box ${isClosing ? 'modal-slam-out' : 'modal-slam'}`} style={{ width: '600px' }}>
                <div className="modal-header">
                    <h2 className="bebas-header-1 title-iri m-0 text-3xl">CONFIRM SALE</h2>
                    <button onClick={() => handleClose(false)} className="close-modal-btn">✕</button>
                </div>

                <div className="modal-body" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ width: '130px', height: '130px', flexShrink: 0, border: '1px solid rgba(139, 40, 40, 0.3)', background: 'rgba(139, 40, 40, 0.05)', position: 'relative', overflow: 'hidden' }}>
                        <img src={`/assets/Killers/${killer.killerName}.png`} alt={killer.killerName} style={{ height: '130%', objectFit: 'cover', filter: 'grayscale(80%) brightness(0.8)' }} />
                    </div>

                    <div>
                        <p className="inter-text-normal m-0">
                            Are you sure you want to sell <span className="text-white">{killer.killerName}</span> for <span className="title-iri">${killer.cost}</span>?
                        </p>
                        <div className="mt-4" style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderLeft: '2px solid var(--color-IRIDESCENT)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="inter-text-small text-muted">Projected Balance:</span>
                            <span className="inter-text-small title-white">${projectedBalance + killer.cost}</span>
                        </div>
                        <p className="inter-text-small text-muted mt-3 mb-0">This action cannot be undone.</p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="back-button" onClick={() => handleClose(false)}>Cancel</button>
                    <button className="squareBtn" onClick={() => handleClose(true)}>Confirm Sale</button>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// START CHALLENGE (PACT) MODAL
// ==========================================
export const StartChallengeModal = ({ variant, startingBalance, rosterList, onSubmit, onClose, isSealingPact }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    return (
        <div className={`modal-backdrop ${isClosing ? 'fade-out' : 'fade-in'}`}>
            <div className={`modal-content-box start-challenge-modal ${isClosing ? 'modal-slam-out' : 'modal-slam'}`} style={{ width: '70vw', maxWidth: '800px', height: '80vh' }}>
                {isSealingPact ? (
                    <div className="modal-body flex flex-col items-center justify-center fade-in">
                        <h2 className="bebas-header-1 title-iri text-4xl mb-6 tracking-widest">CHALLENGE STARTED</h2>
                        <EntityLoader />
                    </div>
                ) : (
                    <>
                        <div className="modal-header">
                            <h2 className="bebas-header-1 title-white text-3xl m-0">CONFIRM NEW CHALLENGE</h2>
                            <button onClick={handleClose} className="close-modal-btn">✕</button>
                        </div>

                        <div className="modal-body hide-scrollbar">
                            <h3 className="bebas-header-1 text-2xl mb-2">Variant: <span className="title-iri">{variant.name}</span></h3>
                            {(variant.id === 'BLOOD_MONEY' || variant.id === 'AFTERBURN') && (
                                <p className="bebas-header-1">Starting Balance: <span className="title-iri">${startingBalance}</span></p>
                            )}

                            <p className="inter-text-normal mt-4 mb-2">{variant.rulesDescription}</p>
                            <ul className="inter-text-small" style={{ listStyleType: 'square', paddingLeft: '1.5rem' }}>
                                {variant.rulesSummary.map((rule, i) => <li key={i} className="mb-1">{rule}</li>)}
                            </ul>

                            <div className="mt-6">
                                <button className="inter-text-normal title-white" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
                                    <span>Included Killers ({rosterList.length})</span>
                                </button>
                                <ul className="included-killers-grid">
                                    {rosterList.map(k => (
                                        <li key={k.id || k.killerId} className="inter-text-small text-normal">
                                            {k.name || k.killerName}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="back-button" onClick={handleClose}>Back</button>
                            <button className="squareBtn" onClick={onSubmit}>Start Challenge</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
