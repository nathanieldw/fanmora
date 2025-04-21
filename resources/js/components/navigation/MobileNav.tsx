import React from 'react';
import { Link } from '@inertiajs/react';
import { User } from '@/types';
import { 
    HomeIcon, 
    MagnifyingGlassIcon, 
    PlusIcon, 
    HeartIcon, 
    FilmIcon 
} from '@heroicons/react/24/outline';
import { 
    HomeIcon as HomeSolidIcon, 
    MagnifyingGlassIcon as MagnifyingGlassSolidIcon, 
    FilmIcon as FilmSolidIcon, 
    HeartIcon as HeartSolidIcon 
} from '@heroicons/react/24/solid';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type NavProps = {
    user: User;
    onCreatePost?: () => void;
};

function MobileNav({ user, onCreatePost }: NavProps) {
    // Function to determine if a link is active
    const isActive = (routeName: string) => route().current(routeName);
    
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-900 py-2 flex justify-around items-center sm:hidden z-50">
            <Link href={route('dashboard')} className="p-2">
                {isActive('dashboard') ? 
                    <HomeSolidIcon className="w-6 h-6 text-black dark:text-white" /> : 
                    <HomeIcon className="w-6 h-6 text-black dark:text-white" />}
            </Link>
            
            <Link href={route('explore')} className="p-2">
                {isActive('explore') ? 
                    <MagnifyingGlassSolidIcon className="w-6 h-6 text-black dark:text-white" /> : 
                    <MagnifyingGlassIcon className="w-6 h-6 text-black dark:text-white" />}
            </Link>
            
            <button 
                onClick={onCreatePost} 
                className="p-2 bg-transparent border-0 focus:outline-none"
                aria-label="Create new post"
            >
                <PlusIcon className="w-6 h-6 text-black dark:text-white" />
            </button>
            
            <Link href={route('notifications')} className="p-2">
                {isActive('notifications') ? 
                    <HeartSolidIcon className="w-6 h-6 text-black dark:text-white" /> : 
                    <HeartIcon className="w-6 h-6 text-black dark:text-white" />}
            </Link>
            
            <Link href={route('profile.show', { user: user.username ?? user.id })} className="p-2">
                <Avatar className="w-6 h-6 border border-gray-200 dark:border-gray-800">
                    <AvatarImage src={user.profile_photo_url as string} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            </Link>
        </nav>
    );
};

export default MobileNav;
