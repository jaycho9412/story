import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();

    const users = await prisma.user.findMany({
      where: q ? { username: { contains: q, mode: 'insensitive' } } : undefined,
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        _count: { select: { journals: true, reviews: true } },
      },
      orderBy: { username: 'asc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
