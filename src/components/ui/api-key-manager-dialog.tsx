
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, AlertTriangle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'googleApiKey';

interface ApiKeyManagerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ApiKeyManagerDialog({ isOpen, onOpenChange }: ApiKeyManagerDialogProps) {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [storedApiKey, setStoredApiKey] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const keyFromStorage = localStorage.getItem(LOCAL_STORAGE_KEY);
      setStoredApiKey(keyFromStorage);
      setApiKeyInput(keyFromStorage || '');
    }
  }, [isOpen]);

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem(LOCAL_STORAGE_KEY, apiKeyInput.trim());
      setStoredApiKey(apiKeyInput.trim());
      toast({
        title: "API Key Saved Locally",
        description: "Your API key has been saved in your browser's local storage. Remember to update your .env file and restart the server for it to take effect.",
      });
    } else {
      handleClearKey(); // Clear if input is empty
    }
    onOpenChange(false);
  };

  const handleClearKey = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setStoredApiKey(null);
    setApiKeyInput('');
    toast({
      title: "API Key Cleared Locally",
      description: "Your API key has been removed from your browser's local storage.",
    });
    onOpenChange(false);
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
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Google AI API Key"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
            />
            {storedApiKey && (
              <p className="text-xs text-muted-foreground">
                An API key is currently stored locally.
              </p>
            )}
          </div>
          <div className="p-3 bg-primary/10 border border-primary/30 rounded-md text-sm">
            <p className="font-semibold text-primary mb-1">Important Activation Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-foreground/80">
              <li>To enable AI features, copy this key.</li>
              <li>Open the <code className="bg-muted px-1 py-0.5 rounded">.env</code> file in your project.</li>
              <li>Set or update the line: <code className="bg-muted px-1 py-0.5 rounded">GOOGLE_API_KEY=YOUR_API_KEY_HERE</code> (replace <code className="bg-muted px-1 py-0.5 rounded">YOUR_API_KEY_HERE</code> with your actual key).</li>
              <li><strong>Restart your development server</strong> (e.g., stop and re-run <code className="bg-muted px-1 py-0.5 rounded">npm run dev</code>).</li>
            </ol>
          </div>
          <div className="flex items-start p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm">
            <AlertTriangle className="h-5 w-5 text-destructive mr-2 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-destructive mb-1">Security Note:</p>
              <p className="text-destructive/80">
                Saving API keys in browser local storage is for development convenience only. Do not use this method for production or shared environments where security is critical. The key is accessible via browser developer tools.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between gap-2">
          <Button type="button" variant="outline" onClick={handleClearKey} className={!storedApiKey ? 'invisible' : ''}>
            Clear Stored Key
          </Button>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
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
