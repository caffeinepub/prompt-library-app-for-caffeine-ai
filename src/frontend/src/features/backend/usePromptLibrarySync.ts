import { useEffect, useCallback, useRef, useState } from 'react';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { usePromptStore } from '../prompts/promptStore';
import { useCategoryStore } from '../categories/categoryStore';
import { PromptLibraryApi } from './promptLibraryApi';
import { Prompt } from '../prompts/types';
import { toast } from 'sonner';
import { logBackendDiagnostic } from './actorDiagnostics';

/**
 * Hook that syncs prompt library data with the backend.
 * Loads data after authentication, performs connectivity checks, and provides action wrappers for CRUD operations.
 */
export function usePromptLibrarySync() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!(identity && !identity.getPrincipal().isAnonymous());
  
  const setPrompts = usePromptStore((state) => state.setPrompts);
  const clearPrompts = usePromptStore((state) => state.clearPrompts);
  
  const setCategories = useCategoryStore((state) => state.setCategories);
  const clearCategories = useCategoryStore((state) => state.clearCategories);
  
  const hasLoadedRef = useRef(false);
  const apiRef = useRef<PromptLibraryApi | null>(null);
  
  // Connectivity check state
  const [connectivityStatus, setConnectivityStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [connectivityError, setConnectivityError] = useState<Error | undefined>(undefined);

  // Initialize API when actor is available
  useEffect(() => {
    if (actor) {
      apiRef.current = new PromptLibraryApi(actor);
    } else {
      apiRef.current = null;
    }
  }, [actor]);

  // Perform connectivity check after actor is ready
  useEffect(() => {
    if (!isAuthenticated || !actor || actorFetching || connectivityStatus !== 'idle') {
      return;
    }

    const checkConnectivity = async () => {
      setConnectivityStatus('checking');
      try {
        // Use the backend's connectivity check endpoint
        await actor.backendConnectivityCheck();
        setConnectivityStatus('success');
        setConnectivityError(undefined);
      } catch (error: any) {
        const connectivityErr = new Error(
          error.message?.includes('Unauthorized') 
            ? 'Backend connection succeeded but authorization failed. Please try logging out and back in.'
            : 'Backend connectivity check failed. The app cannot reach the backend canister.'
        );
        setConnectivityError(connectivityErr);
        setConnectivityStatus('error');

        logBackendDiagnostic({
          phase: 'connectivity-check',
          isAuthenticated,
          principal: identity?.getPrincipal().toString(),
          error: connectivityErr,
          additionalContext: {
            originalError: error.message,
          },
        });
      }
    };

    checkConnectivity();
  }, [isAuthenticated, actor, actorFetching, connectivityStatus, identity]);

  // Load data from backend after connectivity check succeeds
  useEffect(() => {
    if (!isAuthenticated || !actor || actorFetching || hasLoadedRef.current || connectivityStatus !== 'success') {
      return;
    }

    const loadData = async () => {
      try {
        const api = new PromptLibraryApi(actor);
        const [backendPrompts, backendCategories] = await Promise.all([
          api.getAllPrompts(),
          api.getAllCategories(),
        ]);
        
        // Get current state for merging favorites
        const currentPrompts = usePromptStore.getState().prompts;
        
        // Merge with local favorites state
        const mergedPrompts = backendPrompts.map(bp => {
          const localPrompt = currentPrompts.find(p => p.id === bp.id);
          return {
            ...bp,
            isFavorite: localPrompt?.isFavorite || false,
            dateAdded: localPrompt?.dateAdded || bp.dateAdded,
            dateModified: localPrompt?.dateModified || bp.dateModified,
          };
        });
        
        setPrompts(mergedPrompts);
        setCategories(backendCategories);
        hasLoadedRef.current = true;
      } catch (error: any) {
        console.error('Failed to load prompts from backend:', error);
        if (error.message?.includes('Unauthorized')) {
          toast.error('Please sign in to access your prompts');
        } else {
          toast.error('Failed to load prompts from backend');
        }

        logBackendDiagnostic({
          phase: 'initialization',
          isAuthenticated,
          principal: identity?.getPrincipal().toString(),
          error,
        });
      }
    };

    loadData();
  }, [isAuthenticated, actor, actorFetching, connectivityStatus, setPrompts, setCategories, identity]);

  // Clear data on logout
  useEffect(() => {
    if (!isAuthenticated) {
      clearPrompts();
      clearCategories();
      hasLoadedRef.current = false;
      setConnectivityStatus('idle');
      setConnectivityError(undefined);
    }
  }, [isAuthenticated, clearPrompts, clearCategories]);

  // Determine if the system is ready for operations
  const isReady = connectivityStatus === 'success' && !!apiRef.current && isAuthenticated;

  // Action wrappers that persist to backend
  const savePrompt = useCallback(async (prompt: Prompt) => {
    if (!apiRef.current) {
      const error = new Error('Backend connection not ready. Please wait for the app to finish connecting.');
      logBackendDiagnostic({
        phase: 'operation',
        isAuthenticated,
        principal: identity?.getPrincipal().toString(),
        error,
        additionalContext: { operation: 'savePrompt', connectivityStatus },
      });
      throw error;
    }

    try {
      await apiRef.current.savePrompt(prompt);
      
      // Update local state
      const currentPrompts = usePromptStore.getState().prompts;
      const existingIndex = currentPrompts.findIndex(p => p.id === prompt.id);
      
      if (existingIndex >= 0) {
        const updated = [...currentPrompts];
        updated[existingIndex] = prompt;
        usePromptStore.getState().setPrompts(updated);
      } else {
        usePromptStore.getState().setPrompts([...currentPrompts, prompt]);
      }
    } catch (error: any) {
      console.error('Failed to save prompt:', error);
      const errorMessage = error.message?.includes('Unauthorized')
        ? 'You do not have permission to save prompts'
        : 'Failed to save prompt to backend';
      toast.error(errorMessage);

      logBackendDiagnostic({
        phase: 'operation',
        isAuthenticated,
        principal: identity?.getPrincipal().toString(),
        error,
        additionalContext: { operation: 'savePrompt', promptId: prompt.id },
      });

      throw error;
    }
  }, [isAuthenticated, identity, connectivityStatus]);

  const deletePrompt = useCallback(async (promptId: string) => {
    if (!apiRef.current) {
      const error = new Error('Backend connection not ready. Please wait for the app to finish connecting.');
      logBackendDiagnostic({
        phase: 'operation',
        isAuthenticated,
        principal: identity?.getPrincipal().toString(),
        error,
        additionalContext: { operation: 'deletePrompt', connectivityStatus },
      });
      throw error;
    }

    try {
      await apiRef.current.deletePrompt(promptId);
      
      // Update local state
      const currentPrompts = usePromptStore.getState().prompts;
      usePromptStore.getState().setPrompts(currentPrompts.filter(p => p.id !== promptId));
    } catch (error: any) {
      console.error('Failed to delete prompt:', error);
      const errorMessage = error.message?.includes('Unauthorized')
        ? 'You do not have permission to delete prompts'
        : 'Failed to delete prompt from backend';
      toast.error(errorMessage);

      logBackendDiagnostic({
        phase: 'operation',
        isAuthenticated,
        principal: identity?.getPrincipal().toString(),
        error,
        additionalContext: { operation: 'deletePrompt', promptId },
      });

      throw error;
    }
  }, [isAuthenticated, identity, connectivityStatus]);

  const saveCategory = useCallback(async (categoryName: string) => {
    if (!apiRef.current) {
      const error = new Error('Backend connection not ready. Please wait for the app to finish connecting.');
      logBackendDiagnostic({
        phase: 'operation',
        isAuthenticated,
        principal: identity?.getPrincipal().toString(),
        error,
        additionalContext: { operation: 'saveCategory', connectivityStatus },
      });
      throw error;
    }

    try {
      await apiRef.current.saveCategory(categoryName);
      
      // Update local state
      const currentCategories = useCategoryStore.getState().categories;
      if (!currentCategories.includes(categoryName)) {
        useCategoryStore.getState().addCategory(categoryName);
      }
    } catch (error: any) {
      console.error('Failed to save category:', error);
      const errorMessage = error.message?.includes('Unauthorized')
        ? 'You do not have permission to save categories'
        : 'Failed to save category to backend';
      toast.error(errorMessage);

      logBackendDiagnostic({
        phase: 'operation',
        isAuthenticated,
        principal: identity?.getPrincipal().toString(),
        error,
        additionalContext: { operation: 'saveCategory', categoryName },
      });

      throw error;
    }
  }, [isAuthenticated, identity, connectivityStatus]);

  const renameCategory = useCallback(async (oldName: string, newName: string) => {
    if (!apiRef.current) {
      const error = new Error('Backend connection not ready. Please wait for the app to finish connecting.');
      logBackendDiagnostic({
        phase: 'operation',
        isAuthenticated,
        principal: identity?.getPrincipal().toString(),
        error,
        additionalContext: { operation: 'renameCategory', connectivityStatus },
      });
      throw error;
    }

    try {
      // Use the backend's updateCategoryName method
      await apiRef.current.renameCategory(oldName, newName);
      
      // Update local state
      useCategoryStore.getState().renameCategory(oldName, newName);
      
      // Update local prompts
      const prompts = usePromptStore.getState().prompts;
      const updatedPrompts = prompts.map(p => ({
        ...p,
        categories: p.categories.map(c => c === oldName ? newName : c),
      }));
      usePromptStore.getState().setPrompts(updatedPrompts);
    } catch (error: any) {
      console.error('Failed to rename category:', error);
      toast.error('Failed to rename category');

      logBackendDiagnostic({
        phase: 'operation',
        isAuthenticated,
        principal: identity?.getPrincipal().toString(),
        error,
        additionalContext: { operation: 'renameCategory', oldName, newName },
      });

      throw error;
    }
  }, [isAuthenticated, identity, connectivityStatus]);

  const deleteCategory = useCallback(async (categoryName: string) => {
    if (!apiRef.current) {
      const error = new Error('Backend connection not ready. Please wait for the app to finish connecting.');
      logBackendDiagnostic({
        phase: 'operation',
        isAuthenticated,
        principal: identity?.getPrincipal().toString(),
        error,
        additionalContext: { operation: 'deleteCategory', connectivityStatus },
      });
      throw error;
    }

    try {
      // Delete category - backend handles detaching from prompts
      await apiRef.current.deleteCategory(categoryName);
      
      // Update local state
      useCategoryStore.getState().deleteCategory(categoryName);
      
      // Update local prompts
      const prompts = usePromptStore.getState().prompts;
      const updatedPrompts = prompts.map(p => ({
        ...p,
        categories: p.categories.filter(c => c !== categoryName),
      }));
      usePromptStore.getState().setPrompts(updatedPrompts);
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');

      logBackendDiagnostic({
        phase: 'operation',
        isAuthenticated,
        principal: identity?.getPrincipal().toString(),
        error,
        additionalContext: { operation: 'deleteCategory', categoryName },
      });

      throw error;
    }
  }, [isAuthenticated, identity, connectivityStatus]);

  const refreshFromBackend = useCallback(async () => {
    if (!apiRef.current) {
      const error = new Error('Backend connection not ready. Please wait for the app to finish connecting.');
      logBackendDiagnostic({
        phase: 'operation',
        isAuthenticated,
        principal: identity?.getPrincipal().toString(),
        error,
        additionalContext: { operation: 'refreshFromBackend', connectivityStatus },
      });
      throw error;
    }

    try {
      const [backendPrompts, backendCategories] = await Promise.all([
        apiRef.current.getAllPrompts(),
        apiRef.current.getAllCategories(),
      ]);
      
      // Get current state for merging favorites
      const currentPrompts = usePromptStore.getState().prompts;
      
      // Merge with local favorites state
      const mergedPrompts = backendPrompts.map(bp => {
        const localPrompt = currentPrompts.find(p => p.id === bp.id);
        return {
          ...bp,
          isFavorite: localPrompt?.isFavorite || false,
        };
      });
      
      setPrompts(mergedPrompts);
      setCategories(backendCategories);
    } catch (error: any) {
      console.error('Failed to refresh from backend:', error);
      toast.error('Failed to refresh data from backend');

      logBackendDiagnostic({
        phase: 'operation',
        isAuthenticated,
        principal: identity?.getPrincipal().toString(),
        error,
        additionalContext: { operation: 'refreshFromBackend' },
      });

      throw error;
    }
  }, [setPrompts, setCategories, isAuthenticated, identity, connectivityStatus]);

  return {
    isReady,
    isCheckingConnectivity: connectivityStatus === 'checking',
    connectivityError,
    savePrompt,
    deletePrompt,
    saveCategory,
    renameCategory,
    deleteCategory,
    refreshFromBackend,
  };
}
