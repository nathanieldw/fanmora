import React from 'react';
import { HeartIcon } from '@heroicons/react/24/solid';

const WelcomeFooter: React.FC = () => {
    return (
        <footer className="bg-white py-8 dark:bg-gray-950">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between border-t border-gray-200 pt-8 md:flex-row dark:border-gray-800">
                    <div className="flex items-center">
                        <HeartIcon className="h-6 w-6 text-[#00AFF0]" />
                        <span className="ml-2 text-xl font-bold bg-gradient-to-r from-[#00AFF0] to-[#8D41D6] bg-clip-text text-transparent">
                            Fanmora
                        </span>
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-500 md:mt-0 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} Fanmora. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default WelcomeFooter;
