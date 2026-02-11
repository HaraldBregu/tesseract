import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/providers/theme-provider";
import { useKeyboardShortcutsAPI } from "@/hooks/use-electron";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

function KeyboardShortcutsWindowView() {
    const { t } = useTranslation();
    const keyboardAPI = useKeyboardShortcutsAPI();
    const [categories, setCategories] = useState<KeyboardShortcutCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedCommand, setSelectedCommand] =
        useState<KeyboardShortcut | null>(null);
    const [newShortcut, setNewShortcut] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [conflict, setConflict] = useState<string | null>(null);
    const [isReservedShortcut, setIsReservedShortcut] = useState(false);
    const [reservedReason, setReservedReason] = useState<'devtools' | 'os' | 'macOptionSpecialChar' | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [validationMessage, setValidationMessage] = useState<{ type: 'info' | 'warning' | 'success'; message: string; example?: string } | null>(null);

    const visibleCategories = useMemo(() => {
        return categories
            .map((category) => ({
                ...category,
                commands: category.commands.filter((command) => !command.locked),
            }))
            .filter((category) => category.commands.length > 0);
    }, [categories]);

    // Detect if running on Mac
    const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
    
    // Get the platform-specific main modifier name
    const mainModifier = isMac ? "Cmd" : "Ctrl";

    // Check if a key is a letter (A-Z)
    const isLetterKey = (key: string): boolean => /^[A-Z]$/.test(key);
    
    // Check if a key is a number (0-9)
    const isNumberKey = (key: string): boolean => /^\d$/.test(key);
    
    // Check if a key is a function key (F1-F24)
    const isFunctionKey = (key: string): boolean => /^F(\d|1\d|2[0-4])$/.test(key);

    /**
     * macOS Option key produces special characters when pressed with letters/numbers.
     * These combinations cannot be used as shortcuts because the OS intercepts them
     * to input special characters (e.g., Option+A = å, Option+K = ˚, Option+2 = ™).
     * 
     * On macOS, Alt/Option-only shortcuts (without Cmd) should be blocked for:
     * - All letters (A-Z): produce accented/special characters
     * - All numbers (0-9): produce symbols like ™, £, ¢, etc.
     * - Option+Shift+letters also produces special characters (uppercase versions)
     * 
     * Valid macOS shortcuts with Alt must also include Cmd: Cmd+Alt+Key
     */
    const isMacOptionConflict = (key: string, hasCmdOrCtrl: boolean, hasAlt: boolean): boolean => {
        if (!isMac || !hasAlt || hasCmdOrCtrl) {
            // Not Mac, no Alt pressed, or Cmd is also pressed - no conflict
            return false;
        }
        // On Mac, Alt+Letter or Alt+Number (without Cmd) produces special characters
        return isLetterKey(key) || isNumberKey(key);
    };

    // Format shortcut for display (avoid substring replacements; handle both CmdOrCtrl and CommandOrControl)
    const formatShortcutForDisplay = (shortcut?: string): string => {
        if (!shortcut) return "";

        const parts = shortcut
            .split("+")
            .map((part) => part.trim())
            .filter(Boolean);

        const formattedParts = parts.map((part) => {
            switch (part) {
                case "CmdOrCtrl":
                case "CommandOrControl":
                    return isMac ? "Cmd" : "Ctrl";
                case "Alt":
                    return isMac ? "Option" : "Alt";
                default:
                    return part;
            }
        });

        return formattedParts.join(" + ");
    };

    // Get platform-specific help text
    const getHelpText = (): string => {
        return isMac ? t("keyboardShortcuts.helpTextMac") : t("keyboardShortcuts.helpTextWinLinux");
    };

    // Notify main process when component is mounted and ready to show
    useEffect(() => {
        globalThis.electron.ipcRenderer.send("child-window-ready");
    }, []);

    // Load shortcuts on mount
    useEffect(() => {
        loadShortcuts();
    }, []);

    // Ensure selected category exists (or reset) once filtered categories change
    useEffect(() => {
        if (visibleCategories.length === 0) {
            if (selectedCategory) {
                setSelectedCategory("");
            }
            if (selectedCommand) {
                setSelectedCommand(null);
                setNewShortcut("");
            }
            return;
        }

        const categoryExists = visibleCategories.some(
            (category) => category.name === selectedCategory
        );

        if (!selectedCategory || !categoryExists) {
            setSelectedCategory(visibleCategories[0].name);
            setSelectedCommand(null);
            setNewShortcut("");
        }
    }, [visibleCategories, selectedCategory, selectedCommand]);

    useEffect(() => {
        if (!selectedCommand) {
            return;
        }

        const isCommandVisible = visibleCategories.some((category) =>
            category.commands.some(
                (command) => command.menuItemId === selectedCommand.menuItemId
            )
        );

        if (!isCommandVisible) {
            setSelectedCommand(null);
            setNewShortcut("");
        }
    }, [visibleCategories, selectedCommand]);

    const loadShortcuts = async () => {
        try {
            const shortcuts = await keyboardAPI.getShortcuts();
            setCategories(shortcuts);
        } catch (error) {
            console.error("Failed to load shortcuts:", error);
        }
    };

    const handleCategorySelect = (categoryName: string) => {
        setSelectedCategory(categoryName);
        setSelectedCommand(null);
        setNewShortcut("");
        setConflict(null);
        setIsReservedShortcut(false);
        setReservedReason(null);
        setSuccessMessage(null);
        setErrorMessage(null);
        setValidationMessage(null);
    };

    const handleCommandSelect = (command: KeyboardShortcut) => {
        setSelectedCommand(command);
        setNewShortcut(command.shortcut);
        setConflict(null);
        setIsReservedShortcut(false);
        setReservedReason(null);
        setSuccessMessage(null);
        setErrorMessage(null);
        setValidationMessage(null);
    };

    // Normalize event.code to key name (e.g., "KeyC" -> "C", "Digit1" -> "1")
    const normalizeCodeToKeyName = (code: string): string => {
        // Handle letter keys (KeyA-KeyZ)
        if (code.startsWith("Key")) {
            return code.substring(3); // "KeyC" -> "C"
        }

        // Handle digit keys (Digit0-Digit9)
        if (code.startsWith("Digit")) {
            return code.substring(5); // "Digit1" -> "1"
        }

        // Handle special keys using the code map
        const codeMap: Record<string, string> = {
            Enter: "Enter",
            Escape: "Escape",
            Space: "Space",
            Delete: "Delete",
            Backspace: "Backspace",
            Tab: "Tab",
            ArrowUp: "Up",
            ArrowDown: "Down",
            ArrowLeft: "Left",
            ArrowRight: "Right",
            Minus: "-",
            Equal: "=",
            BracketLeft: "[",
            BracketRight: "]",
            Backslash: "\\",
            Semicolon: ";",
            Quote: "'",
            Comma: ",",
            Period: ".",
            Slash: "/",
            Backquote: "`",
        };

        return codeMap[code] || code;
    };

    /**
     * Validates and normalizes shortcut format for Electron accelerators
     * Electron requires modifiers in a specific order:
     * 1. CmdOrCtrl (or Cmd/Ctrl)
     * 2. Alt
     * 3. Shift
     * 4. Key
     */
    const validateShortcut = (shortcut: string): boolean => {
        if (!shortcut) return false;

        const parts = shortcut
            .split("+")
            .map((part) => part.trim())
            .filter(Boolean);
        if (parts.length === 0) return false;

        // Last part must be a key (not a modifier)
        const lastPart = parts.at(-1);
        if (!lastPart) return false;
        const modifiers = [
            "CmdOrCtrl",
            "CommandOrControl",
            "Cmd",
            "Ctrl",
            "Alt",
            "Shift",
            "Meta",
            "Super",
        ];
        if (modifiers.includes(lastPart)) return false;

        return true;
    };

    /**
     * Show validation message for modifier-only keys
     */
    const showModifiersOnlyMessage = (hasCmdOrCtrl: boolean, hasAlt: boolean, hasShift: boolean) => {
        const currentMods: string[] = [];
        if (hasCmdOrCtrl) currentMods.push(mainModifier);
        if (hasAlt) currentMods.push("Alt");
        if (hasShift) currentMods.push("Shift");
        
        if (currentMods.length > 0) {
            setValidationMessage({
                type: 'info',
                message: t("keyboardShortcuts.validation.modifiersOnly"),
                example: t("keyboardShortcuts.validation.modifiersOnlyExample", { modifiers: currentMods.join("+") })
            });
        }
    };

    /**
     * Show validation message when letter/number pressed without proper modifiers
     */
    const showNeedsModifierMessage = (hasShift: boolean, normalizedKey: string) => {
        if (hasShift) {
            // Shift+Letter produces uppercase, not valid as shortcut
            setValidationMessage({
                type: 'warning',
                message: t("keyboardShortcuts.validation.shiftOnlyNotAllowed", { modifier: mainModifier }),
                example: t("keyboardShortcuts.validation.shiftOnlyExample", { modifier: mainModifier, key: normalizedKey })
            });
        } else {
            // No modifier at all
            setValidationMessage({
                type: 'warning',
                message: t("keyboardShortcuts.validation.needsModifier", { modifier: mainModifier }),
                example: t("keyboardShortcuts.validation.needsModifierExample", { modifier: mainModifier, key: normalizedKey })
            });
        }
        setNewShortcut("");
        setIsRecording(false);
    };

    /**
     * Show success validation message based on shortcut type
     */
    const showSuccessValidationMessage = (shortcut: string, normalizedKey: string, isTabKey: boolean, isFKey: boolean, keysCount: number) => {
        if (isTabKey) {
            setValidationMessage({
                type: 'info',
                message: t("keyboardShortcuts.validation.tabNotRecommended")
            });
        } else if (isFKey && keysCount === 1) {
            // Function key alone
            setValidationMessage({
                type: 'success',
                message: t("keyboardShortcuts.validation.functionKeyValid", { key: normalizedKey }),
                example: t("keyboardShortcuts.validation.functionKeyExample", { key: normalizedKey, modifier: mainModifier })
            });
        } else {
            // Valid shortcut with modifiers
            setValidationMessage({
                type: 'success',
                message: t("keyboardShortcuts.validation.validShortcut"),
                example: t("keyboardShortcuts.validation.validShortcutFormat", { shortcut: formatShortcutForDisplay(shortcut) })
            });
        }
    };

    const handleShortcutRecord = useCallback(
        (event: KeyboardEvent) => {
            if (!isRecording) return;

            event.preventDefault();
            event.stopPropagation();

            // Check which modifiers are pressed
            const hasCmdOrCtrl = (isMac && event.metaKey) || (!isMac && event.ctrlKey);
            const hasAlt = event.altKey;
            const hasShift = event.shiftKey;
            
            // Ignore modifier-only keys - show guidance message
            if (["Control", "Alt", "Shift", "Meta", "Command"].includes(event.key)) {
                showModifiersOnlyMessage(hasCmdOrCtrl, hasAlt, hasShift);
                return;
            }

            const normalizedKey = normalizeCodeToKeyName(event.code);
            
            // Check for Escape key - not allowed
            if (normalizedKey === "Escape" || normalizedKey === "Esc") {
                setValidationMessage({
                    type: 'warning',
                    message: t("keyboardShortcuts.validation.escapeNotAllowed")
                });
                return;
            }
            
            const isTabKey = normalizedKey === "Tab";
            const needsModifier = isLetterKey(normalizedKey) || isNumberKey(normalizedKey);
            const isFKey = isFunctionKey(normalizedKey);
            
            // macOS-specific: Option+Letter/Number produces special characters, cannot be used as shortcuts
            if (isMacOptionConflict(normalizedKey, hasCmdOrCtrl, hasAlt)) {
                setValidationMessage({
                    type: 'warning',
                    message: t("keyboardShortcuts.validation.macOptionConflict"),
                    example: t("keyboardShortcuts.validation.macOptionConflictExample", { key: normalizedKey })
                });
                setNewShortcut("");
                setIsRecording(false);
                return;
            }
            
            // Validation: Letter/Number without CmdOrCtrl or Alt
            if (needsModifier && !hasCmdOrCtrl && !hasAlt) {
                showNeedsModifierMessage(hasShift, normalizedKey);
                return;
            }

            // Build shortcut in correct Electron accelerator order
            const keys: string[] = [];
            if (hasCmdOrCtrl) keys.push("CmdOrCtrl");
            if (hasAlt) keys.push("Alt");
            if (hasShift) keys.push("Shift");
            keys.push(normalizedKey);

            const shortcut = keys.join("+");

            if (validateShortcut(shortcut)) {
                setNewShortcut(shortcut);
                setIsRecording(false);
                showSuccessValidationMessage(shortcut, normalizedKey, isTabKey, isFKey, keys.length);
            } else {
                setIsRecording(false);
                setValidationMessage({
                    type: 'warning',
                    message: t("keyboardShortcuts.validation.modifiersOnly"),
                    example: t("keyboardShortcuts.validation.modifiersOnlyExample", { modifiers: mainModifier })
                });
            }
        },
        [isRecording, isMac, mainModifier, t]
    );

    useEffect(() => {
        if (!isRecording) return;

        document.addEventListener("keydown", handleShortcutRecord, true);
        return () => {
            document.removeEventListener("keydown", handleShortcutRecord, true);
        };
    }, [isRecording, handleShortcutRecord]);

    const handleAssignShortcut = async () => {
        if (!selectedCommand || !newShortcut || !canAssign) return;

        // Clear previous messages
        setConflict(null);
        setIsReservedShortcut(false);
        setReservedReason(null);
        setSuccessMessage(null);
        setErrorMessage(null);
        setValidationMessage(null);

        try {
            const result = await keyboardAPI.setShortcut(
                selectedCommand.menuItemId,
                newShortcut
            );

            if (result.success) {
                // Show success message
                setSuccessMessage(t("keyboardShortcuts.successMessage"));
                // Reload shortcuts to get updated data
                await loadShortcuts();

                // Update the displayed shortcut
                if (selectedCommand) {
                    setSelectedCommand({
                        ...selectedCommand,
                        shortcut: newShortcut,
                        isCustom: true,
                    });
                }

                // Auto-hide success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);
            } else if (result.isReserved) {
                // Show reserved shortcut message with specific reason
                setIsReservedShortcut(true);
                setReservedReason(result.reservedReason || null);
                console.warn(
                    `Reserved shortcut: ${newShortcut} is reserved (reason: ${result.reservedReason || 'unknown'})`
                );
            } else if (result.conflict) {
                // Show detailed conflict message
                setConflict(result.conflict);
                console.warn(
                    `Shortcut conflict: ${newShortcut} is already assigned to ${result.conflict}`
                );
            } else {
                // Generic failure without conflict
                setErrorMessage(t("keyboardShortcuts.errorMessage"));
                console.error("Failed to assign shortcut: Unknown reason");
            }
        } catch (error) {
            // Handle unexpected errors
            console.error("Failed to assign shortcut:", error);
            const errorMsg = error instanceof Error ? error.message : "Unknown error";
            setErrorMessage(t("keyboardShortcuts.errorUnknown"));
            console.error("Shortcut assignment error details:", errorMsg);
        }
    };

    const handleResetAll = async () => {
        if (globalThis.confirm(t("keyboardShortcuts.resetConfirmation"))) {
            try {
                await keyboardAPI.resetAll();
                await loadShortcuts();
                setSelectedCommand(null);
                setNewShortcut("");
                setConflict(null);
                setIsReservedShortcut(false);
                setValidationMessage(null);
            } catch (error) {
                console.error("Failed to reset shortcuts:", error);
            }
        }
    };

    const startRecording = () => {
        if (!selectedCommand) return;
        setIsRecording(true);
        setNewShortcut("");
        setConflict(null);
        setIsReservedShortcut(false);
        setSuccessMessage(null);
        setErrorMessage(null);
        setValidationMessage(null);
    };

    const handleCancelRecording = () => {
        setIsRecording(false);
        setNewShortcut(selectedCommand?.shortcut ?? "");
        setConflict(null);
        setIsReservedShortcut(false);
        setSuccessMessage(null);
        setErrorMessage(null);
        setValidationMessage(null);
    };

    const currentCategory = visibleCategories.find(
        (cat) => cat.name === selectedCategory
    );
    const canAssign =
        newShortcut &&
        selectedCommand &&
        newShortcut !== selectedCommand.shortcut &&
        !selectedCommand.locked &&
        !conflict &&
        !isReservedShortcut;

    return (
        <div className="fixed inset-0 flex flex-col bg-grey-95 dark:bg-grey-10">
            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex">
                {/* Categories Panel */}
                <div className="w-1/5 border-r border-grey-85 dark:border-grey-40 flex flex-col">
                    <div className="px-4 py-2.5 border-b border-grey-85 dark:border-grey-40">
                        <Label className="text-sm font-semibold text-grey-100 dark:text-grey-95">
                            {t("keyboardShortcuts.categories")}
                        </Label>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="py-1">
                            {visibleCategories.map((category) => (
                                <button
                                    key={category.name}
                                    onClick={() => handleCategorySelect(category.name)}
                                    className={cn(
                                        "w-full rounded text-left px-4 py-1.5 text-sm transition-colors flex items-center justify-between group",
                                        selectedCategory === category.name
                                            ? "bg-primary text-primary-foreground"
                                            : "text-grey-100 dark:text-grey-90 hover:bg-grey-90 dark:hover:bg-grey-30"
                                    )}
                                >
                                    <span className="flex-1 truncate text-sm">
                                        {t(category.label)}
                                    </span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Commands Panel */}
                <div className="w-2/5 border-r border-grey-85 dark:border-grey-40 flex flex-col">
                    <div className="px-4 py-2.5 border-b border-grey-85 dark:border-grey-40">
                        <Label className="text-sm font-semibold text-grey-100 dark:text-grey-95">
                            {t("keyboardShortcuts.commands")}
                        </Label>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="py-1">
                            {currentCategory?.commands.map((command) => (
                                <button
                                    key={command.menuItemId}
                                    onClick={() => handleCommandSelect(command)}
                                    className={cn(
                                        "w-full rounded text-left px-4 py-1.5 text-sm transition-colors flex items-center justify-between gap-3",
                                        selectedCommand?.menuItemId === command.menuItemId
                                            ? "bg-primary text-primary-foreground"
                                            : "text-grey-100 dark:text-grey-90 hover:bg-grey-90 dark:hover:bg-grey-30"
                                    )}
                                >
                                    <div className="flex items-start flex-1">
                                        {command.firstParentLabel.trim() !== "" && (
                                            <span
                                                className={cn(
                                                    "text-xs font-mono mr-2 font-bold",
                                                    selectedCommand?.menuItemId === command.menuItemId
                                                        ? "text-primary-foreground/70"
                                                        : "text-grey-60 dark:text-grey-70"
                                                )}
                                            >
                                                {t(command.firstParentLabel) + " >"}
                                            </span>
                                        )}
                                        {command.secondParentLabel.trim() !== "" && (
                                            <span
                                                className={cn(
                                                    "text-xs font-mono mr-2 font-bold",
                                                    selectedCommand?.menuItemId === command.menuItemId
                                                        ? "text-primary-foreground/70"
                                                        : "text-grey-60 dark:text-grey-70"
                                                )}
                                            >
                                                {t(command.secondParentLabel) + " >"}
                                            </span>
                                        )}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="flex-1 truncate text-sm">
                                                        {command.label
                                                            ? t(command.label)
                                                            : command.menuItemId}
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        {command.label
                                                            ? t(command.label)
                                                            : command.menuItemId}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Shortcut Details Panel */}
                <div className="w-2/5 flex flex-col">
                    <div className="px-4 py-2.5 border-b border-grey-85 dark:border-grey-40">
                        <Label className="text-sm font-semibold text-grey-100 dark:text-grey-95">
                            {t("keyboardShortcuts.keyboardShortcut")}
                        </Label>
                    </div>

                    {selectedCommand ? (
                        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
                            <div>
                                <Label className="text-xs font-medium text-grey-40 dark:text-grey-60 mb-1.5 block">
                                    {t("keyboardShortcuts.defaultShortcut")}
                                </Label>
                                {selectedCommand.shortcut.trim() ? <div className="px-3 py-2 bg-white dark:bg-grey-20 border border-grey-85 dark:border-grey-40 rounded text-sm font-mono text-grey-100 dark:text-grey-95">
                                    {formatShortcutForDisplay(selectedCommand.shortcut)}
                                </div> :
                                    <div className="p-3 bg-white dark:bg-grey-20 border border-grey-85 dark:border-grey-40 rounded text-xs font-mono text-grey-60 dark:text-grey-60 font-thin italic">
                                        {t("keyboardShortcuts.missingShortcut")}
                                    </div>}
                            </div>

                            <div>
                                <Label className="text-xs font-medium text-grey-40 dark:text-grey-60 mb-1.5 block">
                                    {t("keyboardShortcuts.newShortcut")}
                                </Label>
                                <input
                                    type="text"
                                    readOnly
                                    value={
                                        isRecording ? t("keyboardShortcuts.pressKeys") : formatShortcutForDisplay(newShortcut)
                                    }
                                    onClick={startRecording}
                                    placeholder={t("keyboardShortcuts.placeholder")}
                                    className="w-full px-3 py-2 bg-white dark:bg-grey-20 border border-grey-85 dark:border-grey-40 rounded text-sm font-mono text-grey-100 dark:text-grey-95 placeholder:text-grey-60 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <p className="mt-1.5 text-xs text-grey-60 dark:text-grey-70">
                                    {getHelpText()}
                                </p>
                            </div>

                            {/* Validation Message */}
                            {validationMessage && (
                                <div className={cn(
                                    "px-3 py-2 text-xs rounded border",
                                    validationMessage.type === 'success' && "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30",
                                    validationMessage.type === 'warning' && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
                                    validationMessage.type === 'info' && "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
                                )}>
                                    <p className="font-medium">{validationMessage.message}</p>
                                    {validationMessage.example && (
                                        <p className="mt-1 opacity-80 font-mono text-[11px]">{validationMessage.example}</p>
                                    )}
                                </div>
                            )}

                            {/* Success Message */}
                            {successMessage && (
                                <div className="px-3 py-2 bg-green-500/10 text-green-700 dark:text-green-400 text-xs rounded border border-green-500/30">
                                    {successMessage}
                                </div>
                            )}

                            {/* Reserved Shortcut Warning - with specific reason */}
                            {isReservedShortcut && (
                                <div className="px-3 py-2 bg-destructive/10 text-destructive text-xs rounded border border-destructive/30">
                                    {reservedReason === 'devtools' 
                                        ? t("keyboardShortcuts.reservedDevTools")
                                        : reservedReason === 'os'
                                        ? t("keyboardShortcuts.reservedOS")
                                        : reservedReason === 'macOptionSpecialChar'
                                        ? t("keyboardShortcuts.reservedMacOption")
                                        : t("keyboardShortcuts.reservedShortcut")}
                                </div>
                            )}

                            {/* Conflict Warning */}
                            {conflict && (
                                <div className="px-3 py-2 bg-destructive/10 text-destructive text-xs rounded border border-destructive/30">
                                    {t("keyboardShortcuts.conflictMessage", { conflict: t(conflict) })}
                                </div>
                            )}

                            {/* Error Message */}
                            {errorMessage && (
                                <div className="px-3 py-2 bg-destructive/10 text-destructive text-xs rounded border border-destructive/30">
                                    {errorMessage}
                                </div>
                            )}

                            <Button
                                onClick={handleAssignShortcut}
                                disabled={!canAssign}
                                size="small"
                                className="w-24 h-7 items-center justify-center"
                                intent="secondary"
                                variant="tonal"
                            >
                                {t("keyboardShortcuts.assign")}
                            </Button>
                            {(isRecording ||
                                (selectedCommand &&
                                    newShortcut !== selectedCommand.shortcut)) && (
                                    <Button
                                        onClick={handleCancelRecording}
                                        size="small"
                                        className="mx-2 w-24 h-7 items-center justify-center"
                                        intent="secondary"
                                        variant="outline"
                                    >
                                        {t("buttons.cancel")}
                                    </Button>
                                )}
                            <Separator className="my-4" />

                            <div>
                                <Label className="text-xs font-medium text-grey-40 dark:text-grey-60 mb-1.5 block">
                                    {t("keyboardShortcuts.description")}
                                </Label>
                                <p className="text-sm text-grey-100 dark:text-grey-95">
                                    {t(selectedCommand.description)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-grey-60 dark:text-grey-50 text-sm px-4">
                            {t("keyboardShortcuts.selectCommand")}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex h-14 items-center gap-2 border-t bg-background px-3 z-50 bg-grey-90 dark:bg-grey-20 border-grey-85 dark:border-grey-40">
                <div className="flex items-end justify-end gap-2 w-full">
                    <Button
                        onClick={handleResetAll}
                        className="w-24 items-center justify-center"
                        size="mini"
                        intent={"secondary"}
                        variant={"tonal"}
                    >
                        {t("buttons.resetAll")}
                    </Button>
                    <Button
                        onClick={() => globalThis.application.closeChildWindow()}
                        className="w-24 items-center justify-center"
                        size="mini"
                        intent={"primary"}
                    >
                        {t("buttons.ok")}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function KeyboardShortcutsApp() {
    return (
        <ThemeProvider>
            <KeyboardShortcutsWindowView />
        </ThemeProvider>
    );
}

export default KeyboardShortcutsApp;
