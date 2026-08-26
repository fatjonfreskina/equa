# Changelog

Tutte le modifiche rilevanti al progetto sono documentate in questo file.

Il formato segue [Keep a Changelog](https://keepachangelog.com/it/1.0.0/).
Il versionamento segue [Semantic Versioning](https://semver.org/lang/it/).

---

## [1.4.3] Frontend; Backend

### Aggiunto

- Asset SVG del logo condiviso tra l'app e la testata del README.
- Base di test automatici: pytest per il calcolo dei bilanci, Vitest per le utility frontend e hook pre-commit per le suite interessate dalle modifiche.
- Flusso di chiusura dei conti con stati `In corso`, `Chiusura conti` e `Conti chiusi`, più riapertura esplicita quando serve una correzione.
- Pagamenti persistenti generati dai saldi: chi paga può segnalare il pagamento e chi riceve può confermarlo dal proprio dispositivo.
- Invito alla chiusura visibile nella tab Bilanci solo quando è rilevante, selezione locale del partecipante compatta e popup finale di celebrazione con donazione facoltativa.

### Corretto

- Suggerimenti di donazione aggiornati a 2 €, 3 € e 5 €.
- Durante la chiusura dei conti il backend rifiuta modifiche a spese e partecipanti, evitando che i saldi cambino involontariamente.
- I messaggi della chiusura distinguono correttamente il gruppo in chiusura dal gruppo già chiuso e indicano quando si attende la conferma del creditore.
- Dopo l'avvio della chiusura, la tab Bilanci ricarica subito i pagamenti da confermare senza richiedere una navigazione o un refresh manuale.

---

## [1.4.2] Frontend - 2026-08-25

### Aggiunto

- Cronologia locale dei gruppi: i gruppi creati vengono salvati sul dispositivo e i gruppi ricevuti possono essere salvati volontariamente.
- Sezione "I tuoi gruppi recenti" nella home, con apertura rapida, rimozione singola e cancellazione completa della cronologia.

---

## [1.4.1] Frontend; Backend - 2026-08-25

### Aggiunto

- Il pulsante "Condividi" nell'header apre il pannello con WhatsApp, condivisione nativa e copia del link.

### Corretto

- Nell'header del gruppo, su mobile i titoli lunghi vanno a capo nello spazio disponibile senza sovrapporsi al pulsante di condivisione, che resta sulla stessa riga.

---

## [1.4.0] Frontend; Backend - 2026-08-25

### Aggiunto

- Dopo la creazione di un gruppo viene mostrato un promemoria per condividere e conservare il link di accesso.
- Il promemoria offre condivisione nativa, messaggio WhatsApp precompilato, copia del link e URL visibile per la copia manuale.

---

## [1.3.0] Frontend; Backend - 2026-08-24

### Aggiunto

- Modifica dell'email dei partecipanti direttamente dalla tab "Partecipanti".
- Form di aggiunta partecipante richiudibile per una visualizzazione piu compatta.
- Configurazione pre-commit con Black, Ruff e Prettier per formattazione e linting automatici.

---

## [1.2.1] Frontend - 2026-08-22

### Corretto

- Form di aggiunta partecipante nella tab "Partecipanti" non era responsive e sfondava lo schermo su mobile. Ora va in colonna sotto i 640px (flex-col sm:flex-row) e gli input possono restringersi correttamente (min-w-0).

---

## [1.2.0] Frontend; Backend - 2026-08-22

### Aggiunto

- Nuovo endpoint `POST /groups/{group_id}/members/` per aggiungere partecipanti a un gruppo già esistente, anche a spese già presenti. I nuovi membri non vengono retroattivamente coinvolti nelle spese precedenti, che mantengono lo split salvato al momento della loro creazione.

---

## [1.1.1] Backend - 2026-04-23

### Corretto

- Aggiunto test della connessione al database prima di avviare l'applicazione (fix #7). Aggiunto inoltre pool_recycle a 1800 secondi per riciclare le connessioni ogni 30 minuti, prevenendo timeout inattesi.

---

## [1.1.0] Frontend; [1.1.0] Backend - 2026-04-19

### Aggiunto

- Totale spese in tempo reale nella vista gruppo
- Modifica spese già inserite (click su una spesa per aprire il form precompilato)
- Rimozione partecipanti dal gruppo (solo se non coinvolti in nessuna spesa)
- Nuovo endpoint `PUT /groups/{group_id}/expenses/{expense_id}`
- Nuovo endpoint `DELETE /groups/{group_id}/members/{member_id}`

---

## [1.0.0] Frontend; [1.0.0] Backend - 2026-04-08

### Aggiunto

- Creazione gruppi con partecipanti
- Aggiunta spese con tre modalità: tutti, sottoinsieme, personalizzato
- Algoritmo greedy per minimizzare il numero di transazioni
- Vista bilanci con chi deve cosa a chi
- Link condivisibile per ogni gruppo
- Donazioni PayPal con cifre rapide (1€, 2€, 5€, libero)
- Logo geometrico SVG
- Deploy self-hosted con Docker + Portainer + Nginx
- CI/CD con GitHub Actions → Docker Hub
