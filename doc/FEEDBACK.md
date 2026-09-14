# Feedback non invasivo

La issue #20 aggiunge un canale facoltativo per segnalare un problema o proporre una funzione. Il controllo si trova nel pannello globale «Preferenze e feedback», insieme a lingua e tema, ma form e logiche restano componenti separati.

## Flusso e dati

Il browser invia al backend Equa soltanto categoria (`bug` o `feature`), messaggio, lingua dell'interfaccia ed eventuale email di contatto inserita volontariamente. Il backend inoltra il payload via HTTPS al microservizio email con il token server-to-server. Il browser non conosce il token e non contatta direttamente il microservizio.

Equa non aggiunge automaticamente URL, UUID, nomi, partecipanti, importi, user agent o altri dati del gruppo. Il messaggio non viene salvato nel database; restano solo contatori HMAC temporanei nella tabella `email_link_rate_limits` creata dalla migrazione `005`.

## Configurazione Equa

| Variabile | Uso |
| --- | --- |
| `FEEDBACK_ENABLED` | `true` per mostrare e accettare il feedback; default `false`. |
| `FEEDBACK_RATE_LIMIT_SECRET` | Segreto casuale di almeno 32 caratteri per pseudonimizzare le chiavi dei limiti. |
| `EMAIL_SERVICE_URL` | URL base HTTPS del microservizio condiviso. |
| `EMAIL_SERVICE_TOKEN` | Deve coincidere con `EQUA_TOKEN` del microservizio. |
| `EMAIL_PRIVACY_URL` | Informativa mostrata nel form. |

Il limite è 3 invii per IP ogni ora e 100 invii globali ogni ora. Gli invii falliti consumano comunque il limite. Dietro proxy, fidarsi soltanto degli indirizzi dei proxy controllati.

Nel microservizio configurare `EQUA_FEEDBACK_RECEIVER`, distribuendo la relativa PR prima di abilitare il frontend. Non usare `RECEIVER`, riservato all'applicativo legacy.

## Verifica manuale

- controllare apertura, Escape, focus e layout mobile del pannello globale e del dialog;
- cambiare lingua e tema dal pannello e verificare la persistenza locale;
- inviare bug e suggerimento, con e senza email facoltativa;
- verificare che un errore di rete conservi il testo scritto;
- verificare limite e risposta recuperabile;
- controllare email e log: nessun dato del gruppo o segreto deve comparire;
- disabilitare il feedback e verificare che lingua e tema restino disponibili.
