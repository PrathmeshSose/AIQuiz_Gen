
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, AlertTriangle, Info } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'googleApiKey';

type ApiKeyManagerDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function ApiKeyManagerDialog({ isOpen, onOpenChange }: ApiKeyManagerDialogProps) {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [isKeyInLocalStorage, setIsKeyInLocalStorage] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY);
      setIsKeyInLocalStorage(!!storedKey);
      setApiKeyInput(storedKey || '');
    }
  }, [isOpen]);

  const updateServerSessionKey = async (key: string | null) => {
    try {
      const response = await fetch('/api/set-dev-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update server session key');
      }
      return data;
    } catch (error: any) {
      console.error('Error updating server session key:', error);
      throw error; // Re-throw to be caught by caller
    }
  };

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) {
      toast({
        title: 'API Key is empty',
        description: 'Please enter a valid API key.',
        variant: 'destructive',
      });
      return;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, apiKeyInput);
    setIsKeyInLocalStorage(true);
    toast({
      title: 'API Key Saved Locally',
      description: 'Your API key has been saved to browser local storage.',
    });

    try {
      await updateServerSessionKey(apiKeyInput);
      toast({
        title: 'API Key Active for Session',
        description: 'The API key is now active for the current server session (dev mode). No restart needed.',
      });
    } catch (error: any) {
      toast({
        title: 'Server Key Update Failed',
        description: `Could not activate key for server session: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleClearKey = async () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setIsKeyInLocalStorage(false);
    setApiKeyInput('');
    toast({
      title: 'API Key Cleared Locally',
      description: 'Your API key has been removed from browser local storage.',
    });

    try {
      await updateServerSessionKey(null); // Send null to clear
      toast({
        title: 'API Key Cleared for Session',
        description: 'The API key has been cleared for the current server session (dev mode).',
      });
    } catch (error: any) {
      toast({
        title: 'Server Key Clear Failed',
        description: `Could not clear key for server session: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <KeyRound className="mr-2 h-5 w-5" /> Manage Google AI API Key (Dev Mode)
          </DialogTitle>
          <DialogDescription>
            Set your Google AI API key for the current development session. Changes take effect immediately without a server restart.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-300 rounded-md text-blue-700 text-sm flex items-start">
            <Info className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Development Convenience:</span> This key is active for your current server session.
              For persistence across server restarts or for production, set <code>GOOGLE_API_KEY</code> in your <code>.env</code> file and restart the server.
            </div>
          </div>

          <div>
            <Label htmlFor="apiKey" className="mb-1 block">
              Your Google AI API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter your API key"
            />
            {isKeyInLocalStorage && (
              <p className="text-xs text-muted-foreground mt-1">
                A key is currently stored in your browser's local storage.
              </p>
            )}
          </div>

           <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-md text-yellow-700 text-sm flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Security Note:</span> Storing API keys in browser local storage is not secure for shared or production environments. This feature is for local development convenience.
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={handleClearKey} disabled={!isKeyInLocalStorage && !apiKeyInput}>
            Clear Key
          </Button>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveKey}>
              Set API Key for Session
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
