'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type {
  Annotation,
  CreateAnnotationPayload,
  UpdateAnnotationPayload,
  AnnotationFilters,
} from '@/types/annotation-types';

/**
 * useAnnotations Hook
 *
 * Manages annotation state and provides CRUD operations.
 * Connects to the annotation API and handles local state updates.
 */
export function useAnnotations(reportId: string, pageNumber?: number) {
  const { data: session } = useSession();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch annotations from the API
   */
  const fetchAnnotations = useCallback(
    async (filters?: AnnotationFilters) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append('reportId', reportId);
        if (pageNumber !== undefined) {
          params.append('pageNumber', String(pageNumber));
        }
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
              params.append(key, String(value));
            }
          });
        }

        const response = await fetch(`/api/annotations?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch annotations');
        }

        const data = await response.json();
        setAnnotations(data.annotations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching annotations:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [reportId, pageNumber]
  );

  /**
   * Create a new annotation
   */
  const createAnnotation = useCallback(
    async (payload: CreateAnnotationPayload): Promise<Annotation | null> => {
      if (!session?.user?.email) {
        setError('User must be authenticated to create annotations');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/annotations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to create annotation');
        }

        const newAnnotation: Annotation = await response.json();

        // Add to local state
        setAnnotations((prev) => [...prev, newAnnotation]);

        return newAnnotation;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error creating annotation:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  /**
   * Update an existing annotation
   */
  const updateAnnotation = useCallback(
    async (
      annotationId: string,
      payload: UpdateAnnotationPayload
    ): Promise<Annotation | null> => {
      if (!session?.user?.email) {
        setError('User must be authenticated to update annotations');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/annotations/${annotationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to update annotation');
        }

        const updatedAnnotation: Annotation = await response.json();

        // Update in local state
        setAnnotations((prev) =>
          prev.map((ann) => (ann.id === annotationId ? updatedAnnotation : ann))
        );

        return updatedAnnotation;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error updating annotation:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  /**
   * Delete an annotation
   */
  const deleteAnnotation = useCallback(
    async (annotationId: string): Promise<boolean> => {
      if (!session?.user?.email) {
        setError('User must be authenticated to delete annotations');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/annotations/${annotationId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete annotation');
        }

        // Remove from local state
        setAnnotations((prev) => prev.filter((ann) => ann.id !== annotationId));

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error deleting annotation:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  /**
   * Filter annotations locally
   */
  const filterAnnotations = useCallback(
    (filters: Partial<AnnotationFilters>) => {
      return annotations.filter((ann) => {
        if (filters.status && ann.status !== filters.status) return false;
        if (filters.priority && ann.priority !== filters.priority) return false;
        if (filters.createdBy && ann.createdBy !== filters.createdBy)
          return false;
        if (filters.tags?.length) {
          const hasTag = filters.tags.some((tag) => ann.tags.includes(tag));
          if (!hasTag) return false;
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesBody = ann.body.some((b) =>
            b.value.toLowerCase().includes(searchLower)
          );
          const matchesTags = ann.tags.some((tag) =>
            tag.toLowerCase().includes(searchLower)
          );
          if (!matchesBody && !matchesTags) return false;
        }
        return true;
      });
    },
    [annotations]
  );

  /**
   * Get annotation by ID
   */
  const getAnnotationById = useCallback(
    (annotationId: string) => {
      return annotations.find((ann) => ann.id === annotationId);
    },
    [annotations]
  );

  /**
   * Get annotations in a thread
   */
  const getAnnotationThread = useCallback(
    (threadId: string) => {
      return annotations.filter((ann) => ann.threadId === threadId);
    },
    [annotations]
  );

  /**
   * Initial load
   */
  useEffect(() => {
    fetchAnnotations();
  }, [fetchAnnotations]);

  return {
    // State
    annotations,
    isLoading,
    error,

    // CRUD operations
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    fetchAnnotations,

    // Utility functions
    filterAnnotations,
    getAnnotationById,
    getAnnotationThread,
  };
}
