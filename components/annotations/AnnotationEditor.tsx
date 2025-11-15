'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
  Annotation,
  AnnotationStatus,
  AnnotationPriority,
  UpdateAnnotationPayload,
} from '@/types/annotation-types';
import { ANNOTATION_COLORS, type AnnotationColorKey } from '@/types/annotation-types';

interface AnnotationEditorProps {
  annotation: Annotation | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (annotationId: string, payload: UpdateAnnotationPayload) => void;
  onDelete: (annotationId: string) => void;
}

const STATUS_OPTIONS: { value: AnnotationStatus; label: string }[] = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publié' },
  { value: 'resolved', label: 'Résolu' },
  { value: 'archived', label: 'Archivé' },
];

const PRIORITY_OPTIONS: { value: AnnotationPriority; label: string }[] = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
  { value: 'critical', label: 'Critique' },
];

export function AnnotationEditor({
  annotation,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: AnnotationEditorProps) {
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<AnnotationStatus>('draft');
  const [priority, setPriority] = useState<AnnotationPriority>('medium');
  const [color, setColor] = useState<string>(ANNOTATION_COLORS.default);
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (annotation) {
      const commentBody = annotation.body.find((b) => b.purpose === 'commenting');
      setComment(commentBody?.value || '');
      setStatus(annotation.status);
      setPriority(annotation.priority);
      setColor(annotation.color);
      setTags(annotation.tags.join(', '));
    } else {
      setComment('');
      setStatus('draft');
      setPriority('medium');
      setColor(ANNOTATION_COLORS.default);
      setTags('');
    }
  }, [annotation]);

  const handleSave = () => {
    if (!annotation) return;

    const payload: UpdateAnnotationPayload = {
      body: [
        {
          type: 'TextualBody',
          value: comment,
          purpose: 'commenting',
          format: 'text/plain',
          language: 'fr',
        },
      ],
      status,
      priority,
      color,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    onSave(annotation.id, payload);
    onClose();
  };

  const handleDelete = () => {
    if (!annotation) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annotation ?')) {
      onDelete(annotation.id);
      onClose();
    }
  };

  if (!annotation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier l'annotation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire</Label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ajoutez votre commentaire..."
              className="w-full min-h-[120px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white resize-none"
              autoFocus
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as AnnotationStatus)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as AnnotationPriority)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex gap-2">
              {Object.entries(ANNOTATION_COLORS).map(([key, colorValue]) => (
                <button
                  key={key}
                  onClick={() => setColor(colorValue)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === colorValue
                      ? 'border-gray-900 dark:border-white scale-110'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: colorValue }}
                  aria-label={key}
                  title={key}
                />
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="urgent, technique, question..."
            />
          </div>

          {/* Metadata */}
          <div className="text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p>Créé par {annotation.createdByEmail}</p>
            <p>
              Le {new Date(annotation.created).toLocaleDateString('fr-FR')} à{' '}
              {new Date(annotation.created).toLocaleTimeString('fr-FR')}
            </p>
            {annotation.modified !== annotation.created && (
              <p className="text-xs mt-1">
                Modifié le {new Date(annotation.modified).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={handleSave}>Enregistrer</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
