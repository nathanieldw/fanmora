import { useState, useEffect } from 'react';
import { Link, Head, router } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/layouts/AppLayout';
import { Post, SharedData, User } from '@/types';
import ProfileHeaderBar from '@/components/profile/ProfileHeaderBar';
import ProfileBanner from '@/components/profile/ProfileBanner';
import ProfileInfoCard from '@/components/profile/ProfileInfoCard';
import ProfileSubscriptionCard from '@/components/profile/ProfileSubscriptionCard';
import ProfilePostFeed from '@/components/profile/ProfilePostFeed';
import { toast } from 'sonner';

// Extend SharedData with the specific prop passed from the route
interface PageProps extends SharedData {
    profileUser: User;
    userStats?: {
        posts: number;
        media: number;
        streams: number;
    };
}

export default function ShowProfile({ auth, profileUser, userStats = { posts: 0, media: 0, streams: 0 } }: PageProps) {
    // Core data states
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [followersCount, setFollowersCount] = useState<number>(0);
    const [followingCount, setFollowingCount] = useState<number>(0);
    const [postsCount, setPostsCount] = useState<number>(userStats.posts || 0);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [savedPosts, setSavedPosts] = useState<Post[]>([]);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [isAvailableNow, setIsAvailableNow] = useState<boolean>(true);
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

    // Subscription-related states
    const [subscriptionData, setSubscriptionData] = useState({
        price: 30,
        renewal: 'May 17, 2025',
        trialPrice: 15,
        trialDays: 30,
        bundles: [
            { months: 3, discount: '30%', totalPrice: 63 }
        ]
    });
    
    const [subscriptionPlans, setSubscriptionPlans] = useState([
        {
            id: 'monthly',
            interval: 'monthly',
            price: 9.99,
            trial_enabled: true,
            trial_days: 7,
            trial_price: 0
        },
        {
            id: 'yearly',
            interval: 'yearly',
            price: 99.99,
            trial_enabled: true,
            trial_days: 7,
            trial_price: 0
        }
    ]);

    const isOwnProfile = auth.user?.id === profileUser.id;

    // Fetch user data
    useEffect(() => {
        // Fetch follow status and counts
        axios.get(`/api/users/${profileUser.id}/follow-status`)
            .then(response => {
                setIsFollowing(response.data.isFollowing);
                setFollowersCount(response.data.followersCount);
                setFollowingCount(response.data.followingCount);
            })
            .catch(error => console.error('Error fetching follow status:', error));

        // Fetch post count and sample posts
        axios.get(`/api/users/${profileUser.id}/posts`)
            .then(response => {
                setPostsCount(response.data.total);
                setUserPosts(response.data.posts);
            })
            .catch(error => console.error('Error fetching posts:', error));
            
        // Check if user is subscribed to the profile user
        if (!isOwnProfile && auth.user) {
            axios.get(`/api/users/${profileUser.id}/subscription-status`)
                .then(response => {
                    setIsSubscribed(response.data.isSubscribed);
                })
                .catch(error => {
                    console.error('Error fetching subscription status:', error);
                    // Default to false if there's an error
                    setIsSubscribed(false); 
                });
                
            // Fetch subscription plans for the creator
            axios.get(`/api/users/${profileUser.id}/subscription-plans`)
                .then(response => {
                    if (response.data.plans && response.data.plans.length > 0) {
                        setSubscriptionPlans(response.data.plans);
                    }
                })
                .catch(error => {
                    console.error('Error fetching subscription plans:', error);
                });
        }

        // Reset saved posts state when profile changes
        setSavedPosts([]);
        setActiveTab('all');
    }, [profileUser.id, isOwnProfile, auth.user]);
    
    // Create a function to handle successful subscription
    const handleSubscriptionSuccess = () => {
        setIsSubscribed(true);
        toast.success(`You are now subscribed to ${profileUser.name}`);
    };

    return (
        <AppLayout user={auth.user}>
            <Head title={`${profileUser.name}`} />

            <div className="w-full">
                {/* Header */}
                <ProfileHeaderBar 
                    name={profileUser.name} 
                    profileUser={profileUser} 
                    isOwnProfile={isOwnProfile} 
                    isSubscribed={isSubscribed}
                    onSubscriptionSuccess={handleSubscriptionSuccess}
                />

                {/* Banner and Avatar */}
                <ProfileBanner user={profileUser} />

                {/* Info Card (name, username, bio) */}
                <ProfileInfoCard user={profileUser} />

                {/* Subscription Card */}
                <ProfileSubscriptionCard
                    profileUser={profileUser}
                    isOwnProfile={isOwnProfile}
                    isSubscribed={isSubscribed}
                    price={subscriptionData.price}
                    renewal={subscriptionData.renewal}
                    trialPrice={subscriptionData.trialPrice}
                    trialDays={subscriptionData.trialDays}
                    bundles={subscriptionData.bundles}
                    plans={subscriptionPlans}
                    onSubscribe={() => {
                        // Show subscription modal
                        document.getElementById('subscription-trigger-button')?.click();
                    }}
                />

                {/* Post Feed */}
                <ProfilePostFeed posts={userPosts} user={profileUser} />
            </div>
        </AppLayout>
    );
}