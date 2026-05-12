export const getTimeAgo = (timestamp: string) => {
  if (!timestamp) return '...';
  
  // Convert Supabase UTC timestamp to local time correctly
  // Adding 'Z' forces it to be parsed as UTC
  const orderTime = new Date(timestamp.includes('Z') ? timestamp : timestamp + 'Z');
  const now = new Date();
  
  const diffSeconds = Math.floor((now.getTime() - orderTime.getTime()) / 1000);
  
  if (diffSeconds < 0) return 'Just now'; // handle slight clock drift
  if (diffSeconds < 10) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds} sec ago`;
  
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day ago`;
};
