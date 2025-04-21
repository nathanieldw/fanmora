import React from 'react';
import { Link } from '@inertiajs/react';
import { HeartIcon } from '@heroicons/react/24/solid';
import { type User } from '@/types';

interface WelcomeHeaderProps {
    user: User | null;
    canLogin: boolean;
    canRegister: boolean;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ user, canLogin, canRegister }) => {
    return (
        <header className="border-b border-gray-100 bg-white px-4 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 w-full">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
                <div className="flex items-center">
                    <HeartIcon className="h-8 w-8 text-[#00AFF0]" />
                    <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-[#00AFF0] to-[#8D41D6] bg-clip-text text-transparent">
                        Fanmora
                    </span>
                </div>
                <nav className="flex items-center space-x-2">
                    {user ? (
                        <Link
                            href={route('dashboard')}
                            className="rounded-md bg-gradient-to-r from-[#00AFF0] to-[#8D41D6] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            {canLogin && (
                                <Link
                                    href={route('login')}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                    Log in
                                </Link>
                            )}
                            {canRegister && (
                                <Link
                                    href={route('register')}
                                    className="rounded-md bg-gradient-to-r from-[#00AFF0] to-[#8D41D6] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
                                >
                                    Sign up
                                </Link>
                            )}
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default WelcomeHeader;
