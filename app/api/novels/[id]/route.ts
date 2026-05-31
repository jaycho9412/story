import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const novel = await prisma.novel.findUnique({
      where: { id: parseInt(id) },
      include: {
        reviews: {
          include: {
            user: { select: { username: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!novel) return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
    
    return NextResponse.json(novel);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch novel' }, { status: 500 });
  }
}
