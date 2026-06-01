import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();

    const novels = await prisma.novel.findMany({
      where: q ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { author: { contains: q, mode: 'insensitive' } },
          { tags: { some: { name: { contains: q, mode: 'insensitive' } } } },
        ],
      } : undefined,
      include: {
        reviews: { select: { rating: true } },
        tags: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(novels);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch novels' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    jwt.verify(token, JWT_SECRET);

    const { title, author, coverUrl, description, booksUrl } = await request.json();
    if (!title || !title.trim()) {
      return NextResponse.json({ error: '書名為必填欄位' }, { status: 400 });
    }

    const novel = await prisma.novel.create({
      data: {
        title: title.trim(),
        author: (author || '').trim() || '未知作者',
        coverUrl: coverUrl?.trim() || '',
        description: description?.trim() || '',
        booksUrl: booksUrl?.trim() || '',
      },
    });

    return NextResponse.json({ message: 'Created successfully', novel });
  } catch (error) {
    console.error('Novel create error:', error);
    return NextResponse.json({ error: '新增失敗' }, { status: 500 });
  }
}

