import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET) as { userId: number }; }
  catch { return null; }
}

// 取得自己的收藏
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.userId },
      include: {
        novel: {
          include: {
            reviews: { select: { rating: true } },
            tags: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bookmarks);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

// 新增收藏
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { novelId } = await request.json();
    const bookmark = await prisma.bookmark.upsert({
      where: { userId_novelId: { userId: user.userId, novelId } },
      update: {},
      create: { userId: user.userId, novelId },
    });
    return NextResponse.json(bookmark, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to add bookmark' }, { status: 500 });
  }
}
