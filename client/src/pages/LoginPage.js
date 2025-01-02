// src/pages/LoginPage.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from '../components/Login';
import Registration from '../components/Registration';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  // Varianti per le animazioni
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const tabVariants = {
    inactive: { opacity: 0.6 },
    active: { opacity: 1 }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Logo e Titolo */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Brain Scanner
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-600 mt-2"
          >
            Piattaforma di test e valutazione
          </motion.p>
        </div>

        {/* Card Container */}
        <motion.div
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <motion.button
              variants={tabVariants}
              animate={activeTab === 'login' ? 'active' : 'inactive'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 text-sm font-medium transition-colors duration-200
                ${activeTab === 'login' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              Accedi
            </motion.button>
            <motion.button
              variants={tabVariants}
              animate={activeTab === 'register' ? 'active' : 'inactive'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-4 text-sm font-medium transition-colors duration-200
                ${activeTab === 'register' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              Registrati
            </motion.button>
          </div>
          {/* Form Container */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'login' ? <Login /> : <Registration />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer con info aggiuntive */}
          <div className="px-6 pb-6 text-center">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-500"
            >
              {activeTab === 'login' 
                ? "Non hai un account? " 
                : "Hai già un account? "}
              <button
                onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {activeTab === 'login' ? 'Registrati ora' : 'Accedi'}
              </button>
            </motion.p>
          </div>
        </motion.div>

        {/* Credits */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-gray-500 mt-8"
        >
          Brain Scanner © {new Date().getFullYear()}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;