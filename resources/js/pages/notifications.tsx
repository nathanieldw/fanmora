import { useState, useEffect } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { SharedData, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { HeartIcon, ChatBubbleLeftIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon, ChatBubbleLeftIcon as ChatOutlineIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';

interface NotificationData {
  post_id?: number;
  post_image?: string;
  comment_text?: string;
  [key: string]: any;
}

interface Notification {
  id: number;
  type: string;
  data: NotificationData;
  created_at: string;
  read_at: string | null;
  sender: {
    id: number;
    name: string;
    username: string;
    profile_photo_url: string;
  };
}

interface PageProps extends SharedData {
  notifications: Notification[];
}



export default function Notifications({ auth, notifications }: PageProps) {
  const [viewedNotifications, setViewedNotifications] = useState<Set<number>>(new Set());

  // Mark notifications as read when viewed
  useEffect(() => {
    // Get all unread notification IDs that are currently being viewed
    const unreadIds = notifications
      .filter(notification => !notification.read_at && !viewedNotifications.has(notification.id))
      .map(notification => notification.id);

    // Mark each notification as viewed locally
    if (unreadIds.length > 0) {
      const newViewed = new Set(viewedNotifications);
      unreadIds.forEach(id => newViewed.add(id));
      setViewedNotifications(newViewed);

      // Send requests to mark them as read on the server
      unreadIds.forEach(id => {
        axios.post(route('notifications.read', { notification: id }));
      });
    }
  }, [notifications]);

  // Group notifications by date categories
  const groupNotifications = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000; // 1 day in milliseconds
    const lastWeek = today - 604800000; // 7 days in milliseconds
    const lastMonth = today - 2592000000; // 30 days in milliseconds

    const grouped = {
      today: [] as Notification[],
      yesterday: [] as Notification[],
      thisWeek: [] as Notification[],
      thisMonth: [] as Notification[],
      earlier: [] as Notification[],
    };

    notifications.forEach(notification => {
      const date = new Date(notification.created_at).getTime();
      
      if (date >= today) {
        grouped.today.push(notification);
      } else if (date >= yesterday) {
        grouped.yesterday.push(notification);
      } else if (date >= lastWeek) {
        grouped.thisWeek.push(notification);
      } else if (date >= lastMonth) {
        grouped.thisMonth.push(notification);
      } else {
        grouped.earlier.push(notification);
      }
    });

    return grouped;
  };

  const groupedNotifications = groupNotifications();
  
  // Function to render notification icon based on type
  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <HeartIcon className="w-6 h-6 text-red-500" />;
      case 'comment':
        return <ChatBubbleLeftIcon className="w-6 h-6 text-blue-500" />;
      case 'follow':
        return <UserPlusIcon className="w-6 h-6 text-green-500" />;
      case 'verified':
        return <CheckBadgeIcon className="w-6 h-6 text-blue-500" />;
      case 'mention':
        return <ChatOutlineIcon className="w-6 h-6 text-purple-500" />;
      default:
        return <HeartOutlineIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  // Function to format the notification text
  const formatNotificationText = (notification: Notification) => {
    const { sender, type, data } = notification;
    
    switch (type) {
      case 'like':
        return <span><span className="font-medium">{sender.username}</span> liked your post.</span>;
      case 'comment':
        return (
          <span>
            <span className="font-medium">{sender.username}</span> commented: "{data.comment_text && data.comment_text.length > 30 
              ? `${data.comment_text.substring(0, 30)}...` 
              : data.comment_text}"
          </span>
        );
      case 'follow':
        return <span><span className="font-medium">{sender.username}</span> started following you.</span>;
      case 'mention':
        return <span><span className="font-medium">{sender.username}</span> mentioned you in a comment.</span>;
      default:
        return <span><span className="font-medium">{sender.username}</span> interacted with your content.</span>;
    }
  };

  // Function to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Component to render a notification item
  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const isUnread = !notification.read_at && !viewedNotifications.has(notification.id);
    
    return (
      <div className={`flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-900/20 ${isUnread ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
        <div className="mr-4 flex-shrink-0">
          <Avatar className="h-11 w-11 border border-gray-200 dark:border-gray-800">
            <AvatarImage src={notification.sender.profile_photo_url} alt={notification.sender.name} />
            <AvatarFallback>{notification.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="pr-2">
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {formatNotificationText(notification)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatTime(notification.created_at)}
              </p>
            </div>
            
            <div className="flex items-center">
              {isUnread && (
                <div className="h-2 w-2 rounded-full bg-blue-500 mr-3"></div>
              )}
              
              {notification.data.post_image && (
                <div className="h-11 w-11 flex-shrink-0 rounded overflow-hidden">
                  <img 
                    src={notification.data.post_image} 
                    alt="Post thumbnail" 
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render notification section with title
  const NotificationSection = ({ title, items }: { title: string, items: Notification[] }) => {
    if (items.length === 0) return null;
    
    return (
      <div>
        <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.map(notification => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </div>
    );
  };

  const hasNotifications = notifications.length > 0;

  return (
    <AppLayout user={auth.user}>
      <Head title="Notifications" />

      <div className="pt-4 pb-12 w-full max-w-[520px] mx-auto">
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>

          {hasNotifications ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              <NotificationSection title="Today" items={groupedNotifications.today} />
              <NotificationSection title="Yesterday" items={groupedNotifications.yesterday} />
              <NotificationSection title="This Week" items={groupedNotifications.thisWeek} />
              <NotificationSection title="This Month" items={groupedNotifications.thisMonth} />
              <NotificationSection title="Earlier" items={groupedNotifications.earlier} />
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <HeartOutlineIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">No notifications yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">When you get notifications, they'll appear here</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
