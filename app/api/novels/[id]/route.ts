import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const novel = await prisma.novel.findUnique({
      where: { id: parseInt(id) },
      include: {
        reviews: {
          include: {
            user: { select: { id: true, username: true } }
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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const { title, author, coverUrl, description, booksUrl } = await request.json();
    if (!title?.trim()) return NextResponse.json({ error: '書名為必填' }, { status: 400 });

    const novel = await prisma.novel.update({
      where: { id: parseInt(id) },
      data: {
        title: title.trim(),
        author: author?.trim() || '未知作者',
        coverUrl: coverUrl?.trim() || '',
        description: description?.trim() || '',
        booksUrl: booksUrl?.trim() || '',
      },
    });

    return NextResponse.json(novel);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update novel' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    await prisma.review.deleteMany({ where: { novelId: parseInt(id) } });
    await prisma.novel.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ message: 'Novel deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete novel' }, { status: 500 });
  }
}
