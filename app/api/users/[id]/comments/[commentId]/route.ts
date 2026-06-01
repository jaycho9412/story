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

// 刪除留言（留言者本人 / 版面主人 / 管理員）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const authUser = await getAuthUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, commentId } = await params;
    const comment = await prisma.profileComment.findUnique({
      where: { id: parseInt(commentId) },
    });
    if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const isAuthor = comment.authorId === authUser.userId;
    const isProfileOwner = comment.profileUserId === authUser.userId;
    const isAdmin = authUser.role === 'admin';

    if (!isAuthor && !isProfileOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.profileComment.delete({ where: { id: parseInt(commentId) } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
