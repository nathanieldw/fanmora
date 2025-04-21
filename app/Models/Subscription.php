<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'creator_id',
        'subscriber_id',
        'status',            // 'pending', 'active', 'failed', 'canceled', 'expired'
        'amount',            // Price paid for the subscription
        'subscription_id',   // Legacy field
        'expires_at',        // When the subscription expires
        'payment_id',        // Internal payment ID
        'payment_provider',  // Payment provider (e.g., 'mollie')
        'payment_reference', // Payment reference ID from provider
        'plan_details',      // JSON with plan details or trial info
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'expires_at' => 'datetime',
        'plan_details' => 'array',
    ];

    /**
     * Get the creator of the subscription.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * Get the subscriber of the subscription.
     */
    public function subscriber(): BelongsTo
    {
        return $this->belongsTo(User::class, 'subscriber_id');
    }
}
