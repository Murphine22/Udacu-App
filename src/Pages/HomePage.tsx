import React from "react";
import { motion } from "framer-motion";
import { Heart, Users, Smile, Church, ArrowDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import MemberCount from "../components/MemberCount";
import AnnouncementSection from "../components/AnnouncementSection";

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const features = [
        {
            icon: <Heart className="w-8 h-8 text-red-500" />,
            title: "Warm Welcome",
            description: "Every greeting is an invitation to encounter grace"
        },
        {
            icon: <Users className="w-8 h-8 text-blue-500" />,
            title: "Family Spirit",
            description: "We're not just a team—we're a family dedicated to service"
        },
        {
            icon: <Smile className="w-8 h-8 text-yellow-500" />,
            title: "Heartfelt Service",
            description: "Guiding you through every moment of worship"
        },
        {
            icon: <Church className="w-8 h-8 text-purple-500" />,
            title: "Divine Experience",
            description: "Creating an atmosphere of reverence and hope"
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section with Parallax Effect */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative min-h-screen overflow-hidden"
            >
                <div className="absolute inset-0">
                    <motion.div
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 2 }}
                        className="relative h-full w-full"
                    >
                        <motion.img
                            src="https://images.unsplash.com/photo-1601142634808-38923eb7c560?auto=format&fit=crop&q=80&w=2070"
                            alt="Glory Dome"
                            className="w-full h-full object-cover"
                            style={{ objectPosition: "center 20%" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/30" />
                    </motion.div>
                </div>

                <div className="relative container mx-auto px-4 h-screen flex flex-col justify-center items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-4xl"
                    >
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight"
                        >
                            Welcome to Dunamis 
                            <span className="block text-blue-400">Ushering Department</span>
                        </motion.h1>
                        
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed"
                        >
                            Step into a place of warm embrace and divine service at the
                            <span className="text-blue-400"> Dunamis Int'l Gospel Centre</span>
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6"
                        >
                            <MemberCount />
                            <motion.button
                            onClick={() => navigate('/support')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                            >
                                Join Our Family
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                    >
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <ArrowDown className="w-8 h-8 text-white/80" />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Announcements & Updates Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <AnnouncementSection />
                </div>
            </section>

            {/* Welcome Message Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-current">Our Promise to You</h2>
                        <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300">
                            Our Glory Dome Ushering Department is not just a team—it's a family dedicated to welcoming 
                            every soul with a heartfelt smile, guiding you through every moment of worship, and ensuring 
                            your experience is filled with hope and reverence.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid with Hover Effects */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                whileHover={{ y: -10 }}
                                className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                            >
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                    className="mb-6"
                                >
                                    {feature.icon}
                                </motion.div>
                                <h3 className="text-xl font-semibold mb-4 text-current">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Image Gallery with Parallax */}
            <section className="py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=2070"
                                alt="Worship Service"
                                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <h3 className="absolute bottom-6 left-6 text-2xl font-bold text-white">Worship</h3>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1560184611-ff3e53f00e8f?auto=format&fit=crop&q=80&w=2070"
                                alt="Community"
                                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <h3 className="absolute bottom-6 left-6 text-2xl font-bold text-white">Community</h3>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1607962837359-5e7e89f86776?auto=format&fit=crop&q=80&w=2070"
                                alt="Fellowship"
                                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <h3 className="absolute bottom-6 left-6 text-2xl font-bold text-white">Fellowship</h3>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 bg-blue-600 dark:bg-blue-800">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto text-center text-white"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Community</h2>
                        <p className="text-xl mb-8">
                            Every step you take leads you closer to the heart of our community.
                            Experience the warmth of fellowship and the promise of spiritual upliftment.
                        </p>
                        <motion.button
                            onClick={() => navigate('/support')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            Begin Your Journey
                        </motion.button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;