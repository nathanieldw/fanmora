<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Mollie\Laravel\Facades\Mollie;

class SubscriptionController extends Controller
{
    public function index()
    {
        $subscriptions = Auth::user()->subscriptions()->with('creator')->get();
        return Inertia::render('subscriptions', [
            'subscriptions' => $subscriptions
        ]);
    }
    
    /**
     * Show the form for creating a new subscription
     * 
     * @param User $creator
     * @return \Inertia\Response
     */
    public function create(User $creator)
    {
        $user = Auth::user();
        $plans = $creator->getSubscriptionPlans();
        
        return Inertia::render('Subscription/Create', [
            'creator' => $creator,
            'plans' => $plans,
            'user' => $user
        ]);
    }
    
    /**
     * Get subscription plans for a specific user
     *
     * @param User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPlans(User $user)
    {
        $plans = $user->getSubscriptionPlans();
        
        return response()->json([
            'success' => true,
            'plans' => $plans
        ]);
    }

    public function store(Request $request, User $creator)
    {
        // Validate the request
        $validated = $request->validate([
            'plan_id' => 'sometimes|string',  // Optional if selecting a specific plan
            'trial' => 'sometimes|boolean',   // Whether to use the trial option
        ]);
        
        // Get current user
        $user = Auth::user();
        
        // Check if creator requires payment for subscription
        if (!$creator->is_subscription_required) {
            // Free subscription - still create a €0.00 payment to verify card
            // Ensure we're passing a User model instance
            if ($user instanceof \App\Models\User) {
                return $this->createFreeSubscription($user, $creator);
            }
            
            // This should never happen if auth middleware is properly configured
            return redirect()->back()->with('error', 'Authentication error. Please try again.');
        }
        
        // Find the requested or default subscription plan
        $subscriptionPlans = $creator->subscription_plans;
        $plan = null;
        
        if (!empty($validated['plan_id'])) {
            // Find the specific plan by ID
            foreach ($subscriptionPlans as $p) {
                if (isset($p['id']) && $p['id'] === $validated['plan_id']) {
                    $plan = $p;
                    break;
                }
            }
        }
        
        // If no specific plan found or requested, use the default plan
        if (!$plan) {
            foreach ($subscriptionPlans as $p) {
                if (isset($p['is_default']) && $p['is_default']) {
                    $plan = $p;
                    break;
                }
            }
        }
        
        // If still no plan found, use the first plan
        if (!$plan && count($subscriptionPlans) > 0) {
            $plan = $subscriptionPlans[0];
        }
        
        // Check if a trial is being used
        $useTrial = $request->boolean('trial') && 
                   isset($creator->trial_option['enabled']) && 
                   $creator->trial_option['enabled'];
        
        // Determine the amount and period
        if ($useTrial) {
            $amount = $creator->trial_option['price'] ?? 0;
            $days = $creator->trial_option['duration_days'] ?? 7;
            $expiresAt = now()->addDays($days);
            $description = "Trial subscription to {$creator->name} for {$days} days";
        } else {
            // Regular subscription based on the selected plan
            $amount = $plan['price'] ?? 0;
            $interval = $plan['interval'] ?? 'monthly';
            
            switch ($interval) {
                case 'quarterly':
                    $expiresAt = now()->addMonths(3);
                    break;
                case 'biannually':
                    $expiresAt = now()->addMonths(6);
                    break;
                case 'yearly':
                    $expiresAt = now()->addYear();
                    break;
                default: // monthly
                    $expiresAt = now()->addMonth();
            }
            
            $description = "Subscription to {$creator->name} ({$interval})";
        }
        
        // Create a pending subscription
        $subscription = Subscription::create([
            'creator_id' => $creator->id,
            'subscriber_id' => $user->id,
            'status' => 'pending',
            'amount' => $amount,
            'expires_at' => $expiresAt,
            'plan_details' => $useTrial ? ['trial' => true] : $plan,
        ]);
        
        // Generate a unique ID for the payment
        $paymentId = "sub_{$subscription->id}_" . Str::random(8);
        
        try {
            // Create Mollie payment, even for €0.00 to verify payment method
            $payment = Mollie::api()->payments->create([
                'amount' => [
                    'currency' => 'EUR',
                    'value' => number_format($amount, 2, '.', ''), // Format as '0.00'
                ],
                'description' => $description,
                'redirectUrl' => route('subscription.callback', ['subscription' => $subscription->id]),
                'webhookUrl' => route('subscription.webhook'),
                'metadata' => [
                    'subscription_id' => $subscription->id,
                    'payment_id' => $paymentId,
                ],
            ]);
            
            // Update subscription with payment reference
            $subscription->update([
                'payment_id' => $paymentId,
                'payment_provider' => 'mollie',
                'payment_reference' => $payment->id,
            ]);
            
            // Redirect to Mollie payment page
            return redirect()->away($payment->getCheckoutUrl());
            
        } catch (\Exception $e) {
            Log::error('Mollie payment creation failed: ' . $e->getMessage());
            
            // Mark subscription as failed
            $subscription->update(['status' => 'failed']);
            
            return redirect()->back()->with('error', 'Payment processing failed. Please try again later.');
        }
    }
    
    /**
     * Create a free subscription with a €0.00 payment for card verification
     * 
     * @param User $subscriber The user subscribing
     * @param User $creator The creator being subscribed to
     * @return \Illuminate\Http\RedirectResponse
     */
    protected function createFreeSubscription(User $subscriber, User $creator)
    {
        // Create subscription
        $subscription = Subscription::create([
            'creator_id' => $creator->id,
            'subscriber_id' => $subscriber->id,
            'status' => 'pending',
            'amount' => 0,
            'expires_at' => now()->addYears(10), // Essentially permanent for free subscriptions
        ]);
        
        // Generate a unique ID for the payment
        $paymentId = "free_sub_{$subscription->id}_" . Str::random(8);
        
        try {
            // Create a €0.00 Mollie payment to verify card
            $payment = Mollie::api()->payments->create([
                'amount' => [
                    'currency' => 'EUR',
                    'value' => '0.00',
                ],
                'description' => "Free subscription to {$creator->name} (card verification)",
                'redirectUrl' => route('subscription.free_callback', ['subscription' => $subscription->id]),
                'webhookUrl' => route('subscription.webhook'),
                'metadata' => [
                    'subscription_id' => $subscription->id,
                    'payment_id' => $paymentId,
                    'free_subscription' => true,
                ],
            ]);
            
            // Update subscription with payment reference
            $subscription->update([
                'payment_id' => $paymentId,
                'payment_provider' => 'mollie',
                'payment_reference' => $payment->id,
            ]);
            
            // Redirect to Mollie payment page
            return redirect()->away($payment->getCheckoutUrl());
            
        } catch (\Exception $e) {
            Log::error('Mollie free subscription verification failed: ' . $e->getMessage());
            
            // Mark subscription as failed
            $subscription->update(['status' => 'failed']);
            
            return redirect()->back()->with('error', 'Payment verification failed. Please try again later.');
        }
    }
    
    /**
     * Handle payment callback for regular subscriptions
     */
    public function handleCallback(Request $request, Subscription $subscription)
    {
        // Check payment status with Mollie
        try {
            $payment = Mollie::api()->payments->get($subscription->payment_reference);
            $user = $subscription->subscriber;
            
            if ($payment->isPaid()) {
                // Payment succeeded, activate the subscription
                $subscription->update(['status' => 'active']);
                
                // Store Mollie customer information if this is the user's first payment
                $this->storeCustomerDetails($user, $payment);
                
                return redirect()->route('profile.show', $subscription->creator->username)
                                ->with('success', 'Subscription activated successfully!');
            } else {
                // Payment failed or canceled
                $subscription->update(['status' => 'failed']);
                return redirect()->route('profile.show', $subscription->creator->username)
                                ->with('error', 'Subscription payment was not completed.');
            }
            
        } catch (\Exception $e) {
            Log::error('Payment verification failed: ' . $e->getMessage());
            return redirect()->route('profile.show', $subscription->creator->username)
                            ->with('error', 'Payment verification failed. Please try again later.');
        }
    }
    
    /**
     * Handle free subscription callback
     */
    public function handleFreeCallback(Request $request, Subscription $subscription)
    {
        // Check payment status with Mollie
        try {
            $payment = Mollie::api()->payments->get($subscription->payment_reference);
            $user = $subscription->subscriber;
            
            if ($payment->isPaid() || $payment->isCanceled() || $payment->isExpired()) {
                // For free subscriptions, we just need the card to be verified
                // Even if the payment is canceled, we can still activate the free subscription
                $subscription->update(['status' => 'active']);
                
                // Store Mollie customer information if this is the user's first payment
                // For free subscriptions, we still store this information from the verification
                if ($payment->isPaid()) {
                    $this->storeCustomerDetails($user, $payment);
                }
                
                return redirect()->route('profile.show', $subscription->creator->username)
                                ->with('success', 'You are now following this creator!');
            } else {
                // Something unusual happened
                return redirect()->route('profile.show', $subscription->creator->username)
                                ->with('error', 'Follow request could not be processed. Please try again.');
            }
            
        } catch (\Exception $e) {
            Log::error('Free subscription verification failed: ' . $e->getMessage());
            return redirect()->route('profile.show', $subscription->creator->username)
                            ->with('error', 'Follow request failed. Please try again later.');
        }
    }
    
    /**
     * Handle Mollie webhook
     */
    public function handleWebhook(Request $request)
    {
        try {
            // Get payment ID from Mollie
            $paymentId = $request->input('id');
            if (!$paymentId) {
                return response('Payment ID not provided', 400);
            }
            
            // Fetch payment details from Mollie
            $payment = Mollie::api()->payments->get($paymentId);
            $subscriptionId = $payment->metadata->subscription_id ?? null;
            
            if (!$subscriptionId) {
                return response('Subscription ID not found in metadata', 400);
            }
            
            // Find the subscription
            $subscription = Subscription::find($subscriptionId);
            if (!$subscription) {
                return response('Subscription not found', 404);
            }
            
            // Update subscription status based on payment status
            if ($payment->isPaid()) {
                $subscription->update(['status' => 'active']);
                
                // Store Mollie customer information if this is the user's first payment
                $this->storeCustomerDetails($subscription->subscriber, $payment);
            } elseif ($payment->isFailed() || $payment->isCanceled() || $payment->isExpired()) {
                // For free subscriptions, we might still want to activate
                if ($subscription->amount == 0 && isset($payment->metadata->free_subscription)) {
                    $subscription->update(['status' => 'active']);
                } else {
                    $subscription->update(['status' => 'failed']);
                }
            }
            
            return response('Webhook processed', 200);
            
        } catch (\Exception $e) {
            Log::error('Webhook processing error: ' . $e->getMessage());
            return response('Webhook processing failed: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Store Mollie customer details for the user
     */
    protected function storeCustomerDetails(User $user, $payment)
    {
        try {
            // Only store details if the user doesn't already have them
            if (empty($user->mollie_customer_id)) {
                // Get the customer ID from the payment
                $customerId = $payment->customerId ?? null;
                
                // If no customer ID in payment, create a new customer
                if (empty($customerId)) {
                    $customer = Mollie::api()->customers->create([
                        'name' => $user->name,
                        'email' => $user->email,
                    ]);
                    $customerId = $customer->id;
                }
                
                // Get the mandate (payment method) if available
                $mandateId = null;
                if ($customerId) {
                    $mandates = Mollie::api()->customers->get($customerId)->mandates();
                    if (count($mandates) > 0) {
                        foreach ($mandates as $mandate) {
                            if ($mandate->status == 'valid') {
                                $mandateId = $mandate->id;
                                break;
                            }
                        }
                    }
                }
                
                // Store the details in the user record
                $user->update([
                    'mollie_customer_id' => $customerId,
                    'mollie_mandate_id' => $mandateId,
                    'mollie_first_payment_id' => $payment->id,
                ]);
            }
        } catch (\Exception $e) {
            // Log but don't fail the subscription if customer storage fails
            Log::error('Failed to store Mollie customer details: ' . $e->getMessage());
        }
    }
}
