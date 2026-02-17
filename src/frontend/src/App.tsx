import React, { useState, useEffect } from 'react';
import { Plus, Settings, Heart, X, LogOut } from 'lucide-react';
import { SiFacebook, SiX, SiLinkedin, SiInstagram, SiGithub } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { SearchInput } from './components/search/SearchInput';
import { CategoryFilterBar } from './components/categories/CategoryFilterBar';
import { ViewModeToggle } from './components/views/ViewModeToggle';
import { SortDropdown } from './components/sorting/SortDropdown';
import { ImportExportControls } from './components/importExport/ImportExportControls';
import { PromptEditorDialog } from './components/prompts/PromptEditorDialog';
import { ManageCategoriesDialog } from './components/categories/ManageCategoriesDialog';
import { ConfirmDialog } from './components/prompts/ConfirmDialog';
import { PromptListView } from './components/prompts/PromptListView';
import { PromptGridView } from './components/prompts/PromptGridView';
import { PromptTableView } from './components/prompts/PromptTableView';
import { SignInScreen } from './components/auth/SignInScreen';
import { usePromptStore } from './features/prompts/promptStore';
import { useCategoryStore } from './features/categories/categoryStore';
import { filterPrompts } from './features/prompts/filtering';
import { sortPrompts } from './features/prompts/sorting';
import { useAutoPersist } from './features/storage/useAutoPersist';
import { loadFromStorage } from './features/storage/localStorage';
import { usePromptLibrarySync } from './features/backend/usePromptLibrarySync';
import { ViewMode, SortMode, Prompt } from './features/prompts/types';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useReliableIILogout } from './features/auth/useReliableIILogout';
import { checkAndClearLogoutPending } from './features/auth/iiProviderLogout';
import { useQueryClient } from '@tanstack/react-query';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortMode, setSortMode] = useState<SortMode>('dateAddedNewest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>(undefined);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [returnedFromLogout, setReturnedFromLogout] = useState(false);

  const { login, identity, isLoggingIn, isInitializing } = useInternetIdentity();
  const { logout: performLogout, isLoggingOut, lastError: logoutError } = useReliableIILogout();
  const queryClient = useQueryClient();

  const prompts = usePromptStore((state) => state.prompts);
  const toggleFavorite = usePromptStore((state) => state.toggleFavorite);
  const clearPrompts = usePromptStore((state) => state.clearPrompts);
  const clearCategories = useCategoryStore((state) => state.clearCategories);

  // Backend sync
  const { isReady, savePrompt, deletePrompt: deletePromptBackend, refreshFromBackend } = usePromptLibrarySync();

  // Check if user is authenticated
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  // Check for logout completion on mount
  useEffect(() => {
    const wasLoggingOut = checkAndClearLogoutPending();
    if (wasLoggingOut) {
      setReturnedFromLogout(true);
    }
  }, []);

  // Show feedback after returning from logout once auth state is settled
  useEffect(() => {
    if (returnedFromLogout && !isInitializing) {
      if (!isAuthenticated) {
        // Logout was successful
        toast.success('Successfully logged out');
      } else {
        // Still authenticated - logout failed
        toast.error('Logout failed. You are still signed in. Please try again.');
      }
      setReturnedFromLogout(false);
    }
  }, [returnedFromLogout, isAuthenticated, isInitializing]);

  // Show error if logout failed
  useEffect(() => {
    if (logoutError) {
      toast.error(logoutError.message);
    }
  }, [logoutError]);

  // Load view mode from storage on mount
  useEffect(() => {
    const data = loadFromStorage();
    if (data?.viewMode) {
      setViewMode(data.viewMode as ViewMode);
    }
  }, []);

  // Auto-persist UI preferences only
  useAutoPersist(viewMode);

  // If not authenticated, show sign-in screen
  if (!isAuthenticated) {
    return (
      <>
        <SignInScreen onSignIn={login} isLoggingIn={isLoggingIn} />
        <Toaster />
      </>
    );
  }

  // Determine if we're in the default empty state
  const isDefaultEmptyState = !selectedCategory && !showFavoritesOnly && !searchQuery.trim();

  // Filter and sort prompts - show empty array if in default empty state
  const displayPrompts = isDefaultEmptyState ? [] : filterPrompts(prompts, searchQuery, selectedCategory, showFavoritesOnly);
  const sortedPrompts = sortPrompts(displayPrompts, sortMode);

  const handleAddPrompt = () => {
    setEditingPrompt(undefined);
    setEditorOpen(true);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setEditorOpen(true);
  };

  const handleSavePrompt = async (data: Omit<Prompt, 'id' | 'dateAdded' | 'dateModified'>) => {
    try {
      if (editingPrompt) {
        // Update existing prompt
        const updatedPrompt = {
          ...editingPrompt,
          ...data,
          dateModified: Date.now(),
        };
        await savePrompt(updatedPrompt);
        toast.success('Prompt updated successfully');
      } else {
        // Create new prompt
        const newPrompt: Prompt = {
          ...data,
          id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          dateAdded: Date.now(),
          dateModified: Date.now(),
        };
        await savePrompt(newPrompt);
        toast.success('Prompt saved successfully');
      }
    } catch (error) {
      // Error already shown by sync hook, re-throw to keep dialog open
      throw error;
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm) {
      try {
        await deletePromptBackend(deleteConfirm);
        toast.success('Prompt deleted successfully');
      } catch (error) {
        // Error already shown by sync hook
      }
      setDeleteConfirm(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    const original = prompts.find((p) => p.id === id);
    if (!original) return;

    const duplicated: Prompt = {
      ...original,
      id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${original.title} (Copy)`,
      dateAdded: Date.now(),
      dateModified: Date.now(),
    };

    try {
      await savePrompt(duplicated);
      toast.success('Prompt duplicated successfully');
    } catch (error) {
      // Error already shown by sync hook
    }
  };

  const handleFavoritesToggle = () => {
    const newShowFavorites = !showFavoritesOnly;
    setShowFavoritesOnly(newShowFavorites);
    // Clear category selection when enabling favorites
    if (newShowFavorites) {
      setSelectedCategory(null);
    }
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    // Clear favorites when selecting a category
    if (category !== null) {
      setShowFavoritesOnly(false);
    }
  };

  const handleClearScreen = () => {
    setSelectedCategory(null);
    setShowFavoritesOnly(false);
    setSearchQuery('');
  };

  const handleLogOff = async () => {
    // Clear in-memory state
    clearPrompts();
    clearCategories();
    
    // Clear query cache
    queryClient.clear();
    
    // Perform logout
    await performLogout();
  };

  const appIdentifier = encodeURIComponent(window.location.hostname || 'prompt-library');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Prompt Library
                </h1>
                <p className="text-sm text-muted-foreground">Organize and manage your AI prompts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleClearScreen} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Clear Screen
              </Button>
              <Button onClick={handleLogOff} variant="outline" size="sm" disabled={isLoggingOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? 'Logging out...' : 'Log Off'}
              </Button>
              <ImportExportControls />
              <Button onClick={() => setManageCategoriesOpen(true)} variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
              <Button onClick={handleAddPrompt} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Prompt
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <SearchInput value={searchQuery} onChange={setSearchQuery} />
            <CategoryFilterBar
              selectedCategory={selectedCategory}
              showFavoritesOnly={showFavoritesOnly}
              onCategorySelect={handleCategorySelect}
              onFavoritesToggle={handleFavoritesToggle}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {sortedPrompts.length} prompt{sortedPrompts.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <SortDropdown sortMode={sortMode} onSortModeChange={setSortMode} />
                <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {isDefaultEmptyState ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-2">
              Select a category, toggle Favorites, or search to view prompts
            </p>
            <p className="text-muted-foreground text-sm">
              Use the filters above to browse your prompt library
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              <PromptListView
                prompts={sortedPrompts}
                onEdit={handleEditPrompt}
                onDelete={handleDeleteClick}
                onDuplicate={handleDuplicate}
                onToggleFavorite={toggleFavorite}
              />
            )}
            {viewMode === 'grid' && (
              <PromptGridView
                prompts={sortedPrompts}
                onEdit={handleEditPrompt}
                onDelete={handleDeleteClick}
                onDuplicate={handleDuplicate}
                onToggleFavorite={toggleFavorite}
              />
            )}
            {viewMode === 'table' && (
              <PromptTableView
                prompts={sortedPrompts}
                onEdit={handleEditPrompt}
                onDelete={handleDeleteClick}
                onDuplicate={handleDuplicate}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <Separator className="mb-6" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                Built with <Heart className="h-3 w-3 fill-red-500 text-red-500" /> using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-foreground transition-colors underline"
                >
                  caffeine.ai
                </a>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiGithub className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiX className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <PromptEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        prompt={editingPrompt}
        onSave={handleSavePrompt}
      />

      <ManageCategoriesDialog
        open={manageCategoriesOpen}
        onOpenChange={setManageCategoriesOpen}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Prompt"
        description="Are you sure you want to delete this prompt? This action cannot be undone."
        onConfirm={handleConfirmDelete}
      />

      <Toaster />
    </div>
  );
}

export default App;
