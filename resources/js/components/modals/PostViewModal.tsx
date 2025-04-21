import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Post, User } from '@/types';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

// Import our modular components
import PostHeader from '@/components/post/PostHeader';
import PostMediaViewer from '@/components/post/PostMediaViewer';
import PostContent from '@/components/post/PostContent';
import PostInteractionButtons from '@/components/post/PostInteractionButtons';
import PostCommentSection from '@/components/post/PostCommentSection';

interface PostViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: Post & { user: User } | null;
    currentUser: User;
}

export default function PostViewModal({ 
    isOpen, 
    onClose, 
    post, 
    currentUser 
}: PostViewModalProps) {
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasLiked, setHasLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [hasSaved, setHasSaved] = useState(false);
    const [comments, setComments] = useState<any[]>([]);

    useEffect(() => {
        if (post) {
            setHasLiked(post.has_liked === true);
            setLikeCount(post.likes?.length || 0);
            setHasSaved(post.has_saved === true);
            setComments(post.comments || []);
        }
    }, [post]);

    const handleLike = () => {
        if (!post) return;
        
        axios.post(route('post.like', { id: post.id }))
            .then(response => {
                setHasLiked(response.data.action === 'liked');
                setLikeCount(response.data.likes_count);
            })
            .catch(error => console.error('Error liking post:', error));
    };

    const handleSave = () => {
        if (!post) return;
        
        axios.post(route('post.save', { id: post.id }))
            .then(response => {
                setHasSaved(response.data.action === 'saved');
            })
            .catch(error => console.error('Error saving post:', error));
    };

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim() || !post) return;
        
        setIsSubmitting(true);
        
        axios.post(route('post.comment', { id: post.id }), { 
            content: comment 
        })
            .then(response => {
                setComments(prev => [response.data.comment, ...prev]);
                setComment('');
                setIsSubmitting(false);
            })
            .catch(() => {
                setIsSubmitting(false);
            });
    };

    if (!post) return null;

    return (
        <Dialog 
            open={isOpen} 
            onClose={onClose} 
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center">
                <Dialog.Panel className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg">
                    {/* Use the PostHeader component */}
                    <PostHeader user={post.user} onClose={onClose} />
                    
                    <div className="flex flex-col lg:flex-row">
                        {/* Left side: Post Content and Media */}
                        <div className="lg:w-7/12 bg-gray-900 flex items-center justify-center">
                            {/* Use the PostMediaViewer component */}
                            {post.media && <PostMediaViewer media={post.media} />}
                        </div>
                        
                        {/* Right side: Comments and Interaction */}
                        <div className="lg:w-5/12 border-l border-gray-200 dark:border-gray-700 flex flex-col max-h-[70vh] bg-white dark:bg-gray-900">
                            {/* Use the PostContent component */}
                            <PostContent 
                                content={post.content} 
                                user={post.user} 
                                created_at={post.created_at} 
                            />
                            
                            {/* Use the PostCommentSection component */}
                            <PostCommentSection 
                                comments={comments}
                                comment={comment}
                                setComment={setComment}
                                isSubmitting={isSubmitting}
                                handleSubmitComment={handleSubmitComment}
                            />
                            
                            {/* Interaction section */}
                            <div className="border-t border-gray-200 dark:border-gray-800 p-3">
                                {/* Use the PostInteractionButtons component */}
                                <PostInteractionButtons 
                                    hasLiked={hasLiked}
                                    hasSaved={hasSaved}
                                    onLike={handleLike}
                                    onSave={handleSave}
                                />
                                
                                {/* Like count */}
                                {likeCount > 0 && (
                                    <div className="mt-2">
                                        <p className="font-semibold text-sm">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</p>
                                    </div>
                                )}
                                
                                {/* Post date */}
                                <div className="mt-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {post.created_at && formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
