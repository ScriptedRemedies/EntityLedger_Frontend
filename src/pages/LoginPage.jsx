import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.scss';

const LoginPage = () => {
    const [isMounted, setIsMounted] = useState(false);
    const navigate = useNavigate();

    // Triggers the initial fade-in animation when the page loads
    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        // Layer 1: Base layer with dark background
        <div className={`login-layer-1 relative min-h-screen bg-[#040507] flex flex-col justify-center transition-opacity duration-1000 ease-in-out ${isMounted ? 'opacity-100' : 'opacity-0'}`}>

            {/* Layer 2: Fog image anchored to the bottom */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                    src="/assets/fog.png"
                    alt="Atmospheric Fog"
                    className="w-full h-full object-cover object-bottom opacity-50"
                />
            </div>

            {/* Content Wrapper: Pulls everything forward so the fog sits behind it */}
            <div className="relative z-10 flex flex-col px-50">

                {/* Layer 3: Logo */}
                <div className="mb-12 mx-auto">
                    <img
                        src="/assets/DBDLogo.png"
                        alt="Dead by Daylight Tally Marks"
                        className="w-64 md:w-80 object-contain"
                    />
                </div>

                {/* Layer 3: Typography Section */}
                <div className="mb-16 flex flex-col">
                    <h1 className="bebas-header-login">
                        The Entities Ledger
                    </h1>
                    <p className="inter-text-normal">
                        Feed the Entity your challenges.
                    </p>
                </div>

                {/* Google Login button */}
                <div className="flex gap-6 mx-auto">
                    <a
                        href={`${import.meta.env.VITE_API_BASE_URL || ''}/oauth2/authorization/google`}
                        className="bg-white text-black px-8 py-3 rounded-md font-bebas text-2xl tracking-wider hover:bg-gray-200 transition-colors">
                        SIGN IN WITH GOOGLE
                    </a>
                </div>

            </div>

        </div>
    );
};

export default LoginPage;
