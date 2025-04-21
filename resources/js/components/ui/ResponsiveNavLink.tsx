import { Link, InertiaLinkProps } from '@inertiajs/react';
import React from 'react';

interface ResponsiveNavLinkProps extends Omit<InertiaLinkProps, 'href'> {
    active?: boolean;
    children: React.ReactNode;
    href?: string; // Make href optional for button usage
    as?: 'button' | 'a';
}

export default function ResponsiveNavLink({ active = false, className = '', children, as = 'a', ...props }: ResponsiveNavLinkProps) {
    const commonClasses = 'w-full flex items-start ps-3 pe-4 py-2 border-l-4 text-base font-medium focus:outline-none transition duration-150 ease-in-out ';

    const linkClasses = active
        ? 'border-purple-400 dark:border-purple-600 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/50 focus:text-purple-800 dark:focus:text-purple-200 focus:bg-purple-100 dark:focus:bg-purple-900 focus:border-purple-700 dark:focus:border-purple-300 '
        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:text-gray-800 dark:focus:text-gray-200 focus:bg-gray-50 dark:focus:bg-gray-700 focus:border-gray-300 dark:focus:border-gray-600 ';

    const buttonClasses = active
        ? 'border-purple-400 dark:border-purple-600 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/50 '
        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 ';

    if (as === 'button') {
        return (
            <button className={`${commonClasses} ${buttonClasses} ${className}`} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
                {children}
            </button>
        );
    } else {
        return (
            <Link {...(props as InertiaLinkProps)} className={`${commonClasses} ${linkClasses} ${className}`}>
                {children}
            </Link>
        );
    }
}
