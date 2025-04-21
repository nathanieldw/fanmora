<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'bio',
        'profile_photo',
        'cover_photo',
        'banner_image',
        'is_creator',
        'provider_id',   // For OAuth provider's user ID
        'provider_name', // For OAuth provider name (google, twitter, etc.)
        'subscription_price',
        'stripe_account_id',
        'stripe_customer_id',
        'default_greeting_message',
        'default_greeting_media',
        'is_subscription_required',
        'subscription_plans',
        'trial_option',
        'mollie_customer_id',
        'mollie_mandate_id',
        'mollie_first_payment_id',
        'is_verified',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'stripe_account_id',
        'stripe_customer_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_creator' => 'boolean',
        'is_subscription_required' => 'boolean',
        'subscription_plans' => 'array',
        'trial_option' => 'array',
        'subscription_price' => 'decimal:2',
        'default_greeting_media' => 'array',
        'is_verified' => 'boolean',
    ];

    /**
     * Get all posts created by the user.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Get the user's subscription plans formatted for use in forms/APIs
     *
     * @return array The formatted subscription plans
     */
    public function getSubscriptionPlans(): array
    {
        // If the user doesn't have subscription plans set, return an empty array
        if (empty($this->subscription_plans)) {
            return [
                [
                    'id' => 'free',
                    'interval' => 'monthly',
                    'price' => 0,
                    'trial_enabled' => false,
                    'trial_days' => 0,
                    'trial_price' => 0
                ]
            ];
        }

        // Clone the subscription plans to avoid modifying the original
        $plans = $this->subscription_plans;

        // Ensure each plan has an ID
        foreach ($plans as $index => $plan) {
            // If no ID exists, create one based on the interval
            if (!isset($plan['id'])) {
                $plans[$index]['id'] = $plan['interval'] . '_' . uniqid();
            }

            // Ensure trial fields exist
            if (!isset($plan['trial_enabled'])) {
                $plans[$index]['trial_enabled'] = false;
            }

            if (!isset($plan['trial_days'])) {
                $plans[$index]['trial_days'] = 0;
            }

            if (!isset($plan['trial_price'])) {
                $plans[$index]['trial_price'] = 0;
            }
        }

        return $plans;
    }

    /**
     * Get all creators that the user is subscribed to.
     */
    public function subscriptions(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'subscriptions', 'subscriber_id', 'creator_id')
            ->withPivot('status', 'expires_at')
            ->withTimestamps();
    }

    /**
     * Get all subscribers of the creator.
     */
    public function subscribers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'subscriptions', 'creator_id', 'subscriber_id')
            ->withPivot('status', 'expires_at')
            ->withTimestamps();
    }

    /**
     * Get all followers of this user (Instagram-style following)
     */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'followed_id', 'follower_id')
            ->withTimestamps();
    }

    /**
     * Get all users that this user is following (Instagram-style following)
     */
    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'followed_id')
            ->withTimestamps();
    }

    /**
     * Get all messages sent by the user.
     */
    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Get all messages received by the user.
     */
    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    /**
     * Get the latest message sent by this user.
     * Used with constraints in the controller for specific conversations.
     */
    public function latestMessageSent(): HasOne
    {
        return $this->hasOne(Message::class, 'sender_id')->latestOfMany();
    }

    /**
     * Get the latest message received by this user.
     * Used with constraints in the controller for specific conversations.
     */
    public function latestMessageReceived(): HasOne
    {
        return $this->hasOne(Message::class, 'receiver_id')->latestOfMany();
    }

    /**
     * Check if user is subscribed to a creator.
     */
    public function isSubscribedTo(User $creator): bool
    {
        return $this->subscriptions()
            ->where('creator_id', $creator->id)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->exists();
    }

    /**
     * Get all notifications for the user.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id')->orderBy('created_at', 'desc');
    }

    /**
     * Get all unread notifications for the user.
     */
    public function unreadNotifications(): HasMany
    {
        return $this->notifications()->whereNull('read_at');
    }

    /**
     * Get all posts that the user has saved.
     */
    public function savedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'saves', 'user_id', 'post_id')
            ->withTimestamps()
            ->using(Save::class);
    }

    /**
     * Get all stories created by the user.
     */
    public function stories(): HasMany
    {
        return $this->hasMany(Story::class)->orderBy('created_at', 'desc');
    }
}
