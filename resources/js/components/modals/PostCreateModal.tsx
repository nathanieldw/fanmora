import { useState, useEffect, useRef, ChangeEvent, FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import '@/../../resources/css/progress-bar.css';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/ui/InputError';
import { XMarkIcon, ArrowLeftIcon, PhotoIcon, VideoCameraIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PostCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Preview {
    url: string;
    type: 'image' | 'video';
    file: File;
}

const MAX_FILES = 10;

const findMediaItemError = (errs: Partial<Record<string, string>>): string | undefined => {
    if (!errs) return undefined;
    for (const key in errs) {
        if (key.startsWith('media.')) {
            return errs[key];
        }
    }
    return undefined;
};

export default function PostCreateModal({ isOpen, onClose }: PostCreateModalProps) {
    // Define step as a type for better TypeScript support
    type StepType = 'upload' | 'caption';
    const [step, setStep] = useState<StepType>('upload');
    const [previews, setPreviews] = useState<Preview[]>([]);
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropAreaRef = useRef<HTMLDivElement>(null);
    
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

    const [hasVideo, setHasVideo] = useState<boolean>(false);
    const [dragOver, setDragOver] = useState<boolean>(false);

    // Reset state when modal opens or closes
    useEffect(() => {
        if (!isOpen) {
            reset();
            setPreviews([]);
            setHasVideo(false);
            setStep('upload');
        }
    }, [isOpen, reset]);

    // Create/revoke preview URLs when media files change
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

            if (!videoFound && data.is_looping) {
                setData('is_looping', false);
            }

            // Automatically move to caption step when files are selected
            if (step === 'upload') {
                setStep('caption');
            }

            return () => {
                newPreviews.forEach(p => URL.revokeObjectURL(p.url));
            };
        } else {
            setPreviews([]);
            setHasVideo(false);
            if (data.is_looping) setData('is_looping', false);
            
            // If no media, go back to upload step
            setStep('upload');
            
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [data.media, data.is_looping, setData, step]);

    // Find media errors for display
    const mediaItemError = findMediaItemError(errors);
    const combinedMediaError = [errors.media, mediaItemError].filter(Boolean).join(' ');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            // Limit number of files
            const newFiles = [...data.media, ...filesArray].slice(0, MAX_FILES);
            setData('media', newFiles);
        }
    };

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
            const filesArray = Array.from(e.dataTransfer.files)
                .filter(file => 
                    file.type.startsWith('image/') || 
                    file.type.startsWith('video/')
                );
                
            if (filesArray.length > 0) {
                // Limit number of files
                const newFiles = [...data.media, ...filesArray].slice(0, MAX_FILES);
                setData('media', newFiles);
            }
        }
    };

    const removeMedia = (fileToRemove: File) => {
        const newPreviews = previews.filter(preview => preview.file !== fileToRemove);
        setPreviews(newPreviews);
        setData('media', newPreviews.map(preview => preview.file));
        // Reset index if we're removing the current preview or if we've removed all previews
        if (currentPreviewIndex >= newPreviews.length) {
            setCurrentPreviewIndex(Math.max(0, newPreviews.length - 1));
        }
    };
    
    const nextPreview = () => {
        if (previews.length > 1) {
            setCurrentPreviewIndex(prev => (prev + 1) % previews.length);
        }
    };
    
    const prevPreview = () => {
        if (previews.length > 1) {
            setCurrentPreviewIndex(prev => (prev - 1 + previews.length) % previews.length);
        }
    };

    const handleSelectFilesClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleGoBack = () => {
        setStep('upload');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(route('posts.store'), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    const handleContinue = () => {
        setStep('caption');
    };

    const closeModal = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={closeModal}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                <DialogHeader className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center relative">
                    {step !== 'upload' && (
                        <button 
                            type="button" 
                            onClick={() => setStep('upload')}
                            className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            aria-label="Back to upload"
                            title="Back to upload step"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </button>
                    )}
                    <DialogTitle className="text-center flex-1 text-lg font-semibold">
                        {step === 'upload' ? 'Create new post' : 'Add a caption'}
                    </DialogTitle>
                    <button 
                        onClick={closeModal} 
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label="Close"
                        title="Close modal"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </DialogHeader>

                {step === 'upload' && (
                    <div className="py-10 flex flex-col items-center">
                        <div className="p-4 space-y-4">
                            {/* Step indicator */}
                            <div className="mb-4 text-center">
                                <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    Step 1: Select media to share
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-10 border-2 border-dashed border-gray-300 dark:border-gray-700 relative"
                                ref={dropAreaRef}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="mb-3 text-gray-500 dark:text-gray-400">
                                        <PhotoIcon className="w-10 h-10 inline-block mr-1" />
                                        <VideoCameraIcon className="w-10 h-10 inline-block ml-1" />
                                    </div>
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold">Drag photos and videos here</span>
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                        Share up to {MAX_FILES} photos and videos
                                    </p>
                                    <Button 
                                        type="button" 
                                        onClick={handleSelectFilesClick}
                                        className="rounded-lg"
                                    >
                                        Select from computer
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="image/jpeg,image/png,image/gif,video/mp4,video/webm"
                                        aria-label="Upload photos or videos"
                                        title="Upload photos or videos"
                                    />
                                </div>
                            </div>
                            {combinedMediaError && (
                                <InputError message={combinedMediaError} className="mt-2" />
                            )}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                        {processing && (
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        {processing ? 'Processing your post...' : 'Ready to ' + (step === 'upload' ? 'continue' : 'share') + '?'}
                                    </div>
                                    {step === 'upload' && (
                                        <Button 
                                            onClick={handleContinue}
                                            disabled={previews.length === 0}
                                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md px-4"
                                        >
                                            Continue
                                        </Button>
                                    )}
                                    {step === 'caption' && (
                                        <Button 
                                            onClick={submit} 
                                            disabled={processing}
                                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md px-4"
                                        >
                                            {processing ? 'Posting...' : 'Share'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'caption' && (
                    <form onSubmit={submit} className="space-y-4">
                        {/* Media Preview Section */}
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative border border-gray-300 dark:border-gray-700 shadow-sm">
                            {/* Current Step Indicator */}
                            <div className="absolute top-2 left-2 z-30 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm border border-gray-200 dark:border-gray-700">
                                Step 2: Review your {previews.length} {previews.length === 1 ? 'media item' : 'media items'}
                            </div>

                            {/* Main Preview Area */}
                            <div className="aspect-square relative">
                                {previews.length > 0 ? (
                                    <div className="w-full h-full">
                                        {previews.map((preview, idx) => (
                                            <div 
                                                key={preview.url} 
                                                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                                                    idx === currentPreviewIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                                }`}
                                            >
                                                {preview.type === 'image' && (
                                                    <img 
                                                        src={preview.url} 
                                                        alt={`Preview ${idx + 1}`} 
                                                        className="max-w-full max-h-full object-contain" 
                                                    />
                                                )}
                                                {preview.type === 'video' && (
                                                    <video 
                                                        src={preview.url} 
                                                        controls={true}
                                                        loop={data.is_looping}
                                                        className="max-w-full max-h-full object-contain"
                                                        title={`Video preview ${idx + 1}`}
                                                        aria-label={`Video preview ${idx + 1}`}
                                                    />
                                                )}
                                                
                                                {/* Media Type Indicator */}
                                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-md text-xs">
                                                    {preview.type === 'image' ? 'Image' : 'Video'} {idx + 1} of {previews.length}
                                                </div>
                                                
                                                {/* Only show remove button when hovering over the preview */}
                                                <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center group">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMedia(preview.file)}
                                                        className="bg-black bg-opacity-70 hover:bg-opacity-90 rounded-md px-3 py-1 text-white transition-all flex items-center gap-1"
                                                        aria-label="Remove media"
                                                        title="Remove this media"
                                                    >
                                                        <span>Remove</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {/* Navigation Arrows (only show if more than 1 preview) */}
                                        {previews.length > 1 && (
                                            <>
                                                <button 
                                                    type="button"
                                                    onClick={prevPreview}
                                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 text-white transition-all"
                                                    aria-label="Previous media"
                                                    title="Previous media"
                                                >
                                                    <ChevronLeftIcon className="h-6 w-6" />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={nextPreview}
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 text-white transition-all"
                                                    aria-label="Next media"
                                                    title="Next media"
                                                >
                                                    <ChevronRightIcon className="h-6 w-6" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center text-gray-500">
                                            <PhotoIcon className="h-20 w-20 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg font-medium">No media selected</p>
                                            <p className="text-sm">Upload photos or videos to create your post</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Thumbnail Carousel */}
                            {previews.length > 1 && (
                                <div className="bg-gray-100 dark:bg-gray-800 p-3 flex gap-2 overflow-x-auto">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 my-auto mr-1">Thumbnails:</div>
                                    {previews.map((preview, idx) => (
                                        <button
                                            key={`thumb-${preview.url}`}
                                            type="button"
                                            onClick={() => setCurrentPreviewIndex(idx)}
                                            className={`relative flex-shrink-0 h-14 w-14 rounded-md overflow-hidden transition-all border ${currentPreviewIndex === idx ? 'border-blue-500 shadow-md' : 'border-gray-300 dark:border-gray-700 opacity-70'}`}
                                            aria-label={`View media ${idx + 1}`}
                                            title={`View media ${idx + 1}`}
                                        >
                                            {preview.type === 'image' && (
                                                <img src={preview.url} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                                            )}
                                            {preview.type === 'video' && (
                                                <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <span className="text-xs text-gray-800 dark:text-gray-200">Video {idx + 1}</span>
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 text-center bg-black bg-opacity-60 text-white text-[10px] py-0.5">
                                                {idx + 1}/{previews.length}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Caption and Settings */}
                        <div className="space-y-3">
                            <Textarea
                                placeholder="Write a caption..."
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                rows={3}
                            />
                            <InputError message={errors.content} />
                            
                            {/* Options */}
                            <div className="space-y-2">
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
                                          '--progress-percentage': `${Math.round(progress.percentage || 0)}%`
                                        } as React.CSSProperties}
                                        role="progressbar"
                                        aria-label="Upload progress"
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button 
                                type="submit" 
                                disabled={processing || (!data.content.trim() && data.media.length === 0)}
                                className="w-full"
                            >
                                {processing ? 'Posting...' : 'Share'}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
