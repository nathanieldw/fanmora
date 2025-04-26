import { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { SharedData, User, Post, PaginatedData } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { MagnifyingGlassIcon, XMarkIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { debounce } from 'lodash';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import PostViewModal from '@/components/modals/PostViewModal';
import axios from 'axios';

interface PageProps extends SharedData {
    posts: PaginatedData<Post & { user: User }>;
    users: User[];
    query?: string;
}

// Enhanced User type with following status
interface EnhancedUser extends User {
    isFollowing?: boolean;
    followersCount?: number;
}

export default function Explore({ auth, posts, users, query = '' }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(query);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<(Post & { user: User }) | null>(null);
    const [enhancedUsers, setEnhancedUsers] = useState<EnhancedUser[]>([]);
    const [followInProgress, setFollowInProgress] = useState<number[]>([]);

    // Initialize enhanced users with following status
    useEffect(() => {
        setEnhancedUsers(users.map(user => ({
            ...user,
            isFollowing: false, // Initially we don't know, this will be updated via API
            followersCount: 0
        })));

        // For each user, check if the current user is following them
        users.forEach(user => {
            const userId = user.id;
            axios.get(`/api/users/${userId}/follow-status`)
                .then(response => {
                    setEnhancedUsers(prevUsers =>
                        prevUsers.map(u =>
                            u.id === userId
                                ? { ...u, isFollowing: response.data.isFollowing, followersCount: response.data.followersCount }
                                : u
                        )
                    );
                })
                .catch(error => console.error(`Error checking follow status for user ${userId}:`, error));
        });
    }, [users]);

    // Handle follow/unfollow a user
    const toggleFollow = (userId: number) => {
        // Prevent multiple clicks
        if (followInProgress.includes(userId)) return;

        // Add user to in-progress list
        setFollowInProgress(prev => [...prev, userId]);

        axios.post(route('users.follow', { user: userId }))
            .then(response => {
                // Update the user in the state
                setEnhancedUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === userId
                            ? {
                                ...user,
                                isFollowing: response.data.action === 'followed',
                                followersCount: response.data.followers_count
                            }
                            : user
                    )
                );
            })
            .catch(error => console.error('Error toggling follow:', error))
            .finally(() => {
                // Remove user from in-progress list
                setFollowInProgress(prev => prev.filter(id => id !== userId));
            });
    };

    // Update the search query with debouncing
    const debouncedSearch = debounce((value: string) => {
        router.get(route('explore'), { q: value }, {
            preserveState: true,
            preserveScroll: true,
            only: ['posts', 'users']
        });
    }, 300);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        debouncedSearch(value);
    };

    const clearSearch = () => {
        setSearchQuery('');
        router.get(route('explore'), {}, {
            preserveState: true,
            preserveScroll: true,
            only: ['posts', 'users']
        });
    };

    // Function to open the post view modal with the selected post
    const openPostModal = (post: Post & { user: User }) => {
        setSelectedPost(post);
        setModalOpen(true);

        // Fetch post details from API
        axios.get(route('api.posts.recommendations', { post: post.id }))
            .then(response => {
                // Update post with full details
                setSelectedPost(response.data.post);
            })
            .catch(error => {
                console.error('Error fetching post details:', error);
            });
    };

    return (
        <AppLayout user={auth.user}>
            <Head title="Explore" />

            <div className="max-w-6xl mx-auto px-2 sm:px-4">
                {/* Search Bar */}
                <div className="mb-4 sm:mb-6 mt-3">
                    <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg mx-0">
                        <MagnifyingGlassIcon
                            className="ml-3 h-5 w-5 text-gray-400 dark:text-gray-500"
                        />
                        <input
                            type="text"
                            className="w-full py-3 pl-4 pr-10 bg-gray-100 dark:bg-gray-800 border-none rounded-lg focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
                            placeholder="Search users or posts"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            aria-label="Search"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                aria-label="Clear search"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* User Results - Show only when searching */}
                {searchQuery && enhancedUsers.length > 0 && (
                    <div className="mb-6 sm:mb-8 bg-white dark:bg-gray-900 rounded-lg shadow p-3 sm:p-4">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">People</h2>
                        <div className="space-y-4">
                            {enhancedUsers.map(user => (
                                <Link
                                    href={route('profile.show', { user: user.username ?? user.id })}
                                key={user.id}
                                className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-2 sm:p-3 rounded-lg transition-colors"
                                >
                                    <p className="flex items-center">
                                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 mr-2 sm:mr-3">
                                            <AvatarImage src={user.profile_photo_url as string} alt={user.name} />
                                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">{user.username || user.name}</h3>
                                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                {user.followersCount !== undefined ? `${user.followersCount} followers` : ''}
                                            </p>
                                        </div>
                                    </p>

                                    {/* Only show follow button for other users (not yourself) */}
                                    {user.id !== auth.user.id && (
                                        <Button
                                            variant={user.isFollowing ? "outline" : "default"}
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleFollow(user.id);
                                            }}
                                            disabled={followInProgress.includes(user.id)}
                                            className={`ml-2 ${user.isFollowing ? 'text-gray-600 border-gray-300' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                        >
                                            <span className="flex items-center">
                                                {user.isFollowing ? (
                                                    <>
                                                        <UserMinusIcon className="h-4 w-4 mr-1" />
                                                        <span>Following</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlusIcon className="h-4 w-4 mr-1" />
                                                        <span>Follow</span>
                                                    </>
                                                )}
                                            </span>
                                        </Button>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Title */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {searchQuery ? 'Search Results' : 'Explore'}
                    </h1>
                    {posts.data.length > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {posts.data.length} {posts.data.length === 1 ? 'post' : 'posts'} found
                        </p>
                    )}
                </div>

                {/* Posts Grid */}
                {posts.data.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-[2px] sm:gap-[4px]">
                        {posts.data.map((post, postIndex) => {
                            // Skip posts with no media
                            if (!post.media || post.media.length === 0) return null;

                            const firstMedia = post.media[0];
                            const isVideo = firstMedia.file_type?.startsWith('video');

                            return (
                                <div
                                    key={post.id}
                                    className="aspect-square relative overflow-hidden cursor-pointer group bg-gray-100 dark:bg-gray-800"
                                    onClick={() => openPostModal(post)}
                                >
                                    {isVideo ? (
                                        <video
                                            src={`/storage/${firstMedia.file_path}`}
                                            className="object-cover w-full h-full"
                                            muted
                                            loop
                                        />
                                    ) : (
                                        <img
                                            src={`/storage/${firstMedia.file_path}`}
                                            alt={`Post by ${post.user.name}`}
                                            className="object-cover w-full h-full"
                                            loading="lazy"
                                        />
                                    )}

                                    {/* Hover overlay with engagement stats - Instagram style */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 active:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                        <div className="flex space-x-4 sm:space-x-8 text-white font-semibold">
                                            <div className="flex items-center">
                                                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                </svg>
                                                <span>{post.likes?.length || 0}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
                                                </svg>
                                                <span>{post.comments?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Multiple media indicator */}
                                    {post.media && post.media.length > 1 && (
                                        <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Video indicator */}
                                    {isVideo && (
                                        <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 sm:py-12">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-3 sm:mb-4">
                            <MagnifyingGlassIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {searchQuery ? 'No results found' : 'No posts to explore yet'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {searchQuery ? 'Try a different search term or check back later' : 'Start following people to see their posts here'}
                        </p>
                    </div>
                )}

                {/* Pagination - Instagram Style */}
                {posts.data.length > 0 && posts.next_page_url && (
                    <div className="mt-4 sm:mt-6 mb-6 sm:mb-8 flex justify-center">
                        <button
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg font-medium text-xs sm:text-sm transition-colors"
                            onClick={() => router.get(posts.next_page_url || '', {}, {
                                preserveState: true,
                                preserveScroll: true,
                                only: ['posts']
                            })}
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>

            {/* Instagram-style Post Modal */}
            <PostViewModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                post={selectedPost}
                currentUser={auth.user}
            />
        </AppLayout>
    );
}
