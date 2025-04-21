import { useState } from 'react';
import { User, Story } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface StoryCircleProps {
    user: User & { stories: Story[]; profile_photo_url?: string };
    onClick: () => void;
}

export default function StoryCircle({ user, onClick }: StoryCircleProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`flex flex-col items-center cursor-pointer transition-transform duration-200 ${isHovered ? 'scale-105' : 'scale-100'}`}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={cn(
                "p-0.5 rounded-full",
                user.stories.some(story => !story.viewed)
                    ? "bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500"
                    : "bg-gray-200 dark:bg-gray-700"
            )}>
                <div className="bg-white dark:bg-black p-0.5 rounded-full">
                    <Avatar className="h-14 w-14 border-2 border-white dark:border-black">
                        <AvatarImage
                            src={user.profile_photo_url || (user.profile_photo ? `/storage/${user.profile_photo}` : undefined)}
                            alt={`${user.username || user.name}'s story`}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm">
                            {user.name?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>
            <span className="text-xs mt-1 max-w-14 truncate text-center">
                {user.username || user.name?.split(' ')[0]}
            </span>
        </div>
    );
}
