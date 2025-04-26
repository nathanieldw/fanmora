import React, { useState, PropsWithChildren, ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { User } from '@/types';
import ApplicationLogo from '@/components/ui/ApplicationLogo';
import ResponsiveNavLink from '@/components/ui/ResponsiveNavLink';
import DesktopSidebar from '@/components/navigation/DesktopSidebar';
import MobileNav from '@/components/navigation/MobileNav';
import SuggestionsSidebar from '@/components/navigation/SuggestionsSidebar';

interface AuthenticatedLayoutProps {
    user: User;
    header?: ReactNode;
}

export default function Authenticated({ user, header, children }: PropsWithChildren<AuthenticatedLayoutProps>) {
    return (
        <div className="min-h-screen bg-white dark:bg-black">
            {/* Instagram-like 3-column Layout */}
            <div className="flex">
                {/* Left Sidebar - Desktop Only */}
                <div className="hidden md:block md:w-[244px] xl:w-[335px] border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0">
                    <DesktopSidebar user={user} />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    {/* Page Content */}
                    <main className="pb-16 md:pb-0 flex justify-center"> {/* Add padding-bottom for mobile nav */}
                        {children}
                    </main>
                </div>

                {/* Right Sidebar - Desktop Only */}
                <div className="hidden lg:block lg:w-[319px] xl:w-[380px] h-screen sticky top-0 px-4">
                    <SuggestionsSidebar user={user} />
                </div>
            </div>

            {/* Mobile Navigation - Fixed to bottom */}
            <div className="md:hidden">
                <MobileNav user={user} />
            </div>
        </div>
    );
}
