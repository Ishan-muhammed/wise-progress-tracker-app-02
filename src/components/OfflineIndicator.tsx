import { usePWA } from '@/hooks/usePWA';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <Badge 
      variant="destructive" 
      className="fixed top-4 right-4 z-40 animate-pulse"
    >
      <WifiOff className="h-3 w-3 mr-1" />
      Offline
    </Badge>
  );
};