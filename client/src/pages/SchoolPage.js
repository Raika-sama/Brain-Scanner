import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { School, Users, GraduationCap, ClipboardList } from 'lucide-react';
import axios from 'axios';

const SchoolPage = () => {
  const [school, setSchool] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  
    const fetchSchool = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/schools/assigned');
        
        if (response.data.success) {
          setSchool(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Errore nel caricamento della scuola');
      } finally {
        setLoading(false);
      }
    };
    useEffect(() => {
    fetchSchool();
  }, []);

  if (loading) {
    return <div>Caricamento...</div>;
  }

  if (error) {
    return <div className="text-red-500">Errore: {error}</div>;
  }

  if (!school) {
    return <div>Nessuna scuola assegnata</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Anagrafica Principale */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <School className="w-6 h-6" />
            <CardTitle>Anagrafica Scuola</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Nome Istituto</h3>
            <p>{school.nome}</p>
          </div>
          <div>
            <h3 className="font-semibold">Codice Meccanografico</h3>
            <p>{school.codice_meccanografico}</p>
          </div>
          <div>
            <h3 className="font-semibold">Tipo Istituto</h3>
            <p>{school.tipo_istituto === 'primo_grado' ? 'Scuola Secondaria di Primo Grado' : 
               school.tipo_istituto === 'secondo_grado' ? 'Scuola Secondaria di Secondo Grado' : 
               'Istituto Comprensivo'}</p>
          </div>
          {school.tipo_istituto !== 'primo_grado' && school.indirizzo_scolastico && (
            <div>
              <h3 className="font-semibold">Indirizzi Scolastici</h3>
              <ul className="list-disc list-inside">
                {school.indirizzo_scolastico.map((indirizzo, index) => (
                  <li key={index}>{indirizzo}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Localizzazione */}
      <Card>
        <CardHeader>
          <CardTitle>Localizzazione</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Regione</h3>
            <p>{school.regione}</p>
          </div>
          <div>
            <h3 className="font-semibold">Provincia</h3>
            <p>{school.provincia}</p>
          </div>
          <div>
            <h3 className="font-semibold">Città</h3>
            <p>{school.citta}</p>
          </div>
          <div>
            <h3 className="font-semibold">Indirizzo</h3>
            <p>{school.indirizzo}</p>
          </div>
        </CardContent>
      </Card>

      {/* Contatti */}
      <Card>
        <CardHeader>
          <CardTitle>Contatti</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Email Istituzionale</h3>
            <p>{school.email_istituzionale}</p>
          </div>
          {school.referente && (
            <>
              <div>
                <h3 className="font-semibold">Referente</h3>
                <p>{school.referente.nome} {school.referente.cognome}</p>
              </div>
              <div>
                <h3 className="font-semibold">Contatto Referente</h3>
                <p>{school.referente.email}</p>
                <p>{school.referente.telefono}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SchoolPage;