import AppButton from "@/components/app/app-button";
import { useCallback, useEffect, useMemo, useState } from "react";
import Combobox from "@/components/combobox";
import IconSearch from "@/components/app/icons/IconSearch";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import MultiSelectDropdown from "../pages/editor/dialogs/findAndReplace/multiselect-dropdown-checkbox";
import AppSeparator from "@/components/app/app-separator";
import IconLeft_1 from "@/components/app/icons/IconLeft_1";
import IconRight_1 from "@/components/app/icons/IconRight_1";
import { debounce } from "lodash-es";
import { apparatusTypeTranslationKey, FIND_WHOLE_DOC } from "@/utils/constants";

const FindAndReplace = () => {
    const MAX_FIND_LENGTH = 255;

    const [findInputValue, setFindInputValue] = useState<string>("");
    const [findInputError, setFindInputError] = useState<string>("");
    const [replaceInputValue, setReplaceInputValue] = useState<string>("");
    const [replaceInputError, setReplaceInputError] = useState<string>("");
    const [replaceHistory, setReplaceHistory] = useState<string[]>([]);
    const [documentCriteria, setDocumentCriteria] = useState<DocumentCriteria[]>([FIND_WHOLE_DOC])
    const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
    const [wholeWords, setWholeWords] = useState<boolean>(false);
    const [apparatuses, setApparatuses] = useState<DocumentApparatus[]>([]);
    const [totalMatches, setTotalMatches] = useState<number>(0);
    const [currentMatch, setCurrentMatch] = useState<number>(1);
    const [isReplaceDisabled, setIsReplaceDisabled] = useState<boolean>(false);
    const [isReplacing, setIsReplacing] = useState<boolean>(false);
    const [findHistory, setFindHistory] = useState<string[]>([]);
    const { t } = useTranslation();

    const debouncedSetSearchCriteria = useMemo(
        () =>
            debounce(() => {
                window.doc.setSearchCriteria({
                    caseSensitive,
                    documentCriteria,
                    searchTerm: findInputValue,
                    wholeWords
                });
            }, 500),
        [caseSensitive, documentCriteria, wholeWords, findInputValue]
    );

    // Notify main process when component is mounted and ready to show
    useEffect(() => {
        window.electron.ipcRenderer.send('child-window-ready');
    }, []);

    // call and cleanup debounced functions
    useEffect(() => {
        debouncedSetSearchCriteria();
        return () => {
            debouncedSetSearchCriteria.cancel();
        };
    }, [debouncedSetSearchCriteria]);

    const onReplaceClick = useCallback(() => {
        if (!replaceHistory.includes(replaceInputValue)) {
            setReplaceHistory((prev) => {
                if (prev.length < 10) {
                    return [...prev, replaceInputValue];
                }
                prev.shift();
                return [...prev, replaceInputValue];
            });
        }
        window.doc.replace(replaceInputValue);
    }, [replaceInputValue]);

    const onReplaceAllClick = useCallback(() => {
        if (!replaceHistory.includes(replaceInputValue)) {
            setReplaceHistory((prev) => {
                if (prev.length < 10) {
                    return [...prev, replaceInputValue];
                }
                prev.shift();
                return [...prev, replaceInputValue];
            });
        }
        window.doc.replaceAll(replaceInputValue);
    }, [replaceInputValue]);

    useEffect(() => {
        const unsubscribeSearchHistoryListener = window.electron.ipcRenderer.on('search-history', (_, data) => {
            setFindHistory(data);
        });

        const unsubscribeReplaceHistoryListener = window.electron.ipcRenderer.on('replace-history', (_, data) => {
            setReplaceHistory(data);
        });

        const unsubscribeDisableReplaceActionListener = window.electron.ipcRenderer.on('set-disable-replace-action', (_, isDisable: boolean) => {
            setIsReplaceDisabled(isDisable);
        });

        const unsubscribeSendCurrentIndex = window.electron.ipcRenderer.on('current-search-index', (_, index: number) => {
            setCurrentMatch(index + 1);
        });

        const unsubscribeSendTotalSearchResults = window.electron.ipcRenderer.on('total-search-results', (_, total: number) => {
            setTotalMatches(total);
        });

        const unsubscribeSendReplaceInProgress = window.electron.ipcRenderer.on('replace-in-progress', (_, isInProgress: boolean) => {
            setIsReplacing(isInProgress);
        })

        return () => {
            unsubscribeSearchHistoryListener();
            unsubscribeReplaceHistoryListener();
            unsubscribeDisableReplaceActionListener();
            unsubscribeSendCurrentIndex();
            unsubscribeSendTotalSearchResults();
            unsubscribeSendReplaceInProgress();
        }
    }, [window.electron]);

    const handleInputChange = useCallback(
        (value: string) => {
            const nextValue = value ?? "";

            if (nextValue.length > MAX_FIND_LENGTH) {
                setFindInputValue(nextValue.slice(0, MAX_FIND_LENGTH));
                setFindInputError(t("findAndReplace.maxChars", { max: MAX_FIND_LENGTH }));
                return;
            }

            setFindInputValue(nextValue);
            setFindInputError("");
        },
        [MAX_FIND_LENGTH, t]
    );

    const handleReplaceChange = useCallback(
        (value: string) => {
            const nextValue = value ?? "";

            if (nextValue.length > MAX_FIND_LENGTH) {
                setReplaceInputValue(nextValue.slice(0, MAX_FIND_LENGTH));
                setReplaceInputError(t("findAndReplace.maxChars", { max: MAX_FIND_LENGTH }));
                return;
            }

            setReplaceInputValue(nextValue);
            setReplaceInputError("");
        },
        [MAX_FIND_LENGTH, t]
    );

    const handleCaseSensitiveChecked = useCallback((checked: boolean) => {
        setCaseSensitive(checked);
    }, []);

    const handleWholeWordsChecked = useCallback((checked: boolean) => {
        setWholeWords(checked);
    }, []);

    const findNext = useCallback(() => {
        if (!findHistory.includes(findInputValue)) {
            setFindHistory((prev) => {
                if (prev.length < 10) {
                    return [...prev, findInputValue];
                }
                prev.shift();
                return [...prev, findInputValue];
            });
        }
        window.doc.findNext();
    }, []);

    const findPrevious = useCallback(() => {
        if (!findHistory.includes(findInputValue)) {
            setFindHistory((prev) => {
                if (prev.length < 10) {
                    return [...prev, findInputValue];
                }
                prev.shift();
                return [...prev, findInputValue];
            });
        }
        window.doc.findPrevious();
    }, []);

    const apparatusList = async () => {
        const apparatusesDocument = await window.doc.getApparatuses() as DocumentApparatus[]
        setApparatuses(apparatusesDocument);
    }

    useEffect(() => {
        apparatusList();
    }, []);

    const optionsSelect = useMemo(() => [
        { label: "All document", value: "wholeDoc" },
        { label: "Text", value: "text" },
        ...apparatuses.map((item) => ({ label: `${item.title} (${t(apparatusTypeTranslationKey[item.type])})`, value: item.id })),
    ], [apparatuses, t])

    const toggleValue = (value: string[]) => {
        setDocumentCriteria(value as DocumentCriteria[]);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="flex flex-col gap-4 py-4 px-7 w-full" >
                    <div className="flex flex-row justify-between gap-2 w-full" >
                        <div className="w-2/3">
                            <div className="flex flex-col gap-1">
                                <Combobox
                                    leftIcon={<IconSearch className="h-5 w-5 text-muted-foreground" />}
                                    selectOptions={findHistory}
                                    totalWWordFound={totalMatches}
                                    wordNumber={currentMatch}
                                    setInput={handleInputChange}
                                    input={findInputValue}
                                    placeholder={t("findAndReplace.find")}
                                    triggerSearch={debouncedSetSearchCriteria}
                                />
                                <div className="min-h-4 text-xs leading-4 text-destructive" aria-live="polite">
                                    {findInputError}
                                </div>
                            </div>
                        </div>
                        <div className="w-1/3">
                            <MultiSelectDropdown selected={documentCriteria} toggleValue={toggleValue} options={optionsSelect} placeholder={t("findAndReplace.searchCriteria")} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4" >
                        <div className="flex flex-col gap-1">
                            <Combobox
                                leftIcon={<IconSearch className="h-5 w-5 text-muted-foreground" />}
                                selectOptions={replaceHistory}
                                setInput={handleReplaceChange}
                                input={replaceInputValue}
                                placeholder={t("findAndReplace.replace")}
                                dropdownContainerClassNames="max-h-[50vh]"
                            />
                            <div className="min-h-4 text-xs leading-4 text-destructive" aria-live="polite">
                                {replaceInputError}
                            </div>
                        </div>
                        <div className="flex flex-row gap-4" >
                            <Checkbox
                                label={t("findAndReplace.caseSensitive")}
                                checked={caseSensitive}
                                className="w-6 h-6 "
                                labelClassName="text-[13px] leading-[15px] w-[124px]"
                                onCheckedChange={handleCaseSensitiveChecked}
                            />
                            <Checkbox
                                label={t("findAndReplace.wholeWords")}
                                checked={wholeWords}
                                className="w-6 h-6"
                                labelClassName="text-[13px] leading-[15px] w-[124px]"
                                onCheckedChange={handleWholeWordsChecked}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <AppSeparator orientation="horizontal" />

            <div className="flex flex-row justify-between gap-6 p-6" >
                <div className="flex flex-row gap-2" >
                    <AppButton
                        className="px-2 py-1 h-6"
                        variant="secondary"
                        size="compact"
                        onClick={onReplaceClick}
                        disabled={isReplaceDisabled || !replaceInputValue || isReplacing || totalMatches <= 0 || !!findInputError || !!replaceInputError}
                    >
                        {t("findAndReplace.replace")}
                    </AppButton>
                    < AppButton
                        className="px-2 py-1 h-6"
                        variant="secondary"
                        size="compact"
                        onClick={onReplaceAllClick}
                        disabled={!replaceInputValue || isReplacing || totalMatches <= 0 || !!findInputError || !!replaceInputError}
                    >
                        {t("findAndReplace.replaceAll")}
                    </AppButton>
                </div>
                < div className="flex flex-row gap-2" >
                    <AppButton
                        className="px-2 py-1 h-6 gap-0"
                        variant="secondary"
                        size="compact"
                        onClick={findPrevious}
                        disabled={!findInputValue || totalMatches <= 0 || !!findInputError || !!replaceInputError}
                    >
                        <IconLeft_1 />
                        {t("findAndReplace.previous")}
                    </AppButton>
                    <AppButton
                        className="px-2 py-1 h-6 gap-0"
                        variant="secondary"
                        size="compact"
                        onClick={findNext}
                        disabled={!findInputValue || totalMatches <= 0 || !!findInputError || !!replaceInputError}
                    >
                        {t("findAndReplace.next")}
                        <IconRight_1 />
                    </AppButton>
                </div>
            </div>

        </div>
    );
}

export default FindAndReplace;