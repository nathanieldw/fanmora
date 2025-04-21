import { Button } from '@/components/ui/button';
import { User } from '@/types';

interface Bundle {
    months: number;
    discount: string;
    totalPrice: number;
}

interface Plan {
    id: string;
    interval: string;
    price: number;
    trial_enabled: boolean;
    trial_days: number;
    trial_price: number;
}

interface ProfileSubscriptionCardProps {
    profileUser: User;
    isOwnProfile: boolean;
    isSubscribed: boolean;
    price: number;
    renewal?: string;
    trialPrice?: number;
    trialDays?: number;
    bundles?: Bundle[];
    plans?: Plan[];
    onSubscribe: () => void;
}

export default function ProfileSubscriptionCard({ 
    profileUser, 
    isOwnProfile, 
    isSubscribed, 
    price, 
    renewal, 
    trialPrice = 0, 
    trialDays = 0, 
    bundles = [], 
    plans = [],
    onSubscribe 
}: ProfileSubscriptionCardProps) {
    // Get default plan (usually monthly)
    const defaultPlan = plans.length > 0 
        ? plans.find(plan => plan.interval === 'monthly') || plans[0] 
        : null;
    
    // Use plan values if available, fallback to props
    const displayPrice = defaultPlan ? defaultPlan.price : price;
    const displayTrialDays = defaultPlan && defaultPlan.trial_enabled ? defaultPlan.trial_days : trialDays;
    const hasTrial = displayTrialDays > 0;
    
    // Format price as currency
    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    };
    
    // Don't show subscription card on own profile
    if (isOwnProfile) {
        return null;
    }
    
    return (
        <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Subscription</h3>
            
            {!isSubscribed ? (
                <>
                    <Button 
                        onClick={onSubscribe}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full flex justify-between items-center px-6 py-5 mb-2">
                        <span>Subscribe</span>
                        {hasTrial && <span>Free for {displayTrialDays} days</span>}
                    </Button>
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>Regular price {formatPrice(displayPrice)} /month</span>
                    </div>
                </>
            ) : (
                <div className="w-full bg-green-500 text-white rounded-full flex justify-between items-center px-6 py-3 mb-2">
                    <span>✓ Subscribed</span>
                    {renewal && <span>Renews {renewal}</span>}
                </div>
            )}
        </div>
    );
}
