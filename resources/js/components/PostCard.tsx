import { useState, useCallback, memo, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import axios from 'axios';
import { PostCardProps } from './PostCard/types';
import { PostHeader } from './PostCard/PostHeader';
import { PostMedia } from './PostCard/PostMedia';
import { PostContent } from './PostCard/PostContent';
import { CommentForm } from './PostCard/CommentForm';

const PostCardComponent = ({ post }: PostCardProps) => {
    // Lightbox state
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    // Engagement state
    const [liked, setLiked] = useState(post.has_liked || false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [saved, setSaved] = useState(post.has_saved || false);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showComments, setShowComments] = useState(false);

    // Format media for lightbox (memoized to prevent recalculations)
    const slides = useMemo(() => {
        return post.media?.map(mediaItem => {
            if (mediaItem.file_type.startsWith('video/')) {
                return {
                    type: 'video' as const, // using const assertion to ensure type is exactly 'video'
                    sources: [
                        {
                            src: `/storage/${mediaItem.file_path}`,
                            type: mediaItem.file_type
                        }
                    ],
                    poster: `/storage/${mediaItem.file_path}#t=0.1`
                };
            } else {
                return {
                    src: `/storage/${mediaItem.file_path}`
                };
            }
        }) || [];
    }, [post.media]);

    // Media click handler for lightbox
    const handleMediaClick = useCallback((clickedIndex: number) => {
        setIndex(clickedIndex);
        setOpen(true);
    }, []);

    // Like handler (memoized to prevent recreation on each render)
    const handleLike = useCallback(() => {
        const newLiked = !liked;
        const newCount = liked ? likesCount - 1 : likesCount + 1;

        // Update UI immediately
        setLiked(newLiked);
        setLikesCount(newCount);

        // Send API request (debounced)
        setTimeout(() => {
            axios.post(route('post.like', { id: post.id }))
                .catch(() => {
                    // Revert on error
                    setLiked(!newLiked);
                    setLikesCount(liked ? likesCount : likesCount - 1);
                });
        }, 300);
    }, [liked, likesCount, post.id]);

    // Save handler (memoized)
    const handleSave = useCallback(() => {
        const newSaved = !saved;

        // Update UI immediately
        setSaved(newSaved);

        // Send API request (debounced)
        setTimeout(() => {
            axios.post(route('post.save', { id: post.id }))
                .catch(() => {
                    // Revert on error
                    setSaved(!newSaved);
                });
        }, 300);
    }, [saved, post.id]);

    // Comment input handler
    const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setComment(e.target.value);
    }, []);

    // Comment toggle handler
    const handleCommentToggle = useCallback(() => {
        setShowComments(!showComments);
    }, [showComments]);

    // Comment submit handler (memoized)
    const handleCommentSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim() || isSubmitting) return;

        setIsSubmitting(true);

        // Debounce to prevent multiple submissions
        setTimeout(() => {
            axios.post(route('post.comment', { id: post.id }), { content: comment })
                .then(() => {
                    setComment('');
                    // Optionally fetch updated comments or add the new comment to a local state array
                })
                .catch(error => {
                    console.error('Error posting comment:', error);
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        }, 300);
    }, [comment, isSubmitting, post.id]);

    return (
        <>
            <Card className="w-full bg-white dark:bg-gray-900 rounded-md overflow-hidden mb-4 shadow-sm border border-gray-100 dark:border-gray-800">
                <PostHeader post={post} />

                <PostMedia
                    post={post}
                    onMediaClick={handleMediaClick}
                />

                <PostContent
                    post={post}
                    liked={liked}
                    likesCount={likesCount}
                    saved={saved}
                    onLike={handleLike}
                    onSave={handleSave}
                    onCommentToggle={handleCommentToggle}
                />

                {showComments && (
                    <CommentForm
                        comment={comment}
                        isSubmitting={isSubmitting}
                        onChange={handleCommentChange}
                        onSubmit={handleCommentSubmit}
                    />
                )}
            </Card>

            <Lightbox
                open={open}
                close={() => setOpen(false)}
                index={index}
                slides={slides}
                plugins={[Video]}
            />
        </>
    );
};

// Memoize the component to prevent unnecessary re-renders
const PostCard = memo(PostCardComponent);

// Export the memoized component as default
export default PostCard;
