import React from 'react';
import {
    UsersIcon,
    SparklesIcon,
    ChatBubbleLeftRightIcon,
    CameraIcon,
} from '@heroicons/react/24/outline';

const features = [
    {
        name: 'Connect with Others',
        description: 'Follow friends and creators, share your moments, and discover new communities.',
        icon: UsersIcon,
    },
    {
        name: 'Express Yourself',
        description: 'Post photos, videos, and thoughts. Customize your profile to reflect your unique style.',
        icon: SparklesIcon,
    },
    {
        name: 'Engage in Conversations',
        description: 'Comment on posts, send direct messages, and join discussions on topics you love.',
        icon: ChatBubbleLeftRightIcon,
    },
    {
        name: 'Discover Inspiration',
        description: 'Explore a world of content tailored to your interests. Find new hobbies and ideas.',
        icon: CameraIcon,
    },
];

const WelcomeFeatures: React.FC = () => {
    return (
        <section id="features" className="bg-white py-16 md:py-24 dark:bg-gray-900">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base font-semibold leading-7 text-[#00AFF0]">Everything You Need</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                        A Platform Built for Connection
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Fanmora provides the tools to share, connect, and discover in a vibrant social space.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => (
                        <div key={feature.name} className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-[#00AFF0] to-[#8D41D6]">
                                <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <h3 className="mt-6 text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                                {feature.name}
                            </h3>
                            <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WelcomeFeatures;
