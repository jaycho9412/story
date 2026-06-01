import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// 公開：取得所有人的心得
export async function GET() {
  try {
    const journals = await prisma.journal.findMany({
      include: {
        user: { select: { id: true, username: true } },
        likes: { select: { userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(journals);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch journals' }, { status: 500 });
  }
}

// 登入用戶發表心得
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const { title, content } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: '內容為必填' }, { status: 400 });

    const journal = await prisma.journal.create({
      data: { title: title?.trim(), content: content.trim(), userId: decoded.userId },
      include: { user: { select: { username: true } } },
    });
    return NextResponse.json(journal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create journal' }, { status: 500 });
  }
}
