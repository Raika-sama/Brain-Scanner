import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "../components/ui/card";
import { 
  School, 
  MapPin, 
  Phone, 
  Mail, 
  Edit2, 
  Users, 
  AlertCircle 
} from 'lucide-react';
import axios from '../utils/axios';
import { Skeleton } from '../components/ui/skeleton';
import Alert from '../components/ui/alert'
import Button from '../components/ui/button'

// Componente per le statistiche
const StatCard = ({ icon: Icon, title, value, className }) => (
  <Card className={className}>
    <CardContent className="p-6">
      <div className="flex items-center space-x-2">
        <Icon className="w-6 h-6 text-blue-500" />
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Componente per i dettagli
const DetailSection = ({ title, icon: Icon, children }) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center space-x-2 pb-2">
      <Icon className="w-5 h-5 text-blue-500" />
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </CardContent>
  </Card>
);

// Componente per i singoli dettagli
const DetailItem = ({ label, value }) => (
  <div className="space-y-1">
    <h3 className="text-sm font-medium text-gray-500">{label}</h3>
    <p className="text-base">{value || 'Non specificato'}</p>
  </div>
);

const SchoolPage = () => {
  const [school, setSchool] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalTeachers: 0
  });

  const fetchSchool = async () => {
    try {
      const response = await axios.get('/api/schools/assigned');
      if (response.data.success) {
        setSchool(response.data.data);
        // Qui potresti fare una chiamata separata per le statistiche
        // o calcolarle dai dati della scuola
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Errore nel caricamento della scuola');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchool();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Nessuna scuola assegnata</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header con azioni */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestione Scuola
        </h1>
        <Button
          variant="outline"
          className="flex items-center space-x-2"
          onClick={() => {/* Implementare modifica */}}
        >
          <Edit2 className="w-4 h-4" />
          <span>Modifica</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          icon={Users} 
          title="Studenti Totali" 
          value={stats.totalStudents} 
        />
        <StatCard 
          icon={School} 
          title="Classi" 
          value={stats.totalClasses} 
        />
        <StatCard 
          icon={Users} 
          title="Docenti" 
          value={stats.totalTeachers} 
        />
      </div>

      {/* Dettagli Scuola */}
      <DetailSection title="Anagrafica" icon={School}>
        <DetailItem label="Nome Istituto" value={school.name} />
        <DetailItem label="Codice Meccanografico" value={school.mechanographicCode} />
        <DetailItem 
          label="Tipo Istituto" 
          value={school.schoolType === 'middle_school' ? 
            'Scuola Secondaria di Primo Grado' : 
            'Scuola Secondaria di Secondo Grado'} 
        />
        {school.schoolType !== 'middle_school' && (
          <DetailItem 
            label="Indirizzo Scolastico" 
            value={school.institutionType} 
          />
        )}
      </DetailSection>

      {/* Localizzazione */}
      <DetailSection title="Localizzazione" icon={MapPin}>
        <DetailItem label="Regione" value={school.region} />
        <DetailItem label="Provincia" value={school.province} />
        <DetailItem label="Città" value={school.city} />
        <DetailItem label="Indirizzo" value={school.address} />
      </DetailSection>

      {/* Contatti */}
      <DetailSection title="Contatti" icon={Mail}>
        <DetailItem label="Email Istituzionale" value={school.email} />
        {school.manager && (
          <>
            <DetailItem 
              label="Referente" 
              value={`${school.manager.firstName} ${school.manager.lastName}`} 
            />
            <DetailItem label="Email Referente" value={school.manager.email} />
            <DetailItem label="Telefono Referente" value={school.manager.phone} />
          </>
        )}
      </DetailSection>
    </div>
  );
};

export default SchoolPage;