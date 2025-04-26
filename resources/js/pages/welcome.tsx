
import WelcomeFeatures from '@/components/welcome/WelcomeFeatures';
import WelcomeFeaturedPosts from '@/components/welcome/WelcomeFeaturedPosts';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import WelcomeHero from '@/components/welcome/WelcomeHero';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

interface WelcomePageProps extends SharedData {
    featuredPosts: {
        id: number;
        caption: string;
        media: {
            url: string;
            type: string;
        }[];
        created_at: string;
        user: {
            id: number;
            username: string;
            name: string;
            profile_photo: string;
        };
    }[];
}

export default function Welcome() {
    const { auth, featuredPosts } = usePage<WelcomePageProps>().props;

    return (
        <>
            <Head title="Welcome">
                {/* add meta tags */}
                <meta name="description" content="Connect with like-minded people and share your passions" />
                <meta name="keywords" content="fanmora, social media, connect, like-minded, passions" />
                <meta name="author" content="Fanmora" />
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
                {/* Hero section with login form */}
                <WelcomeHero />

                {/* Featured Posts Section */}
                {featuredPosts && featuredPosts.length > 0 ? (
                    <WelcomeFeaturedPosts featuredPosts={featuredPosts} />
                ) : (
                    <div className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black relative overflow-hidden">
                        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#00AFF0]/5 to-[#8D41D6]/5 transform -translate-x-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-[#00AFF0]/5 to-[#8D41D6]/5 transform translate-x-1/3 translate-y-1/3"></div>

                        <div className="container mx-auto px-6 relative z-10">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
                                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#00AFF0] to-[#8D41D6]">Platform</span> Features
                            </h2>
                            <WelcomeFeatures />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
