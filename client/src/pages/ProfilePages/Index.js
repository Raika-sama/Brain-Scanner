import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext'; // Corretto il percorso
import { 
  User, School, Users, BookOpen, Clock, Mail, Key, UserCheck, Building, MapPin, Calendar, GraduationCap 
} from 'lucide-react';
import axios from '../../utils/axios'; // Corretto il percorso
import { Section, InfoField, LoadingSpinner, ErrorMessage } from './components'; // Percorso corretto per components



const ProfilePage = () => {
  const [state, setState] = useState({
    userData: null,
    assignedSchool: null,
    userClasses: [],
    students: [],
    loading: {
      user: true,
      school: true,
      classes: true,
      students: true
    },
    errors: {
      user: null,
      school: null,
      classes: null,
      students: null
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await axios.get('/api/users/me');
        setState(prev => ({
          ...prev,
          userData: userResponse.data.user,
          loading: { ...prev.loading, user: false }
        }));

        // Fetch assigned school
        try {
          const schoolResponse = await axios.get('/api/schools/assigned');
          if (schoolResponse.data.success) {
            setState(prev => ({
              ...prev,
              assignedSchool: schoolResponse.data.data,
              loading: { ...prev.loading, school: false }
            }));
          }
        } catch (error) {
          setState(prev => ({
            ...prev,
            errors: { ...prev.errors, school: 'Errore nel caricamento della scuola' },
            loading: { ...prev.loading, school: false }
          }));
        }

        // Fetch classes
        try {
          const classesResponse = await axios.get('/api/classes');
          setState(prev => ({
            ...prev,
            userClasses: classesResponse.data.data || [],
            loading: { ...prev.loading, classes: false }
          }));
        } catch (error) {
          setState(prev => ({
            ...prev,
            errors: { ...prev.errors, classes: 'Errore nel caricamento delle classi' },
            loading: { ...prev.loading, classes: false }
          }));
        }

        // Fetch students
        try {
          const studentsResponse = await axios.get('/api/students/school/assigned');
          setState(prev => ({
            ...prev,
            students: studentsResponse.data.data || [],
            loading: { ...prev.loading, students: false }
          }));
        } catch (error) {
          setState(prev => ({
            ...prev,
            errors: { ...prev.errors, students: 'Errore nel caricamento degli studenti' },
            loading: { ...prev.loading, students: false }
          }));
        }

      } catch (error) {
        setState(prev => ({
          ...prev,
          errors: { ...prev.errors, user: 'Errore nel caricamento dei dati utente' },
          loading: { ...prev.loading, user: false }
        }));
      }
    };

    fetchData();
  }, []);

  const isLoading = Object.values(state.loading).some(Boolean);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const { userData, assignedSchool, userClasses, students } = state;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      {/* User Information */}
      <Section icon={<User />} title="Informazioni Personali">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField 
            icon={<User />}
            label="Nome Completo" 
            value={`${userData?.firstName} ${userData?.lastName}`} 
          />
          <InfoField 
            icon={<Mail />}
            label="Email" 
            value={userData?.email} 
          />
          <InfoField 
            icon={<UserCheck />}
            label="Ruolo" 
            value={userData?.role === 'admin' ? 'Amministratore' : 'Insegnante'} 
          />
          <InfoField 
            icon={<Clock />}
            label="Ultimo Accesso" 
            value={userData?.lastLogin ? new Date(userData.lastLogin).toLocaleString('it-IT') : 'Mai'} 
          />
        </div>
      </Section>

      {/* Assigned School */}
      {assignedSchool && (
        <Section icon={<School />} title="Scuola Assegnata">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {assignedSchool.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField 
                  icon={<Building />}
                  label="Tipo" 
                  value={assignedSchool.schoolType === 'middle_school' ? 'Scuola Media' : 'Scuola Superiore'} 
                />
                <InfoField 
                  icon={<MapPin />}
                  label="Indirizzo" 
                  value={assignedSchool.address} 
                />
                <InfoField 
                  label="Regione" 
                  value={assignedSchool.region} 
                />
                <InfoField 
                  label="Provincia" 
                  value={assignedSchool.province} 
                />
                {assignedSchool.institutionType !== 'none' && (
                  <InfoField 
                    label="Indirizzo Specializzazione" 
                    value={assignedSchool.institutionType} 
                  />
                )}
                <InfoField 
                  label="Sezioni" 
                  value={assignedSchool.sections.join(', ')} 
                />
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Classes */}
      {userClasses.length > 0 && (
        <Section icon={<BookOpen />} title="Classi">
          <div className="grid gap-4">
            {userClasses.map((class_) => (
              <div key={class_._id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {`${class_.year}${class_.section}`}
                    {class_.mainTeacher === userData._id && (
                      <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Docente Principale
                      </span>
                    )}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField 
                    icon={<Calendar />}
                    label="Anno Accademico" 
                    value={class_.academicYear} 
                  />
                  <InfoField 
                    icon={<Users />}
                    label="Studenti" 
                    value={class_.students?.length || 0} 
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Students */}
      {students.length > 0 && (
        <Section icon={<GraduationCap />} title="Studenti">
          <div className="grid gap-4">
            {students.map((student) => (
              <div key={student._id} className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField 
                    icon={<User />}
                    label="Nome" 
                    value={`${student.firstName} ${student.lastName}`} 
                  />
                  <InfoField 
                    label="Classe" 
                    value={student.classId ? `${student.year}${student.section}` : 'Non Assegnata'} 
                  />
                  <InfoField 
                    icon={<Mail />}
                    label="Email" 
                    value={student.email || '-'} 
                  />
                  <InfoField 
                    label="Stato" 
                    value={student.needsClassAssignment ? 'In Attesa di Assegnazione' : 'Assegnato'} 
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </motion.div>
  );
};

export default ProfilePage;