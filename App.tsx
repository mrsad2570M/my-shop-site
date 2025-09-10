import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Register from './components/Register';
import Services from './components/Services';
import Features from './components/Features';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import QuickActions from './components/QuickActions';
import Notification from './components/Notification';
import Terms from './components/Terms'; // Import the new component
import { NotificationType } from './types';

const App: React.FC = () => {
    const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
    const [activeRegisterTab, setActiveRegisterTab] = useState('sell');
    const [showTermsPage, setShowTermsPage] = useState(false); // State for the new page
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            console.log('beforeinstallprompt event fired');
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = () => {
        if (!installPrompt) {
            return;
        }
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            setInstallPrompt(null); // The prompt can only be used once.
        });
    };

    const showNotification = (message: string, type: NotificationType) => {
        setNotification({ message, type });
    };

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleSellClick = () => {
        setActiveRegisterTab('sell');
        document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleShowTerms = () => {
        setShowTermsPage(true);
        window.scrollTo(0, 0); // Scroll to top when showing terms
    };

    const handleCloseTerms = () => {
        setShowTermsPage(false);
    };

    if (showTermsPage) {
        return <Terms onClose={handleCloseTerms} />;
    }

    return (
        <div className="bg-white text-gray-800 font-sans">
            <Header />
            <main>
                <Hero onSellClick={handleSellClick} />
                <Services />
                <Features />
                <Register 
                    showNotification={showNotification} 
                    activeTab={activeRegisterTab}
                    setActiveTab={setActiveRegisterTab}
                    onShowTerms={handleShowTerms}
                />
                <Stats />
                <Testimonials />
                <Contact showNotification={showNotification} />
            </main>
            <Footer onShowTerms={handleShowTerms} />
            <QuickActions onInstallClick={handleInstallClick} showInstallButton={!!installPrompt} />
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default App;