import { useState, ReactNode, FC, ChangeEvent } from "react";
import { textFormatColors } from "@utils/optionsEnums";
import { useTranslation } from "react-i18next";
import cn from "@/utils/classNames";
import Typography from '@components/Typography';
import ButtonPopover from "./button-popover";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import AppButton from "./app/app-button";

interface FormatTextColorProps {
    onSelect?: (color: string) => void;
    initColor: string;
    icon: ReactNode;
    handleClick: () => void;
    tabIndex?: number;
    ariaLabel?: string;
    tooltip?: string;
    disabled?: boolean;
}

const ButtonColor: FC<FormatTextColorProps> = ({
    tabIndex = 0,
    ariaLabel = 'Text Color',
    onSelect,
    initColor,
    icon,
    disabled = false
}) => {
    const { t } = useTranslation();
    const [curColor, setCurColor] = useState<string | undefined>(initColor);
    const [open, setOpen] = useState(false);

    const popoverClass = cn('flex', 'flex-col', 'p-1');
    const gridTemplateClass = cn('grid', 'grid-cols-8', 'gap-1', 'p-1', 'gap-[8px]');
    const differentColorClass = cn('flex', 'justify-between', 'items-center', 'p-1');
    const colorClass = (color: string): string =>
        cn(
            'border rounded-1 aspect-square',
            {
                ['border-2 border-black']: curColor === color,
                ['border-gray-300']: curColor !== color
            }
        );

    const handleClose = (): void => {
        onSelect?.(curColor || initColor);
        setOpen(false);
    };

    return (
        <ButtonPopover
            open={open}
            onOpenChange={setOpen}
            btnFace={icon}
            closeHdlr={handleClose}
            clickHdlr={() => setOpen(!open)}
            disabled={disabled}
        >
            <>
                <div className={popoverClass}>
                    <div className={gridTemplateClass}>
                        {textFormatColors.map((color) => (
                            <AppButton
                                key={color}
                                variant="default"
                                size="icon"
                                tabIndex={tabIndex}
                                aria-label={ariaLabel}
                                className={colorClass(color)}
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                    setCurColor(color);
                                    onSelect?.(color);
                                    setOpen(false);
                                }}
                            />
                            //     key={color}
                            //     variant="tonal"
                            //     size="iconSm"
                            //     tabIndex={tabIndex}
                            //     aria-label={ariaLabel}
                            //     className={colorClass(color)}
                            //     style={{ backgroundColor: color }}
                            //     onClick={() => {
                            //         setCurColor(color);
                            //         onSelect?.(color);
                            //         setOpen(false);
                            //     }}
                            // />
                        ))}
                    </div>
                    <div className={differentColorClass}>
                        <Typography component="h6" className="font-normal">
                            {t('editor.color.differentColor')}
                        </Typography>

                        <input
                            type="color"
                            value={curColor || initColor}
                            onChange={({ target }: ChangeEvent<HTMLInputElement>) => {
                                setCurColor(target.value);
                            }}
                        />
                    </div>
                </div>
                <div className="flex items-start gap-3 p-1">
                    <Checkbox
                        id="no-color-checkbox"
                        defaultChecked={!curColor}
                        checked={!curColor}
                        onCheckedChange={(value) => {
                            const newValue = value ? undefined : initColor;
                            setCurColor(newValue);
                            onSelect?.(newValue ?? initColor);
                            setOpen(false);
                        }}
                    />
                    <div className="grid gap-2">
                        <Label htmlFor="no-color-checkbox">
                            {t('editor.color.noColor')}
                        </Label>
                    </div>
                </div>
            </>
        </ButtonPopover>
    );
};

export default ButtonColor;
