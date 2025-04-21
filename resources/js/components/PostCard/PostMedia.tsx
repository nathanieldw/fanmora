import { useState, useCallback, useRef, useEffect } from 'react';
import { Media } from '@/types';
import { PostCardProps } from './types';

// Lightweight custom slider with sliding animation (no Swiper)

interface PostMediaProps extends PostCardProps {
    onMediaClick: (index: number) => void;
}

export function PostMedia({ post, onMediaClick }: PostMediaProps) {
    if (!post.media || post.media.length === 0) return null;

    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const mediaLoaded = useRef<boolean[]>(Array(post.media.length).fill(false));
    const [, forceUpdate] = useState(0); // used to trigger re‑render when mediaLoaded changes

    // Pre‑load only the first media to speed up initial render
    useEffect(() => {
        if (!post.media || post.media.length === 0) return;

        const first = post.media[0];
        if (first.file_type.startsWith('image/')) {
            const img = new Image();
            img.src = `/storage/${first.file_path}`;
            img.onload = () => {
                mediaLoaded.current[0] = true;
                forceUpdate(x => x + 1);
            };
        } else {
            mediaLoaded.current[0] = true;
            forceUpdate(x => x + 1);
        }
    }, [post.media]);

    const handleMediaLoad = useCallback((index: number) => {
        mediaLoaded.current[index] = true;
        forceUpdate(x => x + 1);
    }, []);

    const handleNext = useCallback(() => {
        if (post.media && post.media.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % post.media.length);
        }
    }, [post.media]);

    const handlePrev = useCallback(() => {
        if (post.media && post.media.length > 1) {
            setCurrentIndex((prev) => (prev - 1 + post.media.length) % post.media.length);
        }
    }, [post.media]);

    const handleMediaClick = useCallback(() => {
        onMediaClick(currentIndex);
    }, [currentIndex, onMediaClick]);

    const handleDotClick = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    const showNavigation = post.media.length > 1;

    return (
        <div
            className="bg-gray-50 dark:bg-gray-900 relative max-h-[500px] overflow-hidden"
            ref={containerRef}
        >
            {/* Slider container */}
            <div
                className="relative aspect-square w-full h-full overflow-hidden"
                onClick={handleMediaClick}
            >
                {/* Track */}
                <div
                    className="flex h-full w-full transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {post.media.map((media, index) => (
                        <div
                            key={index}
                            className="flex-none w-full h-full flex items-center justify-center bg-black cursor-pointer"
                        >
                            {media.file_type.startsWith('image/') ? (
                                <img
                                    src={`/storage/${media.file_path}`}
                                    alt={media.file_name || 'Post image'}
                                    className={`object-contain w-full h-full transition-opacity duration-300 ${mediaLoaded.current[index] ? 'opacity-100' : 'opacity-0'
                                        }`}
                                    width="500"
                                    height="500"
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    onLoad={() => handleMediaLoad(index)}
                                    style={{ maxHeight: '500px', maxWidth: '100%' }}
                                />
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <video
                                        className="object-contain w-full h-full pointer-events-none transition-opacity duration-300"
                                        style={{
                                            opacity: mediaLoaded.current[index] ? 1 : 0,
                                            maxHeight: '500px',
                                            maxWidth: '100%',
                                        }}
                                        controls={false}
                                        preload="metadata"
                                        muted
                                        playsInline
                                        onLoadedMetadata={() => handleMediaLoad(index)}
                                    >
                                        <source src={`/storage/${media.file_path}`} type={media.file_type} />
                                    </video>

                                    {/* Play icon overlay */}
                                    <div className="absolute p-4 bg-black/30 rounded-full backdrop-blur-sm">
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination dots */}
            {showNavigation && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {post.media.map((_, index) => (
                        <button
                            key={index}
                            className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'
                                }`}
                            onClick={() => handleDotClick(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Navigation arrows */}
            {showNavigation && (
                <>
                    <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-2 text-white backdrop-blur-sm"
                        onClick={handlePrev}
                        aria-label="Previous slide"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-2 text-white backdrop-blur-sm"
                        onClick={handleNext}
                        aria-label="Next slide"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}
        </div>
    );
}