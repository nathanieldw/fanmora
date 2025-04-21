import React from 'react';
import { HeartIcon, ChatBubbleOvalLeftIcon, BookmarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

interface PostInteractionButtonsProps {
    hasLiked: boolean;
    hasSaved: boolean;
    onLike: () => void;
    onSave: () => void;
    onComment?: () => void;
    onShare?: () => void;
}

export default function PostInteractionButtons({
    hasLiked,
    hasSaved,
    onLike,
    onSave,
    onComment,
    onShare
}: PostInteractionButtonsProps) {
    return (
        <div className="flex justify-between">
            <div className="flex space-x-4">
                <button 
                    onClick={onLike} 
                    className="hover:scale-110 transition transform"
                    aria-label={hasLiked ? "Unlike post" : "Like post"}
                >
                    {hasLiked ? (
                        <HeartIconSolid className="h-6 w-6 text-red-500" />
                    ) : (
                        <HeartIcon className="h-6 w-6" />
                    )}
                </button>
                <button 
                    onClick={onComment}
                    className="hover:scale-110 transition transform"
                    aria-label="Comment on post"
                >
                    <ChatBubbleOvalLeftIcon className="h-6 w-6" />
                </button>
                <button 
                    onClick={onShare}
                    className="hover:scale-110 transition transform"
                    aria-label="Share post"
                >
                    <PaperAirplaneIcon className="h-6 w-6 rotate-45" />
                </button>
            </div>
            <button 
                onClick={onSave} 
                className="hover:scale-110 transition transform"
                aria-label={hasSaved ? "Unsave post" : "Save post"}
            >
                {hasSaved ? (
                    <BookmarkIconSolid className="h-6 w-6 text-yellow-500" />
                ) : (
                    <BookmarkIcon className="h-6 w-6" />
                )}
            </button>
        </div>
    );
}
