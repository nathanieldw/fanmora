import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { User } from '@/types';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';

interface Plan {
    id: string;
    interval: string;
    price: number;
    trial_enabled: boolean;
    trial_days: number;
    trial_price: number;
}

interface SubscriptionFormProps {
    creator: User;
    plans: Plan[];
    user: User;
}

export default function Create({ creator, plans, user }: SubscriptionFormProps) {
    const [selectedPlan, setSelectedPlan] = useState<string>(plans.length > 0 ? plans[0].id : '');
    
    const { post, processing } = useForm({
        plan_id: selectedPlan,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('subscription.store', { creator: creator.id }));
    };

    const getIntervalLabel = (interval: string) => {
        switch (interval) {
            case 'monthly': return 'Monthly';
            case 'quarterly': return 'Quarterly';
            case 'biannually': return 'Biannually';
            case 'yearly': return 'Yearly';
            default: return interval;
        }
    };

    // Sort plans by price
    const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

    return (
        <AuthenticatedLayout user={user}>
            <Head title={`Subscribe to ${creator.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Subscribe to {creator.name}</CardTitle>
                                <CardDescription>
                                    To follow this creator, you need to connect your payment method for a subscription.
                                    {creator.is_subscription_required ? 
                                        ' This creator requires a paid subscription.' : 
                                        ' You can follow with a free subscription, but a payment method is still required.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium">Select a subscription plan</h3>
                                            <RadioGroup 
                                                value={selectedPlan} 
                                                onValueChange={setSelectedPlan}
                                                className="mt-3 space-y-4"
                                            >
                                                {sortedPlans.map((plan) => (
                                                    <div key={plan.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value={plan.id} id={`plan-${plan.id}`} />
                                                            <Label htmlFor={`plan-${plan.id}`} className="flex flex-1 justify-between">
                                                                <span>{getIntervalLabel(plan.interval)}</span>
                                                                <span className="font-semibold">{formatPrice(plan.price)}</span>
                                                            </Label>
                                                        </div>
                                                        
                                                        {plan.trial_enabled && (
                                                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 pl-6">
                                                                {plan.trial_days} day trial for {formatPrice(plan.trial_price)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>

                                        <Separator />

                                        <div className="text-sm">
                                            <p className="font-medium mb-2">Important information:</p>
                                            <ul className="list-disc pl-5 space-y-1 text-gray-500 dark:text-gray-400">
                                                <li>Your credit card will be securely processed by Mollie</li>
                                                <li>Even for free subscriptions, you need to connect a payment method</li>
                                                <li>You can cancel your subscription at any time</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={processing || !selectedPlan}
                                        >
                                            Connect Payment Method
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                            <CardFooter className="flex justify-center text-sm text-gray-500 dark:text-gray-400">
                                Your payment information is securely handled by Mollie
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
