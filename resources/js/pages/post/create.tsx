import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import InputError from '@/components/ui/InputError';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FormEventHandler, useState, ChangeEvent, useEffect, useRef } from 'react';
import { SharedData, User } from '@/types';
import { PhotoIcon, VideoCameraIcon, XCircleIcon, PaperClipIcon } from '@heroicons/react/24/solid';

interface PageProps extends SharedData {
    // Add any specific props for this page if needed
}

interface Preview {
    url: string;
    type: 'image' | 'video';
    file: File; // Keep reference to original file for removal
}

const MAX_FILES = 10; // Set max number of files

// Helper function to find the first media.* error message
const findMediaItemError = (errs: Partial<Record<string, string>>): string | undefined => {
    if (!errs) return undefined;
    for (const key in errs) {
        if (key.startsWith('media.')) {
            return errs[key];
        }
    }
    return undefined;
};

export default function CreatePost({ auth }: PageProps) {
    const { data, setData, post, processing, errors, reset, recentlySuccessful, progress } = useForm<{
        content: string;
        media: File[]; // Changed to File array
        is_looping: boolean;
    }>({ 
        content: '',
        media: [], // Initialize as empty array
        is_looping: false,
    });

    const [previews, setPreviews] = useState<Preview[]>([]);
    const [hasVideo, setHasVideo] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null); 

    // Create/revoke preview URLs and check for videos when media files change
    useEffect(() => {
        // Cleanup previous previews
        previews.forEach(p => URL.revokeObjectURL(p.url));

        if (data.media.length > 0) {
            let videoFound = false;
            const newPreviews: Preview[] = data.media.map(file => {
                // Explicitly define the type based on the check
                const type: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
                if (type === 'video') videoFound = true;
                return { url: URL.createObjectURL(file), type, file };
            });
            setPreviews(newPreviews);
            setHasVideo(videoFound);

            // If no video is present anymore, ensure looping is off
            if (!videoFound && data.is_looping) {
                 setData('is_looping', false);
            }

            // Cleanup function
            return () => {
                newPreviews.forEach(p => URL.revokeObjectURL(p.url));
            };
        } else {
            setPreviews([]);
            setHasVideo(false);
            // Reset looping if media is removed
            if (data.is_looping) setData('is_looping', false);
             // Also clear the file input visually
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [data.media]); // Rerun when data.media array changes

     // Clear form on successful submission
    useEffect(() => {
        if (recentlySuccessful) {
            reset(); // Reset all form fields including media (will trigger preview useEffect)
            if (fileInputRef.current) { // Clear file input
                fileInputRef.current.value = '';
            }
        }
    }, [recentlySuccessful, reset]);

    // Find media errors for display
    const mediaItemError = findMediaItemError(errors);
    const combinedMediaError = [errors.media, mediaItemError].filter(Boolean).join(' ');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            // Limit number of files
            const limitedFiles = filesArray.slice(0, MAX_FILES);
            setData('media', limitedFiles);
            // Optionally show warning if files were truncated?
        }
    };

    const removeMedia = (fileToRemove: File) => {
        setData('media', data.media.filter(file => file !== fileToRemove));
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!data.content.trim() && data.media.length === 0) return; // Prevent empty posts

        post(route('posts.store'), {
            forceFormData: true, 
            onSuccess: () => {
                // Reset is handled by useEffect
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Create New Post</h2>}
        >
            <Head title="Create Post" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            <div>
                                <Label htmlFor="content" className="sr-only">Post Content</Label>
                                <Textarea
                                    id="content"
                                    value={data.content}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('content', e.target.value)}
                                    placeholder="What's on your mind?" // TODO: Make optional if media exists
                                    className="min-h-[120px] w-full"
                                    required={data.media.length === 0} // Required only if no media
                                />
                                <InputError message={errors.content} className="mt-2" />
                            </div>

                            {/* Media Previews Grid */} 
                            {previews.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {previews.map((preview) => (
                                        <div key={preview.url} className="relative group aspect-square border dark:border-gray-700 rounded-md flex items-center justify-center overflow-hidden bg-black">
                                            {preview.type === 'image' && (
                                                <img src={preview.url} alt="Preview" className="object-cover w-full h-full" />
                                            )}
                                            {preview.type === 'video' && (
                                                // Show simple preview (no controls/loop here)
                                                <video src={preview.url} className="object-cover w-full h-full" />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeMedia(preview.file)}
                                                className="absolute top-1 right-1 bg-black bg-opacity-60 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                                aria-label="Remove media"
                                            >
                                                <XCircleIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                    {/* Placeholder for file input if needed, or add button */} 
                                </div>
                            )}

                            {/* Upload Progress */} 
                            {progress && (
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                                </div>
                            )}


                            {/* File Input and Options */} 
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                                    <Label htmlFor="media-upload" className="cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label={`Attach files (${data.media.length}/${MAX_FILES})`}>
                                        <PaperClipIcon className={`h-6 w-6 ${data.media.length > 0 ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
                                    </Label>
                                    <input
                                        ref={fileInputRef}
                                        id="media-upload"
                                        type="file"
                                        multiple // Allow multiple file selection
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="image/jpeg,image/png,image/gif,video/mp4,video/webm"
                                        aria-describedby="media-error" // Link to the error message
                                        aria-label="Upload media files" // Add accessible name for the hidden input
                                    />
                                     {/* Display number of files selected */} 
                                    {data.media.length > 0 && (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{data.media.length} file(s) selected</span>
                                    )}
                                    {/* Combine potential array and item errors */}
                                    <InputError id="media-error" message={combinedMediaError} className="w-full sm:w-auto" />

                                    {/* Loop Checkbox (only shown if at least one video selected) */} 
                                    {hasVideo && (
                                         <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_looping"
                                                checked={data.is_looping}
                                                onCheckedChange={(checked) => setData('is_looping', !!checked)} 
                                            />
                                            <Label htmlFor="is_looping" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                                Loop video(s)
                                            </Label>
                                            <InputError message={errors.is_looping} className="mt-2" />
                                        </div>
                                    )}
                                </div>

                                <Button type="submit" disabled={processing || (!data.content.trim() && data.media.length === 0)}>
                                    {processing ? 'Posting...' : 'Post'}
                                </Button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}