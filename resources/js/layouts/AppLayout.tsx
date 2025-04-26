import React, { useState, PropsWithChildren } from 'react';
import { User } from '@/types';
import Authenticated from './AuthenticatedLayout';

interface AppLayoutProps {
    user: User;
}

export default function AppLayout({ user, children }: PropsWithChildren<AppLayoutProps>) {
    return (
        <>
            <Authenticated user={user}>
                {children}
            </Authenticated>
        </>
    );
}
