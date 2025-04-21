import { useState, useEffect, useRef } from 'react';
import { User, Story } from '@/types';
import axios from 'axios';
import StoryCircle from './StoryCircle';
import StoryViewer from './StoryViewer';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StoriesRowProps {
  currentUser: User;
}

export default function StoriesRow({ currentUser }: StoriesRowProps) {
  const [usersWithStories, setUsersWithStories] = useState<(User & { stories: Story[]; profile_photo_url?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [uploadingStory, setUploadingStory] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch stories on component mount
  useEffect(() => {
    fetchStories();
  }, []);
  
  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(route('api.stories.index'));
      setUsersWithStories(response.data.stories || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStoryClick = (userIndex: number) => {
    setSelectedUserIndex(userIndex);
    setIsStoryModalOpen(true);
  };
  
  const handleAddStory = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is image or video with reasonable size
    if (!file.type.match(/^(image|video)\/.*$/) || file.size > 20 * 1024 * 1024) {
      alert('Please select an image or video file under 20MB');
      return;
    }
    
    const formData = new FormData();
    formData.append('media', file);
    
    try {
      setUploadingStory(true);
      await axios.post(route('api.stories.store'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Refresh stories after upload
      await fetchStories();
    } catch (error) {
      console.error('Error uploading story:', error);
      alert('Failed to upload story. Please try again.');
    } finally {
      setUploadingStory(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // If there are no stories and not loading, don't show the component
  if (!loading && usersWithStories.length === 0 && !currentUser) {
    return null;
  }
  
  return (
    <>
      <div className="relative mb-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-2 overflow-x-auto">
        <div className="flex space-x-4 p-1 min-w-full">
          {/* Add story button (current user) */}
          <div className="flex-shrink-0">
            <div 
              className="flex flex-col items-center cursor-pointer"
              onClick={handleAddStory}
            >
              <div className="relative">
                <div className="p-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <div className="bg-white dark:bg-black p-0.5 rounded-full relative">
                    <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {currentUser.profile_photo ? (
                        <img 
                          src={`/storage/${currentUser.profile_photo}`} 
                          alt={currentUser.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-gray-500">
                          {currentUser.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                      
                      {/* Plus icon overlay */}
                      <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border-2 border-white dark:border-gray-900">
                        <PlusCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-xs mt-1 block text-center">
                  Your Story
                </span>
              </div>
            </div>
          </div>
          
          {/* Story circles for users with stories */}
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 animate-pulse">
                <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                <div className="h-2 w-12 bg-gray-300 dark:bg-gray-700 mt-2 mx-auto rounded"></div>
              </div>
            ))
          ) : (
            usersWithStories.map((user, index) => (
              <div key={user.id} className="flex-shrink-0">
                <StoryCircle
                  user={user}
                  onClick={() => handleStoryClick(index)}
                />
              </div>
            ))
          )}
        </div>
        
        {/* Hidden file input for adding stories */}
        <label className="sr-only" htmlFor="story-upload">Upload story</label>
        <input
          id="story-upload"
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,video/*"
          onChange={handleFileChange}
          disabled={uploadingStory}
          aria-label="Upload story"
        />
        
        {/* Upload indicator */}
        {uploadingStory && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-10">
            <div className="text-white text-sm">Uploading story...</div>
          </div>
        )}
      </div>
      
      {/* Story viewer modal */}
      {isStoryModalOpen && (
        <StoryViewer
          users={usersWithStories}
          initialUserIndex={selectedUserIndex}
          onClose={() => setIsStoryModalOpen(false)}
        />
      )}
    </>
  );
}
