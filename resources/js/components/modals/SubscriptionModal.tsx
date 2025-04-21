import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { User } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import { Check, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import MolliePaymentForm from '@/components/payment/MolliePaymentForm';

interface Plan {
    id: string;
    interval: string;
    price: number;
    trial_enabled: boolean;
    trial_days: number;
    trial_price: number;
}

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    creator: User;
    plans: Plan[];
    onSuccess?: () => void;
}

// Steps in the subscription flow
enum SubscriptionStep {
    PLAN_SELECTION = 'plan_selection',
    PAYMENT_METHOD = 'payment_method',
    CONFIRMATION = 'confirmation',
}

export default function SubscriptionModal({ isOpen, onClose, creator, plans, onSuccess }: SubscriptionModalProps) {
    // State for managing the multi-step flow
    const [currentStep, setCurrentStep] = useState<SubscriptionStep>(SubscriptionStep.PLAN_SELECTION);
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
    const [hasPaymentMethod, setHasPaymentMethod] = useState<boolean>(false);
    const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDiscountedOptions, setShowDiscountedOptions] = useState(false);
    const [showRenewalInfo, setShowRenewalInfo] = useState(false);

    // Define bundle options
    const bundleOptions = [
        { months: 3, discount: '10%', id: 'bundle-3' },
        { months: 6, discount: '15%', id: 'bundle-6' },
        { months: 12, discount: '20%', id: 'bundle-12' },
    ];

    // Update selected plan whenever plans change or modal opens
    useEffect(() => {
        if (plans.length > 0) {
            setSelectedPlan(plans[0].id);
        }

        // Reset states when modal opens
        if (isOpen) {
            setCurrentStep(SubscriptionStep.PLAN_SELECTION);
            setSelectedBundle(null);
            checkForExistingPaymentMethod();
        }
    }, [plans, isOpen]);

    // Check if user already has a payment method
    const checkForExistingPaymentMethod = async () => {
        try {
            const response = await axios.get('/api/payment-methods/default');
            if (response.data.hasPaymentMethod) {
                setHasPaymentMethod(true);
                setPaymentMethodId(response.data.paymentMethodId);
            } else {
                setHasPaymentMethod(false);
                setPaymentMethodId(null);
            }
        } catch (error) {
            console.error('Error checking payment method:', error);
            setHasPaymentMethod(false);
        }
    };

    const { post, processing } = useForm({
        plan_id: selectedPlan,
        bundle_id: selectedBundle,
        payment_method_id: paymentMethodId,
    });

    const handleProceedToPayment = (bundleId: string | null = null) => {
        // If user selected a bundle, store it
        if (bundleId) {
            setSelectedBundle(bundleId);
        }

        // Check if user has payment method
        if (hasPaymentMethod) {
            // Skip payment method step if they already have one
            handleSubscribe();
        } else {
            // Otherwise, move to payment method step
            setCurrentStep(SubscriptionStep.PAYMENT_METHOD);
        }
    };

    const handlePaymentMethodSuccess = (cardToken: string) => {
        setPaymentMethodId(cardToken);
        setHasPaymentMethod(true);
        // Process subscription with the card token
        handleSubscribe();
    };

    const handleSubscribe = async () => {
        setIsLoading(true);

        try {
            // Make an API call to create a payment with the card token
            const response = await axios.post(`/subscribe/${creator.id}`, {
                plan_id: selectedPlan,
                bundle_id: selectedBundle,
                card_token: paymentMethodId,
                method: 'creditcard'
            });

            // Get the checkout URL for 3D Secure authentication from the response
            const checkoutUrl = response.data._links?.checkout?.href;

            if (checkoutUrl) {
                // Redirect to the 3D Secure authentication page
                window.location.href = checkoutUrl;
            } else {
                // If no checkout URL is provided, the payment was successful without 3D Secure
                setIsLoading(false);
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
                toast.success(`Successfully subscribed to ${creator.name}`);
            }
        } catch (error) {
            console.error('Subscription error:', error);
            setIsLoading(false);
            toast.error('Failed to create subscription. Please try again.');
        }
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

    // Calculate total price for bundle
    const calculateBundleTotal = (months: number, discount: string, basePrice: number) => {
        const discountPercent = parseInt(discount) / 100;
        const total = months * basePrice * (1 - discountPercent);
        return Math.round(total);
    };

    // Get base monthly price
    const basePrice = sortedPlans.length > 0 ? sortedPlans[0].price : 10;

    // Get trial information
    const trialPlan = sortedPlans.find(plan => plan.trial_enabled);
    const hasTrial = !!trialPlan;
    const trialDays = trialPlan?.trial_days || 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[390px] p-0 overflow-hidden">
                {/* Creator profile header */}
                <div className="p-6 pb-4 flex items-center justify-between border-b">
                    {currentStep !== SubscriptionStep.PLAN_SELECTION && (
                        <button
                            onClick={() => setCurrentStep(SubscriptionStep.PLAN_SELECTION)}
                            className="mr-2"
                            type="button"
                            aria-label="Go back to plan selection"
                            title="Go back to plan selection"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={(creator.profile_photo_url as string) || ''} alt={creator.name} />
                            <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold flex items-center gap-1">
                                {creator.name}
                                {creator.verified === true && (
                                    <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                    </svg>
                                )}
                            </h3>
                            <p className="text-sm text-gray-500">@{(creator.username as string) || creator.name.toLowerCase().replace(/\s/g, '')}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Method Step */}
                {currentStep === SubscriptionStep.PAYMENT_METHOD && (
                    <div className="p-6">
                        <h2 className="text-lg font-bold mb-4">Connect Payment Method</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Even for free trials, a payment method is required for subscription renewal.
                            Your card will not be charged until your trial ends.
                        </p>

                        <MolliePaymentForm
                            onSuccess={handlePaymentMethodSuccess}
                            onCancel={() => setCurrentStep(SubscriptionStep.PLAN_SELECTION)}
                            isLoading={isLoading}
                            profileId="pfl_tTFEYvmhb6"
                        />
                    </div>
                )}

                {/* Plan Selection Step */}
                {currentStep === SubscriptionStep.PLAN_SELECTION && (
                    <div className="p-6">
                        <h2 className="text-lg font-bold mb-3">Subscribe and get these benefits:</h2>

                        <ul className="space-y-3 mb-5">
                            <li className="flex items-center gap-2">
                                <span className="text-blue-500"><Check size={18} strokeWidth={3} /></span>
                                <span>Full access to this user's content</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-blue-500"><Check size={18} strokeWidth={3} /></span>
                                <span>Direct message with this user</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-blue-500"><Check size={18} strokeWidth={3} /></span>
                                <span>Cancel your subscription at any time</span>
                            </li>
                        </ul>

                        {/* Standard subscription */}
                        <div className="mb-4">
                            <button
                                type="button"
                                className="bg-blue-500 hover:bg-blue-600 text-white text-base rounded-full w-full flex justify-between items-center font-bold max-w-[300px] py-3 px-6"
                                disabled={isLoading || processing}
                                onClick={() => handleProceedToPayment()}
                                aria-label="Subscribe for free trial"
                            >
                                {isLoading ? (
                                    "Processing..."
                                ) : (
                                    <>
                                        <p>SUBSCRIBE</p>
                                        <p>FOR FREE</p>
                                    </>
                                )}
                            </button>

                            <p className="text-sm text-gray-500 mt-2">
                                This subscription renews at ${basePrice}. <button type="button" onClick={() => setShowRenewalInfo(!showRenewalInfo)} className="text-blue-500">Show renewal info</button>
                            </p>

                            {showRenewalInfo && (
                                <div className="mb-2">
                                    <div className="p-4">
                                        <p className="text-sm font-bold">
                                            Renewal info:
                                        </p>
                                        <ul className="list-disc pl-5">
                                            <li className='font-light'>Your subscription will renew at ${basePrice} until you choose to cancel your subscription.</li>
                                            <li className='font-light'>If you cancel your subscription you will still have access until it expires.</li>
                                            <li className='font-light'>Subject to our <a href="/terms" className="text-blue-500">Terms of Service</a>.</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bundles */}
                        <div>
                            <div className="flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => setShowDiscountedOptions(!showDiscountedOptions)}
                                    className="text-sm text-gray-500"
                                >
                                    {showDiscountedOptions ? "Hide options ▲" : "Show discounted options ▼"}
                                </button>
                            </div>

                            {showDiscountedOptions && (
                                <div className="space-y-3 mt-3">
                                    {bundleOptions.map(bundle => {
                                        const totalPrice = calculateBundleTotal(bundle.months, bundle.discount, basePrice);
                                        return (
                                            <div
                                                key={bundle.id}
                                                className="border border-gray-200 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => handleProceedToPayment(bundle.id)}
                                            >
                                                <div>
                                                    <span className="font-medium">{bundle.months} MONTHS</span> <span className="text-green-500">({bundle.discount} off)</span>
                                                </div>
                                                <div>
                                                    <span className="font-bold">${totalPrice} total</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Close button */}
                <div className="p-4 border-t flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-gray-500"
                        disabled={isLoading || processing}
                    >
                        CLOSE
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
