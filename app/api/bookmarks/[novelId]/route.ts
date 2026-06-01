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

// 取消收藏
export async function DELETE(request: Request, { params }: { params: Promise<{ novelId: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { novelId } = await params;
    await prisma.bookmark.deleteMany({
      where: { userId: user.userId, novelId: parseInt(novelId) },
    });
    return NextResponse.json({ message: 'Bookmark removed' });
  } catch {
    return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 });
  }
}
