import React from 'react';
import { Link } from '@inertiajs/react';
import '@/../../resources/css/logo.css';
import { HeartIcon } from '@heroicons/react/24/solid';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'simple' | 'icon';
    className?: string;
}

export default function Logo({
    size = 'md',
    variant = 'default',
    className = ''
}: LogoProps) {
    // Size classes
    const sizeClasses = {
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-3xl'
    };

    // Icon only version
    if (variant === 'icon') {
        return (
            <Link href="/" className={`flex items-center ${className}`}>
                <HeartIcon className="h-7 w-7 text-[#00AFF0]" />
            </Link>
        );
    }

    // Simple text version
    if (variant === 'simple') {
        return (
            <Link href="/" className={`logo-text ${sizeClasses[size]} ${className}`}>
                Fanmora
            </Link>
        );
    }

    // Default full logo version
    return (
        <Link href="/" className={`flex items-center ${sizeClasses[size]} ${className}`}>
            <HeartIcon className="h-7 w-7 text-[#00AFF0] mr-1" />
            <span className="logo-text">Fanmora</span>
        </Link>
    );
}
