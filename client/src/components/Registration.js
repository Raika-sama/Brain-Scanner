// src/components/Registration.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Registration = () => {
  const { register, isLoading, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',          // modificato da nome
    lastName: '',          // modificato da cognome
    email: '',
    password: '',
    confirmPassword: '',
    role: 'teacher'        // modificato da ruolo e default value
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
      // Rimuoviamo confirmPassword e inviamo i dati corretti
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
    } catch (err) {
      setError(err.message || authError);
    }
  };

  // Array dei campi del form aggiornato con i nuovi nomi
  const inputFields = [
    { name: 'firstName', label: 'Nome', type: 'text' },
    { name: 'lastName', label: 'Cognome', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
    { name: 'confirmPassword', label: 'Conferma Password', type: 'password' }
  ];

  // Il resto del componente rimane invariato per mantenere l'UI
  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* ... error display remains the same ... */}

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
            htmlFor="role" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ruolo
          </label>
          <motion.select
            whileFocus={{ scale: 1.01 }}
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
              transition-all duration-200 bg-white"
          >
            <option value="teacher">Insegnante</option>
            <option value="admin">Amministratore</option>
          </motion.select>
        </div>
      </div>

      {/* ... button remains the same ... */}
    </motion.form>
  );
};

export default Registration;