import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './LoginPage.scss';

const LoginPage = () => {
    const [isMounted, setIsMounted] = useState(false);
    const navigate = useNavigate();

    // Triggers the initial fade-in animation when the page loads
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // The success handler for the official Google button
    const handleLoginSuccess = async (credentialResponse) => {
        try {
            // credentialResponse.credential contains the 'eyJ...' JWT that Spring Boot requires!
            const res = await api.post('/players/sync', {}, {
                headers: {
                    Authorization: `Bearer ${credentialResponse.credential}`
                }
            });

            // Save the JWT so our Axios Interceptor can use it for future requests
            localStorage.setItem('entity_jwt', credentialResponse.credential);

            console.log("Logged in successfully!", res.data);
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to sync with The Entity", error);
        }
    };

    return (
        <div className={`min-h-screen bg-[#040507] flex flex-col items-center justify-center relative transition-opacity duration-1000 ease-in-out ${isMounted ? 'opacity-100' : 'opacity-0'}`}>

            {/* Logo Section */}
            <div className="mb-12">
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
                {/* We use the official Google Component to ensure we get the JWT */}
                <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={() => console.error('Login Failed')}
                    theme="filled_black"
                    size="large"
                    shape="rectangular"
                    text="signin_with"
                />
            </div>

        </div>
    );
};

export default LoginPage;
