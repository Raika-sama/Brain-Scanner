import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    confirmPassword: '',
    ruolo: 'studente'
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validazione password
    if (formData.password !== formData.confirmPassword) {
      setError('Le password non corrispondono!');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: formData.nome,
          cognome: formData.cognome,
          email: formData.email,
          password: formData.password,
          ruolo: formData.ruolo
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Salva il token
        localStorage.setItem('token', data.token);
        // Salva i dati utente
        localStorage.setItem('userData', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Errore durante la registrazione');
      }
    } catch (error) {
      console.error('Errore:', error);
      setError('Errore di connessione al server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Registrazione</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {['nome', 'cognome'].map((field) => (
        <div className="mb-4" key={field}>
          <label htmlFor={field} className="block text-gray-700 mb-2">
            {field.charAt(0).toUpperCase() + field.slice(1)}:
          </label>
          <input
            type="text"
            id={field}
            name={field}
            value={formData[field]}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      ))}

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 mb-2">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {['password', 'confirmPassword'].map((field) => (
        <div className="mb-4" key={field}>
          <label htmlFor={field} className="block text-gray-700 mb-2">
            {field === 'password' ? 'Password:' : 'Conferma Password:'}
          </label>
          <input
            type="password"
            id={field}
            name={field}
            value={formData[field]}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      ))}

      <div className="mb-6">
        <label htmlFor="ruolo" className="block text-gray-700 mb-2">Ruolo:</label>
        <select 
          id="ruolo"
          name="ruolo"
          value={formData.ruolo}
          onChange={handleChange}
          disabled={isLoading}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="amministratore">Amministratore</option>
          <option value="studente">Studente</option>
          <option value="insegnante">Insegnante</option>
        </select>
      </div>

      <button 
        type="submit"
        disabled={isLoading}
        className={`w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Registrazione in corso...' : 'Registrati'}
      </button>
    </form>
  );
}

export default Registration;