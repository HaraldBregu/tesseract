# Guida al Certificato Code Signing Windows per Criterion

Questa guida spiega i passaggi necessari per acquistare e configurare un certificato di code signing Microsoft per firmare l'applicazione Criterion su Windows.

## Indice

1. [Panoramica](#panoramica)
2. [Tipi di Certificato](#tipi-di-certificato)
3. [Fornitori Consigliati](#fornitori-consigliati)
4. [Processo di Acquisto](#processo-di-acquisto)
5. [Configurazione del Certificato](#configurazione-del-certificato)
6. [Configurazione Electron Builder](#configurazione-electron-builder)
7. [Build e Firma](#build-e-firma)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## Panoramica

### Perché è necessario un certificato?

Quando distribuisci un'applicazione Windows, il sistema operativo verifica la firma digitale per:

- **Microsoft SmartScreen**: Senza firma, gli utenti vedranno avvisi come "Windows ha protetto il tuo PC" o "App sconosciuta"
- **Integrità**: Garantisce che il software non sia stato modificato dopo la firma
- **Identità**: Conferma che il software proviene da uno sviluppatore/azienda verificata
- **Antivirus**: Molti antivirus sono meno aggressivi con software firmato

### Requisiti per Criterion

| Elemento | Requisito |
|----------|-----------|
| Sistema operativo target | Windows 10/11 |
| Tipo di applicazione | Electron (NSIS installer) |
| Distribuzione | Open source, download pubblico |
| Algoritmo firma | SHA-256 (obbligatorio dal 2021) |

---

## Tipi di Certificato

### Certificato OV (Organization Validation)

| Caratteristica | Dettaglio |
|----------------|-----------|
| **Costo** | ~$200-400/anno |
| **Verifica** | Verifica dell'organizzazione (DUNS, documenti aziendali) |
| **Tempo di rilascio** | 1-3 giorni lavorativi |
| **SmartScreen** | Richiede accumulo di reputazione (migliaia di download) |
| **Formato** | File .pfx/.p12 |
| **Consigliato per** | Software interno, distribuzione limitata |

### Certificato EV (Extended Validation) ⭐ CONSIGLIATO

| Caratteristica | Dettaglio |
|----------------|-----------|
| **Costo** | ~$400-700/anno |
| **Verifica** | Verifica estesa (identità legale, esistenza fisica, autorità firmatario) |
| **Tempo di rilascio** | 3-7 giorni lavorativi |
| **SmartScreen** | Reputazione immediata ✅ |
| **Formato** | Token hardware (USB) - SafeNet, YubiKey |
| **Consigliato per** | Software pubblico, open source, download massivi |

### Raccomandazione per Criterion

**Certificato EV** è fortemente consigliato perché:

1. Criterion è un progetto open source con distribuzione pubblica
2. Gli utenti scaricheranno da GitHub/sito web senza contesto aziendale
3. L'avviso SmartScreen scoraggerebbe molti utenti
4. Il certificato EV bypassa immediatamente SmartScreen

---

## Fornitori Consigliati

### 1. Sectigo (ex-Comodo) ⭐ CONSIGLIATO

| Dettaglio | Valore |
|-----------|--------|
| **Sito** | https://sectigo.com/ssl-certificates-tls/code-signing |
| **Prezzo EV** | ~$400-500/anno |
| **Prezzo OV** | ~$200-300/anno |
| **Rivenditori** | CheapSSLsecurity, SSLTrust, Comodo Italia |
| **Token** | SafeNet eToken 5110 (incluso o acquistabile) |
| **Pro** | Prezzo competitivo, buon supporto, molto usato |
| **Contro** | Interfaccia web datata |

### 2. DigiCert

| Dettaglio | Valore |
|-----------|--------|
| **Sito** | https://www.digicert.com/signing/code-signing-certificates |
| **Prezzo EV** | ~$600-700/anno |
| **Prezzo OV** | ~$400-500/anno |
| **Token** | SafeNet o YubiKey |
| **Pro** | Premium, supporto eccellente, interfaccia moderna |
| **Contro** | Più costoso |

### 3. GlobalSign

| Dettaglio | Valore |
|-----------|--------|
| **Sito** | https://www.globalsign.com/en/code-signing-certificate |
| **Prezzo EV** | ~$500-600/anno |
| **Token** | SafeNet |
| **Pro** | Affidabile, buona documentazione |
| **Contro** | Processo di verifica più lungo |

### Rivenditori Economici (per OV)

- **CheapSSLSecurity**: https://cheapsslsecurity.com
- **SSLTrust**: https://www.ssltrust.com
- **GoGetSSL**: https://www.gogetssl.com

---

## Processo di Acquisto

### Fase 1: Preparazione Documenti

Prima di acquistare, prepara questi documenti per l'azienda **Fincons Group S.p.A.**:

#### Documenti Richiesti

| Documento | Descrizione |
|-----------|-------------|
| **Visura camerale** | Documento ufficiale della Camera di Commercio (non più vecchio di 6 mesi) |
| **Documento identità** | Carta d'identità o passaporto del firmatario autorizzato |
| **Numero DUNS** | Numero D-U-N-S® di Dun & Bradstreet (se non presente, richiederlo gratuitamente) |
| **Lettera di autorizzazione** | Lettera su carta intestata che autorizza il firmatario |
| **Numero di telefono verificabile** | Deve essere pubblicamente verificabile (es. Pagine Gialle, sito aziendale) |

#### Ottenere il numero DUNS (se necessario)

1. Vai su https://www.dnb.com/duns-number/get-a-duns.html
2. Cerca se Fincons Group ha già un numero DUNS
3. Se non presente, richiedi gratuitamente (5-7 giorni)
4. Il numero DUNS è richiesto dalla maggior parte dei fornitori EV

### Fase 2: Acquisto del Certificato

#### Esempio con Sectigo EV

1. **Vai su**: https://sectigo.com/ssl-certificates-tls/code-signing/ev-code-signing
   
2. **Seleziona**:
   - Tipo: EV Code Signing
   - Durata: 1, 2 o 3 anni (sconto per multi-anno)
   - Token: Incluso o "Use existing token"

3. **Compila il modulo**:
   ```
   Organization Name: Fincons Group S.p.A.
   Organization Address: [Indirizzo sede legale]
   Country: Italy
   DUNS Number: [Il tuo numero DUNS]
   Contact Name: [Nome del firmatario autorizzato]
   Contact Email: [Email aziendale]
   Contact Phone: [Telefono verificabile]
   ```

4. **Pagamento**: Carta di credito o bonifico bancario

5. **Verifica**: Il fornitore contatterà per verificare:
   - Esistenza legale dell'azienda
   - Indirizzo fisico
   - Autorità del firmatario
   - Callback telefonico al numero pubblico

### Fase 3: Ricezione del Certificato

#### Per Certificato OV (file .pfx)

1. Riceverai un'email con il link per scaricare il certificato
2. Durante il download, imposta una password sicura
3. Salva il file `.pfx` in un luogo sicuro
4. **MAI** committare il file .pfx nel repository!

#### Per Certificato EV (token hardware)

1. Riceverai il token USB per posta (3-5 giorni)
2. Installa il software SafeNet Authentication Client
3. Inserisci il token e importa il certificato
4. Imposta il PIN del token (richiesto ad ogni firma)

---

## Configurazione del Certificato

### Installazione SafeNet Authentication Client (per EV)

#### Download

- **Windows**: https://knowledge.digicert.com/solution/SO26917.html
- Oppure dal CD incluso con il token

#### Installazione

1. Esegui l'installer come amministratore
2. Riavvia il computer
3. Inserisci il token USB
4. Apri "SafeNet Authentication Client Tools"
5. Il certificato dovrebbe apparire automaticamente

#### Verifica Certificato

```powershell
# Apri PowerShell come amministratore
# Lista i certificati disponibili
Get-ChildItem -Path Cert:\CurrentUser\My -CodeSigningCert

# Output esempio:
# Thumbprint                                Subject
# ----------                                -------
# ABC123...                                 CN=Fincons Group S.p.A., O=Fincons Group S.p.A....
```

### Esportazione Certificato (solo OV)

Se hai un certificato OV e devi esportarlo:

1. Apri `certmgr.msc`
2. Vai su "Personal" > "Certificates"
3. Trova il certificato di code signing
4. Tasto destro > "All Tasks" > "Export"
5. Seleziona "Yes, export the private key"
6. Formato: `.pfx`
7. Imposta una password sicura

---

## Configurazione Electron Builder

### Opzione 1: Certificato OV (file .pfx)

#### Variabili d'Ambiente

Crea o modifica il file `.env` nella root del progetto:

```env
# Windows Code Signing - OV Certificate
WIN_CSC_LINK=./certificates/code-signing.pfx
WIN_CSC_KEY_PASSWORD=la_tua_password_sicura
```

**IMPORTANTE**: Aggiungi al `.gitignore`:

```gitignore
# Certificates
certificates/
*.pfx
*.p12
```

#### Configurazione electron-builder.json

```json
{
  "win": {
    "signAndEditExecutable": true,
    "forceCodeSigning": true,
    "signtoolOptions": {
      "publisherName": "Fincons Group S.p.A.",
      "certificateFile": "${env.WIN_CSC_LINK}",
      "certificatePassword": "${env.WIN_CSC_KEY_PASSWORD}",
      "timestampServer": "http://timestamp.digicert.com"
    }
  }
}
```

### Opzione 2: Certificato EV (token hardware) ⭐ CONSIGLIATO

#### Configurazione electron-builder.json

```json
{
  "win": {
    "signAndEditExecutable": true,
    "forceCodeSigning": true,
    "signtoolOptions": {
      "publisherName": "Fincons Group S.p.A.",
      "certificateSubjectName": "Fincons Group S.p.A.",
      "timestampServer": "http://timestamp.digicert.com",
      "rfc3161TimeStampServer": "http://timestamp.digicert.com"
    }
  }
}
```

#### Script di Firma Personalizzato (per EV con PIN)

Per certificati EV, il token richiede il PIN ad ogni firma. Per build CI/CD, crea uno script personalizzato.

Crea `scripts/windows-sign.js`:

```javascript
const { execSync } = require('child_process');
const path = require('path');

exports.default = async function(configuration) {
  const filePath = configuration.path;
  const fileName = path.basename(filePath);
  
  console.log(`Signing ${fileName}...`);
  
  // Usa signtool con il certificato dal token
  const signCommand = `signtool sign /tr http://timestamp.digicert.com /td sha256 /fd sha256 /n "Fincons Group S.p.A." "${filePath}"`;
  
  try {
    execSync(signCommand, { stdio: 'inherit' });
    console.log(`Successfully signed ${fileName}`);
  } catch (error) {
    console.error(`Failed to sign ${fileName}:`, error.message);
    throw error;
  }
};
```

Aggiorna `electron-builder.json`:

```json
{
  "win": {
    "signAndEditExecutable": true,
    "forceCodeSigning": true,
    "sign": "./scripts/windows-sign.js",
    "signtoolOptions": {
      "publisherName": "Fincons Group S.p.A."
    }
  }
}
```

### Timestamp Server

Il timestamp è **fondamentale** perché:
- Garantisce che la firma sia valida anche dopo la scadenza del certificato
- Gli utenti possono eseguire software firmato anni dopo

Server timestamp consigliati:

| Provider | URL |
|----------|-----|
| DigiCert | http://timestamp.digicert.com |
| Sectigo | http://timestamp.sectigo.com |
| GlobalSign | http://timestamp.globalsign.com/tsa/r6advanced1 |

---

## Build e Firma

### Build Locale

```bash
# 1. Assicurati che le variabili d'ambiente siano impostate
# Per certificato OV:
export WIN_CSC_LINK="./certificates/code-signing.pfx"
export WIN_CSC_KEY_PASSWORD="la_tua_password"

# 2. Build e firma
npm run dist-win

# 3. L'installer firmato sarà in ./dist/
```

### Build con Token EV

Per certificati EV su token:

1. Inserisci il token USB
2. Assicurati che SafeNet Authentication Client sia in esecuzione
3. Esegui la build:

```bash
npm run dist-win
```

4. Quando richiesto, inserisci il PIN del token
   - **Nota**: Verrà richiesto per ogni file da firmare (exe, dll, installer)

### Verifica della Firma

Dopo la build, verifica che la firma sia corretta:

```powershell
# PowerShell
Get-AuthenticodeSignature ".\dist\Criterion.exe"

# Output atteso:
# SignerCertificate      : [Subject]
#                          CN=Fincons Group S.p.A., O=Fincons Group S.p.A., ...
# Status                 : Valid
# StatusMessage          : Signature verified.
# TimeStamperCertificate : CN=DigiCert Timestamp 2021...
```

Oppure con signtool:

```cmd
signtool verify /pa /v ".\dist\Criterion.exe"
```

### CI/CD con GitHub Actions

Per build automatiche con certificato OV:

```yaml
# .github/workflows/build-windows.yml
name: Build Windows

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build and Sign
        env:
          WIN_CSC_LINK: ${{ secrets.WIN_CSC_LINK }}
          WIN_CSC_KEY_PASSWORD: ${{ secrets.WIN_CSC_KEY_PASSWORD }}
        run: npm run dist-win
        
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: windows-installer
          path: dist/*.exe
```

**Nota**: Per certificati EV, la build CI/CD è più complessa perché richiede il token fisico. Opzioni:
1. Build locale per release
2. Usare servizi come Azure SignTool con HSM cloud
3. GitHub Actions self-hosted runner con token collegato

---

## Troubleshooting

### Errore: "No certificates were found"

**Causa**: Il certificato non è installato o non è visibile.

**Soluzione**:
```powershell
# Verifica certificati installati
certutil -store My

# Per token EV, assicurati che SafeNet sia in esecuzione
# e il token sia inserito
```

### Errore: "The specified PFX password is not correct"

**Causa**: Password errata nel file .env o electron-builder.json.

**Soluzione**:
1. Verifica la password
2. Assicurati che non ci siano spazi extra
3. Prova a esportare di nuovo il certificato con una nuova password

### Errore: "SignTool Error: No matching certificates found"

**Causa**: Il `certificateSubjectName` non corrisponde al nome nel certificato.

**Soluzione**:
```powershell
# Trova il nome esatto del certificato
Get-ChildItem -Path Cert:\CurrentUser\My -CodeSigningCert | Format-List Subject

# Usa il Subject esatto in electron-builder.json
```

### SmartScreen mostra ancora avvisi

**Causa per OV**: Il certificato non ha ancora accumulato reputazione.

**Soluzione**:
1. Aspetta che il software venga scaricato migliaia di volte
2. Oppure passa a un certificato EV

**Causa per EV**: Il certificato potrebbe non essere stato applicato correttamente.

**Soluzione**:
1. Verifica la firma con `signtool verify`
2. Assicurati che il timestamp sia presente
3. Contatta il supporto del fornitore

### Errore: "Access denied" durante la firma

**Causa**: Per token EV, il processo non ha accesso al token.

**Soluzione**:
1. Esegui il terminale come amministratore
2. Assicurati che nessun altro processo stia usando il token
3. Riavvia SafeNet Authentication Client

---

## Best Practices

### Sicurezza

1. **Mai committare certificati o password nel repository**
   ```gitignore
   # .gitignore
   certificates/
   *.pfx
   *.p12
   .env.local
   ```

2. **Usa GitHub Secrets per CI/CD**
   - Codifica il .pfx in base64 per i secrets
   - Mai loggare password nei workflow

3. **Per token EV**:
   - Conserva il token in un luogo sicuro
   - Non condividere il PIN
   - Considera un backup del certificato (se permesso dal fornitore)

### Rinnovo del Certificato

1. **Imposta reminder**: 30 giorni prima della scadenza
2. **Rinnova in anticipo**: Il processo può richiedere giorni
3. **Testa il nuovo certificato**: Prima di usarlo in produzione

### Documentazione

Mantieni un registro interno con:
- Data di acquisto e scadenza
- Fornitore e numero ordine
- Nome del firmatario autorizzato
- Procedura di rinnovo

---

## Riepilogo Configurazione Criterion

### Modifiche da applicare a electron-builder.json

```json
{
  "win": {
    "icon": "./buildResources/appIcons/icon.ico",
    "target": "nsis",
    "signAndEditExecutable": true,
    "artifactName": "${productName}.${ext}",
    "forceCodeSigning": true,
    "signtoolOptions": {
      "publisherName": "Fincons Group S.p.A.",
      "certificateSubjectName": "Fincons Group S.p.A.",
      "timestampServer": "http://timestamp.digicert.com"
    },
    "requestedExecutionLevel": "asInvoker",
    "fileAssociations": [
      {
        "ext": "critx",
        "name": "Criterion File",
        "icon": "./buildResources/fileIcons/win/fileIcon.ico"
      }
    ],
    "extraResources": [
      {
        "from": "./buildResources",
        "to": "buildResources",
        "filter": ["printPreview/jre/win/**", "printPreview/TinyTeX-win/**"]
      }
    ]
  }
}
```

### Checklist Pre-Release

- [ ] Certificato EV acquistato e ricevuto
- [ ] SafeNet Authentication Client installato
- [ ] Token USB funzionante
- [ ] electron-builder.json configurato
- [ ] Build di test completata
- [ ] Firma verificata con signtool
- [ ] SmartScreen testato su macchina pulita

---

## Risorse Utili

- [Electron Builder - Code Signing](https://www.electron.build/code-signing)
- [Microsoft - Authenticode](https://docs.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools)
- [SignTool Documentation](https://docs.microsoft.com/en-us/windows/win32/seccrypto/signtool)
- [Sectigo Knowledge Base](https://support.sectigo.com/)
- [DigiCert Code Signing Guide](https://www.digicert.com/kb/code-signing/)

---

*Documento creato per il progetto Criterion - Fincons Group S.p.A.*
*Ultimo aggiornamento: Novembre 2025*
