// src/components/Registration.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Registration = () => {
  const { register, isLoading, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    confirmPassword: '',
    ruolo: 'studente'
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    try {
      await register({
        nome: formData.nome,
        cognome: formData.cognome,
        email: formData.email,
        password: formData.password,
        ruolo: formData.ruolo
      });
    } catch (err) {
      setError(err.message || authError);
    }
  };

  const inputFields = [
    { name: 'nome', label: 'Nome', type: 'text' },
    { name: 'cognome', label: 'Cognome', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
    { name: 'confirmPassword', label: 'Conferma Password', type: 'password' }
  ];

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {(error || authError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-50 border border-red-200"
        >
          <p className="text-sm text-red-600">{error || authError}</p>
        </motion.div>
      )}

      <div className="space-y-4">
        {inputFields.map((field) => (
          <div key={field.name}>
            <label 
              htmlFor={field.name} 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type={field.type}
              id={field.name}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                transition-all duration-200"
              placeholder={field.label === 'Password' || field.label === 'Conferma Password' 
                ? '••••••••' 
                : `Inserisci ${field.label.toLowerCase()}`}
            />
          </div>
        ))}

        <div>
          <label 
            htmlFor="ruolo" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ruolo
          </label>
          <motion.select
            whileFocus={{ scale: 1.01 }}
            id="ruolo"
            name="ruolo"
            value={formData.ruolo}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
              transition-all duration-200 bg-white"
          >
            <option value="studente">Studente</option>
            <option value="insegnante">Insegnante</option>
            <option value="amministratore">Amministratore</option>
          </motion.select>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`w-full flex items-center justify-center py-2.5 px-4 
          rounded-lg text-white font-medium transition-all duration-200 
          ${isLoading 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
          }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Registrazione in corso...
          </>
        ) : (
          'Registrati'
        )}
      </motion.button>
    </motion.form>
  );
};

export default Registration;