import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface MediaItem {
    id: number;
    file_path: string;
    file_type?: string;
    is_looping?: boolean;
}

interface PostMediaViewerProps {
    media: MediaItem[];
}

export default function PostMediaViewer({ media }: PostMediaViewerProps) {
    if (!media || media.length === 0) {
        return (
            <div className="p-4 text-gray-500 dark:text-gray-400">No media available</div>
        );
    }

    return (
        <Swiper
            modules={[Pagination, Navigation]}
            pagination={{ clickable: true }}
            navigation={media.length > 1}
            className="w-full"
        >
            {media.map((mediaItem, index) => (
                <SwiperSlide key={mediaItem.id || index}>
                    {mediaItem.file_type?.startsWith('image') ? (
                        <img 
                            src={`/storage/${mediaItem.file_path}`} 
                            alt={`Media ${index}`}
                            className="w-full h-auto object-contain max-h-[70vh]" 
                        />
                    ) : (
                        <video
                            src={`/storage/${mediaItem.file_path}`}
                            controls
                            loop={mediaItem.is_looping}
                            className="w-full h-auto object-contain max-h-[70vh]"
                        />
                    )}
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
