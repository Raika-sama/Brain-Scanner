import React, { useState, useMemo } from 'react';
import { Card } from "./ui/card";
import { Check, AlertTriangle, X, ArrowLeft, FileCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ImportPreviewModal = ({ 
  isOpen, 
  onClose, 
  onBack,
  onConfirm, 
  validatedData, 
  schoolConfig 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Raggruppamento degli studenti per classe
  const studentsByClass = useMemo(() => {
    if (!validatedData) return {};
    
    return validatedData.reduce((acc, student) => {
      const classKey = `${student.classe}${student.sezione}`;
      if (!acc[classKey]) {
        acc[classKey] = [];
      }
      acc[classKey].push(student);
      return acc;
    }, {});
  }, [validatedData]);

  // Statistiche dell'importazione
  const stats = useMemo(() => {
    if (!validatedData) return {};

    return {
      totalStudents: validatedData.length,
      totalClasses: Object.keys(studentsByClass).length,
      studentsByGender: validatedData.reduce((acc, student) => {
        acc[student.sesso] = (acc[student.sesso] || 0) + 1;
        return acc;
      }, {})
    };
  }, [validatedData, studentsByClass]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      toast.success('Importazione completata con successo');
      onClose();
    } catch (error) {
      toast.error('Errore durante l\'importazione');
      console.error('Errore importazione:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-4xl mx-4 my-8">
        <Card className="bg-white p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Anteprima Importazione
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isProcessing}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Statistiche */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-blue-50">
              <div className="text-blue-600 font-semibold">
                Studenti Totali
              </div>
              <div className="text-2xl font-bold">
                {stats.totalStudents}
              </div>
            </Card>
            <Card className="p-4 bg-green-50">
              <div className="text-green-600 font-semibold">
                Classi Coinvolte
              </div>
              <div className="text-2xl font-bold">
                {stats.totalClasses}
              </div>
            </Card>
            <Card className="p-4 bg-purple-50">
              <div className="text-purple-600 font-semibold">
                Distribuzione
              </div>
              <div className="text-sm">
                M: {stats.studentsByGender?.M || 0} | 
                F: {stats.studentsByGender?.F || 0}
              </div>
            </Card>
          </div>

          {/* Preview Classi */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Riepilogo Classi</h3>
            <div className="space-y-4">
              {Object.entries(studentsByClass).map(([classKey, students]) => (
                <Card key={classKey} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-lg">
                      Classe {classKey}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {students.length} studenti
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {students.map((student, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                        <span>
                          {student.cognome} {student.nome}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer con bottoni */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={onBack}
              disabled={isProcessing}
              className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Torna al caricamento
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annulla
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin mr-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    </div>
                    Importazione in corso...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-5 h-5 mr-2" />
                    Conferma Importazione
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ImportPreviewModal;