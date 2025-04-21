<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    /**
     * Display a list of conversations.
     */
    public function index(): Response
    {
        $userId = Auth::id();
        $currentUser = Auth::user();

        // Get distinct user IDs the current user has exchanged messages with
        $conversationUserIds = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->selectRaw('CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as user_id', [$userId])
            ->distinct()
            ->pluck('user_id');

        // Get users the current user is following (for creating new conversations)
        $followingUserIds = $currentUser->following()->pluck('users.id');
        
        // Get users following the current user
        $followerUserIds = $currentUser->followers()->pluck('users.id');
        
        // Combine all IDs, removing duplicates
        $allUserIds = $conversationUserIds->merge($followingUserIds)->unique();

        // Eager load users with their latest message in either direction
        $query = User::whereIn('id', $allUserIds->count() > 0 ? $allUserIds : [0])
             ->with(['latestMessageSent' => function ($query) use ($userId) {
                 $query->where('receiver_id', $userId)->latest();
             }, 'latestMessageReceived' => function ($query) use ($userId) {
                 $query->where('sender_id', $userId)->latest();
             }]);
            
        // Safely handle potentially empty IN clauses
        $query->addSelect([
                'has_conversation' => DB::raw(
                    $conversationUserIds->isEmpty() 
                        ? '0' 
                        : 'CASE WHEN id IN (' . $conversationUserIds->implode(',') . ') THEN 1 ELSE 0 END'
                ),
                'is_following' => DB::raw(
                    $followingUserIds->isEmpty() 
                        ? '0' 
                        : 'CASE WHEN id IN (' . $followingUserIds->implode(',') . ') THEN 1 ELSE 0 END'
                ),
                'is_follower' => DB::raw(
                    $followerUserIds->isEmpty() 
                        ? '0' 
                        : 'CASE WHEN id IN (' . $followerUserIds->implode(',') . ') THEN 1 ELSE 0 END'
                ),
                'latest_message_content' => Message::select('content')
                    ->where(function ($query) use ($userId) {
                        $query->whereColumn('sender_id', 'users.id')->where('receiver_id', $userId);
                    })
                    ->orWhere(function ($query) use ($userId) {
                        $query->whereColumn('receiver_id', 'users.id')->where('sender_id', $userId);
                    })
                    ->latest()
                    ->limit(1),
                'latest_message_at' => Message::select('created_at')
                    ->where(function ($query) use ($userId) {
                        $query->whereColumn('sender_id', 'users.id')->where('receiver_id', $userId);
                    })
                    ->orWhere(function ($query) use ($userId) {
                         $query->whereColumn('receiver_id', 'users.id')->where('sender_id', $userId);
                    })
                   ->latest()
                   ->limit(1),
                'has_unread_messages' => Message::selectRaw('COUNT(*)')
                    ->where('sender_id', DB::raw('users.id'))
                    ->where('receiver_id', $userId)
                    ->where('is_read', false)
                    ->limit(1)
            ])
           ->when(!$conversationUserIds->isEmpty(), function ($query) {
               // If there are active conversations, prioritize them
               $query->orderByDesc('latest_message_at');
           }, function ($query) {
               // Otherwise, just order by name
               $query->orderBy('name');
           });
           
        // Get the final result
        $users = $query->get()
           ->each(function ($user) {
               // For display purposes - get profile photo URL
               $user->profile_photo_url = $user->profile_photo 
                   ? asset('storage/' . $user->profile_photo)
                   : 'https://ui-avatars.com/api/?name=' . urlencode($user->name) . '&color=7F9CF5&background=EBF4FF';
           });


        return Inertia::render('Messages/Index', [
            'conversations' => $users,
            'canInitiateWith' => $followingUserIds->toArray()
        ]);
    }

    /**
     * Show the message history with a specific user.
     */
    public function show(User $user): Response 
    {
        $currentUser = Auth::user();
        
        // Check if the current user is following the recipient
        $isFollowing = $currentUser->following()->where('followed_id', $user->id)->exists();
        $isFollower = $currentUser->followers()->where('follower_id', $user->id)->exists();
        
        // If not following, prevent direct messaging
        if (!$isFollowing) {
            return Inertia::render('Messages/Chat', [ 
                'recipient' => null,
                'messages' => [],
                'error' => 'You must follow this user to send messages.',
                'isFollowing' => $isFollowing,
                'isFollower' => $isFollower
            ]);
        }
        
        // Check if there are any existing messages
        $hasMessages = Message::where(function ($query) use ($currentUser, $user) {
            $query->where('sender_id', $currentUser->id)
                  ->where('receiver_id', $user->id);
        })->orWhere(function ($query) use ($currentUser, $user) {
            $query->where('sender_id', $user->id)
                  ->where('receiver_id', $currentUser->id);
        })->exists();
        
        // If no messages exist and user has a default greeting, create that message
        if (!$hasMessages && $currentUser->default_greeting_message) {
            $message = Message::create([
                'sender_id' => $currentUser->id,
                'receiver_id' => $user->id,
                'content' => $currentUser->default_greeting_message,
            ]);
            
            // Add any default greeting media if exists
            if ($currentUser->default_greeting_media && is_array($currentUser->default_greeting_media)) {
                foreach ($currentUser->default_greeting_media as $media) {
                    if (isset($media['path'])) {
                        MessageAttachment::create([
                            'message_id' => $message->id,
                            'file_path' => $media['path'],
                            'file_name' => $media['name'] ?? 'attachment',
                            'file_type' => $media['type'] ?? 'image/jpeg',
                            'file_size' => $media['size'] ?? 0,
                        ]);
                    }
                }
            }
        }

        // Mark messages from the other user as read
        Message::where('sender_id', $user->id)
            ->where('receiver_id', $currentUser->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        // Fetch messages between the two users
        $messages = Message::where(function ($query) use ($currentUser, $user) {
            $query->where('sender_id', $currentUser->id)
                  ->where('receiver_id', $user->id);
        })->orWhere(function ($query) use ($currentUser, $user) {
            $query->where('sender_id', $user->id)
                  ->where('receiver_id', $currentUser->id);
        })
        ->with([
            'sender:id,name,username,profile_photo', 
            'receiver:id,name,username,profile_photo',
            'attachments'
        ]) 
        ->latest() 
        ->paginate(30); 

        // Reverse the collection for chronological display in the UI
        $messages->setCollection($messages->getCollection()->reverse());
        
        // Format the messages for the frontend
        $messages->through(function ($message) {
            // Get sender's profile photo URL
            if ($message->sender && $message->sender->profile_photo) {
                $message->sender->profile_photo_url = asset('storage/' . $message->sender->profile_photo);
            } else if ($message->sender) {
                $message->sender->profile_photo_url = 'https://ui-avatars.com/api/?name=' . urlencode($message->sender->name) . '&color=7F9CF5&background=EBF4FF';
            }
            
            // Format attachments
            $message->formatted_attachments = $message->attachments->map(function ($attachment) {
                return [
                    'id' => $attachment->id,
                    'url' => $attachment->url,
                    'file_name' => $attachment->file_name,
                    'file_type' => $attachment->file_type,
                    'file_size' => $attachment->file_size,
                ];
            });
            
            return $message;
        });


        // Prepare recipient data
        $recipientData = $user->only('id', 'name', 'username');
        $recipientData['profile_photo_url'] = $user->profile_photo 
            ? asset('storage/' . $user->profile_photo)
            : 'https://ui-avatars.com/api/?name=' . urlencode($user->name) . '&color=7F9CF5&background=EBF4FF';
            
        // Pass recipient and paginated messages to the view
        return Inertia::render('Messages/Chat', [ 
            'recipient' => $recipientData,
            'messages' => $messages,
            'isFollowing' => $isFollowing,
            'isFollower' => $isFollower
        ]);
    }


    /**
     * Store a newly created message in storage.
     */
    public function store(Request $request, User $user): RedirectResponse 
    {
        $currentUser = Auth::user();
        
        // Check if the user is following the recipient
        if (!$currentUser->following()->where('followed_id', $user->id)->exists()) {
            return redirect()->back()->with('error', 'You must follow this user to send messages.');
        }
        
        // Validate the request
        $validated = $request->validate([
            'content' => 'nullable|string|max:5000',
            'attachments' => 'nullable|array|max:10',
            'attachments.*' => 'file|mimes:jpeg,png,jpg,gif,mp4,mov,avi,webp|max:20480', // 20MB max per file
        ]);
        
        // Ensure at least content or attachments are provided
        if (empty($validated['content']) && (!$request->hasFile('attachments') || empty($request->file('attachments')))) {
            return redirect()->back()->with('error', 'Message must have content or attachments.');
        }

        // Create the message
        $message = Message::create([
            'sender_id' => $currentUser->id,
            'receiver_id' => $user->id, 
            'content' => $validated['content'] ?? null,
        ]);
        
        // Process attachments if any
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('message-attachments', 'public');
                
                MessageAttachment::create([
                    'message_id' => $message->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize()
                ]);
            }
        }

        // Redirect back to the conversation page
        return redirect()->route('messages.show', ['user' => $user->id]); 
    }
    
    /**
     * Set the user's default greeting message.
     */
    public function setDefaultGreeting(Request $request): RedirectResponse
    {
        $currentUser = Auth::user();
        
        // Validate the request
        $validated = $request->validate([
            'greeting_message' => 'nullable|string|max:5000',
            'greeting_media' => 'nullable|array|max:5',
            'greeting_media.*' => 'file|mimes:jpeg,png,jpg,gif,mp4,mov,avi,webp|max:20480', // 20MB max per file
        ]);
        
        // Update the greeting message
        $currentUser->default_greeting_message = $validated['greeting_message'] ?? null;
        
        // Process greeting media if any
        $mediaData = [];
        if ($request->hasFile('greeting_media')) {
            foreach ($request->file('greeting_media') as $file) {
                $path = $file->store('greeting-media', 'public');
                
                $mediaData[] = [
                    'path' => $path,
                    'name' => $file->getClientOriginalName(),
                    'type' => $file->getMimeType(),
                    'size' => $file->getSize()
                ];
            }
            $currentUser->default_greeting_media = $mediaData;
        }
        
        $currentUser->save();
        
        return redirect()->back()->with('success', 'Default greeting message updated successfully.');
    }
    
    /**
     * Delete the user's default greeting message.
     */
    public function deleteDefaultGreeting(): RedirectResponse
    {
        $currentUser = Auth::user();
        
        // Clear the greeting message and media
        $currentUser->default_greeting_message = null;
        $currentUser->default_greeting_media = null;
        $currentUser->save();
        
        return redirect()->back()->with('success', 'Default greeting message removed.');
    }
}
