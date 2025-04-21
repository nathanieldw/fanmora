import { useState, useEffect } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DollarSign, MessageCircle, Star, Menu } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import TipModal from '@/components/modals/TipModal';
import SubscriptionModal from '@/components/modals/SubscriptionModal';
import axios from 'axios';

interface Plan {
    id: string;
    interval: string;
    price: number;
    trial_enabled: boolean;
    trial_days: number;
    trial_price: number;
}

interface ProfileHeaderBarProps {
    name: string;
    profileUser: User;
    isOwnProfile: boolean;
    isSubscribed?: boolean;
    onSubscriptionSuccess?: () => void;
}

export default function ProfileHeaderBar({ name, profileUser, isOwnProfile, isSubscribed = false, onSubscriptionSuccess }: ProfileHeaderBarProps) {
    const [isTipModalOpen, setIsTipModalOpen] = useState<boolean>(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
    const [subscriptionPlans, setSubscriptionPlans] = useState<Plan[]>([
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
    
    // Fetch subscription plans when modal opens
    useEffect(() => {
        if (isSubscriptionModalOpen && !isOwnProfile) {
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
    }, [isSubscriptionModalOpen, profileUser.id, isOwnProfile]);
    
    const handleMessageClick = async () => {
        if (isOwnProfile) {
            return;
        }
        
        // Check if user is subscribed before allowing to message
        if (!isSubscribed) {
            // Show subscription modal
            setIsSubscriptionModalOpen(true);
            return;
        }
        
        try {
            // Create or get existing conversation
            const response = await axios.post('/api/messages/conversations', {
                recipient_id: profileUser.id
            });
            
            // Navigate to the chat page with the conversation
            const conversationId = response.data.conversation_id;
            router.visit(`/messages/${conversationId}`);
        } catch (error) {
            console.error('Error opening conversation:', error);
            toast.error('Failed to open conversation. Please try again.');
        }
    };
    
    const handleTipClick = () => {
        if (isOwnProfile) {
            return;
        }
        setIsTipModalOpen(true);
    };

    return (
        <>
            <div className="flex items-center p-4 border-b">
                <div className="flex items-center flex-1">
                    <button
                        type="button"
                        onClick={() => window.history.length > 1 ? window.history.back() : router.visit('/dashboard')}
                        className="mr-4"
                        title="Go back"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold">{name}</h1>
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-gray-500 text-sm">Available now</span>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full" 
                        title={isOwnProfile ? "You can't tip yourself" : "Send tip"}
                        onClick={handleTipClick}
                        disabled={isOwnProfile}
                    >
                        <DollarSign className="h-6 w-6" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full" 
                        title={isOwnProfile ? "You can't message yourself" : "Message"}
                        onClick={handleMessageClick}
                        disabled={isOwnProfile}
                    >
                        <MessageCircle className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full" title="More options">
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>
            </div>
            
            {/* Tip Modal */}
            {isTipModalOpen && (
                <TipModal 
                    isOpen={isTipModalOpen} 
                    onClose={() => setIsTipModalOpen(false)} 
                    recipient={profileUser} 
                />
            )}
            
            {/* Hidden button to trigger subscription modal */}
            <button 
                id="subscription-trigger-button" 
                className="hidden" 
                onClick={() => setIsSubscriptionModalOpen(true)}
                aria-hidden="true"
            />
            
            {/* Subscription Modal */}
            {isSubscriptionModalOpen && (
                <SubscriptionModal 
                    isOpen={isSubscriptionModalOpen} 
                    onClose={() => setIsSubscriptionModalOpen(false)} 
                    creator={profileUser}
                    plans={subscriptionPlans}
                    onSuccess={() => {
                        if (onSubscriptionSuccess) {
                            onSubscriptionSuccess();
                        }
                    }}
                />
            )}
        </>
    );
}
