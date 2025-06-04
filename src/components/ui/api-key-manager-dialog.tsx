
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
import { KeyRound, AlertTriangle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'googleApiKey';

type ApiKeyManagerDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function ApiKeyManagerDialog({ isOpen, onOpenChange }: ApiKeyManagerDialogProps) {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY);
      setSavedApiKey(storedKey);
      setApiKeyInput(storedKey || '');
    }
  }, [isOpen]);

  const handleSaveKey = () => {
    if (!apiKeyInput.trim()) {
      toast({
        title: 'API Key is empty',
        description: 'Please enter a valid API key.',
        variant: 'destructive',
      });
      return;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, apiKeyInput);
    setSavedApiKey(apiKeyInput);
    toast({
      title: 'API Key Saved Locally',
      description: 'Your API key has been saved to browser local storage for convenience.',
    });
  };

  const handleClearKey = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSavedApiKey(null);
    setApiKeyInput('');
    toast({
      title: 'API Key Cleared',
      description: 'Your API key has been removed from browser local storage.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <KeyRound className="mr-2 h-5 w-5" /> Manage Google AI API Key
          </DialogTitle>
          <DialogDescription>
            Store your Google AI API key in your browser's local storage for convenience.
            For AI features to work, you MUST also set this key in your <code>.env</code> file and restart the server.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-md text-yellow-700 text-sm flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Important:</span> Storing API keys in browser local storage is not secure for production. This feature is for local development convenience only.
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
            {savedApiKey && (
              <p className="text-xs text-muted-foreground mt-1">
                A key is currently stored in local storage.
              </p>
            )}
          </div>

          <div className="p-3 bg-blue-50 border border-blue-300 rounded-md text-blue-700 text-sm">
            <p className="font-semibold mb-1">To activate AI Features:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Copy your API key.</li>
              <li>Open the <code>.env</code> file in the project root.</li>
              <li>Set <code>GOOGLE_API_KEY=YOUR_API_KEY_HERE</code> (replace <code>YOUR_API_KEY_HERE</code> with your actual key).</li>
              <li>Save the <code>.env</code> file.</li>
              <li>Restart your Next.js development server (usually by stopping and re-running <code>npm run dev</code>).</li>
            </ol>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={handleClearKey} disabled={!savedApiKey}>
            Clear Stored Key
          </Button>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveKey}>
              Save to Local Storage
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
