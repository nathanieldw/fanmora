import { useState, useEffect, useRef, useCallback } from 'react';
import { User, Story } from '@/types';
import { X, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

interface StoryViewerProps {
  users: (User & { stories: Story[]; profile_photo_url?: string })[];
  initialUserIndex: number;
  onClose: () => void;
}

export default function StoryViewer({ users, initialUserIndex, onClose }: StoryViewerProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressBars, setProgressBars] = useState<number[]>([]);
  
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressStartTimeRef = useRef<number>(0);
  const progressDurationRef = useRef<number>(5000); // 5 seconds per story
  const storyViewedRef = useRef<Set<number>>(new Set());
  
  const currentUser = users[currentUserIndex];
  const currentStory = currentUser?.stories[currentStoryIndex];
  
  // Setup progress bars array based on story count
  useEffect(() => {
    if (currentUser?.stories) {
      setProgressBars(currentUser.stories.map((_, i) => i < currentStoryIndex ? 100 : 0));
    }
  }, [currentUser, currentStoryIndex]);
  
  // Handle story progression timing
  const startProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressStartTimeRef.current = Date.now();
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - progressStartTimeRef.current;
      const progress = Math.min(100, (elapsed / progressDurationRef.current) * 100);
      
      setProgressBars(prev => {
        const newBars = [...prev];
        newBars[currentStoryIndex] = progress;
        return newBars;
      });
      
      if (progress >= 100) {
        goToNextStory();
      }
    }, 50);
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentStoryIndex]);
  
  // Restart progress when story changes
  useEffect(() => {
    if (!isPaused) {
      // Mark the current story as viewed if not already viewed
      if (currentStory && !storyViewedRef.current.has(currentStory.id)) {
        markStoryAsViewed(currentStory.id);
        storyViewedRef.current.add(currentStory.id);
      }
      return startProgress();
    }
  }, [currentStoryIndex, isPaused, startProgress]);
  
  // Function to mark a story as viewed in the backend
  const markStoryAsViewed = async (storyId: number) => {
    try {
      await axios.post(route('api.stories.view', { story: storyId }));
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);
  
  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Left arrow key - go to previous story
      if (e.key === 'ArrowLeft') {
        goToPreviousStory();
      }
      // Right arrow key - go to next story
      else if (e.key === 'ArrowRight') {
        goToNextStory();
      }
      // Escape key - close the viewer
      else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentUserIndex, currentStoryIndex]);
  
  // Handle story navigation
  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1);
      setCurrentStoryIndex(users[currentUserIndex - 1].stories.length - 1);
    }
  };
  
  const goToNextStory = () => {
    if (currentStoryIndex < currentUser.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (currentUserIndex < users.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
    } else {
      // End of all stories
      onClose();
    }
  };
  
  const handlePause = () => {
    setIsPaused(true);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };
  
  const handleResume = () => {
    setIsPaused(false);
  };
  
  // Handle mouse/touch events for navigation
  const handleMouseDown = (e: React.MouseEvent) => {
    // Determine if click is on left or right side of the screen
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const clickPosition = clientX - left;
    
    // If clicking in the first 30% of the width, go to previous story
    if (clickPosition < width * 0.3) {
      goToPreviousStory();
    }
    // If clicking in the last 30% of the width, go to next story
    else if (clickPosition > width * 0.7) {
      goToNextStory();
    }
    // Otherwise, just toggle pause
    else {
      if (isPaused) {
        handleResume();
      } else {
        handlePause();
      }
    }
  };
  
  if (!currentUser || !currentStory) return null;
  
  const isVideo = currentStory.media_type.startsWith('video/');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      {/* Close button */}
      <button 
        className="absolute top-4 right-4 text-white z-10"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={24} />
      </button>
      
      {/* Story container */}
      <div 
        className="relative w-full max-w-md h-full max-h-[80vh] overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseEnter={handlePause}
        onMouseLeave={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
          {progressBars.map((progress, index) => (
            <div 
              key={index} 
              className="h-1 bg-gray-600 bg-opacity-50 flex-1 overflow-hidden"
            >
              <div 
                className="h-full bg-white transition-all duration-50"
                style={{ width: `${progress}%` }}
              />
            </div>
          ))}
        </div>
        
        {/* User info */}
        <div className="absolute top-4 left-0 right-0 z-10 flex items-center px-4 mt-4">
          <Avatar className="h-10 w-10 mr-2">
            <AvatarImage 
              src={currentUser.profile_photo_url || (currentUser.profile_photo ? `/storage/${currentUser.profile_photo}` : undefined)} 
              alt={currentUser.name} 
            />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">{currentUser.username || currentUser.name}</p>
            <p className="text-white text-opacity-70 text-xs">
              {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}
            </p>
          </div>
          <button className="text-white" aria-label="More options">
            <MoreHorizontal size={20} />
          </button>
        </div>
        
        {/* Media content */}
        <div className="w-full h-full flex items-center justify-center">
          {isVideo ? (
            <video
              src={`/storage/${currentStory.media_path}`}
              className="max-w-full max-h-full object-contain"
              autoPlay
              playsInline
              muted={isPaused}
              loop={false}
              controls={false}
            />
          ) : (
            <img
              src={`/storage/${currentStory.media_path}`}
              alt={currentStory.caption || "Story"}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
        
        {/* Caption if exists */}
        {currentStory.caption && (
          <div className="absolute bottom-6 left-0 right-0 text-center px-4">
            <p className="text-white text-sm bg-black bg-opacity-30 p-2 rounded-lg backdrop-blur-sm">
              {currentStory.caption}
            </p>
          </div>
        )}
        
        {/* Navigation buttons (visible on larger screens) */}
        <button 
          className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white opacity-70 hover:opacity-100 transition-opacity hidden md:block"
          onClick={goToPreviousStory}
          aria-label="Previous story"
        >
          <ChevronLeft size={36} />
        </button>
        
        <button 
          className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white opacity-70 hover:opacity-100 transition-opacity hidden md:block"
          onClick={goToNextStory}
          aria-label="Next story"
        >
          <ChevronRight size={36} />
        </button>
      </div>
    </div>
  );
}
