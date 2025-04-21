<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    /**
     * Display the welcome page with featured posts
     */
    public function index()
    {
        // Find the official Fanmora account
        $fanmoraAccount = User::where('username', 'fanmora')->first();
        
        // Fetch featured posts (or return empty array if account doesn't exist yet)
        $featuredPosts = [];
        
        if ($fanmoraAccount) {
            $featuredPosts = Post::where('user_id', $fanmoraAccount->id)
                ->with(['user', 'media'])
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($post) {
                    return [
                        'id' => $post->id,
                        'caption' => $post->caption,
                        'created_at' => $post->created_at,
                        'media' => $post->media->map(function ($media) {
                            return [
                                'url' => $media->url,
                                'type' => $media->mime_type,
                            ];
                        }),
                        'user' => [
                            'id' => $post->user->id,
                            'username' => $post->user->username,
                            'name' => $post->user->name,
                            'profile_photo' => $post->user->profile_photo,
                        ],
                    ];
                });
        }
        
        return Inertia::render('welcome', [
            'featuredPosts' => $featuredPosts,
        ]);
    }
}
