import AppLayout from '@/layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import InputError from '@/components/ui/InputError';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FormEventHandler, useState, ChangeEvent, useEffect, useRef } from 'react';
import { SharedData, User } from '@/types';
import {
    PhotoIcon,
    VideoCameraIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import '@/../../resources/css/progress-bar.css';

interface PageProps extends SharedData {
    user: User;
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
    // Define step as a type for better TypeScript support
    type StepType = 'upload' | 'caption';
    const [step, setStep] = useState<StepType>('upload');
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
    const [dragOver, setDragOver] = useState<boolean>(false);

    const { data, setData, post, processing, errors, reset, progress } = useForm<{
        content: string;
        media: File[];
        is_looping: boolean;
        is_premium: boolean;
    }>({
        content: '',
        media: [],
        is_looping: false,
        is_premium: false,
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

            // Automatically move to caption step when files are selected
            if (step === 'upload' && previews.length === 0 && newPreviews.length > 0) {
                setStep('caption');
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

            // If no media, go back to upload step
            if (previews.length > 0) {
                setStep('upload');
            }

            // Also clear the file input visually
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [data.media, data.is_looping, setData, step, previews.length]);

    // Find media errors for display
    const mediaItemError = findMediaItemError(errors);
    const combinedMediaError = [errors.media, mediaItemError].filter(Boolean).join(' ');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            // Limit number of files to MAX_FILES
            const totalCount = data.media.length + filesArray.length;
            if (totalCount > MAX_FILES) {
                alert(`You can only upload a maximum of ${MAX_FILES} files`);
                return;
            }

            // Combine existing media with new files
            setData('media', [...data.media, ...filesArray]);

            // Reset the file input so the user can select the same files again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeMedia = (fileToRemove: File) => {
        const newMedia = data.media.filter(file => file !== fileToRemove);
        setData('media', newMedia);

        // Reset current preview index if necessary
        if (newMedia.length > 0 && currentPreviewIndex >= newMedia.length) {
            setCurrentPreviewIndex(newMedia.length - 1);
        }
    };

    const nextPreview = () => {
        if (currentPreviewIndex < previews.length - 1) {
            setCurrentPreviewIndex(prev => prev + 1);
        }
    };

    const prevPreview = () => {
        if (currentPreviewIndex > 0) {
            setCurrentPreviewIndex(prev => prev - 1);
        }
    };

    const handleSelectFilesClick = () => {
        // Ensure the file input is reset before opening it to avoid issues with the same file selection
        if (fileInputRef.current) {
            // Reset the file input to make sure it triggers change event even if selecting the same files
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    const handleGoBack = () => {
        setStep('upload');
    };

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const filesArray = Array.from(e.dataTransfer.files);

            // Filter only acceptable file types
            const acceptableFiles = filesArray.filter(file => {
                return file.type.startsWith('image/') || file.type.startsWith('video/');
            });

            // Limit number of files
            const totalCount = data.media.length + acceptableFiles.length;
            if (totalCount > MAX_FILES) {
                alert(`You can only upload a maximum of ${MAX_FILES} files`);
                return;
            }

            setData('media', [...data.media, ...acceptableFiles]);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!data.content.trim() && data.media.length === 0) return; // Prevent empty posts
        
        post(route('post.store'), {
            onSuccess: () => {
                reset();
                setStep('upload');
                setCurrentPreviewIndex(0);
                // Force redirect to dashboard
                window.location.href = route('dashboard');
            },
            onError: (errors) => {
                console.error('Post creation failed:', errors);
            }
        });
    };

    return (
        <AppLayout user={auth.user}>
            {/* File input placed at the root level for accessibility across all steps */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif,video/mp4,video/webm"
                aria-describedby="media-error"
                aria-label="Upload photos and videos"
                title="Upload photos and videos"
            />
            <Head title="Create Post" />

            <div className="py-4 sm:py-6 lg:py-8 max-w-4xl mx-auto px-4 sm:px-6 w-full">
                <div className="mb-4 flex items-center">
                    <button
                        type="button"
                        onClick={() => router.visit(route('dashboard'))}
                        className="mr-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Go back to dashboard"
                        title="Go back to dashboard"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold">Create New Post</h1>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden w-full">
                    {step === 'upload' ? (
                        <div
                            className={`p-6 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-gray-600'}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={handleSelectFilesClick}
                            role="button"
                            tabIndex={0}
                            aria-label="Click to upload media"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleSelectFilesClick();
                                }
                            }}
                        >
                            <div className="text-center space-y-4 max-w-md mx-auto">
                                <div className="flex justify-center">
                                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                        <PhotoIcon className="h-10 w-10 text-blue-500" />
                                    </div>
                                </div>

                                <h2 className="text-xl font-semibold">Drag photos and videos here</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Share your moments with your followers. You can upload up to {MAX_FILES} photos and videos.
                                </p>

                                <InputError message={combinedMediaError} className="mt-2" />

                                <div className="pt-4">
                                    <Button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent propagation to parent div's click handler
                                            handleSelectFilesClick();
                                        }}
                                        className="px-6"
                                    >
                                        Select from computer
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px] w-full">
                            {/* Left: Media Preview with Navigation */}
                            <div className="relative bg-black flex items-center justify-center">
                                {previews.length > 0 && (
                                    <>
                                        <div className="w-full aspect-square relative overflow-hidden">
                                            {previews[currentPreviewIndex].type === 'image' ? (
                                                <img
                                                    src={previews[currentPreviewIndex].url}
                                                    alt={`Preview ${currentPreviewIndex + 1}`}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <video
                                                    src={previews[currentPreviewIndex].url}
                                                    className="w-full h-full object-contain"
                                                    controls={previews.length === 1}
                                                    autoPlay
                                                    loop={data.is_looping}
                                                    muted
                                                />
                                            )}
                                        </div>

                                        {/* Navigation arrows (only show if more than 1 preview) */}
                                        {previews.length > 1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={prevPreview}
                                                    disabled={currentPreviewIndex === 0}
                                                    className="absolute left-2 p-1 rounded-full bg-black/50 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                                    aria-label="Previous image"
                                                    title="Previous image"
                                                >
                                                    <ChevronLeftIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={nextPreview}
                                                    disabled={currentPreviewIndex === previews.length - 1}
                                                    className="absolute right-2 p-1 rounded-full bg-black/50 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                                    aria-label="Next image"
                                                    title="Next image"
                                                >
                                                    <ChevronRightIcon className="h-5 w-5" />
                                                </button>

                                                {/* Current preview indicator */}
                                                <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                                                    {previews.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => setCurrentPreviewIndex(index)}
                                                            className={`w-2 h-2 rounded-full ${currentPreviewIndex === index ? 'bg-white' : 'bg-white/50'}`}
                                                            aria-label={`Go to preview ${index + 1}`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {/* Remove button */}
                                        <button
                                            type="button"
                                            onClick={() => removeMedia(previews[currentPreviewIndex].file)}
                                            className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                                            aria-label="Remove media"
                                            title="Remove media"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Right: Form Content */}
                            <div className="p-4 flex flex-col">
                                <form onSubmit={submit} className="flex flex-col h-full">
                                    <div className="flex items-center mb-4">
                                        <button
                                            type="button"
                                            onClick={handleGoBack}
                                            className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                            aria-label="Go back to upload step"
                                            title="Go back to upload step"
                                        >
                                            <ArrowLeftIcon className="h-5 w-5" />
                                        </button>
                                        <h2 className="text-lg font-semibold">Create Post</h2>
                                    </div>

                                    {/* Caption and Settings */}
                                    <div className="space-y-4 flex-grow">
                                        {/* Add more media button */}
                                        <div className="mb-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    // Directly click the file input instead of using the helper function
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                        fileInputRef.current.click();
                                                    }
                                                }}
                                                className="flex items-center gap-1 text-xs cursor-pointer"
                                                title="Add more media"
                                                disabled={data.media.length >= MAX_FILES}
                                            >
                                                <PhotoIcon className="h-4 w-4" />
                                                <span>Add more media</span>
                                                <span className="text-gray-500">({data.media.length}/{MAX_FILES})</span>
                                            </Button>
                                        </div>

                                        <Textarea
                                            placeholder="Write a caption..."
                                            value={data.content}
                                            onChange={(e) => setData('content', e.target.value)}
                                            rows={5}
                                            className="w-full resize-none"
                                        />
                                        <InputError message={errors.content} />

                                        {/* Options */}
                                        <div className="space-y-3 pt-2">
                                            {hasVideo && (
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="is_looping"
                                                        checked={data.is_looping}
                                                        onCheckedChange={(checked) => setData('is_looping', !!checked)}
                                                    />
                                                    <Label htmlFor="is_looping" className="text-sm cursor-pointer">
                                                        Loop video
                                                    </Label>
                                                </div>
                                            )}

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="is_premium"
                                                    checked={data.is_premium}
                                                    onCheckedChange={(checked) => setData('is_premium', !!checked)}
                                                />
                                                <Label htmlFor="is_premium" className="text-sm cursor-pointer">
                                                    Premium content
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Upload Progress */}
                                    {progress && (
                                        <div className="w-full mt-2">
                                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                <span>Uploading media...</span>
                                                <span>{Math.round(progress.percentage || 0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                                <div
                                                    className="upload-progress-bar"
                                                    style={{
                                                        '--progress-percentage': `${Math.round(progress?.percentage || 0)}%`
                                                    } as React.CSSProperties}
                                                    role="progressbar"
                                                    aria-label="Upload progress"
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <div className="mt-4">
                                        <Button
                                            type="submit"
                                            disabled={processing || (!data.content.trim() && data.media.length === 0)}
                                            className="w-full"
                                        >
                                            {processing ? 'Posting...' : 'Share'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}