import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const { novelId, rating, content } = await request.json();

    if (!novelId || !rating) {
      return NextResponse.json({ error: 'novelId and rating are required' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        novelId: parseInt(novelId),
        userId: decoded.userId,
        rating: parseInt(rating),
        content
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
