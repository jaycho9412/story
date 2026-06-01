import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

async function verifyToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET) as { userId: number; role: string }; }
  catch { return null; }
}

// 編輯心得（本人限定）
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const journal = await prisma.journal.findUnique({ where: { id: parseInt(id) } });
    if (!journal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (journal.userId !== user.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { title, content } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: '內容為必填' }, { status: 400 });

    const updated = await prisma.journal.update({
      where: { id: parseInt(id) },
      data: { title: title?.trim(), content: content.trim() },
      include: { user: { select: { username: true } } },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update journal' }, { status: 500 });
  }
}

// 刪除心得（本人或管理員）
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const journal = await prisma.journal.findUnique({ where: { id: parseInt(id) } });
    if (!journal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (journal.userId !== user.userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.journal.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete journal' }, { status: 500 });
  }
}
