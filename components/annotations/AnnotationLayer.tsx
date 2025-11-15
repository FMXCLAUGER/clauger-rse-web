'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type {
  Annotation,
  AnnotationTarget,
  AnnotationBody,
  CreateAnnotationPayload,
} from '@/types/annotation-types';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

// Type for Annotorious class
type Annotorious = any;

interface AnnotationLayerProps {
  /** Container element that holds the image/PDF page */
  imageElement: HTMLImageElement | null;
  /** Report ID */
  reportId: string;
  /** Current page number */
  pageNumber: number;
  /** Existing annotations to display */
  annotations: Annotation[];
  /** Callback when annotation is created */
  onCreateAnnotation: (payload: CreateAnnotationPayload) => void;
  /** Callback when annotation is selected */
  onSelectAnnotation?: (annotation: Annotation | null) => void;
  /** Whether annotation mode is enabled */
  enabled?: boolean;
  /** Current annotation color */
  color?: string;
}

/**
 * AnnotationLayer Component
 *
 * Integrates Annotorious library to enable annotation creation and display.
 * Wraps an image element and provides drawing tools.
 */
export function AnnotationLayer({
  imageElement,
  reportId,
  pageNumber,
  annotations,
  onCreateAnnotation,
  onSelectAnnotation,
  enabled = true,
  color = '#3b82f6',
}: AnnotationLayerProps) {
  const { data: session } = useSession();
  const annoRef = useRef<Annotorious | null>(null);
  const [AnnotoriousClass, setAnnotoriousClass] = useState<any>(null);

  /**
   * Load Annotorious library dynamically (client-side only)
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load CSS and JS in parallel
    Promise.all([
      import('@recogito/annotorious/dist/annotorious.min.css'),
      import('@recogito/annotorious')
    ]).then(([_, mod]) => {
      setAnnotoriousClass(() => mod.Annotorious);
    });
  }, []);

  /**
   * Initialize Annotorious
   */
  useEffect(() => {
    if (!imageElement || !AnnotoriousClass) return;

    // Initialize Annotorious instance
    const anno = new AnnotoriousClass({
      image: imageElement,
      readOnly: !enabled || !session?.user,
      allowEmpty: false,
      drawOnSingleClick: false,
    });

    annoRef.current = anno;

    // Load existing annotations
    loadAnnotationsToAnnotorious(annotations);

    // Event: Annotation created
    anno.on('createAnnotation', handleAnnotoriousCreate);

    // Event: Annotation selected
    anno.on('selectAnnotation', handleAnnotoriousSelect);

    // Event: Annotation updated (moved/resized)
    anno.on('updateAnnotation', handleAnnotoriousUpdate);

    // Cleanup
    return () => {
      try {
        // Only destroy if the image element is still in the DOM
        // This prevents errors when React has already removed the DOM node
        if (anno && imageElement && imageElement.parentNode) {
          anno.destroy();
        }
      } catch (error) {
        // Silently catch any remaining cleanup errors
        // This can happen during fast unmounts or in React Strict Mode
      }
      annoRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageElement, enabled, session, AnnotoriousClass]);

  /**
   * Update annotations when they change
   */
  useEffect(() => {
    if (!annoRef.current) return;
    loadAnnotationsToAnnotorious(annotations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations]);

  /**
   * Update enabled state
   * Note: @recogito/annotorious v2 doesn't have setDrawingEnabled for standard images
   * We need to toggle readOnly mode instead, which requires reinitializing
   */
  useEffect(() => {
    if (!annoRef.current || !imageElement || !AnnotoriousClass) return;

    // Destroy and recreate with new readOnly setting
    // This is necessary because readOnly can't be changed dynamically in v2
    const currentAnnotations = annoRef.current.getAnnotations();

    try {
      // Only destroy if the image element is still in the DOM
      if (imageElement && imageElement.parentNode) {
        annoRef.current.destroy();
      }
    } catch (error) {
      // Silently catch any remaining cleanup errors
    }

    const anno = new AnnotoriousClass({
      image: imageElement,
      readOnly: !enabled || !session?.user,
      allowEmpty: false,
      drawOnSingleClick: false,
    });

    annoRef.current = anno;

    // Restore annotations
    if (currentAnnotations.length > 0) {
      anno.setAnnotations(currentAnnotations);
    }

    // Re-attach event handlers
    anno.on('createAnnotation', handleAnnotoriousCreate);
    anno.on('selectAnnotation', handleAnnotoriousSelect);
    anno.on('updateAnnotation', handleAnnotoriousUpdate);
  }, [enabled, session, AnnotoriousClass]);

  /**
   * Load annotations into Annotorious
   */
  const loadAnnotationsToAnnotorious = useCallback(
    (anns: Annotation[]) => {
      if (!annoRef.current) return;

      // Convert our annotations to Annotorious format
      const annotoriousAnnotations = anns.map((ann) => ({
        '@context': 'http://www.w3.org/ns/anno.jsonld',
        id: ann.id,
        type: 'Annotation',
        body: ann.body,
        target: {
          selector: ann.target.selector,
        },
      }));

      // Clear and reload
      annoRef.current.setAnnotations(annotoriousAnnotations);

      // Apply custom styles based on annotation properties
      anns.forEach((ann) => {
        applyAnnotationStyle(ann);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /**
   * Handle annotation creation from Annotorious
   */
  const handleAnnotoriousCreate = useCallback(
    (annotoriousAnnotation: any) => {
      if (!session?.user?.email) return;

      // Extract selector information
      const selector = annotoriousAnnotation.target.selector;

      // Calculate bounding box from SVG selector
      const boundingBox = extractBoundingBox(selector.value);

      // Create annotation target
      const target: AnnotationTarget = {
        reportId,
        pageNumber,
        selector: {
          type: 'SvgSelector',
          value: selector.value,
        },
        boundingBox,
      };

      // Create annotation body
      const body: AnnotationBody[] = [
        {
          type: 'TextualBody',
          value: '', // Will be filled by AnnotationEditor
          purpose: 'commenting',
          format: 'text/plain',
          language: 'fr',
        },
      ];

      // Create payload
      const payload: CreateAnnotationPayload = {
        target,
        body,
        color,
        status: 'draft',
        priority: 'medium',
        tags: [],
      };

      onCreateAnnotation(payload);
    },
    [session, reportId, pageNumber, color, onCreateAnnotation]
  );

  /**
   * Handle annotation selection
   */
  const handleAnnotoriousSelect = useCallback(
    (annotoriousAnnotation: any) => {
      if (!onSelectAnnotation) return;

      if (!annotoriousAnnotation) {
        onSelectAnnotation(null);
        return;
      }

      // Find our annotation by ID
      const annotation = annotations.find(
        (ann) => ann.id === annotoriousAnnotation.id
      );

      if (annotation) {
        onSelectAnnotation(annotation);
      }
    },
    [annotations, onSelectAnnotation]
  );

  /**
   * Handle annotation update (moved/resized)
   */
  const handleAnnotoriousUpdate = useCallback(
    (annotoriousAnnotation: any, previous: any) => {
      // Handle position/size updates if needed
      // For MVP, we'll keep this simple
      // eslint-disable-next-line no-console
      console.log('Annotation updated:', annotoriousAnnotation);
    },
    []
  );

  /**
   * Apply custom styling to annotation
   */
  const applyAnnotationStyle = useCallback((annotation: Annotation) => {
    if (!annoRef.current || typeof document === 'undefined') return;

    // Apply color, opacity, etc. based on annotation properties
    const element = document.querySelector(
      `[data-id="${annotation.id}"]`
    ) as HTMLElement;

    if (element) {
      element.style.stroke = annotation.color;
      element.style.fill = annotation.color;
      element.style.opacity = annotation.visible ? '0.3' : '0.1';

      // Different styles based on status
      if (annotation.status === 'resolved') {
        element.style.strokeDasharray = '5,5';
      }
    }
  }, []);

  /**
   * Extract bounding box from SVG path
   */
  const extractBoundingBox = (svgValue: string) => {
    // Guard against SSR
    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
      return { x: 0, y: 0, width: 100, height: 100 };
    }

    // Parse SVG to extract bounding box
    // This is a simplified version - in production, use proper SVG parsing
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<svg>${svgValue}</svg>`,
      'image/svg+xml'
    );
    const svgElement = doc.querySelector('svg > *');

    if (svgElement) {
      const bbox = (svgElement as SVGGraphicsElement).getBBox();
      return {
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height,
      };
    }

    // Fallback
    return { x: 0, y: 0, width: 100, height: 100 };
  };

  // This component doesn't render anything - it just manages Annotorious
  return null;
}
