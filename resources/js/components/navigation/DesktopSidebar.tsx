import React from 'react';
import { Link } from '@inertiajs/react';
import { User } from '@/types';
import {
    HomeIcon,
    MagnifyingGlassIcon,
    ChatBubbleOvalLeftIcon,
    HeartIcon,
    PlusCircleIcon,
    Bars3Icon
} from '@heroicons/react/24/outline';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Logo from '@/components/ui/Logo';

interface SidebarProps {
    user: User;
    onCreatePost?: () => void;
    className?: string;
}

const DesktopSidebar = ({ user, onCreatePost, className }: SidebarProps) => {
    // Function to determine if a link is active
    const isActive = (routeName: string) => route().current(routeName);

    const NavItem = ({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) => (
        <Link
            href={href}
            className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${active
                ? 'font-bold'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
        >
            <div className="w-6 h-6">{icon}</div>
            <span className="text-base">{label}</span>
        </Link>
    );

    return (
        <aside className={`w-64 dark:border-gray-800 h-screen flex flex-col py-6 px-3 fixed ${className}`}>
            <div className="mb-8 px-3">
                <Logo size="lg" variant="default" />
            </div>

            {/* Navigation Links */}
            <div className="space-y-1 flex-1">
                <NavItem
                    href={route('dashboard')}
                    icon={<HomeIcon className="w-full h-full" />}
                    label="Home"
                    active={isActive('dashboard')}
                />
                <NavItem
                    href={route('explore')}
                    icon={<MagnifyingGlassIcon className="w-full h-full" />}
                    label="Search"
                />
                <NavItem
                    href={route('messages.index')}
                    icon={<ChatBubbleOvalLeftIcon className="w-full h-full" />}
                    label="Messages"
                />
                <NavItem
                    href={route('notifications')}
                    icon={<HeartIcon className="w-full h-full" />}
                    label="Notifications"
                />
                <div
                    onClick={onCreatePost}
                    className="flex items-center gap-4 px-3 py-3 rounded-lg cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <div className="w-6 h-6">
                        <PlusCircleIcon className="w-full h-full" />
                    </div>
                    <span className="text-base">Create</span>
                </div>

                {/* Profile Link */}
                <Link
                    href={route('profile.show', { username: user.username ?? user.id })}
                    className="flex items-center gap-4 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={user.profile_photo_url as string} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-base">Profile</span>
                </Link>
            </div>

            {/* Bottom Menu */}
            <div className="mb-6">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-4 px-3 py-3 rounded-lg w-full text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Bars3Icon className="w-6 h-6" />
                        <span className="text-base">More</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-60">
                        <DropdownMenuItem asChild>
                            <Link href={route('profile.edit')} className="cursor-pointer">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={route('logout')} method="post" as="button" className="w-full text-left cursor-pointer">
                                Log Out
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    );
};

export default DesktopSidebar;
