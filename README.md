# Tommy ❤ — Tamagotchi per lei

Piccolo gioco gestionale: la protagonista si prende cura di "Tommy" (frigo, doccia, sonno, gioco, coccole),
guadagna monetine, sblocca messaggi d'amore personalizzati man mano che sale il "livello d'affetto".

## Come pubblicarlo su GitHub Pages
1. Carica **tutti** i file di questa cartella (index.html, style.css, script.js, assets/) nella root del repository.
2. Vai su *Settings → Pages*, scegli il branch principale e cartella `/root`.
3. Il gioco sarà online su `https://<tuo-utente>.github.io/<nome-repo>/` dopo qualche minuto.
4. Consiglio: da telefono, apri il link e scegli "Aggiungi a schermata Home" per farlo sembrare una vera app.

## Cosa personalizzare (tutto segnato "MODIFICA QUI" in script.js)
- `START_DATE` → la data da cui parte il conteggio "giorni insieme".
- `LOVE_NOTES` → i vostri messaggi personali, sbloccati ogni 10 punti di affetto.
- `HOURS_TO_EMPTY` → quanto velocemente calano fame/igiene/energia nel tempo reale.
- `SHOP_ITEMS` → cosa si compra al negozio.

## Bug corretti rispetto alla prima versione
- Igiene ed energia ora calano davvero nel tempo (prima solo la fame diminuiva).
- Il calo delle statistiche è basato sul tempo reale trascorso (anche a gioco chiuso), non su un timer fittizio.
- Usate tutte e 6 le immagini fornite (prima "sporco.png" non veniva mai mostrata).
- Aggiunte barre per igiene ed energia (prima solo la fame aveva una barra).
- Video e immagini compressi (da ~26MB a ~400KB totali) per un caricamento istantaneo da telefono.
