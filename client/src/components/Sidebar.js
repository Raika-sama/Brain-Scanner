// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  School,
  GraduationCap,
  Users,
  ClipboardList,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import axios from '../utils/axios';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [classes, setClasses] = useState([]);
  const [isClassesOpen, setIsClassesOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch delle classi associate all'utente
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

    // Carica le classi solo quando il menu è aperto per ottimizzare le prestazioni
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
        title: `${cls.name} ${cls.section}`,
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
      navigate(item.path); // Naviga alla dashboard delle classi
    } else {
      navigate(item.path);
    }
  };

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-900 text-white 
      transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} z-40 overflow-y-auto`}>
      <nav className="mt-6 px-3">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isClassSection = item.hasSubmenu && isClassesOpen;

          return (
            <div key={index}>
              <button
                onClick={() => handleMenuClick(item)}
                className={`flex items-center w-full p-3 mb-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                <item.icon className="w-5 h-5" />
                {isOpen && (
                  <>
                    <span className="ml-3 flex-1 text-left">{item.title}</span>
                    {item.hasSubmenu && (
                      isClassesOpen ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                    )}
                  </>
                )}
              </button>

              {/* Sottomenu delle classi */}
              {isOpen && isClassSection && (
                <div className="ml-8 mb-2">
                  {loading ? (
                    <div className="text-gray-400 text-sm py-2">
                      Caricamento classi...
                    </div>
                  ) : classes.length === 0 ? (
                    <div className="text-gray-400 text-sm py-2">
                      Nessuna classe disponibile
                    </div>
                  ) : (
                    item.submenuItems.map((subItem, subIndex) => (
                      <button
                        key={subIndex}
                        onClick={() => navigate(subItem.path)}
                        className={`flex items-center w-full p-2 rounded-md text-sm
                          ${location.pathname === subItem.path
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                      >
                        <span className="ml-2">{subItem.title}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;