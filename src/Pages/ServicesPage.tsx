import React from "react";
import { motion } from "framer-motion";
import { Heart, Compass, Users, Calendar, Accessibility, Handshake } from "lucide-react";
import MemberCount from "../components/MemberCount";

const ServicesPage: React.FC = () => {
    const services = [
        {
            icon: <Heart className="w-12 h-12 text-red-500" />,
            title: "Warm Welcome & Orientation",
            description: "From the moment you step through our doors, our dedicated ushers greet you with genuine warmth. We provide a clear orientation of the sanctuary, ensuring that you feel comfortable and informed."
        },
        {
            icon: <Compass className="w-12 h-12 text-blue-500" />,
            title: "Guidance & Assistance",
            description: "Whether you need help finding a seat, accessing special accommodations, or have questions about the service, our team is on hand to guide you with efficiency and care."
        },
        {
            icon: <Calendar className="w-12 h-12 text-green-500" />,
            title: "Event Coordination",
            description: "For special events, conferences, and outreach programs, our ushers work closely with event coordinators to manage crowd flow, seating arrangements, and ensure a smooth experience."
        },
        {
            icon: <Accessibility className="w-12 h-12 text-purple-500" />,
            title: "Accessibility & Support",
            description: "We are committed to making our church accessible to everyone. Our team is trained to offer support to individuals with mobility challenges or any special needs."
        },
        {
            icon: <Handshake className="w-12 h-12 text-yellow-500" />,
            title: "Community Connection",
            description: "Beyond logistics, our ushers play a crucial role in building community spirit. They are here to listen, to encourage, and to connect you with the wider ministry."
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
        >
            {/* Hero Section */}
            <section className="relative h-[400px] overflow-hidden">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0"
                >
                    <img
                        src="https://images.unsplash.com/photo-1607962837359-5e7e89f86776?auto=format&fit=crop&q=80&w=2070"
                        alt="Church Service"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </motion.div>
                
                <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-center text-center">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                    >
                        <MemberCount />
                    </motion.div>
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-4"
                    >
                        What We Offer
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-white/90 max-w-2xl"
                    >
                        Our Glory Dome Ushering Department provides services designed to enhance your worship experience
                        and ensure that every visit is seamless and spiritually uplifting.
                    </motion.p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-20 container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
                        >
                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-full inline-block">
                                {service.icon}
                            </div>
                            <h3 className="text-2xl font-semibold mb-3 text-current">{service.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Mission Statement */}
            <section className="py-20 bg-blue-600 dark:bg-blue-800">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto text-center text-white"
                    >
                        <h2 className="text-3xl font-bold mb-6">Our Commitment</h2>
                        <p className="text-lg leading-relaxed">
                            Each service we provide is infused with our core values of compassion, respect, and unwavering
                            commitment to making every visitor feel at home. Our goal is to ensure that your journey within
                            our church is not only organized and comfortable but also spiritually enriching and full of grace.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Image Gallery */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative h-80 rounded-xl overflow-hidden shadow-lg"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=2070"
                                alt="Church Community"
                                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="relative h-80 rounded-xl overflow-hidden shadow-lg"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1560184611-ff3e53f00e8f?auto=format&fit=crop&q=80&w=2070"
                                alt="Church Service"
                                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="relative h-80 rounded-xl overflow-hidden shadow-lg"
                        >
                            <img
                                src="data:image/jpeg;base64,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"
                                alt="Worship"
                                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>
        </motion.div>
    );
};

export default ServicesPage;