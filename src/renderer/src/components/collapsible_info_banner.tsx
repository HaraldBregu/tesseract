import { useState, ReactNode } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

type InfoBannerVariant = "info" | "warning" | "success" | "error";

interface CollapsibleInfoBannerProps {
    /** The icon to display in the banner */
    icon: ReactNode;
    /** The title text of the banner */
    title: string;
    /** The description text of the banner */
    description: string;
    /** The color variant of the banner */
    variant?: InfoBannerVariant;
    /** Whether the banner is initially collapsed */
    defaultCollapsed?: boolean;
    /** Additional class names */
    className?: string;
    /** Whether the banner can be collapsed */
    collapsible?: boolean;
    /** Whether the banner can be dismissed (closed) */
    dismissible?: boolean;
    /** Whether the banner is visible (controlled mode for dismissible) */
    visible?: boolean;
    /** Callback when the banner is dismissed */
    onDismiss?: () => void;
}

const variantStyles: Record<InfoBannerVariant, {
    container: string;
    icon: string;
    title: string;
    description: string;
}> = {
    info: {
        container: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900",
        icon: "text-blue-600 dark:text-blue-400",
        title: "text-blue-800 dark:text-blue-300",
        description: "text-blue-700 dark:text-blue-400",
    },
    warning: {
        container: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900",
        icon: "text-amber-600 dark:text-amber-400",
        title: "text-amber-800 dark:text-amber-300",
        description: "text-amber-700 dark:text-amber-400",
    },
    success: {
        container: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900",
        icon: "text-green-600 dark:text-green-400",
        title: "text-green-800 dark:text-green-300",
        description: "text-green-700 dark:text-green-400",
    },
    error: {
        container: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900",
        icon: "text-red-600 dark:text-red-400",
        title: "text-red-800 dark:text-red-300",
        description: "text-red-700 dark:text-red-400",
    },
};

function CollapsibleInfoBanner({
    icon,
    title,
    description,
    variant = "info",
    defaultCollapsed = false,
    className,
    collapsible = true,
    dismissible = false,
    visible = true,
    onDismiss,
}: Readonly<CollapsibleInfoBannerProps>) {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [internalVisible, setInternalVisible] = useState(true);
    const styles = variantStyles[variant];

    // Use controlled visibility if onDismiss is provided, otherwise use internal state
    const isVisible = onDismiss ? visible : internalVisible;

    const toggleCollapse = () => {
        if (collapsible && !dismissible) {
            setIsCollapsed(!isCollapsed);
        }
    };

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDismiss) {
            onDismiss();
        } else {
            setInternalVisible(false);
        }
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className={cn(
                "rounded-lg border transition-all duration-200",
                styles.container,
                className
            )}
        >
            <div
                className={cn(
                    "flex items-center gap-3 p-4",
                    collapsible && !dismissible && "cursor-pointer select-none"
                )}
                onClick={toggleCollapse}
                onKeyDown={(e) => {
                    if (collapsible && !dismissible && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        toggleCollapse();
                    }
                }}
                role={collapsible && !dismissible ? "button" : undefined}
                tabIndex={collapsible && !dismissible ? 0 : undefined}
                aria-expanded={collapsible && !dismissible ? !isCollapsed : undefined}
            >
                <div className={cn("flex-shrink-0", styles.icon)}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <span className={cn("text-sm font-medium", styles.title)}>
                        {title}
                    </span>
                    {/* Show description inline when dismissible (not collapsible) */}
                    {dismissible && (
                        <p className={cn("text-sm mt-1", styles.description)}>
                            {description}
                        </p>
                    )}
                </div>
                {collapsible && !dismissible && (
                    <div className={cn("flex-shrink-0", styles.icon)}>
                        {isCollapsed ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronUp className="h-4 w-4" />
                        )}
                    </div>
                )}
                {dismissible && (
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className={cn(
                            "flex-shrink-0 p-1 rounded-md transition-colors",
                            "hover:bg-black/10 dark:hover:bg-white/10",
                            styles.icon
                        )}
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            
            {/* Collapsible Description - only show when collapsible mode */}
            {!dismissible && (
                <div
                    className={cn(
                        "overflow-hidden transition-all duration-200",
                        isCollapsed ? "max-h-0" : "max-h-40"
                    )}
                >
                    <div className="px-4 pb-4 pt-0">
                        <span className={cn("text-sm", styles.description)}>
                            {description}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export { CollapsibleInfoBanner, type CollapsibleInfoBannerProps, type InfoBannerVariant };
