import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface MotionLinkProps {
    href: string;
    className?: string;
    children: React.ReactNode;
    title?: string;
    'aria-label'?: string;
    icon?: boolean;
    variant?: 'default' | 'primary' | 'warning' | 'success' | 'destructive';
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    as?: string;
    data?: Record<string, string | number | boolean | null>;
}

const variants = {
    default: {
        hover: { scale: 1.05 },
        tap: { scale: 0.95 },
    },
    icon: {
        hover: { scale: 1.2 },
        tap: { scale: 0.9 },
    },
};

const variantClasses = {
    default: "text-foreground hover:text-foreground/80",
    primary: "text-primary hover:text-primary/80",
    warning: "text-warning hover:text-warning/80",
    success: "text-success hover:text-success/80",
    destructive: "text-destructive hover:text-destructive/80",
};

const MotionLink = ({
    href,
    className = "",
    children,
    title,
    'aria-label': ariaLabel,
    icon = false,
    variant = 'default',
    method,
    as,
    data,
}: MotionLinkProps) => {
    const motionVariant = icon ? variants.icon : variants.default;
    const variantClass = variantClasses[variant];

    return (
        <motion.div
            whileHover={motionVariant.hover}
            whileTap={motionVariant.tap}
        >
            <Link
                href={href}
                className={`transition ${variantClass} ${className}`}
                title={title}
                aria-label={ariaLabel}
                method={method}
                as={as}
                data={data}
            >
                {children}
            </Link>
        </motion.div>
    );
};

export default MotionLink;
