# Migrazioni database

Prima di distribuire una versione che usa nuove colonne, esegui ogni file SQL una sola volta sul database di destinazione, nell'ordine numerico.

Per la chiusura dei conti, esegui `001_add_group_status.sql`, `002_create_settlements.sql` e `003_add_group_closing_count.sql` prima di distribuire il backend aggiornato. Le nuove installazioni ricevono le tabelle direttamente da SQLAlchemy durante l'avvio.

La migrazione `003` inizializza a `1` i gruppi per cui esistono prove di una chiusura precedente (stato `closing`/`closed` o settlement). I dati precedenti non permettono di ricostruire più cicli storici con precisione. Il rollback rimuove la colonna e il relativo conteggio.
