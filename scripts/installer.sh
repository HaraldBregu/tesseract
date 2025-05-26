#!/bin/bash

# Script di installazione per Criterion su macOS
# Equivalente a installer.nsh per NSIS su Windows

APP_NAME="Criterion"
APP_DIR="/Applications/$APP_NAME.app"
CONFIG_DIR="$HOME/Library/Application Support/$APP_NAME/config-store"
SETTINGS_FILE="$CONFIG_DIR/app-settings.json"

# Funzione per selezionare la lingua dell'applicazione
select_language() {
    echo "Seleziona la lingua dell'applicazione:"
    echo "1) Italiano"
    echo "2) English"
    echo "3) Español"
    echo "4) Français"
    echo "5) Deutsch"
    
    read -p "Scelta (1-5, default: 1): " language_choice
    
    case $language_choice in
        1|"")
            SELECTED_LANGUAGE="it"
            ;;
        2)
            SELECTED_LANGUAGE="en"
            ;;
        3)
            SELECTED_LANGUAGE="es"
            ;;
        4)
            SELECTED_LANGUAGE="fr"
            ;;
        5)
            SELECTED_LANGUAGE="de"
            ;;
        *)
            echo "Scelta non valida, verrà utilizzato l'italiano come lingua predefinita."
            SELECTED_LANGUAGE="it"
            ;;
    esac
    
    echo "Lingua selezionata: $SELECTED_LANGUAGE"
    
    # Crea la directory di configurazione se non esiste
    mkdir -p "$CONFIG_DIR"
    
    # Salva la lingua selezionata nel file di configurazione
    echo "{\"language\": \"$SELECTED_LANGUAGE\"}" > "$SETTINGS_FILE"
    echo "Configurazione salvata in: $SETTINGS_FILE"
}

# Richiedi se mantenere i dati esistenti durante l'aggiornamento
keep_data() {
    if [ -d "$HOME/Library/Application Support/$APP_NAME" ]; then
        echo "Installazione esistente rilevata."
        read -p "Mantenere i dati e le impostazioni dell'applicazione? (s/n, default: s): " keep_choice
        
        case $keep_choice in
            n|N)
                echo "Rimozione dei dati esistenti..."
                rm -rf "$HOME/Library/Application Support/$APP_NAME"
                rm -rf "$HOME/Library/Caches/$APP_NAME"
                ;;
            *)
                echo "Mantenimento dei dati esistenti."
                # Rimuovi solo le cache
                rm -rf "$HOME/Library/Caches/$APP_NAME"
                ;;
        esac
    fi
}

# Esegui selezione lingua e gestione dati
keep_data
select_language

# Crea collegamenti sul desktop se richiesto
if [ "$CREATE_DESKTOP_SHORTCUT" = "true" ]; then
    echo "Creazione collegamento sul desktop..."
    ln -sf "$APP_DIR" "$HOME/Desktop/$APP_NAME"
fi

# Registrazione associazione file
echo "Registrazione dei tipi di file..."
defaults write com.apple.LaunchServices LSHandlers -array-add '{LSHandlerContentType=com.finconsgroup.critx;LSHandlerRoleAll="com.finconsgroup.criterion";}'

# Aggiornamento database LaunchServices
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user

# Pulizia alla disinstallazione
if [ "$1" = "uninstall" ]; then
    echo "Rimozione dati applicazione..."
    rm -rf "$HOME/Library/Application Support/$APP_NAME"
    rm -rf "$HOME/Library/Caches/$APP_NAME"
    rm -rf "$HOME/Library/Preferences/com.finconsgroup.criterion.plist"
fi

echo "Installazione completata!"

# Chiedi se avviare l'applicazione dopo l'installazione
read -p "Avviare l'applicazione ora? (s/n, default: s): " run_choice
case $run_choice in
    n|N)
        echo "L'applicazione non verrà avviata automaticamente."
        ;;
    *)
        echo "Avvio dell'applicazione..."
        open "$APP_DIR"
        ;;
esac

exit 0
