/**
 * Annotation System Types
 *
 * Defines the data structures for the collaborative annotation system.
 * Based on W3C Web Annotation Data Model with custom extensions.
 */

/**
 * Annotation Target - Where the annotation is placed
 */
export interface AnnotationTarget {
  /** ID of the report/document being annotated */
  reportId: string;
  /** Page number in the PDF (1-indexed) */
  pageNumber: number;
  /** SVG selector for precise positioning (Annotorious format) */
  selector: {
    type: 'SvgSelector';
    value: string; // SVG path/rect/circle data
  };
  /** Bounding box for quick positioning */
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Annotation Body - Content of the annotation
 */
export interface AnnotationBody {
  /** Type of annotation content */
  type: 'TextualBody' | 'Tag';
  /** Text content or tag value */
  value: string;
  /** Purpose: commenting, tagging, highlighting, etc. */
  purpose: 'commenting' | 'tagging' | 'highlighting' | 'replying';
  /** Format (for TextualBody) */
  format?: 'text/plain' | 'text/html' | 'text/markdown';
  /** Language code (e.g., 'fr', 'en') */
  language?: string;
}

/**
 * Annotation Status
 */
export type AnnotationStatus = 'draft' | 'published' | 'resolved' | 'archived';

/**
 * Annotation Priority
 */
export type AnnotationPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Complete Annotation Object
 */
export interface Annotation {
  /** Unique annotation ID (UUID) */
  id: string;
  /** W3C Annotation type */
  type: 'Annotation';
  /** Target (where the annotation is) */
  target: AnnotationTarget;
  /** Body (annotation content) - can have multiple bodies */
  body: AnnotationBody[];

  // Metadata
  /** User ID who created the annotation */
  createdBy: string;
  /** User email who created the annotation */
  createdByEmail: string;
  /** Creation timestamp (ISO 8601) */
  created: string;
  /** Last modification timestamp (ISO 8601) */
  modified: string;
  /** Last user ID who modified */
  modifiedBy: string;

  // Collaborative features
  /** Annotation status */
  status: AnnotationStatus;
  /** Priority level */
  priority: AnnotationPriority;
  /** Thread ID for replies (same as parent annotation ID) */
  threadId?: string;
  /** Parent annotation ID (for replies) */
  replyTo?: string;
  /** Number of replies to this annotation */
  replyCount: number;
  /** Users mentioned in the annotation (@username) */
  mentions: string[];

  // Display properties
  /** Highlight color (hex code) */
  color: string;
  /** Whether annotation is visible */
  visible: boolean;
  /** Tags for categorization */
  tags: string[];
}

/**
 * Annotation creation payload (client to server)
 */
export interface CreateAnnotationPayload {
  target: AnnotationTarget;
  body: AnnotationBody[];
  status?: AnnotationStatus;
  priority?: AnnotationPriority;
  color?: string;
  tags?: string[];
  replyTo?: string;
}

/**
 * Annotation update payload (client to server)
 */
export interface UpdateAnnotationPayload {
  body?: AnnotationBody[];
  status?: AnnotationStatus;
  priority?: AnnotationPriority;
  color?: string;
  tags?: string[];
  visible?: boolean;
}

/**
 * Annotation filters for queries
 */
export interface AnnotationFilters {
  reportId?: string;
  pageNumber?: number;
  createdBy?: string;
  status?: AnnotationStatus | AnnotationStatus[];
  priority?: AnnotationPriority | AnnotationPriority[];
  tags?: string[];
  threadId?: string;
  search?: string; // Full-text search
}

/**
 * Annotation list response from API
 */
export interface AnnotationListResponse {
  annotations: Annotation[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Annotation statistics
 */
export interface AnnotationStats {
  total: number;
  byStatus: Record<AnnotationStatus, number>;
  byPriority: Record<AnnotationPriority, number>;
  byUser: Record<string, number>;
  recentActivity: {
    date: string;
    count: number;
  }[];
}

/**
 * Real-time annotation event (for WebSocket/SSE)
 */
export interface AnnotationEvent {
  type: 'created' | 'updated' | 'deleted' | 'resolved';
  annotation: Annotation;
  userId: string;
  timestamp: string;
}

/**
 * Annotorious-specific formats for integration
 */
export interface AnnotoriousAnnotation {
  '@context': 'http://www.w3.org/ns/anno.jsonld';
  id: string;
  type: 'Annotation';
  body: AnnotationBody[];
  target: {
    selector: {
      type: 'SvgSelector';
      value: string;
    };
  };
}

/**
 * Helper type for annotation colors
 */
export const ANNOTATION_COLORS = {
  default: '#3b82f6', // blue-500
  comment: '#8b5cf6', // violet-500
  highlight: '#fbbf24', // amber-400
  issue: '#ef4444', // red-500
  resolved: '#10b981', // green-500
  info: '#06b6d4', // cyan-500
} as const;

export type AnnotationColorKey = keyof typeof ANNOTATION_COLORS;
