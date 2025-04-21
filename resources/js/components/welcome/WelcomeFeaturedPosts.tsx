import React from 'react';
import { Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';

interface FeaturedPost {
    id: number;
    caption: string;
    media: {
        url: string;
        type: string;
    }[];
    created_at: string;
    user: {
        id: number;
        username: string;
        name: string;
        profile_photo: string;
    };
}

interface Props {
    featuredPosts: FeaturedPost[];
}

const WelcomeFeaturedPosts: React.FC<Props> = ({ featuredPosts }) => {
    if (!featuredPosts || featuredPosts.length === 0) {
        return null;
    }

    return (
        <div className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#00AFF0]/5 to-[#8D41D6]/5 transform -translate-x-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-[#00AFF0]/5 to-[#8D41D6]/5 transform translate-x-1/3 translate-y-1/3"></div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#00AFF0] to-[#8D41D6]">Featured</span> posts
                    </h2>
                    <a href="/explore" className="text-[#00AFF0] hover:text-[#0099D6] font-medium transition-colors">View all</a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredPosts.map((post) => (
                        <div key={post.id} className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                            <div className="p-4 flex items-center">
                                <Link href={`/${post.user.username}`} className="flex-shrink-0">
                                    <img 
                                        src={post.user.profile_photo || '/img/default-avatar.png'} 
                                        alt={post.user.name} 
                                        className="w-10 h-10 rounded-full mr-3 border-2 border-white dark:border-gray-800 shadow-sm"
                                    />
                                </Link>
                                <div className="min-w-0">
                                    <Link 
                                        href={`/${post.user.username}`}
                                        className="font-semibold text-gray-900 dark:text-white hover:text-[#00AFF0] dark:hover:text-[#00AFF0] transition-colors truncate block"
                                    >
                                        {post.user.name}
                                    </Link>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        @{post.user.username} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            
                            <Link 
                                href={`/${post.user.username}/posts/${post.id}`}
                                className="relative block overflow-hidden aspect-square group-hover:opacity-95 transition-opacity"
                            >
                                {post.media && post.media.length > 0 && (
                                    post.media[0].type.includes('image') ? (
                                        <img 
                                            src={post.media[0].url} 
                                            alt="Post media" 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <video 
                                            src={post.media[0].url}
                                            className="w-full h-full object-cover"
                                            controls
                                        />
                                    )
                                )}
                            </Link>
                            
                            <div className="p-5 flex-grow">
                                <p className="text-gray-700 dark:text-gray-200 line-clamp-3">
                                    {post.caption.length > 120 
                                        ? `${post.caption.substring(0, 120)}...`
                                        : post.caption
                                    }
                                </p>
                            </div>
                            
                            <div className="px-5 pb-5 flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4">
                                <div className="flex items-center space-x-4">
                                    <span className="inline-flex items-center text-gray-600 dark:text-gray-400">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                        </svg>
                                        {Math.floor(Math.random() * 100) + 10}
                                    </span>
                                    <span className="inline-flex items-center text-gray-600 dark:text-gray-400">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                        </svg>
                                        {Math.floor(Math.random() * 20) + 1}
                                    </span>
                                </div>
                                
                                <Link 
                                    href={`/${post.user.username}/posts/${post.id}`}
                                    className="inline-flex items-center text-[#00AFF0] hover:text-[#0099D6] font-medium transition-colors text-sm"
                                >
                                    View post
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                
                {featuredPosts.length > 3 && (
                    <div className="flex justify-center mt-10">
                        <Link 
                            href="/explore"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-[#00AFF0] to-[#8D41D6] hover:opacity-90 transition"
                        >
                            Discover more content
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WelcomeFeaturedPosts;
