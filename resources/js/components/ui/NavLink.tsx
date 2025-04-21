import { Link, InertiaLinkProps } from '@inertiajs/react';
import React from 'react';

interface NavLinkProps extends InertiaLinkProps {
    active?: boolean;
    children: React.ReactNode;
}

export default function NavLink({ active = false, className = '', children, ...props }: NavLinkProps) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none '
                + (active
                    ? 'border-purple-400 dark:border-purple-600 text-gray-900 dark:text-gray-100 focus:border-purple-700 '
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 focus:text-gray-700 dark:focus:text-gray-300 focus:border-gray-300 dark:focus:border-gray-700 ')
                + className
            }
        >
            {children}
        </Link>
    );
}
