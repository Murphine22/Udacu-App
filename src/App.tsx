import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Moon, Sun, MessageCircle, Apple as WhatsApp, Church, Bell } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import HomePage from "./Pages/HomePage";
import AboutPage from "./Pages/AboutPage";
import ServicesPage from "./Pages/ServicesPage";
import FinancePage from "./Pages/FinancePage";
import SupportPage from "./Pages/SupportPage";
import DuesRecordPage from "./Pages/DuesRecordPage";
import AuthModal from "./components/AuthModal";
import ChatBot from "./components/ChatBot";
import MemberSearch from "./components/MemberSearch";
import Footer from "./components/Footer";
import SupportButton from "./components/SupportButton";
import { supabase } from './lib/supabase';

const App: React.FC = () => {
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showAuth, setShowAuth] = useState<boolean>(false);
    const [showChat, setShowChat] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null);
    const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(false);
    const [unreadAnnouncements, setUnreadAnnouncements] = useState<number>(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

    useEffect(() => {
        // Check for dark mode preference in localStorage
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
        
        // Apply dark mode class to document
        if (savedDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
            setIsSupabaseConfigured(true);
            supabase.auth.getSession().then(({ data: { session } }) => {
                setUser(session?.user ?? null);
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
            });

            // Check for unread announcements
            checkUnreadAnnouncements();

            // Subscribe to changes in the announcements table
            const announcementsChannel = supabase
                .channel('announcements_changes')
                .on('postgres_changes', 
                    { event: 'INSERT', schema: 'public', table: 'announcements' },
                    () => checkUnreadAnnouncements()
                )
                .subscribe();

            return () => {
                subscription.unsubscribe();
                announcementsChannel.unsubscribe();
            };
        }
    }, []);

    // Update localStorage and document class when darkMode changes
    useEffect(() => {
        localStorage.setItem('darkMode', darkMode.toString());
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const checkUnreadAnnouncements = async () => {
        try {
            // Get the last viewed timestamp from localStorage
            const lastViewed = localStorage.getItem('lastViewedAnnouncements') 
                ? new Date(localStorage.getItem('lastViewedAnnouncements') || '') 
                : new Date(0);
            
            // Get announcements created after the last viewed timestamp
            const { data, error } = await supabase
                .from('announcements')
                .select('id')
                .gt('created_at', lastViewed.toISOString());
            
            if (error) throw error;
            
            setUnreadAnnouncements(data?.length || 0);
        } catch (error) {
            console.error('Error checking unread announcements:', error);
        }
    };

    const handleSignOut = async () => {
        if (!isSupabaseConfigured) {
            toast.error('Authentication is not configured');
            return;
        }
        await supabase.auth.signOut();
        toast.success('Signed out successfully');
        setShowSettings(false);
    };

    const menuItems = [
        { path: "/", label: "Home" },
        { path: "/about", label: "About" },
        { path: "/services", label: "Services" },
        { path: "/finance", label: "Finance" }
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <Router>
            <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
                <nav className={`fixed w-full top-0 z-50 ${darkMode ? 'bg-gray-800' : 'bg-blue-600'} p-4 text-white shadow-lg`}>
                    <div className="container mx-auto flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0">
                        <div className="flex justify-between items-center">
                            <a 
                                href="https://www.dunamisgospel.org" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center space-x-2"
                            >
                                <Church size={32} className="text-white" />
                                <span className="text-xl font-bold">DIGC</span>
                            </a>
                            
                            {/* Mobile menu button */}
                            <div className="flex items-center space-x-4 md:hidden">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setDarkMode(!darkMode)}
                                    className="p-2 rounded-full hover:bg-white/10"
                                >
                                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                                </motion.button>
                                
                                <button 
                                    onClick={toggleMobileMenu}
                                    className="p-2 rounded-full hover:bg-white/10"
                                >
                                    <div className="w-6 h-0.5 bg-white mb-1.5"></div>
                                    <div className="w-6 h-0.5 bg-white mb-1.5"></div>
                                    <div className="w-6 h-0.5 bg-white"></div>
                                </button>
                            </div>
                            
                            {/* Desktop menu */}
                            <ul className="hidden md:flex space-x-4 ml-8">
                                {menuItems.map((item) => (
                                    <motion.li key={item.path} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            to={item.path}
                                            className="px-4 py-2 rounded-lg hover:bg-white/10"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex-1 max-w-md mx-auto md:mx-0">
                                <MemberSearch />
                            </div>
                            <div className="hidden md:flex items-center space-x-4">
                                <Link to="/" className="relative">
                                    <Bell size={20} className="text-white" />
                                    {unreadAnnouncements > 0 && (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                                        >
                                            {unreadAnnouncements > 9 ? '9+' : unreadAnnouncements}
                                        </motion.div>
                                    )}
                                </Link>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setDarkMode(!darkMode)}
                                    className="p-2 rounded-full hover:bg-white/10"
                                >
                                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile menu */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="md:hidden mt-4 bg-blue-700 dark:bg-gray-700 rounded-lg overflow-hidden"
                            >
                                <ul className="py-2">
                                    {menuItems.map((item) => (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path}
                                                className="block px-4 py-3 hover:bg-blue-800 dark:hover:bg-gray-600"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex items-center justify-between px-4 py-3 border-t border-blue-800 dark:border-gray-600">
                                    <Link 
                                        to="/" 
                                        className="relative"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Bell size={20} className="text-white" />
                                        {unreadAnnouncements > 0 && (
                                            <motion.div 
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                                            >
                                                {unreadAnnouncements > 9 ? '9+' : unreadAnnouncements}
                                            </motion.div>
                                        )}
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>

                <main className="container mx-auto pt-32 px-4 pb-32">
                    <AnimatePresence mode="wait">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/services" element={<ServicesPage />} />
                            <Route path="/finance" element={<FinancePage />} />
                            <Route path="/support" element={<SupportPage />} />
                            <Route path="/dues-record" element={<DuesRecordPage />} />
                        </Routes>
                    </AnimatePresence>
                </main>

                {/* Fixed bottom-right controls */}
                <div className="fixed bottom-8 right-8 flex flex-col space-y-4">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowChat(!showChat)}
                        className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
                    >
                        <MessageCircle size={24} />
                    </motion.button>
                    <motion.a
                        href="https://chat.whatsapp.com/K7sYc0LBFOAI2551Dm8FwH"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
                    >
                        <WhatsApp size={24} />
                    </motion.a>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
                    >
                        <Settings size={24} />
                    </motion.button>
                </div>

                {/* Support button at bottom left */}
                <div className="fixed bottom-8 left-8 z-50">
                    <SupportButton />
                </div>

                <Footer />

                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={`fixed bottom-8 right-32 p-4 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                        >
                            <div className="space-y-4">
                                <h3 className="font-semibold text-current">Settings</h3>
                                {!isSupabaseConfigured ? (
                                    <div className="text-sm text-yellow-600">
                                        Please connect to Supabase to enable authentication
                                    </div>
                                ) : user ? (
                                    <>
                                        <p className="text-current">Signed in as {user.email}</p>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setShowAuth(true)}
                                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        Sign In / Sign Up
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showAuth && isSupabaseConfigured && <AuthModal onClose={() => setShowAuth(false)} />}
                </AnimatePresence>

                <AnimatePresence>
                    {showChat && <ChatBot onClose={() => setShowChat(false)} />}
                </AnimatePresence>

                <Toaster position="bottom-right" />
            </div>
        </Router>
    );
};

export default App;