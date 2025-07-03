import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';

export const PWAUpdatePrompt = () => {
  const { updateAvailable, reloadApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) return null;

  const handleUpdate = () => {
    reloadApp();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <Card className="fixed top-4 left-4 right-4 z-50 shadow-lg border-2 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <RefreshCw className="h-5 w-5 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Update Available
            </h3>
            <p className="text-xs text-blue-700 mb-3">
              A new version of WISE is available with improvements and bug fixes.
            </p>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Update Now
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
                className="text-blue-700 hover:text-blue-800 h-8 px-3"
              >
                Later
              </Button>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="p-1 h-6 w-6 text-blue-600 hover:text-blue-800 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};