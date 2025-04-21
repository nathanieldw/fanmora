<?php

namespace App\Http\Controllers;

use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'post_id' => 'required|exists:posts,id',
        ]);
        $data['user_id'] = Auth::id();
        $like = Like::firstOrCreate($data);
        return response()->json($like);
    }
    public function destroy(Request $request)
    {
        $data = $request->validate([
            'post_id' => 'required|exists:posts,id',
        ]);
        $like = Like::where('post_id', $data['post_id'])->where('user_id', Auth::id())->first();
        if ($like) {
            $like->delete();
        }
        return response()->json(['success' => true]);
    }
}
