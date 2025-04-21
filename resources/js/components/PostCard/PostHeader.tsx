import { Link } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { PostCardProps } from './types';

// Extend dayjs with the relativeTime plugin for fromNow() function
dayjs.extend(relativeTime);

export function PostHeader({ post }: PostCardProps) {
    return (
        <div className="flex items-center p-3 border-b border-gray-100 dark:border-gray-800">
            <Link href={route('profile.show', { username: post.user?.username || post.user?.id })} className="flex items-center group">
                <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage
                        src={post.user?.profile_photo_url as string | undefined}
                        alt={`${post.user?.name}'s profile picture`}
                        className="object-cover"
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                        {post.user?.name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {post.user?.username || post.user?.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {post.created_at && dayjs(post.created_at).fromNow()}
                    </span>
                </div>
            </Link>
            <div className="flex-1"></div>
            <button
                className="text-gray-500 dark:text-gray-400 p-1 rounded-full"
                aria-label="More options"
                title="More options"
            >
                <MoreHorizontal className="h-5 w-5" />
            </button>
        </div>
    );
}
