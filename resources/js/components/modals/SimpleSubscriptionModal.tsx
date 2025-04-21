import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Plan {
    id: string;
    interval: string;
    price: number;
    trial_enabled: boolean;
    trial_days: number;
    trial_price: number;
}

interface SimpleSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    creator: User;
    plan: Plan;
    onSuccess?: () => void;
}

export default function SimpleSubscriptionModal({ 
    isOpen, 
    onClose, 
    creator, 
    plan,
    onSuccess 
}: SimpleSubscriptionModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    
    const { post, processing } = useForm({
        plan_id: plan?.id,
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

    if (!plan) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[375px] p-0 overflow-hidden rounded-xl">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-2">
                                <AvatarImage 
                                    src={typeof creator.profile_photo === 'string' ? `/storage/${creator.profile_photo}` : undefined} 
                                    alt={typeof creator.name === 'string' ? creator.name : ''} 
                                />
                                <AvatarFallback>
                                    {typeof creator.name === 'string' ? creator.name.charAt(0).toUpperCase() : '?'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-bold">{typeof creator.name === 'string' ? creator.name : ''}</div>
                                <div className="text-xs text-gray-500">@{typeof creator.username === 'string' ? creator.username : ''}</div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-800"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="text-center mb-4">
                        <div className="text-lg font-bold">
                            Subscribe to {typeof creator.name === 'string' ? creator.name : ''}
                        </div>
                        <div className="text-sm text-gray-500">
                            Limited offer - 75% OFF for 30 days!
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4 text-center">
                        <div className="text-2xl font-bold">
                            ${(plan.price * 0.25).toFixed(2)} <span className="text-sm font-normal">for 30 days</span>
                        </div>
                        <div className="text-sm text-gray-500">
                            Then ${plan.price.toFixed(2)}/month until cancelled
                        </div>
                    </div>

                    <div className="space-y-3 mb-4">
                        <div className="flex items-center">
                            <div className="h-6 w-6 mr-2 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs">✓</div>
                            <span className="text-sm">Full access to this user's content</span>
                        </div>
                        <div className="flex items-center">
                            <div className="h-6 w-6 mr-2 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs">✓</div>
                            <span className="text-sm">Direct message with this user</span>
                        </div>
                        <div className="flex items-center">
                            <div className="h-6 w-6 mr-2 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs">✓</div>
                            <span className="text-sm">Cancel your subscription at any time</span>
                        </div>
                    </div>

                    <Button 
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        onClick={handleSubmit}
                        disabled={isLoading || processing}
                    >
                        SUBSCRIBE NOW
                    </Button>
                    
                    <div className="text-xs text-center mt-2 text-gray-500">
                        By clicking "Subscribe", you agree to our Terms of Service
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
