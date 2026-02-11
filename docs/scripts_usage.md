# Utilizzo degli script di build

Questa nota descrive l'uso degli script presenti in scripts/ e scripts/pkg-scripts, indicando quando vengono invocati e quale fase del processo di build o packaging coprono.

## scripts/

- **electron-builder-hooks.cjs**  
  Hook di Electron Builder eseguiti durante la build: copia gli script di installazione in una directory temporanea e, al termine, ricostruisce i PKG includendo i file pre/post install usando `pkgutil` e `productbuild`. Configurato in [electron-builder.json](../electron-builder.json). Include le funzioni `afterPack` (preparazione script) e `afterAllArtifactBuild` (ricostruzione PKG con script personalizzati).

- **fix-mac-build.sh**  
  Script di manutenzione per risolvere problemi di build su macOS Apple Silicon. Gestisce:
  - Terminazione di processi PKG builder bloccati (`productbuild`, `pkgbuild`, `pkgutil`)
  - Pulizia di file temporanei di build
  - Fix di permessi per node_modules e directory di output
  - Pulizia delle cache di Electron e electron-builder
  
  Può essere eseguito manualmente prima della build con `./scripts/fix-mac-build.sh` in caso di problemi.

- **installer.nsh**  
  Script NSIS per personalizzare l'installer Windows. Include:
  - Stringhe localizzate in 5 lingue (IT, EN, FR, ES, DE)
  - Pagina di opzioni di installazione personalizzata
  - Gestione della selezione lingua dell'applicazione
  - Opzione per mantenere dati e impostazioni durante gli aggiornamenti
  - Preservazione e ripristino dei template utente
  
  Referenziato nella configurazione NSIS in [electron-builder.json](../electron-builder.json).

- **package-build.cjs**  
  Script di post-build cross-platform che crea archivi ZIP degli artefatti di build.
  
  **Uso**: `node scripts/package-build.cjs <platform> <env>`
  - `platform`: `windows` (.exe), `linux` (.deb), `macos` (.pkg)
  - `env`: `dev`, `stg`, `pre`
  
  Genera un file ZIP nominato `<platform>-build-<env>-<version>.zip` nella directory `dist/`. Invocato dai comandi dist-* in [package.json](../package.json).

- **postinstall.sh**  
  Hook post-install per pacchetti .deb Linux (afterInstall). Esegue:
  - Creazione del symlink `/usr/bin/criterion` tramite `update-alternatives`
  - Impostazione permessi SUID per `chrome-sandbox` (necessario per il sandbox di Electron)
  - Aggiornamento del database MIME e delle icone
  
  Configurato in [electron-builder.json](../electron-builder.json).

## scripts/pkg-scripts/

- **preinstall**  
  Script eseguito prima dell'installazione dei PKG macOS. Operazioni:
  - Rileva l'utente reale (non root) per le operazioni sui file
  - Chiude Criterion se in esecuzione (graceful, poi forzato)
  - Crea backup di template e stili utente esistenti
  - Scrive log in `/tmp/criterion-install.log`
  
  Viene iniettato nel pacchetto PKG tramite gli hook di Electron Builder.

- **postinstall**  
  Script eseguito dopo l'installazione dei PKG macOS. Operazioni:
  - Crea le directory dati utente (`~/Library/Application Support/Criterion/`)
  - Imposta proprietà e permessi corretti sui file
  - Ripristina template e stili utente dal backup più recente
  - Scrive log in `/tmp/criterion-install.log`
  
  Viene iniettato nel pacchetto PKG tramite gli hook di Electron Builder.
