<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;

class FollowController extends Controller
{
    /**
     * Toggle follow status for a user
     *
     * @param User $user User to follow/unfollow
     * @return JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function toggle(User $user)
    {
        // Get the authenticated user
        $authUser = Auth::user();
        
        // Prevent following yourself
        if ($authUser->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot follow yourself'
            ], 422);
        }
        
        // Check if already following
        $isFollowing = $authUser->following()->where('followed_id', $user->id)->exists();
        
        if ($isFollowing) {
            // Unfollow logic remains the same
            $authUser->following()->detach($user->id);
            
            // Get updated follower count
            $followerCount = $user->followers()->count();
            
            return response()->json([
                'success' => true,
                'action' => 'unfollowed',
                'followers_count' => $followerCount
            ]);
        } else {
            // For follow actions, check if the user has a payment method
            if (empty($authUser->mollie_customer_id) || empty($authUser->mollie_mandate_id)) {
                // User needs to be redirected to set up payment through subscription process
                // First check if there's an active subscription in progress
                $pendingSubscription = Subscription::where([
                    'subscriber_id' => $authUser->id,
                    'creator_id' => $user->id,
                    'status' => 'pending'
                ])->exists();
                
                if (!$pendingSubscription) {
                    // Return a JSON response that tells the frontend to redirect
                    return response()->json([
                        'success' => false,
                        'action' => 'redirect_to_subscription',
                        'redirect_url' => route('subscription.create', ['creator' => $user->id]),
                        'message' => 'You need to connect a payment method to follow this user'
                    ]);
                }
            }
            
            // Check if there's an active subscription
            $hasActiveSubscription = Subscription::where([
                'subscriber_id' => $authUser->id,
                'creator_id' => $user->id,
                'status' => 'active'
            ])->exists();
            
            if ($hasActiveSubscription) {
                // If subscription is active, create the follow relationship
                $authUser->following()->attach($user->id);
                
                // Get updated follower count
                $followerCount = $user->followers()->count();
                
                return response()->json([
                    'success' => true,
                    'action' => 'followed',
                    'followers_count' => $followerCount
                ]);
            } else {
                // Redirect to subscription page
                return response()->json([
                    'success' => false,
                    'action' => 'redirect_to_subscription',
                    'redirect_url' => route('subscription.create', ['creator' => $user->id]),
                    'message' => 'You need an active subscription to follow this user'
                ]);
            }
        }
    }
    
    /**
     * Check if the authenticated user is following a specific user
     *
     * @param User $user The user to check
     * @return JsonResponse
     */
    public function status(User $user): JsonResponse
    {
        $authUser = Auth::user();
        
        // Check if the authenticated user is following the given user
        $isFollowing = $authUser->following()->where('followed_id', $user->id)->exists();
        
        // Get follower count for the user
        $followersCount = $user->followers()->count();
        
        return response()->json([
            'isFollowing' => $isFollowing,
            'followersCount' => $followersCount
        ]);
    }
}
