import { Post, User, Media } from '@/types';

export interface PostCardProps {
    post: Post & { 
        user: User, 
        media?: Media[], 
        likes_count?: number, 
        has_liked?: boolean, 
        has_saved?: boolean 
    };
}

export interface SlideItem {
    type?: 'video';
    sources?: Array<{
        src: string;
        type: string;
    }>;
    poster?: string;
    src?: string;
}
