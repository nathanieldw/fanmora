import { Link } from '@inertiajs/react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import SubscriptionModal from '@/components/modals/SubscriptionModal';

interface SuggestionsSidebarProps {
    user: User;
}

// Simplified user type for suggested users (fallback data)
interface SuggestedUser {
    id: number;
    name: string;
    username?: string;
    profile_photo_url?: string;
}

export default function SuggestionsSidebar({ user }: SuggestionsSidebarProps) {
    const [suggestedUsers, setSuggestedUsers] = useState<(User | SuggestedUser)[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | SuggestedUser | null>(null);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);

    // Toggle follow status for a user
    const toggleFollow = (targetUser: User | SuggestedUser) => {
        setFollowLoading(targetUser.id);
        axios.post(route('users.follow', { user: targetUser.id }))
            .then(response => {
                // If the response includes a redirect_to_subscription action, open the modal
                if (response.data.action === 'redirect_to_subscription') {
                    setSelectedUser(targetUser);
                    // Fetch subscription plans for this creator
                    fetchSubscriptionPlans(targetUser.id);
                    return;
                }

                // Remove user from suggestions if successfully followed
                if (response.data.action === 'followed') {
                    setSuggestedUsers(prev => prev.filter(user => user.id !== targetUser.id));
                }
            })
            .catch(error => {
                // Check if the error contains redirection data
                if (error.response && error.response.data) {
                    const { data } = error.response;

                    if (data.action === 'redirect_to_subscription') {
                        setSelectedUser(targetUser);
                        // Fetch subscription plans for this creator
                        fetchSubscriptionPlans(targetUser.id);
                        return;
                    }
                }

                console.error('Error toggling follow:', error);
            })
            .finally(() => setFollowLoading(null));
    };

    // Fetch subscription plans for a creator
    const fetchSubscriptionPlans = (creatorId: number) => {
        axios.get(route('api.users.subscription.plans', { user: creatorId }))
            .then(response => {
                setSubscriptionPlans(response.data.plans || []);
                setIsSubscriptionModalOpen(true);
            })
            .catch(error => {
                console.error('Error fetching subscription plans:', error);
                // Set default plan if fetch fails
                setSubscriptionPlans([{
                    id: 'free',
                    interval: 'monthly',
                    price: 0,
                    trial_enabled: false,
                    trial_days: 0,
                    trial_price: 0
                }]);
                setIsSubscriptionModalOpen(true);
            });
    };

    // Handle successful subscription - attempt to follow again
    const handleSubscriptionSuccess = () => {
        if (!selectedUser) return;

        setFollowLoading(selectedUser.id);
        axios.post(route('users.follow', { user: selectedUser.id }))
            .then(response => {
                // Should now succeed since payment info is connected
                if (response.data.action === 'followed') {
                    setSuggestedUsers(prev => prev.filter(user => user.id !== selectedUser.id));
                }
            })
            .catch(error => console.error('Error following after subscription:', error))
            .finally(() => {
                setFollowLoading(null);
                setSelectedUser(null);
            });
    };

    useEffect(() => {
        // Fetch random users for suggestions
        const fetchRandomUsers = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/api/users/random');
                if (response.data && response.data.users) {
                    setSuggestedUsers(response.data.users);
                }
            } catch (error) {
                console.error('Error fetching random users:', error);
                // Fallback to dummy data if API fails
                setSuggestedUsers([
                    { id: 1, name: 'e222it', username: 'e222it', profile_photo_url: '/storage/profile-photos/dummy1.jpg' },
                    { id: 2, name: 'jonathanbiote', username: 'jonathanbiote', profile_photo_url: '/storage/profile-photos/dummy2.jpg' },
                    { id: 3, name: 'fabiandamsprive', username: 'fabiandamsprive', profile_photo_url: '/storage/profile-photos/dummy3.jpg' },
                    { id: 4, name: 'emmyspn19', username: 'emmyspn19', profile_photo_url: '/storage/profile-photos/dummy4.jpg' },
                    { id: 5, name: 'noa.mnk', username: 'noa.mnk', profile_photo_url: '/storage/profile-photos/dummy5.jpg' },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRandomUsers();
    }, []);

    return (
        <div className="pt-8 h-full">
            {/* Current User */}
            <div className="flex items-center justify-between mb-6">
                <Link href={route('profile.show', { username: user.username ?? user.id })} className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                        <AvatarImage src={user.profile_photo_url as string} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm">{user.username || user.name}</p>
                        <p className="text-gray-500 text-sm">{user.name}</p>
                    </div>
                </Link>
            </div>

            {/* Suggestions Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-semibold text-sm">Suggested for you</h3>
            </div>

            {/* Suggested Users */}
            <div className="space-y-3">
                {isLoading ? (
                    // Loading state
                    Array(5).fill(0).map((_, index) => (
                        <div key={index} className="flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                <div>
                                    <div className="h-2.5 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                    <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            </div>
                            <div className="h-2.5 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    ))
                ) : suggestedUsers.length > 0 ? (
                    // Display suggested users
                    suggestedUsers.map((suggestedUser) => (
                        <div key={suggestedUser.id} className="flex items-center justify-between">
                            <Link href={route('profile.show', { username: suggestedUser.username ?? suggestedUser.id })} className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={suggestedUser.profile_photo_url as string} alt={suggestedUser.name} />
                                    <AvatarFallback>{suggestedUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-xs">{suggestedUser.username || suggestedUser.name}</p>
                                    <p className="text-gray-500 text-xs">Suggested for you</p>
                                </div>
                            </Link>
                            <button
                                className="text-blue-500 text-xs font-semibold hover:text-blue-800"
                                onClick={() => toggleFollow(suggestedUser)}
                                disabled={followLoading === suggestedUser.id}
                            >
                                {followLoading === suggestedUser.id ? 'Loading...' : 'Follow'}
                            </button>
                        </div>
                    ))
                ) : (
                    // No suggested users found
                    <p className="text-gray-500 text-xs text-center py-2">No suggestions available</p>
                )}
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-gray-400 text-xs">
                <div className="flex flex-wrap gap-x-2 mb-3">
                    <Link href="#" className="hover:underline">About</Link>
                    <span className="mx-1">•</span>
                    <Link href="#" className="hover:underline">Help</Link>
                    <span className="mx-1">•</span>
                    <Link href="#" className="hover:underline">Press</Link>
                    <span className="mx-1">•</span>
                    <Link href="#" className="hover:underline">API</Link>
                    <span className="mx-1">•</span>
                    <Link href="#" className="hover:underline">Jobs</Link>
                    <span className="mx-1">•</span>
                    <Link href="#" className="hover:underline">Privacy</Link>
                    <span className="mx-1">•</span>
                    <Link href="#" className="hover:underline">Terms</Link>
                </div>
                <div className="flex items-center mt-4">
                    <span className="mr-2">© {new Date().getFullYear()} FANMORA</span>
                </div>
            </div>

            {/* Subscription Modal */}
            {selectedUser && (
                <SubscriptionModal
                    isOpen={isSubscriptionModalOpen}
                    onClose={() => {
                        setIsSubscriptionModalOpen(false);
                        setSelectedUser(null);
                    }}
                    creator={selectedUser as User}
                    plans={subscriptionPlans}
                    onSuccess={handleSubscriptionSuccess}
                />
            )}
        </div>
    );
}
