import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Plan {
    id: string;
    interval: string;
    price: number;
    trial_enabled: boolean;
    trial_days: number;
    trial_price: number;
}

interface SubscriptionConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    creator: User;
    selectedPlan: Plan;
    onSuccess?: () => void;
}

export default function SubscriptionConfirmModal({ 
    isOpen, 
    onClose, 
    creator, 
    selectedPlan,
    onSuccess 
}: SubscriptionConfirmModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    
    const { post, processing } = useForm({
        plan_id: selectedPlan?.id,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        post(route('subscription.store', { creator: creator.id }), {
            onSuccess: () => {
                setIsLoading(false);
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: () => {
                setIsLoading(false);
            }
        });
    };

    const getIntervalLabel = (interval: string) => {
        switch (interval) {
            case 'monthly': return 'month';
            case 'quarterly': return '3 months';
            case 'biannually': return '6 months';
            case 'yearly': return 'year';
            default: return interval;
        }
    };
    
    if (!selectedPlan) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
                <div className="p-4 space-y-4">
                    {/* Creator Header */}
                    <div className="flex items-center space-x-3 pb-2">
                        <Avatar className="h-10 w-10">
                            <AvatarImage 
                                src={creator.profile_photo ? `/storage/${creator.profile_photo}` : undefined} 
                                alt={creator.name} 
                            />
                            <AvatarFallback>
                                {creator.name?.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium flex items-center">
                                {creator.name}
                                {creator.username && (
                                    <span className="text-gray-500 text-sm ml-1">@{creator.username}</span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">@{creator.username}</div>
                        </div>
                    </div>

                    <h2 className="text-center font-medium text-lg">SUBSCRIBE AND GET THESE BENEFITS:</h2>
                    
                    {/* Benefits List */}
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                            <span>Full access to this user's content</span>
                        </div>
                        <div className="flex items-center">
                            <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                            <span>Direct message with this user</span>
                        </div>
                        <div className="flex items-center">
                            <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                            <span>Cancel your subscription at any time</span>
                        </div>
                    </div>

                    {/* Subscription Price */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md text-center">
                        <div className="font-bold text-xl">
                            {formatPrice(selectedPlan.price)} <span className="text-sm font-normal">per {getIntervalLabel(selectedPlan.interval)}</span>
                        </div>
                        {selectedPlan.trial_enabled && (
                            <div className="text-sm text-gray-500 mt-1">
                                {selectedPlan.trial_days} day trial for {formatPrice(selectedPlan.trial_price)}
                            </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                            This subscription renews at ${selectedPlan.price.toFixed(2)} per {getIntervalLabel(selectedPlan.interval)} until cancelled.
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        <Button
                            type="button"
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={isLoading || processing}
                        >
                            SUBSCRIBE
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={onClose}
                            disabled={isLoading || processing}
                        >
                            CLOSE
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
