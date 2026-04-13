import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
// import { useNavigate } from 'react-router-dom'; // We will uncomment this when the Dashboard exists
import api from '../services/api';
import './LoginPage.scss';

const LoginPage = () => {
    const [isMounted, setIsMounted] = useState(false);
    // const navigate = useNavigate();

    // Triggers the initial fade-in animation when the page loads
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Initiates the Google OAuth flow
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Send the token to Spring Boot to create/verify the user
                const res = await api.post('/players/sync', {}, {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`
                    }
                });

                // Save the token so our Axios Interceptor can use it for future requests
                localStorage.setItem('entity_jwt', tokenResponse.access_token);

                console.log("Logged in successfully!", res.data);
                // navigate('/dashboard'); // Route them to the main app
            } catch (error) {
                console.error("Failed to sync with The Entity", error);
            }
        },
        onError: () => {
            console.error('Login Failed');
        }
    });

    return (
        // The opacity transition handles the fade-in you requested
        <div className={`min-h-screen bg-[#040507] flex flex-col items-center justify-center relative transition-opacity duration-1000 ease-in-out ${isMounted ? 'opacity-100' : 'opacity-0'}`}>

            {/* Logo Section */}
            <div className="mb-12">
                {/* Drop your dbd-logo image into the public folder and uncomment this */}
                {/* <img src="/dbd-logo.png" alt="Dead by Daylight Tally Marks" className="w-64 md:w-80 object-contain" /> */}
            </div>

            {/* Typography Section */}
            <div className="text-center mb-16 flex flex-col items-start md:items-center">
                <h1 className="text-white uppercase tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '50px', lineHeight: '1' }}>
                    The Entities Ledger
                </h1>
                <p className="text-[#a0a0a0] mt-1" style={{ fontFamily: "'Inter', sans-serif", fontSize: '17px' }}>
                    Feed the Entity your challenges.
                </p>
            </div>

            {/* Action Section */}
            <div className="flex gap-6">
                <button
                    onClick={() => login()}
                    className="text-[#a0a0a0] hover:text-white px-12 py-3 tracking-wider transition-all duration-300 border-[6px] border-[#2F2F2F] bg-[#3A3A3A]/50 hover:bg-[#BC1919]/50 hover:border-[#823131]"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: '17px' }}
                >
                    Log In
                </button>
            </div>

        </div>
    );
};

export default LoginPage;
