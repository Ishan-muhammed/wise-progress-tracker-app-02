import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';

export const PWAInstallPrompt = () => {
  const { isInstallable, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg border-2 border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Smartphone className="h-5 w-5 text-green-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-green-900 mb-1">
              Install WISE App
            </h3>
            <p className="text-xs text-green-700 mb-3">
              Add WISE to your home screen for quick access and offline use.
            </p>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleInstall}
                className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
              >
                <Download className="h-3 w-3 mr-1" />
                Install
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
                className="text-green-700 hover:text-green-800 h-8 px-3"
              >
                Not now
              </Button>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="p-1 h-6 w-6 text-green-600 hover:text-green-800 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};