import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Toggle like on a journal
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const { id } = await params;
    const journalId = parseInt(id);
    const userId = decoded.userId;

    const existing = await prisma.journalLike.findUnique({
      where: { journalId_userId: { journalId, userId } },
    });

    if (existing) {
      await prisma.journalLike.delete({ where: { id: existing.id } });
      const count = await prisma.journalLike.count({ where: { journalId } });
      return NextResponse.json({ liked: false, count });
    } else {
      await prisma.journalLike.create({ data: { journalId, userId } });
      const count = await prisma.journalLike.count({ where: { journalId } });
      return NextResponse.json({ liked: true, count });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
