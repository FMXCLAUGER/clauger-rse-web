import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth-config';
import {
  createAnnotation,
  listAnnotations,
} from '@/lib/storage/annotation-storage';
import type { CreateAnnotationPayload, AnnotationFilters } from '@/types/annotation-types';

/**
 * GET /api/annotations
 * List annotations with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    const filters: AnnotationFilters = {
      reportId: searchParams.get('reportId') || undefined,
      pageNumber: searchParams.get('pageNumber')
        ? Number(searchParams.get('pageNumber'))
        : undefined,
      createdBy: searchParams.get('createdBy') || undefined,
      status: searchParams.get('status') as any,
      priority: searchParams.get('priority') as any,
      threadId: searchParams.get('threadId') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const page = Number(searchParams.get('page') || '1');
    const pageSize = Number(searchParams.get('pageSize') || '50');

    const result = await listAnnotations(filters, page, pageSize);

    return NextResponse.json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching annotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annotations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/annotations
 * Create a new annotation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: CreateAnnotationPayload = await request.json();

    // Validate required fields
    if (!payload.target || !payload.body) {
      return NextResponse.json(
        { error: 'Missing required fields: target, body' },
        { status: 400 }
      );
    }

    const annotation = await createAnnotation(
      payload,
      session.user.id,
      session.user.email
    );

    return NextResponse.json(annotation, { status: 201 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating annotation:', error);
    return NextResponse.json(
      { error: 'Failed to create annotation' },
      { status: 500 }
    );
  }
}
