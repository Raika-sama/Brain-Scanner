// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard,
  School,
  GraduationCap,
  Users,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Loader2
} from 'lucide-react';
import axios from '../utils/axios';
import { Tooltip } from '@mui/material';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [classes, setClasses] = useState([]);
  const [isClassesOpen, setIsClassesOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Varianti per le animazioni
  const sidebarVariants = {
    open: { width: '16rem' },
    closed: { width: '5rem' }
  };

  const menuItemVariants = {
    hover: { scale: 1.02, x: 5 },
    tap: { scale: 0.98 }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/classes');
        setClasses(response.data.data);
      } catch (error) {
        console.error('Errore nel caricamento delle classi:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isClassesOpen) {
      fetchClasses();
    }
  }, [isClassesOpen]);

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Scuole', path: '/schools', icon: School },
    { 
      title: 'Classi', 
      path: '/classes', 
      icon: GraduationCap,
      hasSubmenu: true,
      submenuItems: classes.map(cls => ({
        title: `${cls.year}ª ${cls.section}`,
        path: `/classes/${cls._id}`,
        id: cls._id
      }))
    },
    { title: 'Studenti', path: '/students', icon: Users },
    { title: 'Test', path: '/tests', icon: ClipboardList }
  ];

  const handleMenuClick = (item) => {
    if (item.hasSubmenu) {
      setIsClassesOpen(!isClassesOpen);
      navigate(item.path);
    } else {
      navigate(item.path);
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/90 backdrop-blur-md
        border-r border-gray-200/50 shadow-lg z-40 overflow-hidden`}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <nav className="mt-6 px-3">
        <AnimatePresence mode="wait">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isClassSection = item.hasSubmenu && isClassesOpen;

            return (
              <div key={index}>
                <Tooltip 
                  title={!isOpen ? item.title : ''} 
                  placement="right"
                  arrow
                >
                  <motion.button
                    onClick={() => handleMenuClick(item)}
                    variants={menuItemVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className={`flex items-center w-full p-3 mb-2 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <item.icon className={`w-5 h-5 transition-colors duration-200
                      ${isActive ? 'text-blue-600' : 'text-gray-400'}`} 
                    />
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-3 flex-1 text-left whitespace-nowrap"
                      >
                        {item.title}
                        {item.hasSubmenu && (
                          <motion.span
                            animate={{ rotate: isClassesOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="inline-block ml-2"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.span>
                        )}
                      </motion.span>
                    )}
                  </motion.button>
                </Tooltip>

                {/* Sottomenu delle classi con animazione */}
                <AnimatePresence>
                  {isOpen && isClassSection && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-8 mb-2 overflow-hidden"
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="flex items-center text-gray-400 text-sm py-2"
                        >
                          <Loader2 className="w-4 h-4 mr-2" />
                          Caricamento...
                        </motion.div>
                      ) : classes.length === 0 ? (
                        <div className="text-gray-400 text-sm py-2">
                          Nessuna classe disponibile
                        </div>
                      ) : (
                        item.submenuItems.map((subItem, subIndex) => (
                          <motion.button
                            key={subIndex}
                            onClick={() => navigate(subItem.path)}
                            whileHover={{ x: 5 }}
                            className={`flex items-center w-full p-2 rounded-lg text-sm mb-1
                              ${location.pathname === subItem.path
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-500 hover:bg-gray-50'}`}
                          >
                            <span className="ml-2">{subItem.title}</span>
                          </motion.button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </AnimatePresence>
      </nav>
    </motion.aside>
  );
};

export default Sidebar;