import { ReactNode, forwardRef } from 'react';
import { useTheme } from '../hooks/use-theme';

export interface SvgIconProps {
    children: ReactNode;
    color?: string;
    inheritColor?: boolean;
    className?: string;
    size?: string | number;
    intent?: 'primary' | 'secondary' | 'destructive';
    variant?: 'filled' | 'outline' | 'tonal';
    disabled?: boolean;
    viewBox?: string;
    [key: string]: any;
}

export const calculateIconColor = ({
    color,
    inheritColor,
    intent = 'primary',
    variant = 'filled',
    disabled = false,
    isDark = false,
}: Omit<SvgIconProps, 'children'> & { isDark?: boolean }): string => {
    let fillColor = isDark ? "#FFFFFF" : "#001450";

    if (disabled) {
        fillColor = isDark ? "var(--color-grey-40, #6B7280)" : "var(--color-grey-60, #A3A3A3)";
    } else if (color) {
        fillColor = color;
    } else if (inheritColor) {
        fillColor = "currentColor";
    } else if (intent && variant) {
        if (variant === 'filled') {
            switch (intent) {
                case 'primary':
                    fillColor = "var(--color-primary-foreground, white)";
                    break;
                case 'secondary':
                    fillColor = "var(--color-secondary-foreground, white)";
                    break;
                case 'destructive':
                    fillColor = "var(--color-destructive-foreground, white)";
                    break;
            }
        } else if (variant === 'outline' || variant === 'tonal') {
            switch (intent) {
                case 'primary':
                    fillColor = isDark
                        ? "var(--color-primary-dark, #D9E2FF)"
                        : "var(--color-primary, #001450)";
                    break;
                case 'secondary':
                    fillColor = isDark
                        ? "var(--color-secondary-dark, #E1EAF3)"
                        : "var(--color-secondary, #1A2835)";
                    break;
                case 'destructive':
                    fillColor = isDark
                        ? "var(--color-destructive-dark, #EDADB8)"
                        : "var(--color-destructive, #CC334D)";
                    break;
            }
        }
    }

    return fillColor;
};

export const normalizeSize = (size: string | number = "24px"): string | number => {
    if (size === "small") {
        return "18px";
    } else if (typeof size === "number") {
        return `${size}px`;
    }

    return size;
};

const SvgIcon = forwardRef<SVGSVGElement, SvgIconProps>(({
    mode = undefined,
    children,
    color,
    inheritColor = false,
    className = "",
    size = "24px",
    intent = "secondary",
    variant = "tonal",
    disabled = false,
    viewBox = "0 0 24 24",
    ...restProps
}, ref) => {
    const { isDark } = useTheme();

    const fillColor = calculateIconColor({
        color, inheritColor, intent, variant, disabled, isDark
    });

    const _size = normalizeSize(size);

    return (
        <svg
            fill={fillColor}
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width={_size}
            height={_size}
            viewBox={viewBox}
            ref={ref}
            {...restProps}
        >
            {children}
        </svg>
    );
});

SvgIcon.displayName = 'SvgIcon';

export default SvgIcon;