import React from 'react';
import { Link } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { User } from '@/types';

interface PostHeaderProps {
    user: User;
    onClose: () => void;
}

export default function PostHeader({ user, onClose }: PostHeaderProps) {
    return (
        <div className="sticky top-0 flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
            <div className="flex items-center">
                <Link href={route('profile.show', { user: user.username || user.id })} className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={user.profile_photo_url as string} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm">{user.username || user.name}</span>
                </Link>
            </div>
            <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
            >
                <XMarkIcon className="h-6 w-6" />
            </button>
        </div>
    );
}
