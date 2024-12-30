# calculator.py

from typing import List, Dict, Any
import logging
from shared.config import Config

class ProfileCalculator:
    def __init__(self):
        # Definizione delle categorie e relativi assi
        self.categorie = [
            {
                'nome': 'Creatività',
                'asse': ['Intuitivo', 'Sistematico'],
                'positivo': True,
                'domande': range(0, 6)
            },
            {
                'nome': 'Elaborazione',
                'asse': ['Analitico', 'Globale'],
                'positivo': True,
                'domande': range(6, 12)
            },
            {
                'nome': 'Decisione',
                'asse': ['Impulsivo', 'Riflessivo'],
                'positivo': False,
                'domande': range(12, 18)
            },
            {
                'nome': 'Apprendimento',
                'asse': ['Visualizzatore', 'Verbalizzatore'],
                'positivo': True,
                'domande': range(18, 24)
            },
            {
                'nome': 'Autonomia',
                'asse': ['Poco autonomo', 'Molto autonomo'],
                'positivo': True,
                'domande': range(24, 30)
            }
        ]

        # Scale di valutazione
        self.scale = {
            'positiva': {
                'Per niente': 1,
                'Poco': 1.5,
                'Abbastanza': 2,
                'Molto': 2.5,
                'Completamente': 3
            },
            'negativa': {
                'Per niente': 3,
                'Poco': 2.5,
                'Abbastanza': 2,
                'Molto': 1.5,
                'Completamente': 1
            }
        }

    def calculate_profile(self, risposte: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calcola il profilo basato sulle risposte fornite
        :param risposte: Lista di dizionari con 'domanda' e 'risposta'
        :return: Dizionario con profilo completo
        """
        try:
            # Ordina le risposte per numero domanda
            risposte_ordinate = sorted(risposte, key=lambda x: x['domanda'])
            
            risultati_categorie = []
            punteggio_totale = 0

            # Calcola il punteggio per ogni categoria
            for categoria in self.categorie:
                punteggio = 0
                # Prendi solo le risposte pertinenti alla categoria
                risposte_categoria = [r for r in risposte_ordinate 
                                    if r['domanda'] in categoria['domande']]

                # Calcola il punteggio della categoria
                scala = self.scale['positiva' if categoria['positivo'] else 'negativa']
                for risposta in risposte_categoria:
                    punteggio += scala[risposta['risposta']]

                # Calcola la distanza dal centro
                distanza = abs(punteggio - Config.CENTRO_SCALA)
                
                # Determina il valore sull'asse
                valore = categoria['asse'][1] if punteggio > Config.CENTRO_SCALA else categoria['asse'][0]

                # Aggiungi i risultati della categoria
                risultato_categoria = {
                    'nome': categoria['nome'],
                    'punteggio': punteggio,
                    'valore': valore,
                    'distanza_dal_centro': distanza,
                    'consigli': self.get_consigli(categoria['nome'], valore)
                }
                
                risultati_categorie.append(risultato_categoria)
                punteggio_totale += punteggio

            return {
                'profilo': risultati_categorie,
                'punteggio_totale': punteggio_totale,
                'media_punteggio': punteggio_totale / len(self.categorie)
            }

        except Exception as e:
            logging.error(f"Errore nel calcolo del profilo: {str(e)}")
            raise

    def get_consigli(self, categoria: str, valore: str) -> List[str]:
        """
        Restituisce i consigli personalizzati basati sulla categoria e sul valore
        :param categoria: Nome della categoria
        :param valore: Valore ottenuto sull'asse
        :return: Lista di consigli
        """
        consigli_map = {
            'Creatività': {
          'Intuitivo': [
              'Trova soluzioni rapide e creative senza seguire necessariamente regole definite.',
              'Usare brainstorming per generare idee.',
              'Sfrutta la tua immaginazione e la tua capacità di pensare fuori dagli schemi.',
              'Cerca di trovare soluzioni creative ai problemi ed esplorare approcci alternativi per risolvere problemi complessi..',
              'Lavorare in ambienti flessibili che favoriscano la creatività.',

          ],
          'Sistematico': [
              'Cerca di sviluppare la tua creatività attraverso attività come il brainstorming o il disegno.',
              'Prova a guardare i problemi da diverse prospettive.',
              'Preferisci approcci strutturati e metodici.',
              'Utilizzare strumenti di gestione del tempo per ottimizzare il lavoro.'
          ]
      },
      'Elaborazione': {
         'Analitico': [
             'Tendi a concentrarti sui dettagli e procedere passo dopo passo.',
             'Dividere i problemi in parti più piccole e lavora con schemi sequenziali.',
             'Documentare ogni passaggio per avere una visione chiara del progresso.'
         ],
         'Globale': [
             'Predilige una visione di insieme e si focalizza sul contesto generale.'
             'Creare mappe concettuali.',
             'Riflettere sul contesto prima di agire.',
             'Integrare idee da diverse fonti per costruire una comprensione globale.'
         ]
      },
      'Apprendimento': {
          'Visualizzatore': [
              'Impara meglio tramite immagini, grafici e rappresentazioni visive.',
              'Usare mappe mentali e infografiche.',
              'Integrare immagini nei materiali di studio.',
              'Utilizzare software di visualizzazione per organizzare idee.',

          ],
          'Verbalizzatore': [
              'Apprendi meglio tramite lettura e linguaggio scritto.',
              'Leggere testi con spiegazioni dettagliate.',
              'Prendere appunti dettagliati durante lo studio.',
              'Partecipare a discussioni o gruppi di studio.'
          ]
      },
      'Decisione': {
          'Impulsivo': [
              'Tendi a rispondere rapidamente e ad agire senza riflettere troppo.',
              'Prendere tempo prima di agire.',
              'Imparare tecniche di mindfulness ed acquisire consapevolezza di sé.',
              'Chiedere feedback prima di prendere decisioni importanti.',

          ],
          'Riflessivo': [
              'Preferisci riflettere attentamente prima di prendere decisioni.',
              'Analizzare pro e contro delle decisioni e valutare tutte le opzioni prima di agire.',
              'Lavorare in ambienti che consentano tempi lunghi di riflessione.',
              'Imparare ad agire in maniera più spontanea quando serve.'
          ]
      },
      'Autonomia': {
          'Poco autonomo': [
              'Hai bisogno di indicazioni esterne per portare a termine i compiti.',
              'Chiedere feedback frequenti.',
              'Lavorare con supervisori o tutor o in gruppo.',
              'Creare un piano dettagliato con supporto esterno.',

          ],
          'Molto autonomo': [
              'Ti gestisci bene da solo e preferisci autonomia nelle attività.',
              'Pianificare le attività in modo indipendente.',
              '"Fissare obiettivi personali chiari e valutare periodicamente i progressi.',
              'Non sottovalutare la importanza del lavoro di gruppo.'
          ]
      },
        }

        return consigli_map.get(categoria, {}).get(valore, [
            'Continua a sviluppare il tuo stile di apprendimento',
            'Cerca di bilanciare diversi approcci'
        ])