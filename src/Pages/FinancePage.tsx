import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DuesRecordPage from "./DuesRecordPage";
import FinancialSummary from "../components/FinancialSummary";
import ImageCarousel from "../components/ImageCarousel";
import BankDetails from "../components/BankDetails";
import PrintButton from "../components/PrintButton";
import { supabase } from '../lib/supabase';

const FinancePage: React.FC = () => {
    const [showDuesRecord, setShowDuesRecord] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const financeImages = [
        {
            url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200",
            alt: "Financial Growth Chart"
        },
        {
            url: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&q=80&w=1200",
            alt: "Financial Planning"
        },
        {
            url: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&q=80&w=1200",
            alt: "Digital Banking"
        },
        {
            url: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=1200",
            alt: "Team Collaboration"
        }
    ];

    useEffect(() => {
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        try {
            const { data, error } = await supabase.rpc('check_admin_status');
            if (error) throw error;
            setIsAdmin(data || false);
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleYearChange = (increment: number) => {
        setSelectedYear(prev => prev + increment);
    };

    if (showDuesRecord) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="print-container"
            >
                <DuesRecordPage />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDuesRecord(false)}
                    className="fixed bottom-8 right-8 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors print:hidden"
                >
                    Back to Overview
                </motion.button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen p-4 md:p-8 space-y-8 print-container relative"
        >
            <div className="max-w-7xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex justify-between items-center">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-5xl font-bold text-blue-600 dark:text-blue-400"
                        >
                            Financial Overview
                        </motion.h1>

                        {/* Year Selection */}
                        <div className="flex items-center space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleYearChange(-1)}
                                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
                            >
                                <ChevronLeft size={20} />
                            </motion.button>
                            <span className="text-xl font-semibold text-current">{selectedYear}</span>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleYearChange(1)}
                                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
                            >
                                <ChevronRight size={20} />
                            </motion.button>
                        </div>
                    </div>

                    <ImageCarousel images={financeImages} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <BankDetails />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <FinancialSummary isAdmin={isAdmin} selectedYear={selectedYear} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => setShowDuesRecord(true)}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                    <h2 className="text-2xl font-semibold mb-4 text-current">Monthly Dues Record</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        View and manage monthly dues payments for all members. Click to access the detailed record.
                    </p>
                </motion.div>

                {isAdmin && (
                    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 print:hidden">
                        <PrintButton onPrint={handlePrint} />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default FinancePage;