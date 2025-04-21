interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  postsCount: number;
  mediaCount: number;
  streamsCount: number;
}

export default function ProfileTabs({ activeTab, setActiveTab, postsCount, mediaCount, streamsCount }: ProfileTabsProps) {
  return (
    <div className="border-b">
      <div className="flex justify-between p-2">
        <button
          className={`flex-1 text-center font-semibold pb-2 border-b-2 ${activeTab === 'all' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
          onClick={() => setActiveTab('all')}
        >
          {postsCount} posts
        </button>
        <button
          className={`flex-1 text-center font-semibold pb-2 border-b-2 ${activeTab === 'media' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
          onClick={() => setActiveTab('media')}
        >
          {mediaCount} media
        </button>
        <button
          className={`flex-1 text-center font-semibold pb-2 border-b-2 ${activeTab === 'streams' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
          onClick={() => setActiveTab('streams')}
        >
          {streamsCount} streams
        </button>
      </div>
    </div>
  );
}
