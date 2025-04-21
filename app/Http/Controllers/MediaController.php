<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class MediaController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'file' => 'required|file',
            'is_premium' => 'boolean',
        ]);
        $file = $request->file('file');
        $path = $file->store('media', 'public');
        $media = Media::create([
            'post_id' => $data['post_id'],
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'is_premium' => $data['is_premium'] ?? false,
        ]);
        return response()->json($media);
    }
}
