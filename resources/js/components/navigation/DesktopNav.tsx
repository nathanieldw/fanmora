import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { User } from '@/types';
import ApplicationLogo from '@/components/ui/ApplicationLogo';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { HomeIcon, MagnifyingGlassIcon, ChatBubbleOvalLeftEllipsisIcon, UserCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

interface DesktopNavProps {
    user: User;
}

const DesktopNav: React.FC<DesktopNavProps> = ({ user }) => {
    // Function to determine if a link is active (add other routes as needed)
    const isActive = (routeName: string) => route().current(routeName);

    // Basic styling for active/inactive icons
    const iconClass = (active: boolean) => `w-7 h-7 ${active ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`;

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 hidden sm:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo on the left */}
                    <div className="shrink-0 flex items-center">
                        <Link href={route('dashboard')}>
                            <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                        </Link>
                    </div>

                    {/* Navigation Icons in the middle (or spaced) */}
                    <div className="flex items-center space-x-6 md:space-x-8">
                        <Link href={route('dashboard')} title="Feed" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <HomeIcon className={iconClass(isActive('dashboard'))} />
                        </Link>
                        <Link href={route('explore')} title="Explore" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <MagnifyingGlassIcon className={iconClass(isActive('explore'))} />
                        </Link>
                        {/* Create button removed from main nav */}
                        <Link href={route('messages.index')} title="Messages" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <ChatBubbleOvalLeftEllipsisIcon className={iconClass(isActive('messages.index'))} />
                        </Link>
                    </div>

                    {/* Settings Dropdown on the right */}
                    <div className="hidden sm:flex sm:items-center sm:ms-6">
                        <div className="ms-3 relative">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    {/* Option 1: User Icon - uncomment if preferred */}
                                    {/* <Button variant="ghost" size="icon" className="rounded-full">
                                        <UserCircleIcon className="h-7 w-7 text-gray-500 dark:text-gray-400" />
                                    </Button> */}
                                    {/* Option 2: User Name Button (current) */}
                                    <Button variant="ghost" className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition ease-in-out duration-150">
                                        {user.name}
                                        <svg className="ms-2 -me-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={route('profile.show', { user: user.username ?? user.id })}>View Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={route('profile.edit')}>Profile Settings</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={route('logout')} method="post" as="button" className="w-full text-left">
                                            Log Out
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default DesktopNav;
