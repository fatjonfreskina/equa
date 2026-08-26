# Metriche anonime

Equa usa facoltativamente Umami Cloud per misurare l'uso aggregato del prodotto. L'integrazione è disabilitata finché `VITE_UMAMI_WEBSITE_ID` non viene configurato nell'ambiente di build.

## Eventi raccolti

- pageview della home (`/`);
- pageview della vista gruppo normalizzata (`/group`);
- `group_created` dopo la creazione riuscita di un gruppo;
- `group_opened_from_recent` quando viene aperto un gruppo dalla cronologia locale;
- `expense_created` dopo il salvataggio riuscito di una nuova spesa;
- `share_opened`, `share_whatsapp` e `share_copied` per le modalità di condivisione del link;
- `closing_started` dopo l'avvio riuscito della chiusura dei conti;
- `settlement_reported` e `settlement_confirmed` dopo la segnalazione e la conferma di un pagamento;
- `group_closed` dopo la chiusura riuscita dei conti.
- `donation_clicked` quando viene aperto il link di donazione.

## Dati esclusi

Non inviare a Umami UUID o link di gruppo, nomi, descrizioni, email, importi, partecipanti, identità locale o stati dei singoli pagamenti. Non usare `umami.identify()` né identificatori persistenti dell'utente.

Umami carica il proprio script solo quando l'ID pubblico del sito è configurato. I pageview automatici sono disattivati: Equa invia percorsi normalizzati per non esporre l'UUID presente nell'URL del gruppo.

Come parte del tracker, Umami raccoglie anche metadati tecnici standard della visita, tra cui hostname, lingua del browser, referrer, risoluzione schermo, titolo e URL normalizzato. Questa raccolta va indicata nell'informativa privacy del sito prima dell'attivazione. Vedi la [documentazione Umami sulle metriche](https://docs.umami.is/docs/metric-definitions).
