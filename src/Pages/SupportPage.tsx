import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, User, Users, Star, X, ChevronDown, ChevronUp, Award, Shield, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MemberCount from '../components/MemberCount';

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [leaderHover, setLeaderHover] = useState<string | null>(null);

  const toggleUnit = (unitName: string) => {
    if (expandedUnit === unitName) {
      setExpandedUnit(null);
    } else {
      setExpandedUnit(unitName);
    }
  };

  const leadership = [
    {
      role: 'Acting Leader',
      name: 'Deacon Chinedu',
      phone: '+234 803 786 5842',
      icon: <Award className="w-10 h-10 text-yellow-500" />,
      description: 'Oversees all department activities and coordinates with church leadership',
      color: 'from-yellow-500 to-amber-300'
    }
  ];

  const units = [
    {
      name: 'Welfare Unit',
      members: [
        { role: 'Unit Head', name: 'Bro. Abraham', phone: '+234 803 634 7730' },
        { role: 'Unit Assistant', name: 'Sis Juliet', phone: '+234 806 735 2573' }
      ]
    },
    {
      name: 'Accounts Unit',
      members: [
        { role: 'Unit Head', name: 'Bro. Elkay Kenneth', phone: '+234 803 629 9913' },
        { role: 'Unit Assistant', name: 'Sis Christy Osuagwu', phone: '+234 703 493 7183' }
      ]
    },
    {
      name: 'Training Unit',
      members: [
        { role: 'Unit Head', name: 'Bro. John Amara', phone: '+234 803 626 5630' },
        { role: 'Unit Assistant', name: 'Mrs. Ige', phone: '+234 803 315 5759' }
      ]
    },
    {
      name: 'Secretariat Unit',
      members: [
        { role: 'Unit Head', name: 'Bro. Uche', phone: '+234 803 781 2417' },
        { role: 'Unit Assistant', name: 'Mrs. Henry', phone: '+234 803 436 1731' }
      ]
    },
    {
      name: 'Prayer Unit',
      members: [
        { role: 'Unit Head', name: 'Bro. Sunday', phone: '+234 814 910 6700' },
        { role: 'Unit Assistant', name: 'Sis Charity', phone: '+234 814 828 3663' }
      ]
    },
    {
      name: 'Visitation Unit',
      members: [
        { role: 'Unit Head', name: 'Bro. Harrison', phone: '+234 803 361 2530' },
        { role: 'Unit Assistant', name: 'Sis Elizabeth', phone: '+234 805 658 1982' }
      ]
    },
    {
      name: 'Uniform Unit',
      members: [
        { role: 'Unit Head', name: 'Mr. Tony', phone: '+234 803 651 6964' },
        { role: 'Unit Assistant', name: 'Sis Maureen', phone: '+234 806 461 5882' }
      ]
    },
    {
      name: 'Technical Unit',
      members: [
        { role: 'Unit Head', name: 'Bro. Odion', phone: '+234 810 494 2027' },
        { role: 'Unit Assistant', name: 'Sis Faith', phone: '+234 805 583 9341' }
      ]
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 relative"
    >
      {/* Close Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate(-1)}
        className="fixed top-20 right-8 p-2 bg-gray-200 dark:bg-gray-700 rounded-full z-50 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        <X size={24} className="text-gray-600 dark:text-gray-300" />
      </motion.button>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">Support & Leadership</h1>
            <MemberCount />
          </motion.div>
        </div>

        {/* Leadership Section - Enhanced */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
        >
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-semibold mb-6 flex items-center text-current"
          >
            <Star className="w-6 h-6 text-yellow-500 mr-2" />
            Leadership Team
          </motion.h2>
          
          <div className="grid grid-cols-1 gap-6">
            {leadership.map((leader, index) => (
              <motion.div
                key={leader.name}
                custom={index}
                variants={cardVariants}
                onHoverStart={() => setLeaderHover(leader.name)}
                onHoverEnd={() => setLeaderHover(null)}
                className="relative overflow-hidden"
              >
                <motion.div 
                  className={`bg-gradient-to-r ${leader.color} rounded-lg p-1`}
                  animate={{ 
                    boxShadow: leaderHover === leader.name 
                      ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                      <motion.div 
                        className="p-4 rounded-full bg-blue-50 dark:bg-blue-900/20"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 1 }}
                      >
                        {leader.icon}
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{leader.name}</h3>
                            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">{leader.role}</p>
                          </div>
                          
                          <motion.a
                            href={`tel:${leader.phone.replace(/\s+/g, '')}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Phone size={18} />
                            <span className="hidden md:inline">Call Now</span>
                          </motion.a>
                        </div>
                        
                        <p className="mt-3 text-gray-600 dark:text-gray-300">{leader.description}</p>
                        
                        <div className="mt-4 flex items-center">
                          <Phone className="w-5 h-5 text-blue-500 mr-2" />
                          <span className="text-current">{leader.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: leaderHover === leader.name ? "100%" : "0%" 
                      }}
                      transition={{ duration: 0.5 }}
                      className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 mt-4 rounded-full"
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Units Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-semibold mb-6 flex items-center text-current"
          >
            <Users className="w-6 h-6 text-green-500 mr-2" />
            Departmental Units
          </motion.h2>
          <div className="space-y-4">
            {units.map((unit, unitIndex) => (
              <motion.div
                key={unit.name}
                custom={unitIndex}
                variants={cardVariants}
                className="border dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <motion.div
                  onClick={() => toggleUnit(unit.name)}
                  className={`flex justify-between items-center p-4 cursor-pointer ${
                    expandedUnit === unit.name 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                  whileHover={{ backgroundColor: expandedUnit === unit.name ? '#dbeafe' : '#f9fafb' }}
                >
                  <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400">{unit.name}</h3>
                  <motion.div
                    animate={{ rotate: expandedUnit === unit.name ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {expandedUnit === unit.name ? (
                      <ChevronUp className="w-5 h-5 text-blue-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-blue-500" />
                    )}
                  </motion.div>
                </motion.div>
                
                <AnimatePresence>
                  {expandedUnit === unit.name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
                        {unit.members.map((member, memberIndex) => (
                          <motion.div
                            key={`${member.role}-${memberIndex}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: memberIndex * 0.1 }}
                            className="pl-4 border-l-2 border-blue-300 dark:border-blue-700"
                          >
                            <p className="font-medium text-gray-700 dark:text-gray-300">{member.role}</p>
                            <p className="flex items-center mt-1 text-current">
                              <User className="w-4 h-4 mr-2 text-blue-500" />
                              {member.name}
                            </p>
                            {member.phone && (
                              <p className="flex items-center mt-1 text-current">
                                <Phone className="w-4 h-4 mr-2 text-blue-500" />
                                {member.phone}
                              </p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default SupportPage;