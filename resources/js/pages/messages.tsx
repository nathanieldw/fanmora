import AppLayout from '@/layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { SharedData } from '@/types';

interface PageProps extends SharedData {
    // Add specific props for Messages page if needed
}

export default function Messages({ auth }: PageProps) {
    return (
        <AppLayout user={auth.user}>
            {/* Header can be added within the page content if needed */}
            <Head title="Messages" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">Messages Page Content Goes Here</div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
