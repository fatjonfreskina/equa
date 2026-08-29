# Equa: istruzioni per gli agenti

## Prodotto e principi

- Equa divide spese di gruppo senza account obbligatori. Il link del gruppo è centrale nel flusso.
- Mantieni il prodotto semplice, mobile-first e privacy-first: non introdurre login, tracking, email o raccolta dati senza una richiesta esplicita e l'allineamento con `doc/ROADMAP.md`.
- I dati locali devono restare minimi. Non salvare localmente spese complete, saldi o email se bastano metadati e ID del gruppo.
- Il possesso dell'UUID del gruppo oggi permette la collaborazione. Non presentare la selezione locale del partecipante come autenticazione o autorizzazione forte.

## Struttura e fonti di verità

- `frontend/`: Vue 3, TypeScript, Vite e Tailwind. Le view principali sono `src/views/HomeView.vue` e `src/views/GroupView.vue`.
- `frontend/src/api/groups.ts`: tipi e client API del dominio; aggiornalo quando cambiano endpoint o response backend.
- `frontend/src/utils/recentGroups.ts`: cronologia locale dei gruppi; usa `localStorage` e conserva solo metadati.
- `backend/app/`: FastAPI con handler **sincroni**, SQLAlchemy con `Session` sincrone e MySQL.
- `backend/app/models.py`, `schemas.py`, `routers/`: per ogni cambiamento al dominio, mantieni modello, schema e router coerenti.
- `doc/ROADMAP.md`: priorità e criteri di prodotto. Aggiorna le checkbox solo per lavoro effettivamente completato.
- `doc/CHANGELOG.md`: aggiungi una voce per ogni modifica che sarà rilasciata.

## Database e migrazioni

- L'app avvia `Base.metadata.create_all()`: può creare tabelle nuove, ma **non** modifica tabelle esistenti.
- Ogni modifica dello schema deve avere un file SQL numerato in `backend/migrations/` e un aggiornamento a `backend/migrations/README.md`.
- Esegui le migrazioni esistenti in ordine (`001_add_group_status.sql`, poi `002_create_settlements.sql`) una sola volta sui database esistenti. Non eliminare tabelle o dati per risolvere un errore di migrazione.
- A ciascun file di migrazione deve corrispondere un corrispettivo per il rollback (`001_add_group_status_rollback.sql`), se possibile. Se non è possibile, documenta la ragione in `README.md`.

## Convenzioni di implementazione

- Frontend: usa `<script setup lang="ts">`, Composition API e tipi espliciti. Mantieni l'UI in italiano.
- Backend: usa Pydantic v2 e route sincrone; valida sempre lato backend, anche se la UI già limita l'azione.
- Per funzioni legate alla chiusura: la selezione del partecipante è locale e serve solo per attribuire azioni fiduciarie. Token/ruoli separati sono una feature futura della roadmap.
- Preferisci modifiche mirate; non riscrivere componenti o file non coinvolti dalla richiesta.
- Non leggere o modificare `.env`, lockfile, `node_modules`, `dist`, asset generati o file di build salvo necessità esplicita.

## Verifica locale

- Frontend: da `frontend/`, esegui `npm run build`.
- Backend: da root, esegui `python -m compileall -q backend/app` per un controllo di sintassi minimo.
- Prima del handoff, esegui `git diff --check` e segnala migrazioni DB o passi di deploy necessari.
- Non dichiarare verifiche manuali, mobile o di database come completate se non sono state eseguite.
- Unit test: da implementare quando vengono introdotte logiche complesse o bugfix critici. Usa `python -m pytest backend/tests` e `npm run test:run` per backend e frontend.

## Formattazione

- Backend: dalla root, esegui `python -m black backend` e `python -m ruff check --fix backend`.
- Frontend: dalla root, esegui `npx --prefix frontend prettier --write "frontend/src/**/*.{ts,vue,js}"`.
- Per eseguire formatter e controlli configurati nel pre-commit su tutto il repository, usa `python -m pre_commit run --all-files`.

## Codex Cloud

- L'ambiente remoto usa Linux e avvia i comandi dalla root del repository.
- Configura Python 3.12 e Node.js 20, poi usa `bash scripts/codex-cloud/setup.sh` come setup script.
- Usa `bash scripts/codex-cloud/maintenance.sh` come maintenance script per riallineare le dipendenze nei container in cache.
- L'ambiente standard non richiede credenziali MySQL: avvia database e servizi completi solo per task di integrazione che lo richiedono esplicitamente.
- Mantieni disattivato l'accesso Internet durante la fase agente salvo necessità specifiche; in quel caso limita domini e metodi allo stretto necessario.

## Git

- Lavora sul branch richiesto dall'utente; se serve crearne uno, usa nomi descrittivi come `feature-...` o `bugfix-...`.
- Prima di cambiare branch, controlla `git status --short` e preserva modifiche non correlate.
- Non usare `git reset --hard`, `git checkout --` o comandi distruttivi senza autorizzazione esplicita.
- Apri i branch partendo da `release-candidate`, se eseguito in Codex Cloud, apri le pull request verso `release-candidate` e non verso `main`.
