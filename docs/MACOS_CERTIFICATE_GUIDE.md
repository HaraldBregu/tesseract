# Guida al Certificato Apple Developer per Criterion

Questa guida spiega i passaggi necessari per acquistare e configurare un certificato Apple Developer per firmare e notarizzare l'applicazione Criterion su macOS.

## Indice

1. [Panoramica](#panoramica)
2. [Tipi di Certificato Apple](#tipi-di-certificato-apple)
3. [Iscrizione Apple Developer Program](#iscrizione-apple-developer-program)
4. [Creazione dei Certificati](#creazione-dei-certificati)
5. [Configurazione App ID](#configurazione-app-id)
6. [Notarizzazione](#notarizzazione)
7. [Configurazione Electron Builder](#configurazione-electron-builder)
8. [Build e Firma](#build-e-firma)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Panoramica

### Perche e necessario un certificato Apple?

Quando distribuisci un'applicazione macOS, il sistema Gatekeeper verifica la firma digitale per:

- **Gatekeeper**: Senza firma, gli utenti vedranno "Impossibile aprire l'app perche proviene da uno sviluppatore non identificato"
- **Notarizzazione**: Dal macOS 10.15 Catalina, Apple richiede che le app siano notarizzate
- **Integrita**: Garantisce che il software non sia stato modificato dopo la firma
- **Identita**: Conferma che il software proviene da uno sviluppatore/azienda verificata

### Requisiti per Criterion

| Elemento | Requisito |
|----------|-----------|
| Sistema operativo target | macOS 10.13+ (High Sierra e successivi) |
| Tipo di applicazione | Electron (DMG installer) |
| Distribuzione | Open source, download pubblico |
| Architetture | x64 (Intel) e arm64 (Apple Silicon) |
| Notarizzazione | Obbligatoria per macOS 10.15+ |

### Differenze con Windows

| Aspetto | Windows | macOS |
|---------|---------|-------|
| Costo certificato | $400-700/anno (EV) | $99/anno (tutto incluso) |
| Fornitore | Terze parti (DigiCert, Sectigo) | Solo Apple |
| Notarizzazione | Non esiste | Obbligatoria |
| Token hardware | Richiesto per EV | Non richiesto |
| Reputazione | SmartScreen (accumulo) | Immediata con notarizzazione |

---

## Tipi di Certificato Apple

### Developer ID Application (CONSIGLIATO)

| Caratteristica | Dettaglio |
|----------------|-----------|
| **Uso** | Distribuzione fuori dall'App Store |
| **Costo** | Incluso nei $99/anno del Developer Program |
| **Notarizzazione** | Supportata e consigliata |
| **Consigliato per** | Criterion (distribuzione diretta) |

### Developer ID Installer

| Caratteristica | Dettaglio |
|----------------|-----------|
| **Uso** | Firma di pacchetti .pkg |
| **Costo** | Incluso nei $99/anno |
| **Necessario per** | Installer .pkg (non DMG) |

### Mac App Distribution

| Caratteristica | Dettaglio |
|----------------|-----------|
| **Uso** | Distribuzione tramite Mac App Store |
| **Costo** | Incluso nei $99/anno |
| **Non adatto per** | Criterion (Electron ha limitazioni su App Store) |

### Raccomandazione per Criterion

**Developer ID Application** e necessario perche:

1. Criterion e distribuito fuori dall'App Store (GitHub, sito web)
2. Le app Electron hanno difficolta con le sandbox dell'App Store
3. Permette la notarizzazione per bypassare Gatekeeper

---

## Iscrizione Apple Developer Program

### Fase 1: Prerequisiti

#### Account Apple ID

Se non hai un Apple ID aziendale:

1. Vai su https://appleid.apple.com/account
2. Crea un nuovo Apple ID con email aziendale (es. developer@finconsgroup.com)
3. Attiva l'autenticazione a due fattori (obbligatoria)

#### Documenti per Iscrizione Aziendale

| Documento | Descrizione |
|-----------|-------------|
| **Numero D-U-N-S** | Obbligatorio per aziende (stesso di Windows) |
| **Sito web aziendale** | Deve essere pubblico e verificabile |
| **Autorita legale** | Il firmatario deve avere autorita di vincolare l'azienda |
| **Email aziendale** | Deve corrispondere al dominio del sito web |

### Fase 2: Iscrizione

1. **Vai su**: https://developer.apple.com/programs/enroll/

2. **Seleziona tipo di iscrizione**:
   - **Organizzazione** (consigliato per Fincons Group)
   - Individuale (solo per sviluppatori indipendenti)

3. **Compila i dati aziendali**:
   ```
   Organization Name: Fincons Group S.p.A.
   D-U-N-S Number: [Il tuo numero DUNS]
   Website: https://www.finconsgroup.com
   Headquarters Address: [Sede legale]
   Legal Entity Type: Corporation
   ```

4. **Verifica telefonica**: Apple chiamera per verificare l'autorita del firmatario

5. **Pagamento**: $99/anno (carta di credito)

6. **Attivazione**: 24-48 ore dopo il pagamento

### Fase 3: Verifica Iscrizione

1. Accedi a https://developer.apple.com/account/
2. Vai su "Membership" nella barra laterale
3. Verifica che lo stato sia "Active"
4. **Copia il Team ID** (stringa di 10 caratteri, es. `ABC123DEF4`)

---

## Creazione dei Certificati

### Fase 1: Generare il CSR (Certificate Signing Request)

Il CSR deve essere generato sul Mac che usera per firmare.

#### Metodo 1: Keychain Access (GUI)

1. Apri **Keychain Access** (Applicazioni > Utility)
2. Menu: **Keychain Access > Certificate Assistant > Request a Certificate From a Certificate Authority**
3. Compila:
   - **User Email Address**: developer@finconsgroup.com
   - **Common Name**: Fincons Group S.p.A.
   - **CA Email Address**: lascia vuoto
   - **Request is**: Saved to disk
4. Salva come `CertificateSigningRequest.certSigningRequest`

#### Metodo 2: Terminale

```bash
# Genera chiave privata e CSR
openssl genrsa -out developer_id.key 2048

openssl req -new -key developer_id.key \
  -out CertificateSigningRequest.certSigningRequest \
  -subj "/emailAddress=developer@finconsgroup.com/CN=Fincons Group S.p.A./C=IT"
```

### Fase 2: Creare il Certificato su Apple Developer Portal

1. Vai su https://developer.apple.com/account/resources/certificates/list

2. Clicca **"+"** per aggiungere un nuovo certificato

3. Seleziona **"Developer ID Application"**

4. Clicca **"Continue"**

5. **Carica il file CSR** creato nel passo precedente

6. Clicca **"Continue"** e poi **"Download"**

7. Il file scaricato sara `developerID_application.cer`

### Fase 3: Installare il Certificato

#### Metodo 1: Doppio click

1. Doppio click sul file `.cer` scaricato
2. Si aprira Keychain Access
3. Il certificato verra installato nel keychain "login"

#### Metodo 2: Terminale

```bash
# Importa il certificato
security import developerID_application.cer -k ~/Library/Keychains/login.keychain-db
```

### Fase 4: Verificare l'Installazione

```bash
# Lista i certificati di code signing disponibili
security find-identity -v -p codesigning

# Output atteso:
# 1) ABC123... "Developer ID Application: Fincons Group S.p.A. (TEAM_ID)"
#    1 valid identities found
```

### Fase 5: Esportare il Certificato (per CI/CD)

Se devi usare il certificato in CI/CD (GitHub Actions):

1. Apri **Keychain Access**
2. Trova il certificato "Developer ID Application: Fincons Group S.p.A."
3. **Espandi** la freccia per vedere la chiave privata associata
4. **Seleziona entrambi** (certificato + chiave privata)
5. Tasto destro > **"Export 2 items..."**
6. Salva come `.p12` con una password sicura
7. **Non committare mai** il file .p12 nel repository!

---

## Configurazione App ID

### Creare l'App ID (se non esiste)

1. Vai su https://developer.apple.com/account/resources/identifiers/list

2. Clicca **"+"** > **"App IDs"** > **"App"**

3. Compila:
   - **Description**: Criterion
   - **Bundle ID**: Explicit > `com.finconsgroup.criterion`
   
4. **Capabilities**: Seleziona quelle necessarie (per Electron base, nessuna speciale)

5. Clicca **"Continue"** e **"Register"**

### Verificare la Corrispondenza

Il Bundle ID deve corrispondere esattamente a quello in `electron-builder.json`:

```json
{
  "appId": "com.finconsgroup.criterion"
}
```

---

## Notarizzazione

### Cos'e la Notarizzazione?

La notarizzazione e un processo automatico di Apple che:
- Scansiona l'app per malware
- Verifica che sia firmata correttamente
- Emette un "ticket" che Gatekeeper riconosce

Dal macOS 10.15 Catalina, le app non notarizzate mostrano un avviso bloccante.

### Fase 1: Creare App-Specific Password

Le credenziali Apple ID non possono essere usate direttamente per la notarizzazione. Serve una password dedicata.

1. Vai su https://appleid.apple.com/account/manage

2. Accedi con l'Apple ID dello sviluppatore

3. Sezione **"Sign-In and Security"** > **"App-Specific Passwords"**

4. Clicca **"+"** per generare una nuova password

5. **Nome**: `Criterion Notarization`

6. **Copia la password** (formato: `xxxx-xxxx-xxxx-xxxx`)

7. Salva in un luogo sicuro (non sara piu visibile)

### Fase 2: Configurare le Credenziali

#### Metodo 1: Keychain (consigliato per build locali)

```bash
# Salva le credenziali nel keychain
xcrun notarytool store-credentials "criterion-notarize" \
  --apple-id "developer@finconsgroup.com" \
  --team-id "TEAM_ID" \
  --password "xxxx-xxxx-xxxx-xxxx"
```

#### Metodo 2: Variabili d'ambiente (per CI/CD)

```bash
APPLE_ID=developer@finconsgroup.com
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID=ABC123DEF4
```

### Fase 3: Notarizzazione Manuale (Test)

```bash
# 1. Crea un archivio ZIP dell'app
ditto -c -k --keepParent "dist/mac/Criterion.app" "Criterion.zip"

# 2. Invia per la notarizzazione
xcrun notarytool submit "Criterion.zip" \
  --keychain-profile "criterion-notarize" \
  --wait

# 3. Se approvato, applica il ticket all'app
xcrun stapler staple "dist/mac/Criterion.app"

# 4. Verifica
xcrun stapler validate "dist/mac/Criterion.app"
```

---

## Configurazione Electron Builder

### Configurazione Base (Firma + Notarizzazione)

Modifica `electron-builder.json`:

```json
{
  "mac": {
    "target": [
      {
        "target": "dmg",
        "arch": ["x64", "arm64"]
      }
    ],
    "icon": "./buildResources/appIcons/icon.icns",
    "category": "public.app-category.utilities",
    "artifactName": "${productName}-${version}-${arch}.${ext}",
    "darkModeSupport": true,
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "./buildResources/entitlements.mac.plist",
    "entitlementsInherit": "./buildResources/entitlements.mac.plist",
    "identity": "Developer ID Application: Fincons Group S.p.A. (TEAM_ID)",
    "notarize": {
      "teamId": "TEAM_ID"
    }
  }
}
```

### Configurazione Entitlements

Il file `buildResources/entitlements.mac.plist` definisce i permessi dell'app:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Necessario per Electron -->
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
    
    <!-- Hardened Runtime con eccezioni per Electron -->
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    
    <!-- Accesso file (se necessario) -->
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
</dict>
</plist>
```

### Variabili d'Ambiente per Notarizzazione

Crea o aggiorna il file `.env`:

```bash
# macOS Code Signing & Notarization
APPLE_ID=developer@finconsgroup.com
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID=ABC123DEF4

# Per CI/CD con certificato esportato
# CSC_LINK=./certificates/mac-signing.p12
# CSC_KEY_PASSWORD=password_del_p12
```

---

## Build e Firma

### Build Locale

```bash
# 1. Assicurati che il certificato sia nel keychain
security find-identity -v -p codesigning

# 2. Imposta le variabili per la notarizzazione
export APPLE_ID="developer@finconsgroup.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="ABC123DEF4"

# 3. Build completa con firma e notarizzazione
npm run dist-mac
```

### Verifica della Firma

```bash
# Verifica firma
codesign -dv --verbose=4 dist/mac/Criterion.app

# Output atteso:
# Authority=Developer ID Application: Fincons Group S.p.A. (TEAM_ID)
# Authority=Developer ID Certification Authority
# Authority=Apple Root CA
# Signature=adheres to a Library Validation
```

### Verifica Notarizzazione

```bash
# Verifica che il ticket sia applicato
xcrun stapler validate dist/mac/Criterion.app

# Output atteso:
# The validate action worked!

# Verifica con spctl (simula Gatekeeper)
spctl -a -vv dist/mac/Criterion.app

# Output atteso:
# dist/mac/Criterion.app: accepted
# source=Notarized Developer ID
```

### CI/CD con GitHub Actions

```yaml
# .github/workflows/build-macos.yml
name: Build macOS

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: macos-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Import Code Signing Certificate
        env:
          MACOS_CERTIFICATE: ${{ secrets.MACOS_CERTIFICATE }}
          MACOS_CERTIFICATE_PWD: ${{ secrets.MACOS_CERTIFICATE_PWD }}
        run: |
          echo $MACOS_CERTIFICATE | base64 --decode > certificate.p12
          security create-keychain -p actions build.keychain
          security default-keychain -s build.keychain
          security unlock-keychain -p actions build.keychain
          security import certificate.p12 -k build.keychain -P $MACOS_CERTIFICATE_PWD -T /usr/bin/codesign
          security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k actions build.keychain
          
      - name: Build and Notarize
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        run: npm run dist-mac
        
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: macos-dmg
          path: dist/*.dmg
```

---

## Troubleshooting

### Errore: "No identity found"

**Causa**: Il certificato non e installato o non e valido.

**Soluzione**:
```bash
# Verifica certificati disponibili
security find-identity -v -p codesigning

# Se vuoto, reinstalla il certificato dal portale Apple
```

### Errore: "Unable to build chain to self-signed root"

**Causa**: Manca il certificato intermedio Apple.

**Soluzione**:
```bash
# Scarica e installa i certificati Apple
# Vai su https://www.apple.com/certificateauthority/
# Scarica "Developer ID - G2" e "Apple Root CA - G2"
# Doppio click per installarli
```

### Errore: "Notarization failed - Package Invalid"

**Causa**: L'app non e firmata correttamente o mancano entitlements.

**Soluzione**:
1. Verifica che `hardenedRuntime: true` sia impostato
2. Controlla che il file entitlements sia corretto
3. Assicurati che tutte le librerie siano firmate:
```bash
codesign -vvv --deep --strict dist/mac/Criterion.app
```

### Errore: "The signature is invalid"

**Causa**: L'app e stata modificata dopo la firma, o la firma non include tutte le risorse.

**Soluzione**:
```bash
# Rifirma con deep signing
codesign --force --deep --sign "Developer ID Application: Fincons Group S.p.A. (TEAM_ID)" \
  dist/mac/Criterion.app
```

### Errore: "xcrun: error: unable to find utility notarytool"

**Causa**: Xcode Command Line Tools non installati o versione vecchia.

**Soluzione**:
```bash
# Installa/aggiorna Xcode Command Line Tools
xcode-select --install

# Oppure scarica da developer.apple.com
```

### Errore: "App cannot be opened because the developer cannot be verified"

**Causa per app firmata**: La notarizzazione non e stata completata o il ticket non e stato applicato.

**Soluzione**:
```bash
# Verifica notarizzazione
xcrun stapler validate dist/mac/Criterion.app

# Se non valido, riapplica il ticket
xcrun stapler staple dist/mac/Criterion.app
```

---

## Best Practices

### Sicurezza

1. **Non committare credenziali nel repository**
   ```gitignore
   # .gitignore
   certificates/
   *.p12
   *.cer
   .env
   .env.local
   ```

2. **Usa GitHub Secrets per CI/CD**
   - Codifica il .p12 in base64: `base64 -i certificate.p12 | pbcopy`
   - Salva come secret `MACOS_CERTIFICATE`

3. **Ruota le App-Specific Password periodicamente**
   - Revocale quando non piu necessarie
   - Crea password separate per ambienti diversi

### Rinnovo del Certificato

1. **I certificati Developer ID scadono dopo 5 anni** (non annualmente come Windows)
2. **Il Developer Program deve essere rinnovato annualmente** ($99)
3. Se il programma scade, i certificati rimangono validi ma non puoi crearne di nuovi
4. **Imposta reminder** 30 giorni prima della scadenza del programma

### Dual Architecture

Per supportare sia Intel che Apple Silicon:

```json
{
  "mac": {
    "target": [
      {
        "target": "dmg",
        "arch": ["x64", "arm64"]
      }
    ]
  }
}
```

Oppure crea un Universal Binary:

```json
{
  "mac": {
    "target": [
      {
        "target": "dmg",
        "arch": ["universal"]
      }
    ]
  }
}
```

---

## Riepilogo Configurazione Criterion

### Modifiche da applicare a electron-builder.json

```json
{
  "mac": {
    "target": [
      {
        "target": "dmg",
        "arch": ["x64", "arm64"]
      }
    ],
    "icon": "./buildResources/appIcons/icon.icns",
    "category": "public.app-category.utilities",
    "artifactName": "${productName}-${version}-${arch}.${ext}",
    "darkModeSupport": true,
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "./buildResources/entitlements.mac.plist",
    "entitlementsInherit": "./buildResources/entitlements.mac.plist",
    "identity": "Developer ID Application: Fincons Group S.p.A. (TEAM_ID)",
    "notarize": {
      "teamId": "TEAM_ID"
    }
  }
}
```

### Checklist Pre-Release

- [ ] Apple Developer Program attivo ($99/anno)
- [ ] Certificato Developer ID Application creato
- [ ] Certificato installato nel keychain
- [ ] App ID configurato con Bundle ID corretto
- [ ] Team ID identificato
- [ ] App-Specific Password generata
- [ ] File `.env` con credenziali notarizzazione
- [ ] `electron-builder.json` configurato
- [ ] Entitlements corretti
- [ ] Build di test completata
- [ ] Firma verificata con `codesign`
- [ ] Notarizzazione completata
- [ ] Ticket applicato con `stapler`
- [ ] Test su macchina pulita (Gatekeeper)

---

## Confronto Costi: Windows vs macOS

| Elemento | Windows (EV) | macOS |
|----------|--------------|-------|
| Certificato (anno 1) | ~$500 | $99 |
| Token hardware | ~$50-100 | Non richiesto |
| Rinnovo annuale | ~$400-500 | $99 |
| Notarizzazione | N/A | Inclusa |
| **Totale anno 1** | **~$550-600** | **$99** |
| **Totale anni successivi** | **~$400-500** | **$99** |

---

## Risorse Utili

- [Apple Developer Program](https://developer.apple.com/programs/)
- [Notarizing macOS Software](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [Code Signing Guide](https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/)
- [Electron Builder - macOS](https://www.electron.build/configuration/mac)
- [Hardened Runtime](https://developer.apple.com/documentation/security/hardened_runtime)

---

*Documento creato per il progetto Criterion - Fincons Group S.p.A.*
*Ultimo aggiornamento: Novembre 2025*
