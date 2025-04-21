import { Link } from '@inertiajs/react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { PostCardProps } from './types';

interface PostContentProps extends PostCardProps {
    liked: boolean;
    likesCount: number;
    saved: boolean;
    onLike: () => void;
    onSave: () => void;
    onCommentToggle: () => void;
    onShare: () => void; // New prop for sharing functionality
}

export function PostContent({
    post,
    liked,
    likesCount,
    saved,
    onLike,
    onSave,
    onCommentToggle,
    onShare // Added the new prop
}: PostContentProps) {
    return (
        <div className="px-3 py-2">
            {/* Caption */}
            {post.content && (
                <div className="mb-2">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                        <Link href={route('profile.show', { username: post.user?.username || post.user?.id })} className="font-semibold mr-1">
                            {post.user?.username || post.user?.name}
                        </Link>
                        <span className="break-words">
                            {post.content}
                        </span>
                    </p>
                </div>
            )}

            {/* Engagement buttons */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex space-x-4">
                    {/* Like button */}
                    <button
                        className={`p-0.5 ${liked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
                        aria-label={liked ? "Unlike" : "Like"}
                        title={liked ? "Unlike" : "Like"}
                        onClick={onLike}
                    >
                        <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                    </button>

                    {/* Comment button */}
                    <button
                        className="p-0.5 text-gray-600 dark:text-gray-400"
                        aria-label="Comment"
                        title="Comment"
                        onClick={onCommentToggle}
                    >
                        <MessageCircle className="h-5 w-5" />
                    </button>

                    {/* Share button */}
                    <button
                        className="p-0.5 text-gray-600 dark:text-gray-400"
                        aria-label="Share"
                        title="Share"
                        onClick={onShare} // Added the onClick handler
                    >
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>

                {/* Save button */}
                <button
                    className={`p-0.5 ${saved ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}
                    aria-label={saved ? "Unsave" : "Save"}
                    title={saved ? "Unsave" : "Save"}
                    onClick={onSave}
                >
                    <Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Likes count */}
            {likesCount > 0 && (
                <div className="mb-1">
                    <p className="font-normal text-xs text-gray-600 dark:text-gray-400">
                        {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                    </p>
                </div>
            )}
        </div>
    );
}