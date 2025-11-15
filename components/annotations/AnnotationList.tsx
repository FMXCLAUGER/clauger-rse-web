'use client';

import { useState } from 'react';
import type { Annotation, AnnotationStatus, AnnotationPriority } from '@/types/annotation-types';
import { MessageSquare, Tag, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';

interface AnnotationListProps {
  annotations: Annotation[];
  onSelectAnnotation: (annotation: Annotation) => void;
  selectedAnnotationId?: string | null;
}

const STATUS_LABELS: Record<AnnotationStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  resolved: 'Résolu',
  archived: 'Archivé',
};

const PRIORITY_COLORS: Record<AnnotationPriority, string> = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  critical: 'text-red-500',
};

export function AnnotationList({
  annotations,
  onSelectAnnotation,
  selectedAnnotationId,
}: AnnotationListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [filterStatus, setFilterStatus] = useState<AnnotationStatus | 'all'>('all');

  // Filter annotations
  const filteredAnnotations = annotations.filter(
    (ann) => filterStatus === 'all' || ann.status === filterStatus
  );

  // Sort annotations
  const sortedAnnotations = [...filteredAnnotations].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    } else {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
  });

  const getCommentPreview = (annotation: Annotation) => {
    const commentBody = annotation.body.find((b) => b.purpose === 'commenting');
    const text = commentBody?.value || 'Aucun commentaire';
    return text.length > 80 ? text.substring(0, 80) + '...' : text;
  };

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Annotations ({annotations.length})
        </h2>

        {/* Filters */}
        <div className="space-y-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as AnnotationStatus | 'all')}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillons</option>
            <option value="published">Publiés</option>
            <option value="resolved">Résolus</option>
            <option value="archived">Archivés</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
          >
            <option value="date">Trier par date</option>
            <option value="priority">Trier par priorité</option>
          </select>
        </div>
      </div>

      {/* Annotation list */}
      <div className="flex-1 overflow-y-auto">
        {sortedAnnotations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune annotation</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedAnnotations.map((annotation) => (
              <button
                key={annotation.id}
                onClick={() => onSelectAnnotation(annotation)}
                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  selectedAnnotationId === annotation.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary'
                    : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: annotation.color }}
                    />
                    <span
                      className={`text-xs font-medium ${
                        PRIORITY_COLORS[annotation.priority]
                      }`}
                    >
                      {annotation.priority.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {STATUS_LABELS[annotation.status]}
                  </span>
                </div>

                {/* Comment preview */}
                <p className="text-sm text-gray-900 dark:text-white mb-2">
                  {getCommentPreview(annotation)}
                </p>

                {/* Tags */}
                {annotation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {annotation.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                    {annotation.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{annotation.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {annotation.createdByEmail.split('@')[0]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(annotation.created).toLocaleDateString('fr-FR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span>Page {annotation.target.pageNumber}</span>
                </div>

                {/* Reply count */}
                {annotation.replyCount > 0 && (
                  <div className="mt-2 text-xs text-primary font-medium">
                    {annotation.replyCount} réponse{annotation.replyCount > 1 ? 's' : ''}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">Brouillons:</span>{' '}
            {annotations.filter((a) => a.status === 'draft').length}
          </div>
          <div>
            <span className="font-medium">Résolus:</span>{' '}
            {annotations.filter((a) => a.status === 'resolved').length}
          </div>
        </div>
      </div>
    </div>
  );
}
