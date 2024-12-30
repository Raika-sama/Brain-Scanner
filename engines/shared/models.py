# models.py

from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from datetime import datetime

@dataclass
class Risposta:
    """Modello per una singola risposta"""
    domanda: int
    risposta: str

@dataclass
class RisultatoCategoria:
    """Modello per il risultato di una categoria"""
    nome: str
    punteggio: float
    valore: str
    distanza_dal_centro: float
    consigli: List[str]

@dataclass
class ProfiloCompleto:
    """Modello per il profilo completo"""
    user_id: str
    test_id: str
    data: datetime
    profilo: List[RisultatoCategoria]
    punteggio_totale: float
    media_punteggio: float

@dataclass
class TestInput:
    """Modello per i dati in input"""
    user_id: str
    test_id: str
    risposte: List[Risposta]

@dataclass
class TestOutput:
    """Modello per la risposta dell'API"""
    success: bool
    message: str
    data: Optional[ProfiloCompleto] = None
    errors: Optional[Dict[str, Any]] = None