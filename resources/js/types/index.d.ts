import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    username?: string | null;
    bio?: string | null;
    profile_photo?: string | null;
    cover_photo?: string | null;
    is_creator?: boolean;
    subscription_price?: number | null;
    avatar?: string;
    email_verified_at: string | null;
    is_verified: boolean;
    banner_image?: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Media {
    id: number;
    post_id: number;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    is_premium: boolean;
    is_looping?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Post {
    id: number;
    user_id: number;
    content: string;
    is_premium: boolean;
    likes_count: number;
    comments_count: number;
    created_at: string;
    updated_at: string;
    // Assuming relationships might be loaded:
    user?: User;
    media?: Media[];
    comments?: any[]; // Define Comment type later if needed
    likes?: any[]; // Define Like type later if needed
    [key: string]: unknown;
}

// Generic type for Laravel's default pagination structure
export interface PaginatedData<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    updated_at: string;
    // Relationships (optional based on eager loading)
    sender?: User;
    receiver?: User;
    [key: string]: unknown;
}

export interface Story {
    id: number;
    user_id: number;
    media_path: string;
    media_type: string;
    caption?: string;
    expires_at: string;
    created_at: string;
    updated_at: string;
    // Relationships (optional based on eager loading)
    user?: User;
    [key: string]: unknown;
}
