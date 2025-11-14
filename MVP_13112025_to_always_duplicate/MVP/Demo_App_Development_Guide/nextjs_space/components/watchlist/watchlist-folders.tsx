'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Folder, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface WatchlistFolder {
  id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  watchlists?: { count: number }[];
}

export function WatchlistFolders() {
  const [folders, setFolders] = useState<WatchlistFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3b82f6');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/watchlist/folders');
      if (!response.ok) throw new Error('Failed to fetch folders');
      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to load folders');
    } finally {
      setIsLoading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/watchlist/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName,
          color: newFolderColor,
          icon: 'folder',
        }),
      });

      if (!response.ok) throw new Error('Failed to create folder');
      
      const data = await response.json();
      setFolders([...folders, data.folder]);
      setNewFolderName('');
      setNewFolderColor('#3b82f6');
      setDialogOpen(false);
      toast.success('Folder created successfully');
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    } finally {
      setIsCreating(false);
    }
  };

  const colors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
  ];

  if (isLoading) {
    return <div className="p-4">Loading folders...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Watchlist Folders
            </CardTitle>
            <CardDescription>Organize your watched campaigns</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Organize your watchlist by creating custom folders
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="folder-name">Folder Name</Label>
                  <Input
                    id="folder-name"
                    placeholder="e.g., Hot Deals, Under Review"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Folder Color</Label>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewFolderColor(color.value)}
                        className={`w-10 h-10 rounded-lg border-2 ${
                          newFolderColor === color.value ? 'border-black dark:border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createFolder} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Folder'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {folders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No folders yet. Create one to organize your watchlist.</p>
            </div>
          ) : (
            folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: folder.color + '20' }}
                  >
                    <Folder className="h-5 w-5" style={{ color: folder.color }} />
                  </div>
                  <div>
                    <div className="font-medium">{folder.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {folder.watchlists?.[0]?.count || 0} campaigns
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
