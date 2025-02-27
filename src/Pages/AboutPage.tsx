import React from "react";
import { motion } from "framer-motion";
import { Heart, Shield, Star, Target } from "lucide-react";
import MemberCount from "../components/MemberCount";

const AboutPage: React.FC = () => {
    const values = [
        {
            icon: <Heart className="w-8 h-8 text-red-500" />,
            title: "Integrity",
            description: "Upholding the highest standards of service with unwavering honesty"
        },
        {
            icon: <Shield className="w-8 h-8 text-blue-500" />,
            title: "Compassion",
            description: "Serving with genuine care and understanding for every individual"
        },
        {
            icon: <Star className="w-8 h-8 text-yellow-500" />,
            title: "Excellence",
            description: "Striving for perfection in every aspect of our service"
        },
        {
            icon: <Target className="w-8 h-8 text-green-500" />,
            title: "Dedication",
            description: "Committed to creating meaningful worship experiences"
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative h-[500px] overflow-hidden"
            >
                <div className="absolute inset-0">
                    <motion.img
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.5 }}
                        src="https://images.unsplash.com/photo-1560184611-ff3e53f00e8f?auto=format&fit=crop&q=80&w=2070"
                        alt="Church Interior"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/30" />
                </div>

                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-6"
                        >
                            <MemberCount />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold text-white mb-6"
                        >
                            Our Mission & Legacy
                        </motion.h1>
                    </div>
                </div>
            </motion.section>

            {/* Mission Statement */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="prose prose-lg dark:prose-invert mx-auto"
                        >
                            <p className="text-xl leading-relaxed mb-8 text-gray-700 dark:text-gray-300">
                                At Dunamis Int'l Gospel Centre, our Glory Dome Ushering Department stands as a testament 
                                to service, humility, and the transformative power of love. Rooted in a tradition of 
                                heartfelt hospitality, we believe that the act of welcoming is an expression of divine grace.
                            </p>
                            <p className="text-xl leading-relaxed mb-8 text-gray-700 dark:text-gray-300">
                                Our mission is simple: to create an environment where every individual feels valued, 
                                supported, and spiritually enriched. With a deep commitment to excellence, our ushers 
                                embody the principles of integrity, compassion, and dedication.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Grid */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold text-center mb-12 text-current"
                    >
                        Our Core Values
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="mb-4">{value.icon}</div>
                                <h3 className="text-xl font-semibold mb-2 text-current">{value.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Image Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h2 className="text-3xl font-bold text-current">Our Legacy Continues</h2>
                            <p className="text-lg text-gray-700 dark:text-gray-300">
                                We honor our heritage by continually evolving, embracing new ways to connect, and 
                                extending our service beyond the physical space of our sanctuary. Join us as we build 
                                a community that celebrates faith, nurtures hope, and spreads the gospel of peace.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative h-[400px] rounded-xl overflow-hidden shadow-xl"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=2070"
                                alt="Church Community"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;