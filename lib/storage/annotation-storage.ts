import { Redis } from '@upstash/redis';
import { v4 as uuidv4 } from 'uuid';
import type {
  Annotation,
  CreateAnnotationPayload,
  UpdateAnnotationPayload,
  AnnotationFilters,
  AnnotationListResponse,
} from '@/types/annotation-types';
import { ANNOTATION_COLORS } from '@/types/annotation-types';

/**
 * Annotation Storage Service
 *
 * Handles CRUD operations for annotations using Upstash Redis.
 * Uses Redis data structures for efficient querying and filtering.
 */

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Redis key patterns
const KEYS = {
  annotation: (id: string) => `annotation:${id}`,
  reportAnnotations: (reportId: string) => `report:${reportId}:annotations`,
  userAnnotations: (userId: string) => `user:${userId}:annotations`,
  allAnnotations: 'annotations:all',
  annotationsByPage: (reportId: string, page: number) =>
    `report:${reportId}:page:${page}:annotations`,
};

/**
 * Create a new annotation
 */
export async function createAnnotation(
  payload: CreateAnnotationPayload,
  userId: string,
  userEmail: string
): Promise<Annotation> {
  const now = new Date().toISOString();
  const annotationId = uuidv4();

  const annotation: Annotation = {
    id: annotationId,
    type: 'Annotation',
    target: payload.target,
    body: payload.body,
    createdBy: userId,
    createdByEmail: userEmail,
    created: now,
    modified: now,
    modifiedBy: userId,
    status: payload.status || 'draft',
    priority: payload.priority || 'medium',
    color: payload.color || ANNOTATION_COLORS.default,
    tags: payload.tags || [],
    replyTo: payload.replyTo,
    threadId: payload.replyTo || annotationId, // If reply, use parent's threadId, else create new thread
    replyCount: 0,
    mentions: [],
    visible: true,
  };

  // Store annotation
  await redis.set(KEYS.annotation(annotationId), JSON.stringify(annotation));

  // Add to indices
  await Promise.all([
    // Add to report annotations set
    redis.sadd(KEYS.reportAnnotations(payload.target.reportId), annotationId),

    // Add to user annotations set
    redis.sadd(KEYS.userAnnotations(userId), annotationId),

    // Add to all annotations set
    redis.sadd(KEYS.allAnnotations, annotationId),

    // Add to page-specific set
    redis.sadd(
      KEYS.annotationsByPage(payload.target.reportId, payload.target.pageNumber),
      annotationId
    ),
  ]);

  // If this is a reply, increment parent's reply count
  if (payload.replyTo) {
    const parentKey = KEYS.annotation(payload.replyTo);
    const parentData = await redis.get<string>(parentKey);
    if (parentData) {
      const parent: Annotation = JSON.parse(parentData);
      parent.replyCount++;
      parent.modified = now;
      await redis.set(parentKey, JSON.stringify(parent));
    }
  }

  return annotation;
}

/**
 * Get annotation by ID
 */
export async function getAnnotation(annotationId: string): Promise<Annotation | null> {
  const data = await redis.get<string>(KEYS.annotation(annotationId));
  return data ? JSON.parse(data) : null;
}

/**
 * Update annotation
 */
export async function updateAnnotation(
  annotationId: string,
  payload: UpdateAnnotationPayload,
  userId: string
): Promise<Annotation | null> {
  const existing = await getAnnotation(annotationId);
  if (!existing) return null;

  const now = new Date().toISOString();

  const updated: Annotation = {
    ...existing,
    ...payload,
    modified: now,
    modifiedBy: userId,
  };

  await redis.set(KEYS.annotation(annotationId), JSON.stringify(updated));

  return updated;
}

/**
 * Delete annotation
 */
export async function deleteAnnotation(annotationId: string): Promise<boolean> {
  const annotation = await getAnnotation(annotationId);
  if (!annotation) return false;

  // Remove from all indices
  await Promise.all([
    redis.del(KEYS.annotation(annotationId)),
    redis.srem(KEYS.reportAnnotations(annotation.target.reportId), annotationId),
    redis.srem(KEYS.userAnnotations(annotation.createdBy), annotationId),
    redis.srem(KEYS.allAnnotations, annotationId),
    redis.srem(
      KEYS.annotationsByPage(
        annotation.target.reportId,
        annotation.target.pageNumber
      ),
      annotationId
    ),
  ]);

  // If this annotation has replies, delete them too
  if (annotation.replyCount > 0) {
    const allIds = await redis.smembers(
      KEYS.reportAnnotations(annotation.target.reportId)
    );
    const replies = await Promise.all(
      allIds.map(async (id) => {
        const ann = await getAnnotation(id as string);
        return ann?.replyTo === annotationId ? ann : null;
      })
    );

    await Promise.all(
      replies.filter(Boolean).map((reply) => deleteAnnotation(reply!.id))
    );
  }

  return true;
}

/**
 * List annotations with filters
 */
export async function listAnnotations(
  filters: AnnotationFilters,
  page: number = 1,
  pageSize: number = 50
): Promise<AnnotationListResponse> {
  let annotationIds: string[] = [];

  // Get IDs based on filters
  if (filters.reportId && filters.pageNumber !== undefined) {
    // Most specific: report + page
    const ids = await redis.smembers(
      KEYS.annotationsByPage(filters.reportId, filters.pageNumber)
    );
    annotationIds = ids as string[];
  } else if (filters.reportId) {
    // Report-wide
    const ids = await redis.smembers(KEYS.reportAnnotations(filters.reportId));
    annotationIds = ids as string[];
  } else if (filters.createdBy) {
    // User-specific
    const ids = await redis.smembers(KEYS.userAnnotations(filters.createdBy));
    annotationIds = ids as string[];
  } else {
    // All annotations
    const ids = await redis.smembers(KEYS.allAnnotations);
    annotationIds = ids as string[];
  }

  // Fetch all annotations
  const annotations = (
    await Promise.all(annotationIds.map((id) => getAnnotation(id)))
  ).filter(Boolean) as Annotation[];

  // Apply additional filters
  let filtered = annotations;

  if (filters.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    filtered = filtered.filter((ann) => statuses.includes(ann.status));
  }

  if (filters.priority) {
    const priorities = Array.isArray(filters.priority)
      ? filters.priority
      : [filters.priority];
    filtered = filtered.filter((ann) => priorities.includes(ann.priority));
  }

  if (filters.tags?.length) {
    filtered = filtered.filter((ann) =>
      filters.tags!.some((tag) => ann.tags.includes(tag))
    );
  }

  if (filters.threadId) {
    filtered = filtered.filter((ann) => ann.threadId === filters.threadId);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((ann) => {
      const matchesBody = ann.body.some((b) =>
        b.value.toLowerCase().includes(searchLower)
      );
      const matchesTags = ann.tags.some((tag) =>
        tag.toLowerCase().includes(searchLower)
      );
      return matchesBody || matchesTags;
    });
  }

  // Sort by creation date (newest first)
  filtered.sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
  );

  // Pagination
  const total = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAnnotations = filtered.slice(startIndex, endIndex);

  return {
    annotations: paginatedAnnotations,
    total,
    page,
    pageSize,
    hasMore: endIndex < total,
  };
}

/**
 * Get annotation count for a report
 */
export async function getAnnotationCount(reportId: string): Promise<number> {
  const ids = await redis.smembers(KEYS.reportAnnotations(reportId));
  return ids.length;
}

/**
 * Get annotation count by page
 */
export async function getAnnotationCountByPage(
  reportId: string,
  pageNumber: number
): Promise<number> {
  const ids = await redis.smembers(
    KEYS.annotationsByPage(reportId, pageNumber)
  );
  return ids.length;
}
