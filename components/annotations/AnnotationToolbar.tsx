'use client';

import { MousePointer2, Highlighter, MessageSquare, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ANNOTATION_COLORS, type AnnotationColorKey } from '@/types/annotation-types';

interface AnnotationToolbarProps {
  enabled: boolean;
  onToggle: () => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  annotationCount: number;
}

export function AnnotationToolbar({
  enabled,
  onToggle,
  currentColor,
  onColorChange,
  annotationCount,
}: AnnotationToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* Toggle annotation mode */}
      <Button
        variant={enabled ? 'default' : 'outline'}
        size="sm"
        onClick={onToggle}
        className="flex items-center gap-2"
      >
        {enabled ? (
          <>
            <MessageSquare className="w-4 h-4" />
            Mode annotation actif
          </>
        ) : (
          <>
            <MousePointer2 className="w-4 h-4" />
            Activer annotations
          </>
        )}
      </Button>

      {/* Color picker */}
      {enabled && (
        <>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-500" />
            <div className="flex gap-1">
              {Object.entries(ANNOTATION_COLORS).map(([key, color]) => (
                <button
                  key={key}
                  onClick={() => onColorChange(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                    currentColor === color
                      ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-primary'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={key}
                  title={key}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Annotation count */}
      <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
        {annotationCount} annotation{annotationCount > 1 ? 's' : ''}
      </div>
    </div>
  );
}
