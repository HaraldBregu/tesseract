import { useState, MouseEvent, ReactNode, FC } from "react";
import cn from "@/utils/classNames";
import Button from "@components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import * as React from "react";

interface ButtonPopoverProps {
    btnFace: ReactNode;
    children: ReactNode;
    closeHdlr: () => void;
    clickHdlr: (e: MouseEvent<HTMLButtonElement>) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
}

// Helper function to clone React elements and add disabled prop
const cloneElementWithDisabled = (element: ReactNode, disabled: boolean): ReactNode => {
    if (React.isValidElement<{ disabled?: boolean }>(element)) {
        return React.cloneElement(element, {
            ...(typeof element.props === 'object' && element.props !== null ? element.props : {}),
            disabled,
        });
    }
    return element;
};

const ButtonPopover: FC<ButtonPopoverProps> = ({
    btnFace,
    children,
    closeHdlr,
    clickHdlr,
    open,
    onOpenChange,
    disabled = false,
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const popoverOpen = isControlled ? open : Boolean(anchorEl);

    const handleClick = (e: MouseEvent<HTMLButtonElement>): void => {
        if (!isControlled) {
            setAnchorEl(e.currentTarget);
        }
        clickHdlr(e);
        onOpenChange?.(!popoverOpen);
    };

    const btnClass = cn(
        'flex',
        'flex-col',
        'items-center',
        'border-none',
        'bg-none',
        'cursor-pointer',
        'p-0',
        'leading-none'
    );

    const handleOpenChange = (nextOpen: boolean): void => {
        if (!isControlled && !nextOpen) {
            setAnchorEl(null);
        }
        if (!nextOpen) {
            closeHdlr();
        }
        onOpenChange?.(nextOpen);
    };

    return (
        <Popover open={popoverOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                {/* <AppButton
                    onClick={handleClick}
                    className={btnClass}
                    variant="toolbar"
                    size="icon"
                    rounded="sm"
                    disabled={disabled}
                >
                    {cloneElementWithDisabled(btnFace, disabled)}
                </AppButton> */}
                <Button
                    onClick={handleClick}
                    className={btnClass}
                    variant="icon"
                    size="iconSm"
                    intent="secondary"
                    disabled={disabled}>
                    {cloneElementWithDisabled(btnFace, disabled)}
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                {children}
            </PopoverContent>
        </Popover>
    );
};

export default ButtonPopover;
