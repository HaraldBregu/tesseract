import { ChangeEvent, useCallback, useEffect, useState, useMemo, ReactElement } from 'react';
import Modal from '@/components/ui/modal';
import Button from '@/components/ui/button';
import { useTranslation } from "react-i18next"
import TextField from '@/components/ui/textField';
import { numberToListFormat, listFormatToNumber } from '@/lib/utils/number-format-converters';

const MAX_NUMBER_VALUE = 9999;
const MIN_NUMBER_VALUE = 1;
const DEFAULT_LIST_TYPE: OrderedListType = '1';

interface ResumeNumberingModalProps {
    isOpen: boolean;
    initialValue?: { number: number; listType: OrderedListType } | null;
    onCancel: () => void;
    onApply: (numberBullet: number) => void;
}

interface ValidationResult {
    isValid: boolean;
    formattedValue: string | null;
    errorMessage: string | null;
}

interface ListTypeInfo {
    listTypeDescription: string;
    placeholder: string;
}

interface ValidationFeedbackProps {
    isValid: boolean;
    inputValue: string;
    formattedValue: string | null;
    errorMessage: string | null;
}

function useNumberValidation(inputValue: string, listType: OrderedListType): ValidationResult {
    const { t } = useTranslation();

    return useMemo(() => {
        if (inputValue === '') {
            return {
                isValid: false,
                formattedValue: numberToListFormat(MIN_NUMBER_VALUE, listType),
                errorMessage: null
            };
        }

        const numValue = listFormatToNumber(inputValue, listType);

        if (numValue > 0 && numValue <= MAX_NUMBER_VALUE) {
            return {
                isValid: true,
                formattedValue: numberToListFormat(numValue, listType),
                errorMessage: null
            };
        }

        if (numValue > MAX_NUMBER_VALUE) {
            return {
                isValid: false,
                formattedValue: null,
                errorMessage: t('resumeNumbering.error.tooLarge', `Value too large (max ${MAX_NUMBER_VALUE})`)
            };
        }

        return {
            isValid: false,
            formattedValue: null,
            errorMessage: t('resumeNumbering.error.invalid', 'Invalid format')
        };
    }, [inputValue, listType, t]);
}

function useListTypeInfo(listType: OrderedListType): ListTypeInfo {
    const { t } = useTranslation();

    return useMemo(() => {
        const listTypeMap: Record<OrderedListType, ListTypeInfo> = {
            'a': {
                listTypeDescription: t('resumeNumbering.listType.lowerAlpha', 'lowercase letters (a, b, c...)'),
                placeholder: 'a, b, c... or 1, 2, 3...'
            },
            'A': {
                listTypeDescription: t('resumeNumbering.listType.upperAlpha', 'uppercase letters (A, B, C...)'),
                placeholder: 'A, B, C... or 1, 2, 3...'
            },
            'i': {
                listTypeDescription: t('resumeNumbering.listType.lowerRoman', 'lowercase roman (i, ii, iii...)'),
                placeholder: 'i, ii, iii... or 1, 2, 3...'
            },
            'I': {
                listTypeDescription: t('resumeNumbering.listType.upperRoman', 'uppercase roman (I, II, III...)'),
                placeholder: 'I, II, III... or 1, 2, 3...'
            },
            '1': {
                listTypeDescription: t('resumeNumbering.listType.decimal', 'numbers (1, 2, 3...)'),
                placeholder: '1, 2, 3...'
            }
        };

        return listTypeMap[listType] || listTypeMap['1'];
    }, [listType, t]);
}

function ValidationFeedback({ isValid, inputValue, formattedValue, errorMessage }: ValidationFeedbackProps): ReactElement | null {
    const { t } = useTranslation();

    if (errorMessage && inputValue !== '') {
        return (
            <div className="text-xs text-red-500 px-2 flex items-center gap-1">
                <span className="text-red-500">✗</span>
                <span>{errorMessage}</span>
            </div>
        );
    }

    if (isValid && formattedValue && inputValue !== formattedValue) {
        return (
            <div className="text-xs text-muted-foreground px-2 flex items-center gap-1">
                <span>{t('resumeNumbering.preview', 'Preview')}:</span>
                <span className="font-semibold text-green-600">{formattedValue}</span>
                <span className="text-green-600">✓</span>
            </div>
        );
    }

    if (isValid && inputValue === formattedValue && inputValue !== '') {
        return (
            <div className="text-xs text-green-600 px-2 flex items-center gap-1">
                <span>✓</span>
                <span>{t('resumeNumbering.valid', 'Valid format')}</span>
            </div>
        );
    }

    return null;
}

function ResumeNumberingModal({ isOpen, initialValue, onCancel, onApply }: ResumeNumberingModalProps): ReactElement {
    const { t } = useTranslation();

    const [numberBullet, setNumberBullet] = useState<number>(MIN_NUMBER_VALUE);
    const [listType, setListType] = useState<OrderedListType>(DEFAULT_LIST_TYPE);
    const [inputValue, setInputValue] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            const number = initialValue?.number || MIN_NUMBER_VALUE;
            const type = initialValue?.listType || DEFAULT_LIST_TYPE;

            setNumberBullet(number);
            setListType(type);
            setInputValue(numberToListFormat(number, type));
        }
    }, [isOpen, initialValue]);

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setInputValue(value);

        if (value === '') {
            return;
        }

        const numValue = listFormatToNumber(value, listType);
        if (numValue > 0) {
            setNumberBullet(numValue);
        }
    }, [listType]);

    const handleApply = useCallback(() => {
        onApply(numberBullet);
    }, [numberBullet, onApply]);

    const { isValid, formattedValue, errorMessage } = useNumberValidation(inputValue, listType);
    const { listTypeDescription, placeholder } = useListTypeInfo(listType);

    const canApply = useMemo(() => {
        return isValid && numberBullet >= MIN_NUMBER_VALUE && numberBullet <= MAX_NUMBER_VALUE;
    }, [isValid, numberBullet]);

    const inputClassName = useMemo(() => {
        return !isValid && inputValue !== '' ? 'border-red-500' : '';
    }, [isValid, inputValue]);

    return (
        <Modal
            key="resume-numbering-modal"
            isOpen={isOpen}
            onOpenChange={onCancel}
            onClose={onCancel}
            title={t('resumeNumbering.title')}
            className="w-[240px] gap-0"
            contentClassName="flex flex-col gap-8"
            footerClassName='h-[auto] pt-4 pb-4 border-none'
            showCloseIcon={true}
            titleClassName='text-left'
            actions={[
                <Button
                    key="cancel"
                    className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-24"
                    size="mini"
                    intent="secondary"
                    variant="tonal"
                    onClick={onCancel}
                >
                    {t('buttons.cancel')}
                </Button>,
                <Button
                    key="save"
                    className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-24"
                    size="mini"
                    intent="primary"
                    onClick={handleApply}
                    disabled={!canApply}
                >
                    {t('buttons.apply')}
                </Button>
            ]}
        >
            <div className="grid grid-cols-1 gap-4 w-full">
                <div className="flex flex-col gap-2">
                    <TextField
                        id="resume-numbering-value"
                        type="text"
                        label={t('resumeNumbering.label')}
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        className={inputClassName}
                    />

                    <div className="text-xs text-muted-foreground px-2">
                        {t('resumeNumbering.listTypeInfo', 'List type')}: {listTypeDescription}
                    </div>

                    <ValidationFeedback
                        isValid={isValid}
                        inputValue={inputValue}
                        formattedValue={formattedValue}
                        errorMessage={errorMessage}
                    />
                </div>
            </div>
        </Modal>
    );
}

export default ResumeNumberingModal;