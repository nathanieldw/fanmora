import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { SharedData, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Extend User type for conversations list if needed
interface ConversationUser extends User {
    latest_message_content?: string;
    latest_message_at?: string;
}

interface PageProps extends SharedData {
    conversations: ConversationUser[];
}

export default function MessagesIndex({ auth, conversations }: PageProps) {

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Messages</h2>}
        >
            <Head title="Messages" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {conversations.length > 0 ? (
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {conversations.map((convoUser) => (
                                        <li key={convoUser.id} className="py-4">
                                            <Link
                                                href={route('messages.show', { user: convoUser.id })}
                                                className="flex items-center space-x-4 group hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md"
                                            >
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={convoUser.profile_photo ?? undefined} alt={convoUser.name} />
                                                    <AvatarFallback>{getInitials(convoUser.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate dark:text-white group-hover:underline">
                                                        {convoUser.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                                        {convoUser.latest_message_content || 'No messages yet'}
                                                    </p>
                                                </div>
                                                <div className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                    {convoUser.latest_message_at ? dayjs(convoUser.latest_message_at).fromNow(true) : ''}
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>You have no active conversations.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
