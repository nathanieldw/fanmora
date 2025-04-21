<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Models\StoryView;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class StoryController extends Controller
{
    /**
     * Display a listing of active stories from followed users.
     * Prioritize stories that haven't been viewed by the current user.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // Get authenticated user
        $user = Auth::user();
        
        // Get the IDs of users that the authenticated user follows
        $followedUserIds = $user->following()->pluck('users.id');
        
        // Include the authenticated user's ID to get their stories too
        $followedUserIds->push($user->id);
        
        // Get active stories from followed users
        $users = User::whereIn('id', $followedUserIds)
            ->with(['stories' => function ($query) {
                $query->where('expires_at', '>', Carbon::now())
                      ->orderBy('created_at', 'desc');
            }])
            ->get()
            ->filter(function ($user) {
                return $user->stories->isNotEmpty();
            });

        // Get IDs of stories the user has already viewed
        $viewedStoryIds = StoryView::where('user_id', $user->id)
            ->pluck('story_id')
            ->toArray();
            
        // Sort users so that users with unwatched stories appear first
        $users = $users->sortByDesc(function ($user) use ($viewedStoryIds) {
            // Count unwatched stories for this user
            $unwatchedCount = $user->stories->filter(function ($story) use ($viewedStoryIds) {
                return !in_array($story->id, $viewedStoryIds);
            })->count();
            
            // Return count of unwatched stories (higher priority) plus a small fraction based on story recency
            return $unwatchedCount + (0.001 * $user->stories->max('id'));
        })->values();
        
        return response()->json([
            'stories' => $users,
        ]);
    }
    
    /**
     * Store a newly created story in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'media' => 'required|file|mimes:jpeg,png,jpg,gif,mp4,mov,webm|max:20480', // 20MB max
            'caption' => 'nullable|string|max:500',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $user = Auth::user();
        $media = $request->file('media');
        $mediaType = $media->getMimeType();
        
        // Create a unique filename
        $filename = time() . '_' . uniqid() . '.' . $media->getClientOriginalExtension();
        
        // Store the file
        $path = $media->storeAs('stories', $filename, 'public');
        
        // Calculate expiration time (48 hours from now)
        $expiresAt = Carbon::now()->addHours(48);
        
        // Create the story
        $story = Story::create([
            'user_id' => $user->id,
            'media_path' => $path,
            'media_type' => $mediaType,
            'caption' => $request->caption,
            'expires_at' => $expiresAt,
        ]);
        
        return response()->json([
            'message' => 'Story created successfully',
            'story' => $story,
        ], 201);
    }
    
    /**
     * Mark a story as viewed by the authenticated user.
     *
     * @param  \App\Models\Story  $story
     * @return \Illuminate\Http\Response
     */
    public function markAsViewed(Story $story)
    {
        $user = Auth::user();
        
        // Check if the story is already viewed
        $viewed = $story->views()->where('user_id', $user->id)->exists();
        
        if (!$viewed) {
            // Create a new view record
            $story->views()->create([
                'user_id' => $user->id,
            ]);
        }
        
        return response()->json([
            'message' => 'Story marked as viewed',
            'viewed' => true,
        ]);
    }
    
    /**
     * Remove the specified story from storage.
     *
     * @param  \App\Models\Story  $story
     * @return \Illuminate\Http\Response
     */
    public function destroy(Story $story)
    {
        // Check if the authenticated user is the owner of the story
        if (Auth::id() !== $story->user_id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }
        
        // Delete the story media file
        if (Storage::disk('public')->exists($story->media_path)) {
            Storage::disk('public')->delete($story->media_path);
        }
        
        // Delete the story views
        $story->views()->delete();
        
        // Delete the story
        $story->delete();
        
        return response()->json([
            'message' => 'Story deleted successfully',
        ]);
    }
}
