import { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { SharedData, Post, PaginatedData, User } from '@/types';
import PostCard from '@/components/PostCard';
import StoriesRow from '@/components/stories/StoriesRow';
import axios from 'axios';

interface PageProps extends SharedData {
    posts: PaginatedData<Post & { user: User }>;
}

export default function Dashboard({ auth, posts: initialPosts }: PageProps) {
    // State to manage posts
    const [posts, setPosts] = useState<(Post & { user: User })[]>(initialPosts.data || []);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialPosts.next_page_url);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    
    // Ref for intersection observer to detect when user scrolls to bottom
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    
    // Function to load more posts
    const loadMorePosts = useCallback(async () => {
        if (!nextPageUrl || isLoading) return;
        
        try {
            setIsLoading(true);
            setHasError(false);
            
            const response = await axios.get(nextPageUrl);
            const newPosts = response.data.data;
            
            // Append new posts to existing ones
            setPosts(currentPosts => [...currentPosts, ...newPosts]);
            
            // Update pagination info
            setNextPageUrl(response.data.next_page_url);
        } catch (error) {
            console.error('Error loading more posts:', error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }, [nextPageUrl, isLoading]);
    
    // Set up intersection observer for infinite scrolling
    useEffect(() => {
        // Clean up previous observer if it exists
        if (observerRef.current) {
            observerRef.current.disconnect();
        }
        
        // Create new observer
        observerRef.current = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && nextPageUrl) {
                    loadMorePosts();
                }
            },
            { threshold: 0.5 }
        );
        
        // Start observing the load more element
        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }
        
        // Clean up observer on component unmount
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loadMorePosts, nextPageUrl]);

    return (
        <AppLayout user={auth.user}>
            <Head title="Feed" />

            <div className="pt-6 pb-12 w-full max-w-[470px] mx-auto">
                {/* Stories Row */}
                <StoriesRow currentUser={auth.user} />

                {/* Posts Feed */}
                <div className="space-y-4">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                            <p className="text-gray-900 dark:text-gray-100">No posts yet. Follow some creators or create your own!</p>
                        </div>
                    )}
                    
                    {/* Load more indicator/trigger */}
                    {nextPageUrl && (
                        <div 
                            ref={loadMoreRef} 
                            className="flex justify-center p-4"
                        >
                            {isLoading && (
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
                            )}
                        </div>
                    )}
                    
                    {/* Error state */}
                    {hasError && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
                            <p>There was an error loading posts. Please try again.</p>
                            <button 
                                onClick={loadMorePosts}
                                className="mt-2 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium text-sm"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    
                    {/* End of feed message */}
                    {!nextPageUrl && posts.length > 0 && (
                        <div className="text-center p-4 text-gray-500 dark:text-gray-400 text-sm">
                            You've reached the end of your feed.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
