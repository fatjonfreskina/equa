# Strategia di test

I test devono proteggere la correttezza dei conti, la privacy del flusso senza account e i passaggi irreversibili della chiusura del gruppo. Non puntare alla copertura totale: aggiungere un test quando una regressione produrrebbe un saldo errato, una perdita di accesso o un'azione non autorizzata.

## Backend

- **Unità pure:** algoritmo dei bilanci, arrotondamenti e calcolo delle transazioni.
- **API con database isolato:** validazione di pagante/split, appartenenza al gruppo, blocco durante la chiusura e ciclo di vita dei pagamenti.
- **Migrazioni:** ogni modifica dello schema deve essere verificata almeno su un database vuoto e documentata per i database esistenti.

## Frontend

- **Unità:** utility di `localStorage`, formatter e generazione dei messaggi di condivisione.
- **Componenti:** creazione gruppo, salvataggio/rimozione dei recenti, flusso di chiusura e messaggi di errore rilevanti.
- I test non devono leggere o scrivere servizi esterni, né fare affidamento su date o rete reali.

## Comandi

```bash
# Backend, dopo aver installato backend/requirements-dev.txt
python -m pytest backend/tests

# Frontend
cd frontend
npm run test:run
```

Il pre-commit esegue le suite interessate quando vengono modificati file backend o frontend; la build resta il controllo TypeScript completo.

Per attivare gli hook dopo l'installazione delle dipendenze di sviluppo:

```bash
python -m pre_commit install
```
