<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display the notifications page.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get the user's notifications, including related sender data
        $notifications = $user->notifications()
            ->with('sender:id,name,username,profile_photo')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                // Prepare user data with profile photo URL
                $sender = $notification->sender;
                $sender->profile_photo_url = $sender->profile_photo 
                    ? asset('storage/' . $sender->profile_photo)
                    : 'https://ui-avatars.com/api/?name=' . urlencode($sender->name) . '&color=7F9CF5&background=EBF4FF';
                
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $notification->data,
                    'created_at' => $notification->created_at,
                    'read_at' => $notification->read_at,
                    'sender' => [
                        'id' => $sender->id,
                        'name' => $sender->name,
                        'username' => $sender->username,
                        'profile_photo_url' => $sender->profile_photo_url,
                    ]
                ];
            });
        
        return Inertia::render('notifications', [
            'notifications' => $notifications
        ]);
    }
    
    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        // Ensure the notification belongs to the authenticated user
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $notification->markAsRead();
        
        return response()->json(['success' => true]);
    }
    
    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
            
        return response()->json(['success' => true]);
    }
}
