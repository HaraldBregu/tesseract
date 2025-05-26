# Include librerie necessarie per dialog e checkbox
!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "WinMessages.nsh"
!include "LogicLib.nsh"
!include "FileFunc.nsh"  # Aggiunta per funzioni avanzate di gestione file

# NOTA: Le lingue supportate sono definite in electron-builder.json
# con le proprietà "language" e "installerLanguages" limitate a:
# - Italiano (it-IT)
# - Inglese (en-US)
# - Spagnolo (es-ES)
# - Francese (fr-FR)
# - Tedesco (de-DE)

# Definizione delle stringhe localizzate
!define OPTION_PAGE_TITLE_IT "Opzioni di installazione"
!define OPTION_PAGE_SUBTITLE_IT "Personalizza le opzioni di installazione"
!define KEEP_DATA_IT "Mantieni i dati e le impostazioni dell'applicazione"
!define SELECT_LANG_IT "Seleziona la lingua dell'applicazione:"
!define RUN_AFTER_INSTALL_IT "Avvia Criterion dopo l'installazione"
!define CLOSE_BUTTON_IT "Chiudi"

!define OPTION_PAGE_TITLE_EN "Installation Options"
!define OPTION_PAGE_SUBTITLE_EN "Customize installation options"
!define KEEP_DATA_EN "Keep application data and settings"
!define SELECT_LANG_EN "Select application language:"
!define RUN_AFTER_INSTALL_EN "Launch Criterion after installation"
!define CLOSE_BUTTON_EN "Close"

!define OPTION_PAGE_TITLE_FR "Options d'installation"
!define OPTION_PAGE_SUBTITLE_FR "Personnaliser les options d'installation"
!define KEEP_DATA_FR "Conserver les données et les paramètres de l'application"
!define SELECT_LANG_FR "Sélectionner la langue de l'application:"
!define RUN_AFTER_INSTALL_FR "Lancer Criterion après l'installation"
!define CLOSE_BUTTON_FR "Fermer"

!define OPTION_PAGE_TITLE_ES "Opciones de instalación"
!define OPTION_PAGE_SUBTITLE_ES "Personaliza las opciones de instalación"
!define KEEP_DATA_ES "Mantener dati e configurazione dell'applicazione"
!define SELECT_LANG_ES "Seleccionar idioma de la aplicación:"
!define RUN_AFTER_INSTALL_ES "Iniciar Criterion después de la instalación"
!define CLOSE_BUTTON_ES "Cerrar"

!define OPTION_PAGE_TITLE_DE "Installationsoptionen"
!define OPTION_PAGE_SUBTITLE_DE "Installationsoptionen anpassen"
!define KEEP_DATA_DE "Anwendungsdaten und Einstellungen beibehalten"
!define SELECT_LANG_DE "Sprache der Anwendung auswählen:"
!define RUN_AFTER_INSTALL_DE "Criterion nach der Installation starten"
!define CLOSE_BUTTON_DE "Schließen"

# Impostazioni per la selezione della lingua
!define MUI_LANGDLL_REGISTRY_ROOT "HKCU"
!define MUI_LANGDLL_REGISTRY_KEY "Software\Criterion"
!define MUI_LANGDLL_REGISTRY_VALUENAME "Installer Language"
!define MUI_LANGDLL_ALWAYSSHOW
!define MUI_LANGDLL_WINDOWTITLE "Seleziona lingua | Select language"
!define MUI_LANGDLL_INFO "Seleziona la lingua dell'installazione | Select installer language"

# Definizioni per la pagina finale
!define MUI_FINISHPAGE_RUN "$INSTDIR\Criterion.exe"
!define MUI_FINISHPAGE_RUN_CHECKED
!define MUI_FINISHPAGE_RUN_FUNCTION "RunApplicationAndExit"
!define MUI_FINISHPAGE_NOAUTOCLOSE
!define MUI_FINISHPAGE_NOREBOOTSUPPORT
!define MUI_FINISHPAGE_SHOWREADME ""
!define MUI_FINISHPAGE_SHOWREADME_NOTCHECKED
!define MUI_FINISHPAGE_SHOWREADME_FUNCTION ExitInstaller
# Il pulsante sarà impostato dinamicamente
!define MUI_PAGE_CUSTOMFUNCTION_PRE FinishPagePre
!define MUI_PAGE_CUSTOMFUNCTION_SHOW FinishPageShow
!define MUI_PAGE_CUSTOMFUNCTION_LEAVE FinishPageLeave
!define MUI_FINISHPAGE_LINK "www.finconsgroup.com"
!define MUI_FINISHPAGE_LINK_LOCATION "https://www.finconsgroup.com"

# Definizione dell'ordine delle pagine dell'installatore
!insertmacro MUI_PAGE_WELCOME
!ifdef EULA
  !insertmacro MUI_PAGE_LICENSE "${EULA}"
!else
  !ifdef PROJECT_DIR
    !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\LICENSE"
  !else
    !insertmacro MUI_PAGE_LICENSE "$INSTDIR\LICENSE"
  !endif
!endif
Page custom OptionsPageCreate OptionsPageLeave
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

# IMPORTANTE: NON inserire MUI_LANGUAGE qui, electron-builder gestisce già le lingue

Var KEEP_CONFIG
Var APP_ALREADY_INSTALLED
Var Dialog
Var KeepDataCheckbox
Var KeepDataState
Var INSTALL_EXECUTED
Var INSTALLER_COMPLETED
Var INSTALLER_CLOSING
Var LanguageDropList
Var SelectedLanguage
Var InstallerLanguage
Var LocalizedOptionTitle
Var LocalizedOptionSubtitle
Var LocalizedKeepData
Var LocalizedSelectLang
Var LocalizedRunText
Var LocalizedCloseButton

Function ExitInstaller
  SetErrorLevel 0
  SetAutoClose true
  StrCpy $INSTALLER_CLOSING "1"
  Quit
FunctionEnd

Function FinishPagePre
  # Imposta dinamicamente il testo del pulsante chiudi
  !undef MUI_FINISHPAGE_BUTTON
  !define MUI_FINISHPAGE_BUTTON "$LocalizedCloseButton"
FunctionEnd

Function FinishPageShow
  # Aggiorna il testo del pulsante "Run" nella pagina finale in base alla lingua
  Call GetLocalizedStrings
  
  # Aggiorna il testo del pulsante nella pagina finale
  FindWindow $0 "#32770" "" $HWNDPARENT
  GetDlgItem $0 $0 1203 # ID del checkbox "Launch"
  SendMessage $0 ${WM_SETTEXT} 0 "STR:$LocalizedRunText"
  
  # Aggiorna anche il pulsante Chiudi
  GetDlgItem $0 $HWNDPARENT 2 # ID del pulsante Close/Chiudi
  SendMessage $0 ${WM_SETTEXT} 0 "STR:$LocalizedCloseButton"
  
  StrCpy $INSTALLER_COMPLETED "1"
FunctionEnd

Function FinishPageLeave
  StrCpy $INSTALLER_CLOSING "1"
FunctionEnd

Function RunApplicationAndExit
  ExecShell "" "$INSTDIR\Criterion.exe"
  StrCpy $INSTALLER_CLOSING "1"
  SetErrorLevel 0
  Quit
FunctionEnd

Function .onGUIEnd
  ${If} $INSTALLER_CLOSING != "1"
    StrCpy $INSTALLER_CLOSING "1"
    Quit
  ${EndIf}
FunctionEnd

Function .onInstSuccess
  StrCpy $INSTALLER_COMPLETED "1"
  ClearErrors
FunctionEnd

# Aggiornamento delle stringhe localizzate in base alla lingua corrente
Function GetLocalizedStrings
  ${If} $LANGUAGE == 1040 # LANG_ITALIAN
    StrCpy $SelectedLanguage "it"
    StrCpy $InstallerLanguage "0"
    StrCpy $LocalizedOptionTitle "${OPTION_PAGE_TITLE_IT}"
    StrCpy $LocalizedOptionSubtitle "${OPTION_PAGE_SUBTITLE_IT}"
    StrCpy $LocalizedKeepData "${KEEP_DATA_IT}"
    StrCpy $LocalizedSelectLang "${SELECT_LANG_IT}"
    StrCpy $LocalizedRunText "${RUN_AFTER_INSTALL_IT}"
    StrCpy $LocalizedCloseButton "${CLOSE_BUTTON_IT}"
  ${ElseIf} $LANGUAGE == 1033 # LANG_ENGLISH_US
    StrCpy $SelectedLanguage "en"
    StrCpy $InstallerLanguage "1"
    StrCpy $LocalizedOptionTitle "${OPTION_PAGE_TITLE_EN}"
    StrCpy $LocalizedOptionSubtitle "${OPTION_PAGE_SUBTITLE_EN}"
    StrCpy $LocalizedKeepData "${KEEP_DATA_EN}"
    StrCpy $LocalizedSelectLang "${SELECT_LANG_EN}"
    StrCpy $LocalizedRunText "${RUN_AFTER_INSTALL_EN}"
    StrCpy $LocalizedCloseButton "${CLOSE_BUTTON_EN}"
  ${ElseIf} $LANGUAGE == 2057 # LANG_ENGLISH_UK
    StrCpy $SelectedLanguage "en"
    StrCpy $InstallerLanguage "1"
    StrCpy $LocalizedOptionTitle "${OPTION_PAGE_TITLE_EN}"
    StrCpy $LocalizedOptionSubtitle "${OPTION_PAGE_SUBTITLE_EN}"
    StrCpy $LocalizedKeepData "${KEEP_DATA_EN}"
    StrCpy $LocalizedSelectLang "${SELECT_LANG_EN}"
    StrCpy $LocalizedRunText "${RUN_AFTER_INSTALL_EN}"
    StrCpy $LocalizedCloseButton "${CLOSE_BUTTON_EN}"
  ${ElseIf} $LANGUAGE == 1034 # LANG_SPANISH
    StrCpy $SelectedLanguage "es"
    StrCpy $InstallerLanguage "2"
    StrCpy $LocalizedOptionTitle "${OPTION_PAGE_TITLE_ES}"
    StrCpy $LocalizedOptionSubtitle "${OPTION_PAGE_SUBTITLE_ES}"
    StrCpy $LocalizedKeepData "${KEEP_DATA_ES}"
    StrCpy $LocalizedSelectLang "${SELECT_LANG_ES}"
    StrCpy $LocalizedRunText "${RUN_AFTER_INSTALL_ES}"
    StrCpy $LocalizedCloseButton "${CLOSE_BUTTON_ES}"
  ${ElseIf} $LANGUAGE == 1036 # LANG_FRENCH
    StrCpy $SelectedLanguage "fr"
    StrCpy $InstallerLanguage "3"
    StrCpy $LocalizedOptionTitle "${OPTION_PAGE_TITLE_FR}"
    StrCpy $LocalizedOptionSubtitle "${OPTION_PAGE_SUBTITLE_FR}"
    StrCpy $LocalizedKeepData "${KEEP_DATA_FR}"
    StrCpy $LocalizedSelectLang "${SELECT_LANG_FR}"
    StrCpy $LocalizedRunText "${RUN_AFTER_INSTALL_FR}"
    StrCpy $LocalizedCloseButton "${CLOSE_BUTTON_FR}"
  ${ElseIf} $LANGUAGE == 1031 # LANG_GERMAN
    StrCpy $SelectedLanguage "de"
    StrCpy $InstallerLanguage "4"
    StrCpy $LocalizedOptionTitle "${OPTION_PAGE_TITLE_DE}"
    StrCpy $LocalizedOptionSubtitle "${OPTION_PAGE_SUBTITLE_DE}"
    StrCpy $LocalizedKeepData "${KEEP_DATA_DE}"
    StrCpy $LocalizedSelectLang "${SELECT_LANG_DE}"
    StrCpy $LocalizedRunText "${RUN_AFTER_INSTALL_DE}"
    StrCpy $LocalizedCloseButton "${CLOSE_BUTTON_DE}"
  ${Else}
    StrCpy $SelectedLanguage "it"
    StrCpy $InstallerLanguage "0"
    StrCpy $LocalizedOptionTitle "${OPTION_PAGE_TITLE_IT}"
    StrCpy $LocalizedOptionSubtitle "${OPTION_PAGE_SUBTITLE_IT}"
    StrCpy $LocalizedKeepData "${KEEP_DATA_IT}"
    StrCpy $LocalizedSelectLang "${SELECT_LANG_IT}"
    StrCpy $LocalizedRunText "${RUN_AFTER_INSTALL_IT}"
    StrCpy $LocalizedCloseButton "${CLOSE_BUTTON_IT}"
  ${EndIf}
FunctionEnd

Function OptionsPageCreate
  ${If} $INSTALL_EXECUTED == "1"
    Abort
  ${EndIf}
  
  # Ottieni le stringhe localizzate
  Call GetLocalizedStrings
  
  !insertmacro MUI_HEADER_TEXT "$LocalizedOptionTitle" "$LocalizedOptionSubtitle"
  nsDialogs::Create 1018
  Pop $Dialog
  
  ${If} $Dialog == error
    Abort
  ${EndIf}
  
  ${NSD_CreateCheckbox} 10u 30u 100% 10u "$LocalizedKeepData"
  Pop $KeepDataCheckbox
  ${NSD_SetState} $KeepDataCheckbox 1
  
  ${NSD_CreateLabel} 10u 50u 100% 12u "$LocalizedSelectLang"
  Pop $0
  
  ${NSD_CreateComboBox} 10u 65u 200u 150u ""
  Pop $LanguageDropList
  SendMessage $LanguageDropList ${CB_ADDSTRING} 0 "STR:Italiano"
  SendMessage $LanguageDropList ${CB_ADDSTRING} 0 "STR:English"
  SendMessage $LanguageDropList ${CB_ADDSTRING} 0 "STR:Español"
  SendMessage $LanguageDropList ${CB_ADDSTRING} 0 "STR:Français"
  SendMessage $LanguageDropList ${CB_ADDSTRING} 0 "STR:Deutsch"
  SendMessage $LanguageDropList ${CB_SETCURSEL} $InstallerLanguage 0
  
  nsDialogs::Show
FunctionEnd

Function OptionsPageLeave
  ${NSD_GetState} $KeepDataCheckbox $KeepDataState
  ${If} $KeepDataState == ${BST_CHECKED}
    StrCpy $KEEP_CONFIG "1"
  ${Else}
    StrCpy $KEEP_CONFIG "0"
  ${EndIf}
  
  SendMessage $LanguageDropList ${CB_GETCURSEL} 0 0 $1
  
  ${If} $1 == 0
    StrCpy $SelectedLanguage "it"
  ${ElseIf} $1 == 1
    StrCpy $SelectedLanguage "en"
  ${ElseIf} $1 == 2
    StrCpy $SelectedLanguage "es"
  ${ElseIf} $1 == 3
    StrCpy $SelectedLanguage "fr"
  ${ElseIf} $1 == 4
    StrCpy $SelectedLanguage "de"
  ${Else}
    StrCpy $SelectedLanguage "it"
  ${EndIf}
FunctionEnd

# Definizione della macro preInit direttamente
!macro preInit
  # Impostazione predefinita per le variabili
  StrCpy $INSTALL_EXECUTED "0"
  StrCpy $INSTALLER_COMPLETED "0"
  StrCpy $INSTALLER_CLOSING "0"
  StrCpy $SelectedLanguage "it"
  StrCpy $InstallerLanguage "0"
  
  # Inizializza le stringhe localizzate
  Call GetLocalizedStrings
  
  ${If} ${FileExists} "$INSTDIR\Criterion.exe"
    StrCpy $APP_ALREADY_INSTALLED "1"
    ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "UninstallString"
    ${If} $0 != ""
      DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
    ${EndIf}
    nsExec::Exec 'taskkill /F /IM "Criterion.exe" /T'
    ${If} ${FileExists} "$EXEDIR\Criterion-setup-${VERSION}.exe"
      DetailPrint "File di installazione esistente trovato: $EXEDIR\Criterion-setup-${VERSION}.exe"
      DetailPrint "Tentativo di rimozione del file esistente..."
      Delete /REBOOTOK "$EXEDIR\Criterion-setup-${VERSION}.exe"
      Sleep 1000
    ${EndIf}
  ${Else}
    StrCpy $APP_ALREADY_INSTALLED "0"
  ${EndIf}
!macroend

!macro customInstall
  ${If} $INSTALL_EXECUTED == "1"
    DetailPrint "Installazione già eseguita, salto."
    Return
  ${EndIf}
  
  StrCpy $INSTALL_EXECUTED "1"
  
  SetShellVarContext current
  
  CreateDirectory "$APPDATA\Criterion\config-store"
  
  ClearErrors
  FileOpen $0 "$APPDATA\Criterion\config-store\app-settings.json" w
  ${If} ${Errors}
    DetailPrint "Errore durante l'apertura del file app-settings.json"
    Sleep 500
    FileOpen $0 "$APPDATA\Criterion\config-store\app-settings.json" w
    ${If} ${Errors}
      DetailPrint "Impossibile creare il file di configurazione. L'applicazione userà le impostazioni predefinite."
      Goto JsonWriteEnd
    ${EndIf}
  ${EndIf}
  
  FileWrite $0 '{"language": "$SelectedLanguage"}'
  FileClose $0
  DetailPrint "Lingua selezionata salvata in $APPDATA\Criterion\config-store\app-settings.json: $SelectedLanguage"
  
  JsonWriteEnd:
  
  ${If} $KEEP_CONFIG != "1"
    RMDir /r "$APPDATA\criterion-store"
    Delete "$APPDATA\Criterion\*.*"
    RMDir /r "$APPDATA\Criterion\Session Storage"
    RMDir /r "$APPDATA\Criterion\Local Storage"
    Delete "$LOCALAPPDATA\Criterion\*"
    RMDir /r "$LOCALAPPDATA\Criterion"
    Goto EndPreInit
  ${EndIf}
  
  RMDir /r "$LOCALAPPDATA\Criterion\Cache"
  RMDir /r "$LOCALAPPDATA\Criterion\Code Cache"
  RMDir /r "$APPDATA\Criterion\Session Storage"
  RMDir /r "$APPDATA\Criterion\Local Storage"
  RMDir /r "$LOCALAPPDATA\Criterion\GPUCache"
  Delete "$LOCALAPPDATA\Criterion\*.log"
  RMDir /r "$TEMP\Criterion-updater"

  EndPreInit:
  
  ${If} $APP_ALREADY_INSTALLED == "1"
    RMDir /r "$INSTDIR\buildResources"
    RMDir /r "$INSTDIR\locales"
    Delete "$INSTDIR\*.dll"
    Delete "$INSTDIR\*.pak"
    Delete "$INSTDIR\*.bin"
    Delete "$INSTDIR\*.dat"
    Delete "$INSTDIR\Criterion.exe"
    SetDetailsPrint both
    DetailPrint "Aggiornamento dell'installazione esistente..."
    SetDetailsPrint listonly
    SetOverwrite on
  ${EndIf}
  
  StrCpy $INSTALLER_COMPLETED "1"
!macroend

!macro customUnInstall
  ${If} $APP_ALREADY_INSTALLED == "1"
    SetDetailsPrint both
    DetailPrint "Saltando disinstallazione durante l'aggiornamento..."
    SetDetailsPrint listonly
    Abort
  ${EndIf}
!macroend

!ifndef MULTIUSER_INSTALLMODE_INSTDIR
  !define MULTIUSER_INSTALLMODE_INSTDIR "Criterion"
!endif
!ifndef MULTIUSER_INSTALLMODE_FUNCTION
  !define MULTIUSER_INSTALLMODE_FUNCTION MultiUserFinishFunction
!endif
!ifndef PRODUCT_DIR_REGKEY
  !define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\Criterion.exe"
!endif
!ifndef PRODUCT_UNINST_KEY
  !define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!endif
!ifndef PRODUCT_UNINST_ROOT_KEY
  !define PRODUCT_UNINST_ROOT_KEY "HKLM"
!endif
