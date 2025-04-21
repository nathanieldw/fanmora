import React, { useState, PropsWithChildren } from 'react';
import { User } from '@/types';
import Authenticated from './AuthenticatedLayout';
import PostCreateModal from '@/components/modals/PostCreateModal';

interface AppLayoutProps {
    user: User;
}

export default function AppLayout({ user, children }: PropsWithChildren<AppLayoutProps>) {
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    const handleCreatePost = () => {
        setIsPostModalOpen(true);
    };

    const handleClosePostModal = () => {
        setIsPostModalOpen(false);
    };

    return (
        <>
            <Authenticated user={user} onCreatePost={handleCreatePost}>
                {children}
            </Authenticated>

            {/* Global Post Creation Modal */}
            <PostCreateModal 
                isOpen={isPostModalOpen}
                onClose={handleClosePostModal}
            />
        </>
    );
}
