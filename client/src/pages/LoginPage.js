// src/pages/LoginPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate per il reindirizzamento
import Login from '../components/Login';
import Registration from '../components/Registration';

function LoginPage() {
  const navigate = useNavigate(); // Inizializza useNavigate
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Stato per verificare se l'utente è loggato

  useEffect(() => {
    // Controlla se l'utente è già loggato (es. se ha un token valido)
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []); // Esegui l'effetto solo al montaggio del componente

  useEffect(() => {
    // Reindirizza alla pagina protetta se l'utente è loggato
    if (isLoggedIn) {
      navigate('/dashboard'); // Sostituisci '/dashboard' con il percorso della tua pagina protetta
    }
  }, [isLoggedIn]); // Esegui l'effetto quando isLoggedIn cambia

  return (
    <div>
      <h1>Benvenuto in AI4S!</h1>
      {!isLoggedIn && ( // Mostra i componenti di login e registrazione solo se l'utente non è loggato
        <>
          <Login />
          <Registration />
        </>
      )}
    </div>
  );
}

export default LoginPage;

// Importa useNavigate da react-router-dom per gestire il reindirizzamento.
// Utilizza useState per tenere traccia dello stato di login dell'utente.
// Utilizza useEffect per controllare se l'utente è già loggato al caricamento della pagina e per reindirizzare l'utente alla pagina protetta se è loggato.
// Mostra i componenti di login e registrazione solo se l'utente non è loggato.