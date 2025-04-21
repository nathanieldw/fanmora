import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { SharedData, User, Message, PaginatedData } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/ui/InputError';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { FormEventHandler, useEffect, useRef } from 'react';
import dayjs from 'dayjs';

// Extend Message type if needed to ensure sender/receiver are always User objects
interface ChatMessage extends Message {
    sender: User;
    receiver: User;
}

interface PageProps extends SharedData {
    recipient: User;
    messages: PaginatedData<ChatMessage>;
}

export default function MessagesChat({ auth, recipient, messages }: PageProps) {
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        content: '',
    });

    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling to bottom

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        // Scroll to bottom when component mounts or messages change
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Clear form on successful send
        if (recentlySuccessful) {
            reset('content');
            // Optionally re-fetch messages or rely on Inertia's reload
        }
    }, [recentlySuccessful, reset]);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Post to the store route for this specific user conversation
        post(route('messages.store', { user: recipient.id }), {
            preserveScroll: true, // Keep scroll position after submit
            onSuccess: () => { // Clear textarea on success is handled by useEffect
                scrollToBottom(); // Ensure view scrolls down after sending
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <Link href={route('messages.index')} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </Link>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={recipient.profile_photo ?? undefined} alt={recipient.name} />
                        <AvatarFallback>{getInitials(recipient.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">{recipient.name}</span>
                </div>
            }
        >
            <Head title={`Chat with ${recipient.name}`} />

            <div className="flex flex-col h-[calc(100vh-var(--header-height)-var(--footer-height))]"> {/* Adjust height calculation as needed */}
                {/* Message Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* TODO: Add button/logic to load more messages (pagination) */}
                    {messages.data.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender_id === auth.user.id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex items-end max-w-xs lg:max-w-md ${message.sender_id === auth.user.id ? 'flex-row-reverse' : 'flex-row'}`}>
                                {message.sender_id !== auth.user.id && (
                                    <Avatar className="h-6 w-6 mr-2 mb-1 self-start shrink-0">
                                        <AvatarImage src={message.sender.profile_photo ?? undefined} alt={message.sender.name} />
                                        <AvatarFallback>{getInitials(message.sender.name)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={`p-3 rounded-lg ${message.sender_id === auth.user.id
                                        ? 'bg-blue-500 text-white rounded-br-none'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap break-words">
                                        {message.content}
                                    </p>
                                    <span className="text-xs opacity-75 block mt-1 text-right">
                                        {dayjs(message.created_at).format('h:mm A')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} /> {/* Anchor for scrolling */}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <form onSubmit={submit} className="flex items-center space-x-3">
                        <Textarea
                            id="content"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            placeholder={`Message ${recipient.name}`}
                            className="flex-1 resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
                            rows={1}
                            required
                            onKeyDown={(e) => {
                                // Submit on Enter, new line on Shift+Enter
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    submit(e as any); // Type assertion might be needed
                                }
                            }}
                        />
                        <Button type="submit" disabled={processing || !data.content.trim()} size="icon">
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </Button>
                    </form>
                    <InputError message={errors.content} className="mt-2" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
