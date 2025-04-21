<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Story extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'media_path',
        'media_type',
        'caption',
        'expires_at'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'viewed',
    ];

    /**
     * Get the user that owns the story.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Get the views for the story.
     */
    public function views(): HasMany
    {
        return $this->hasMany(StoryView::class);
    }
    
    /**
     * Determine if the story has been viewed by the authenticated user.
     *
     * @return bool
     */
    public function getViewedAttribute(): bool
    {
        if (!Auth::check()) {
            return false;
        }
        
        return $this->views()->where('user_id', Auth::id())->exists();
    }
    
    /**
     * Record that the authenticated user has viewed this story.
     *
     * @return bool
     */
    public function markAsViewed(): bool
    {
        if (!Auth::check() || $this->viewed) {
            return false;
        }
        
        $this->views()->create([
            'user_id' => Auth::id(),
        ]);
        
        return true;
    }

    /**
     * Scope a query to only include active stories (not expired).
     */
    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now());
    }

    /**
     * Check if the story is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}
