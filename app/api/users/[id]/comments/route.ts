import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET) as { userId: number; role: string }; }
  catch { return null; }
}

// 取得留言牆
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await prisma.profileComment.findMany({
      where: { profileUserId: parseInt(id) },
      include: { author: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// 在版面留言
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await getAuthUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { content } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: '留言不能為空' }, { status: 400 });

    const comment = await prisma.profileComment.create({
      data: {
        content: content.trim(),
        profileUserId: parseInt(id),
        authorId: authUser.userId,
      },
      include: { author: { select: { id: true, username: true } } },
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
