import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { User } from '@/types';

interface PostContentProps {
    content: string | null;
    user: User;
    created_at?: string;
}

export default function PostContent({ content, user, created_at }: PostContentProps) {
    if (!content) return null;
    
    return (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-start mb-3">
                <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={user.profile_photo_url as string} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <span className="font-semibold text-sm mr-2">{user.username || user.name}</span>
                    <span className="text-sm">{content}</span>
                    {created_at && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
