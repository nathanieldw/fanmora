<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Like;
use App\Models\Media;
use App\Models\Post;
use App\Models\Save;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PostController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $posts = Post::with(['user', 'media', 'comments', 'likes'])->latest()->paginate(20);
        
        // Add likes_count, has_liked, and has_saved flags to each post
        $posts->through(function ($post) use ($user) {
            $post->likes_count = $post->likes->count();
            $post->has_liked = $post->likes->contains('user_id', $user->id);
            $post->has_saved = $post->saves->contains('user_id', $user->id);
            return $post;
        });
        
        return Inertia::render('dashboard', [
            'posts' => $posts
        ]);
    }

    public function show(Post $post)
    {
        $user = Auth::user();
        $post->load(['user', 'media', 'comments.user', 'likes', 'saves']);
        
        // Add engagement flags
        $post->likes_count = $post->likes->count();
        $post->has_liked = $post->likes->contains('user_id', $user->id);
        $post->has_saved = $post->saves->contains('user_id', $user->id);
        
        return Inertia::render('post', [
            'post' => $post
        ]);
    }

    /**
     * Store a newly created post in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate content OR media array is required
        $validated = $request->validate([
            // Content is required only if no media is present
            'content' => [Rule::requiredIf(!$request->hasFile('media')), 'nullable', 'string', 'max:5000'],
            // Media array validation (optional, max 10 files example)
            'media' => ['nullable', 'array', 'max:10'],
            // Validate each file in the media array
            'media.*' => ['required', 'file', 'mimes:jpg,jpeg,png,gif,mp4,webm', 'max:20480'], // Max 20MB per file
            // is_looping applies to all videos in this post
            'is_looping' => ['nullable', 'boolean'],
            'is_premium' => 'boolean',
        ]);

        // Create the post first
        $post = Post::create([
            'user_id' => Auth::id(),
            'content' => $validated['content'] ?? null,
            'is_premium' => $validated['is_premium'] ?? false,
        ]);

        // Handle media uploads if present
        if ($request->hasFile('media')) {
            $loopingFlag = $validated['is_looping'] ?? false; // Get looping flag once

            foreach ($request->file('media') as $file) {
                if ($file->isValid()) { // Check if file is valid
                    $path = $file->store('posts', 'public');
                    $type = $file->getMimeType();

                    Media::create([
                        'post_id' => $post->id,
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'file_type' => $type,
                        'file_size' => $file->getSize(),
                        // Apply looping flag only if it's a video
                        'is_looping' => str_starts_with($type, 'video/') ? $loopingFlag : false,
                    ]);
                }
            }
        }

        // Redirect to the dashboard (feed) after successful creation
        return redirect()->route('dashboard')->with('success', 'Post created successfully!');
    }
    
    /**
     * Like or unlike a post
     */
    public function like($id): JsonResponse
    {
        $post = Post::findOrFail($id);
        $user = Auth::user();
        
        // Check if the user has already liked the post
        $like = Like::where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->first();
            
        if ($like) {
            // Unlike - remove the like
            $like->delete();
            $action = 'unliked';
        } else {
            // Like - create a new like
            Like::create([
                'user_id' => $user->id,
                'post_id' => $post->id
            ]);
            $action = 'liked';
        }
        
        // Return the current like status and count
        return response()->json([
            'success' => true,
            'action' => $action,
            'likes_count' => $post->fresh()->likes()->count()
        ]);
    }
    
    /**
     * Save or unsave a post
     */
    public function save($id): JsonResponse
    {
        $post = Post::findOrFail($id);
        $user = Auth::user();
        
        // Check if the user has already saved the post
        $save = Save::where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->first();
            
        if ($save) {
            // Unsave - remove the save
            $save->delete();
            $action = 'unsaved';
        } else {
            // Save - create a new save
            Save::create([
                'user_id' => $user->id,
                'post_id' => $post->id
            ]);
            $action = 'saved';
        }
        
        return response()->json([
            'success' => true,
            'action' => $action
        ]);
    }
    
    /**
     * Add a comment to a post
     */
    public function comment(Request $request, $id): JsonResponse
    {
        $post = Post::findOrFail($id);
        
        $validated = $request->validate([
            'content' => 'required|string|max:1000'
        ]);
        
        $comment = Comment::create([
            'user_id' => Auth::id(),
            'post_id' => $post->id,
            'content' => $validated['content']
        ]);
        
        // Load the user data to return with the comment
        $comment->load('user');
        
        return response()->json([
            'success' => true,
            'comment' => $comment
        ]);
    }

    /**
     * Display the explore page with search and trending posts
     */
    public function explore(Request $request)
    {
        // Get search query if present
        $query = $request->input('q');
        
        if ($query) {
            // Search posts by caption or user name/username
            $posts = Post::with(['user', 'media', 'likes', 'comments'])
                ->where(function (Builder $queryBuilder) use ($query) {
                    // Search in post caption
                    $queryBuilder->where('content', 'like', '%' . $query . '%')
                        // Or search by user's name or username
                        ->orWhereHas('user', function (Builder $userQuery) use ($query) {
                            $userQuery->where('name', 'like', '%' . $query . '%')
                                ->orWhere('username', 'like', '%' . $query . '%');
                        });
                })
                ->latest()
                ->paginate(24);
                
            // Also search for users if query isn't empty
            $users = User::where('name', 'like', '%' . $query . '%')
                ->orWhere('username', 'like', '%' . $query . '%')
                ->limit(5)
                ->get();
        } else {
            // Show trending posts (posts with most likes and comments)
            $posts = Post::with(['user', 'media', 'likes', 'comments'])
                ->withCount(['likes', 'comments'])
                ->orderByDesc('likes_count')
                ->orderByDesc('comments_count')
                ->paginate(24);
                
            // Show suggested users (could be based on various factors)
            $users = User::withCount('followers')
                ->orderByDesc('followers_count')
                ->limit(5)
                ->get();
        }
        
        return Inertia::render('explore', [
            'posts' => $posts,
            'users' => $users,
            'query' => $query
        ]);
    }
    
    /**
     * Show a single post with recommended posts for Instagram-style modal view.
     *
     * @param Post $post
     * @return \Illuminate\Http\JsonResponse
     */
    public function showWithRecommendations(Post $post)
    {
        // Load post with all relations
        $post->load(['user', 'media', 'likes', 'comments.user']);
        
        // Track if current user has liked or saved the post
        $user = Auth::user();
        if ($user) {
            $post->has_liked = $post->likes->contains('user_id', $user->id);
            $post->has_saved = $post->saves()->where('user_id', $user->id)->exists();
        }
        
        // Get recommended posts (posts by same user or with similar tags)
        $recommendedPosts = Post::with(['user', 'media'])
            ->where(function ($query) use ($post) {
                // Posts by the same user (excluding the current post)
                $query->where('user_id', $post->user_id)
                    ->where('id', '!=', $post->id);
                
                // Or posts with similar tags/content could be added here
                // For now, just get some recent posts if not enough from same user
            })
            ->orWhere(function ($query) use ($post) {
                $query->where('id', '!=', $post->id)
                    ->orderBy('created_at', 'desc');
            })
            ->withCount(['likes', 'comments'])
            ->limit(12)
            ->get();
            
        // Track if current user has liked or saved each recommended post
        if ($user) {
            foreach ($recommendedPosts as $recPost) {
                $recPost->has_liked = $recPost->likes()->where('user_id', $user->id)->exists();
                $recPost->has_saved = $recPost->saves()->where('user_id', $user->id)->exists();
            }
        }
        
        return response()->json([
            'post' => $post,
            'recommendedPosts' => $recommendedPosts
        ]);
    }
    
    /**
     * Get posts for a specific user's profile page
     *
     * @param User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserPosts(User $user)
    {
        // Get the current authenticated user
        $authUser = Auth::user();
        
        // Get posts by the user with media and counts
        $posts = Post::with(['media'])
            ->where('user_id', $user->id)
            ->latest() // Order by newest first
            ->paginate(12); // Limit to 12 posts per page
            
        // Add like and save status for each post
        foreach ($posts as $post) {
            $post->likes_count = $post->likes()->count();
            $post->comments_count = $post->comments()->count();
            
            if ($authUser) {
                $post->has_liked = $post->likes()->where('user_id', $authUser->id)->exists();
                $post->has_saved = $post->saves()->where('user_id', $authUser->id)->exists();
            }
        }
        
        // Get total count of posts for this user
        $totalPosts = Post::where('user_id', $user->id)->count();
        
        return response()->json([
            'posts' => $posts->items(), // Get just the items without pagination metadata
            'total' => $totalPosts,
            'has_more' => $posts->hasMorePages(),
            'next_page' => $posts->nextPageUrl()
        ]);
    }
    
    /**
     * Get saved posts for the authenticated user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSavedPosts()
    {
        // Get the current authenticated user
        $user = Auth::user();
        
        // Get posts saved by the user
        $savedPosts = $user->savedPosts()
            ->with(['user', 'media'])
            ->latest() // Order by newest saved first
            ->paginate(12);
            
        // Add like and save status for each post
        foreach ($savedPosts as $post) {
            $post->likes_count = $post->likes()->count();
            $post->comments_count = $post->comments()->count();
            $post->has_liked = $post->likes()->where('user_id', $user->id)->exists();
            $post->has_saved = true; // These are saved posts, so this is always true
        }
        
        // Get total count of saved posts
        $totalSaved = $user->savedPosts()->count();
        
        return response()->json([
            'posts' => $savedPosts->items(),
            'total' => $totalSaved,
            'has_more' => $savedPosts->hasMorePages(),
            'next_page' => $savedPosts->nextPageUrl()
        ]);
    }
}
