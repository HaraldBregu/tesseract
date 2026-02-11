# Guida al Trasferimento Certificati Apple Developer tra Mac

Questa guida spiega come trasferire un certificato Apple Developer (e la relativa chiave privata) da un Mac ad un altro, per permettere la firma del codice su più macchine.

## Indice

1. [Panoramica](#panoramica)
2. [Prerequisiti](#prerequisiti)
3. [Esportazione del Certificato](#esportazione-del-certificato)
4. [Trasferimento Sicuro](#trasferimento-sicuro)
5. [Importazione sul Nuovo Mac](#importazione-sul-nuovo-mac)
6. [Verifica dell'Installazione](#verifica-dellinstallazione)
7. [Configurazione Post-Importazione](#configurazione-post-importazione)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices di Sicurezza](#best-practices-di-sicurezza)

---

## Panoramica

### Perché trasferire un certificato?

- **Nuovo Mac**: Hai sostituito la macchina di sviluppo
- **Team distribuito**: Più sviluppatori devono poter firmare l'app
- **CI/CD**: Configurazione di sistemi di build automatizzati
- **Backup**: Preservare l'accesso al certificato in caso di guasto hardware

### Cosa viene trasferito?

| Elemento | Descrizione | Necessario |
|----------|-------------|------------|
| **Certificato pubblico** | Contiene l'identità dello sviluppatore | ✅ Sì |
| **Chiave privata** | Permette la firma del codice | ✅ Sì |
| **Certificati intermedi** | Catena di fiducia Apple | ⚠️ Automatici |

> ⚠️ **IMPORTANTE**: Senza la chiave privata, il certificato è inutilizzabile per la firma. La chiave privata esiste solo sul Mac dove è stato generato il CSR originale.

---

## Prerequisiti

### Sul Mac di origine (dove esportare)

- [ ] macOS con Keychain Access
- [ ] Certificato Developer ID Application installato
- [ ] Accesso amministratore per sbloccare il keychain
- [ ] Password del keychain (solitamente la password di login)

### Sul Mac di destinazione (dove importare)

- [ ] macOS 10.13 o successivo
- [ ] Xcode Command Line Tools installati
- [ ] Accesso amministratore

### Verifica certificato esistente

Prima di esportare, verifica che il certificato sia presente e valido:

```bash
# Lista tutti i certificati di code signing
security find-identity -v -p codesigning

# Output atteso:
# 1) XXXXXXXX "Developer ID Application: Nome Azienda (TEAM_ID)"
#    1 valid identities found
```

---

## Esportazione del Certificato

### Metodo 1: Keychain Access (GUI) - CONSIGLIATO

Questo metodo esporta sia il certificato che la chiave privata in un unico file `.p12`.

#### Passaggi:

1. **Apri Keychain Access**
   - Applicazioni > Utility > Keychain Access
   - Oppure: `open -a "Keychain Access"`

2. **Seleziona il keychain corretto**
   - Barra laterale sinistra > **login** (o dove è salvato il certificato)

3. **Trova il certificato**
   - Categoria > **Certificati** (o **My Certificates**)
   - Cerca "Developer ID Application"

4. **Espandi il certificato**
   - Clicca sulla freccia accanto al certificato
   - Dovresti vedere la **chiave privata** associata

5. **Seleziona entrambi**
   - Clicca sul certificato
   - Tieni premuto `Cmd` e clicca sulla chiave privata
   - Entrambi devono essere evidenziati

6. **Esporta**
   - Menu: File > **Esporta elementi...** (oppure tasto destro > Esporta)
   - Formato: **Personal Information Exchange (.p12)**
   - Nome file: `DeveloperID_Application.p12`
   - Salva in una posizione sicura

7. **Imposta password**
   - Inserisci una **password robusta** per proteggere il file
   - **Memorizza questa password** - servirà per l'importazione
   - Conferma la password

8. **Autenticazione**
   - Inserisci la password del keychain (o usa Touch ID)
   - Potrebbe essere richiesto più volte

### Metodo 2: Terminale

```bash
# 1. Trova il nome esatto del certificato
security find-identity -v -p codesigning

# 2. Esporta certificato e chiave privata
# Sostituisci "Developer ID Application: Nome Azienda (TEAM_ID)" con il nome esatto
security export -k ~/Library/Keychains/login.keychain-db \
  -t identities \
  -f pkcs12 \
  -o ~/Desktop/DeveloperID_Application.p12 \
  -P "PASSWORD_SICURA"

# Nota: Potrebbe essere necessario specificare il certificato esatto
```

### Metodo 3: Esportazione separata (certificato + chiave)

Se hai bisogno di file separati:

```bash
# Esporta solo il certificato (formato .cer)
security find-certificate -c "Developer ID Application" -p > ~/Desktop/certificate.pem

# Per la chiave privata, usa Keychain Access GUI
# Seleziona solo la chiave > Esporta > formato .p12
```

---

## Trasferimento Sicuro

### ⚠️ AVVERTENZE DI SICUREZZA

Il file `.p12` contiene la tua identità di sviluppatore. Se compromesso:
- Qualcuno potrebbe firmare malware a tuo nome
- Apple potrebbe revocare il certificato
- Danni reputazionali per l'azienda

### Metodi di trasferimento consigliati

#### 1. AirDrop (Mac-to-Mac diretto) ✅ CONSIGLIATO

```
Mac origine → AirDrop → Mac destinazione
```

- Crittografato end-to-end
- Non transita su internet
- Immediato

#### 2. USB/Disco esterno crittografato ✅

```bash
# Crea un'immagine disco crittografata
hdiutil create -encryption AES-256 -size 10m \
  -volname "Certificates" -fs HFS+ \
  ~/Desktop/certificates_secure.dmg

# Monta l'immagine
hdiutil attach ~/Desktop/certificates_secure.dmg

# Copia il file .p12
cp ~/Desktop/DeveloperID_Application.p12 /Volumes/Certificates/

# Smonta
hdiutil detach /Volumes/Certificates
```

#### 3. Servizio cloud aziendale con crittografia ⚠️

Se necessario usare cloud storage:

```bash
# Cripta il file prima dell'upload
openssl enc -aes-256-cbc -salt -pbkdf2 \
  -in DeveloperID_Application.p12 \
  -out DeveloperID_Application.p12.enc

# Decripta dopo il download (sul Mac destinazione)
openssl enc -aes-256-cbc -d -pbkdf2 \
  -in DeveloperID_Application.p12.enc \
  -out DeveloperID_Application.p12
```

### Metodi da EVITARE ❌

| Metodo | Rischio |
|--------|---------|
| Email non crittografata | Intercettazione |
| Slack/Teams | Log permanenti |
| Repository Git | Esposizione pubblica |
| Link condivisi (Dropbox, GDrive) | Accesso non autorizzato |

---

## Importazione sul Nuovo Mac

### Metodo 1: Doppio click (GUI)

1. **Individua il file `.p12`** sul nuovo Mac

2. **Doppio click** sul file
   - Si aprirà Keychain Access

3. **Seleziona il keychain di destinazione**
   - **login** (consigliato per uso personale)
   - **System** (se deve essere disponibile a tutti gli utenti)

4. **Inserisci la password** del file .p12

5. **Autenticazione** - Inserisci la password del Mac

6. **Conferma importazione**

### Metodo 2: Keychain Access (GUI)

1. Apri **Keychain Access**

2. Seleziona il keychain **login** (o System)

3. Menu: File > **Importa elementi...**

4. Seleziona il file `.p12`

5. Inserisci la password del file .p12

6. Conferma con la password del Mac

### Metodo 3: Terminale

```bash
# Importa nel keychain login
security import ~/Desktop/DeveloperID_Application.p12 \
  -k ~/Library/Keychains/login.keychain-db \
  -P "PASSWORD_DEL_P12" \
  -T /usr/bin/codesign \
  -T /usr/bin/productsign \
  -T /usr/bin/productbuild

# Oppure nel System keychain (richiede sudo)
sudo security import ~/Desktop/DeveloperID_Application.p12 \
  -k /Library/Keychains/System.keychain \
  -P "PASSWORD_DEL_P12" \
  -T /usr/bin/codesign
```

### Configurare l'accesso automatico (evita popup)

Per evitare che macOS chieda continuamente l'autorizzazione durante la firma:

```bash
# Sblocca il keychain
security unlock-keychain -p "PASSWORD_KEYCHAIN" ~/Library/Keychains/login.keychain-db

# Imposta la partizione list per permettere l'accesso a codesign
security set-key-partition-list -S apple-tool:,apple:,codesign: \
  -s -k "PASSWORD_KEYCHAIN" ~/Library/Keychains/login.keychain-db
```

---

## Verifica dell'Installazione

### Test 1: Lista certificati disponibili

```bash
security find-identity -v -p codesigning
```

**Output atteso:**
```
1) XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX "Developer ID Application: Nome Azienda (TEAM_ID)"
   1 valid identities found
```

### Test 2: Verifica catena di certificati

```bash
security find-certificate -c "Developer ID Application" -p | \
  openssl x509 -text -noout | grep -A2 "Issuer:"
```

### Test 3: Firma di prova

```bash
# Crea un file di test
echo "test" > /tmp/test_sign.txt

# Firma il file
codesign -s "Developer ID Application: Nome Azienda (TEAM_ID)" /tmp/test_sign.txt

# Verifica la firma
codesign -v /tmp/test_sign.txt

# Pulisci
rm /tmp/test_sign.txt
```

### Test 4: Firma di un'app Electron

```bash
# Nella directory del progetto Criterion
npm run dist-mac

# Verifica firma dell'app generata
codesign -dv --verbose=4 dist/mac/Criterion.app
```

**Output atteso:**
```
Authority=Developer ID Application: Nome Azienda (TEAM_ID)
Authority=Developer ID Certification Authority
Authority=Apple Root CA
```

---

## Configurazione Post-Importazione

### 1. Installare i certificati intermedi (se mancanti)

Se la verifica mostra errori di catena:

```bash
# Scarica i certificati Apple
curl -O https://www.apple.com/certificateauthority/DeveloperIDG2CA.cer
curl -O https://www.apple.com/certificateauthority/AppleRootCA-G2.cer

# Importa
security import DeveloperIDG2CA.cer -k ~/Library/Keychains/login.keychain-db
security import AppleRootCA-G2.cer -k ~/Library/Keychains/login.keychain-db

# Pulisci
rm DeveloperIDG2CA.cer AppleRootCA-G2.cer
```

### 2. Configurare variabili d'ambiente

Crea o aggiorna il file `.env` del progetto:

```bash
# macOS Code Signing
APPLE_ID=developer@tuaazienda.com
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID=ABC123DEF4
```

### 3. Configurare le credenziali per la notarizzazione

```bash
# Salva le credenziali nel keychain del nuovo Mac
xcrun notarytool store-credentials "criterion-notarize" \
  --apple-id "developer@tuaazienda.com" \
  --team-id "TEAM_ID" \
  --password "xxxx-xxxx-xxxx-xxxx"
```

### 4. Verificare electron-builder.json

Assicurati che l'identità corrisponda esattamente:

```json
{
  "mac": {
    "identity": "Developer ID Application: Nome Azienda (TEAM_ID)"
  }
}
```

---

## Troubleshooting

### Errore: "No identity found"

**Causa**: La chiave privata non è stata importata correttamente.

**Soluzione**:
```bash
# Verifica che il .p12 contenga la chiave privata
openssl pkcs12 -info -in DeveloperID_Application.p12 -nodes -nocerts

# Se vuoto, il .p12 non contiene la chiave - ri-esporta dal Mac originale
```

### Errore: "The specified item could not be found in the keychain"

**Causa**: Il certificato è in un keychain diverso o bloccato.

**Soluzione**:
```bash
# Lista tutti i keychain
security list-keychains

# Sblocca il keychain corretto
security unlock-keychain ~/Library/Keychains/login.keychain-db

# Aggiungi il keychain alla lista di ricerca
security list-keychains -s ~/Library/Keychains/login.keychain-db
```

### Errore: "User interaction is not allowed"

**Causa**: Il keychain è bloccato o richiede conferma manuale.

**Soluzione**:
```bash
# Sblocca il keychain
security unlock-keychain -p "PASSWORD" ~/Library/Keychains/login.keychain-db

# Imposta il timeout (0 = mai bloccare durante la sessione)
security set-keychain-settings -t 0 ~/Library/Keychains/login.keychain-db

# Imposta le partizioni per codesign
security set-key-partition-list -S apple-tool:,apple:,codesign: \
  -s -k "PASSWORD" ~/Library/Keychains/login.keychain-db
```

### Errore: "A valid signing identity matching this name could not be found"

**Causa**: Nome del certificato non corrisponde esattamente.

**Soluzione**:
```bash
# Trova il nome esatto
security find-identity -v -p codesigning

# Copia esattamente il nome tra virgolette nel tuo electron-builder.json
```

### Errore: "Unable to build chain to self-signed root"

**Causa**: Mancano i certificati intermedi Apple.

**Soluzione**:
```bash
# Scarica e installa i certificati intermedi
curl -O https://www.apple.com/certificateauthority/DeveloperIDG2CA.cer
security import DeveloperIDG2CA.cer -k ~/Library/Keychains/login.keychain-db
```

### Il certificato appare ma non firma

**Causa**: La chiave privata non è associata o è corrotta.

**Soluzione**:
1. In Keychain Access, espandi il certificato
2. Verifica che appaia una chiave privata sotto di esso
3. Se non c'è, ri-importa il file .p12
4. Se ancora non funziona, ri-esporta dal Mac originale assicurandoti di selezionare entrambi

---

## Best Practices di Sicurezza

### Protezione del file .p12

| Azione | Raccomandazione |
|--------|-----------------|
| Password | Minimo 16 caratteri, casuale |
| Storage | Mai su cloud non crittografato |
| Condivisione | Solo tramite canali sicuri |
| Backup | In luogo fisico sicuro (cassaforte) |
| Eliminazione | Usa `srm` o cancellazione sicura |

```bash
# Eliminazione sicura dopo l'importazione
rm -P DeveloperID_Application.p12

# Oppure (più sicuro)
srm -sz DeveloperID_Application.p12
```

### Limitare l'accesso al certificato

```bash
# Imposta permessi restrittivi sul keychain
chmod 600 ~/Library/Keychains/login.keychain-db
```

### Audit degli accessi

```bash
# Abilita logging degli accessi al keychain
sudo log config --mode "level:debug" --subsystem com.apple.securityd
```

### Revoca in caso di compromissione

Se il certificato viene compromesso:

1. **Accedi** a https://developer.apple.com/account/resources/certificates/list
2. **Trova** il certificato compromesso
3. **Clicca** "Revoke"
4. **Crea** un nuovo certificato
5. **Aggiorna** tutti i Mac autorizzati

---

## Checklist Trasferimento

### Sul Mac di origine

- [ ] Verificato che il certificato esista e sia valido
- [ ] Esportato certificato E chiave privata in formato .p12
- [ ] Impostata password robusta per il .p12
- [ ] Trasferito il file in modo sicuro
- [ ] Eliminato il file .p12 temporaneo

### Sul Mac di destinazione

- [ ] Importato il file .p12 nel keychain
- [ ] Verificato che appaia in `security find-identity`
- [ ] Installati certificati intermedi Apple (se necessario)
- [ ] Configurato accesso automatico per codesign
- [ ] Configurate credenziali notarizzazione
- [ ] Eseguito test di firma
- [ ] Eliminato il file .p12 temporaneo

---

## Script di Automazione

### Script di verifica completa

Salva come `verify-signing-setup.sh`:

```bash
#!/bin/bash

echo "🔍 Verifica configurazione code signing macOS"
echo "============================================="

# 1. Verifica certificati
echo -e "\n📜 Certificati disponibili:"
security find-identity -v -p codesigning

# 2. Verifica keychain
echo -e "\n🔐 Keychain attivi:"
security list-keychains

# 3. Test firma
echo -e "\n✍️  Test firma..."
TEMP_FILE=$(mktemp)
CERT_NAME=$(security find-identity -v -p codesigning | grep "Developer ID Application" | head -1 | sed 's/.*"\(.*\)"/\1/')

if [ -n "$CERT_NAME" ]; then
    codesign -s "$CERT_NAME" "$TEMP_FILE" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Firma riuscita con: $CERT_NAME"
    else
        echo "❌ Firma fallita"
    fi
else
    echo "❌ Nessun certificato Developer ID trovato"
fi
rm -f "$TEMP_FILE"

# 4. Verifica notarytool
echo -e "\n📋 Credenziali notarizzazione:"
xcrun notarytool store-credentials --list 2>/dev/null || echo "Nessuna credenziale salvata"

echo -e "\n✅ Verifica completata"
```

Esegui:
```bash
chmod +x verify-signing-setup.sh
./verify-signing-setup.sh
```

---

## Risorse Utili

- [Apple: Exporting Certificates](https://support.apple.com/guide/keychain-access/kyca35961/mac)
- [Apple: Code Signing Guide](https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/)
- [Electron Builder: Code Signing](https://www.electron.build/code-signing)

---

*Documento creato per il progetto Criterion*
*Ultimo aggiornamento: Dicembre 2025*
