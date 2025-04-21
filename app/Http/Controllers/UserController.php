<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Get random users for the suggestions sidebar
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getRandomUsers(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 5);
        $currentUser = Auth::user();

        // Get random users except the current user and those they already follow
        $followingUserIds = $currentUser->following()->pluck('users.id')->toArray();
        $excludeIds = array_merge([$currentUser->id], $followingUserIds);

        $randomUsers = User::whereNotIn('id', $excludeIds)
            ->select(['id', 'name', 'username', 'profile_photo'])
            ->inRandomOrder()
            ->limit($limit)
            ->get();

        // Transform the users to include the profile photo URL
        $randomUsers->each(function ($user) {
            $user->profile_photo_url = $user->profile_photo 
                ? '/storage/' . $user->profile_photo
                : '/storage/profile-photos/default-avatar.jpg';
        });

        return response()->json([
            'users' => $randomUsers
        ]);
    }
}
