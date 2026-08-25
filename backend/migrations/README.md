# Migrazioni database

Prima di distribuire una versione che usa nuove colonne, esegui ogni file SQL una sola volta sul database di destinazione, nell'ordine numerico.

Per la chiusura dei conti, esegui `001_add_group_status.sql` e `002_create_settlements.sql` prima di distribuire il backend aggiornato. Le nuove installazioni ricevono le tabelle direttamente da SQLAlchemy durante l'avvio.
