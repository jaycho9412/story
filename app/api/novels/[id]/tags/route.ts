import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    return decoded.role === 'admin' ? decoded : null;
  } catch { return null; }
}

// 為書籍加入標籤
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { id } = await params;
    const { tagId } = await request.json();

    await prisma.novel.update({
      where: { id: parseInt(id) },
      data: { tags: { connect: { id: tagId } } },
    });
    return NextResponse.json({ message: 'Tag added' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add tag' }, { status: 500 });
  }
}

// 從書籍移除標籤
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { id } = await params;
    const { tagId } = await request.json();

    await prisma.novel.update({
      where: { id: parseInt(id) },
      data: { tags: { disconnect: { id: tagId } } },
    });
    return NextResponse.json({ message: 'Tag removed' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove tag' }, { status: 500 });
  }
}
