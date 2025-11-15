import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth-config';
import {
  getAnnotation,
  updateAnnotation,
  deleteAnnotation,
} from '@/lib/storage/annotation-storage';
import type { UpdateAnnotationPayload } from '@/types/annotation-types';

/**
 * GET /api/annotations/[id]
 * Get a single annotation by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const annotation = await getAnnotation(params.id);

    if (!annotation) {
      return NextResponse.json({ error: 'Annotation not found' }, { status: 404 });
    }

    return NextResponse.json(annotation);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching annotation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annotation' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/annotations/[id]
 * Update an annotation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await getAnnotation(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Annotation not found' }, { status: 404 });
    }

    // Check if user owns the annotation (or is admin in the future)
    if (existing.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit your own annotations' },
        { status: 403 }
      );
    }

    const payload: UpdateAnnotationPayload = await request.json();

    const updated = await updateAnnotation(params.id, payload, session.user.id);

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update annotation' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating annotation:', error);
    return NextResponse.json(
      { error: 'Failed to update annotation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/annotations/[id]
 * Delete an annotation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await getAnnotation(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Annotation not found' }, { status: 404 });
    }

    // Check if user owns the annotation (or is admin in the future)
    if (existing.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own annotations' },
        { status: 403 }
      );
    }

    const success = await deleteAnnotation(params.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete annotation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting annotation:', error);
    return NextResponse.json(
      { error: 'Failed to delete annotation' },
      { status: 500 }
    );
  }
}
