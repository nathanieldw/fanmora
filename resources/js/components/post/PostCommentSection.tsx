import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { User } from '@/types';

interface Comment {
    id: number;
    content: string;
    created_at?: string;
    user: User;
}

interface PostCommentSectionProps {
    comments: Comment[];
    comment: string;
    setComment: (comment: string) => void;
    isSubmitting: boolean;
    handleSubmitComment: (e: React.FormEvent) => void;
}

export default function PostCommentSection({
    comments,
    comment,
    setComment,
    isSubmitting,
    handleSubmitComment
}: PostCommentSectionProps) {
    return (
        <>
            {/* Comments section */}
            <div className="flex-1 overflow-y-auto p-4">
                {comments.length > 0 ? (
                    comments.map((comment) => {
                        // Skip comments with missing user data
                        if (!comment.user) return null;
                        
                        return (
                            <div key={comment.id} className="mb-4">
                                <div className="flex items-start">
                                    <Avatar className="h-8 w-8 mr-2">
                                        <AvatarImage 
                                            src={comment.user.profile_photo_url as string || '/images/default-avatar.png'} 
                                            alt={comment.user?.name || 'User'} 
                                        />
                                        <AvatarFallback>
                                            {comment.user.name ? comment.user.name.charAt(0).toUpperCase() : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <span className="font-semibold text-sm mr-2">{comment.user.username || comment.user.name || 'Anonymous'}</span>
                                        <span className="text-sm">{comment.content}</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {comment.created_at && formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No comments yet</p>
                )}
            </div>
            
            {/* Comment form */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-3">
                <form onSubmit={handleSubmitComment} className="flex items-center">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 bg-transparent focus:outline-none"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        disabled={!comment.trim() || isSubmitting}
                        className="text-blue-500 font-semibold"
                    >
                        Post
                    </Button>
                </form>
            </div>
        </>
    );
}
