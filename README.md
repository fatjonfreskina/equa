# equa 🍝

> *Dividi le spese, non le amicizie.*

**Equa** è un'app web italiana per dividere le spese in gruppo — senza abbonamenti, senza tracciamento, senza rotture di scatole. Basta un link.

---

## Perché Equa?

Perché ogni gruppo ha quel momento imbarazzante in cui nessuno sa bene chi deve quanto a chi, e qualcuno inizia a tirare fuori lo scontrino della cena di tre settimane fa.

Equa risolve il problema. Aggiungi le spese, seleziona chi partecipa, e l'algoritmo calcola il numero minimo di transazioni per pareggiare i conti. Fine.

**Gratis per sempre.** Nessun piano Pro, nessuna funzionalità nascosta dietro un paywall.

---

## Funzionalità

- ✅ Crea un gruppo in 30 secondi, senza registrazione
- ✅ Condividi con un semplice link
- ✅ Dividi equamente tra tutti, tra un sottoinsieme, o con importi personalizzati
- ✅ Algoritmo di ottimizzazione che minimizza il numero di pagamenti
- ✅ Nessun account richiesto

---

## L'algoritmo

Questo è il pezzo interessante.

Il problema del "chi deve cosa a chi" sembra banale ma non lo è. Con N persone e M spese, la soluzione ingenua produce una rete di pagamenti incrociati che fa venire il mal di testa. Equa fa di meglio.

### Come funziona

**Step 1 — Calcolo del saldo netto**

Per ogni membro si calcola il saldo netto: quanto ha pagato in totale, meno quanto avrebbe dovuto pagare in base agli split. Un saldo positivo significa che quella persona è in credito, uno negativo che è in debito.

```
saldo(persona) = totale_pagato - totale_dovuto
```

Esempio con 3 persone e 230€ di spese totali (quota ideale: ~76.67€ a testa):

| Persona | Pagato | Dovuto | Saldo |
|---------|--------|--------|-------|
| Marco   | 100€   | 76.67€ | +23.33€ (creditore) |
| Giulia  | 130€   | 76.67€ | +53.33€ (creditrice) |
| Luca    | 0€     | 76.67€ | -76.67€ (debitore) |

**Step 2 — Algoritmo greedy**

Si separano creditori e debitori, ordinati per importo decrescente. Si abbinano iterativamente il creditore più grande con il debitore più grande:

1. Luca deve 76.67€. Giulia ne aspetta 53.33€ → Luca paga 53.33€ a Giulia. Luca ha ancora 23.34€ di debito.
2. Luca deve ancora 23.34€. Marco ne aspetta 23.33€ → Luca paga 23.33€ a Marco.

Risultato: **2 transazioni** invece delle potenziali 6 di una soluzione ingenua (ogni debitore paga ogni creditore separatamente).

**Perché funziona**

In un gruppo di N persone, l'algoritmo garantisce al massimo N-1 transazioni — il minimo teorico possibile per azzerare tutti i debiti. Ogni transazione azzera completamente almeno una persona dal gioco, riducendo il problema ad ogni passo.

Non è sempre la soluzione globalmente ottimale in tutti i casi edge (è un problema NP in generale), ma per i casi reali — gruppi da 3 a 20 persone — produce risultati ottimali o quasi, in tempo costante.

---

## Stack

| Layer | Tecnologia |
|-------|------------|
| Frontend | Vue 3 + TypeScript + Vite + Tailwind CSS |
| Backend | Python + FastAPI + SQLAlchemy |
| Database | MySQL |
| Reverse proxy | Nginx |
| CI/CD | GitHub Actions → Docker Hub |
| Container management | Portainer |

---

## Sviluppo locale

### Prerequisiti

- Node.js 20+
- Python 3.12+
- MySQL

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Crea `backend/.env`:

```env
DB_USER=equa
DB_PASS=la-tua-password
HOST_NAME=localhost
HOST_PORT=3306
DB_NAME=equa
SECRET_KEY=una-stringa-random-lunga
ALLOW_ORIGINS=http://localhost:5173
```

Avvia:

```bash
uvicorn app.main:app --reload --port 8000
```

La documentazione API è disponibile su `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'app è disponibile su `http://localhost:5173`.

---

## Deploy

Il progetto usa Docker per il backend e un build statico per il frontend, serviti da nginx.

### Database (prima volta)

```sql
CREATE DATABASE equa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'equa'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON equa.* TO 'equa'@'localhost';
FLUSH PRIVILEGES;
```

### CI/CD

Ad ogni push su `main`, GitHub Actions builda l'immagine Docker del backend e la pusha su Docker Hub. Il deploy sul server avviene tramite Portainer — basta fare un pull dell'immagine aggiornata dal registry e riavviare il container.

Configura i seguenti secrets su GitHub (`Settings → Secrets → Actions`):

| Secret | Descrizione |
|--------|-------------|
| `DOCKER_USERNAME` | Username Docker Hub |
| `DOCKER_PASSWORD` | Token Docker Hub |

---

## Struttura del progetto

```
equa/
├── frontend/          # Vue 3 + TypeScript
│   ├── src/
│   │   ├── views/     # HomeView, GroupView
│   │   ├── components/
│   │   └── api/       # Client HTTP tipizzato
│   └── vite.config.ts
├── backend/           # FastAPI
│   ├── app/
│   │   ├── routers/   # groups, expenses, balances
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── main.py
│   └── Dockerfile
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## Contribuire

Pull request benvenute. Se trovi un bug o hai un'idea, apri una issue.

Se vuoi aggiungere una funzionalità grossa, apri prima una issue per discuterne — meglio allinearsi prima di scrivere codice.

---

## Supporto

Equa è sviluppato e mantenuto nel tempo libero, su un server di casa, con amore e caffè.

Se ti è utile e vuoi offrire un giro:

[![Donate](https://img.shields.io/badge/PayPal-Offrimi%20un%20caffè-00457C?style=flat&logo=paypal)](https://paypal.me/tuonome)

---

## Licenza

MIT — fai quello che vuoi, ma non togliere i credits. È un gesto di rispetto, non un obbligo legale.
