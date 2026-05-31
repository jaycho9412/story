import { NextResponse } from 'next/server';
import axios from 'axios';

const OL_BASE = 'https://openlibrary.org/search.json';
const FIELDS = 'title,author_name,cover_i,first_publish_year';

async function searchOpenLibrary(query: string, limit = 8) {
  const url = `${OL_BASE}?q=${encodeURIComponent(query)}&limit=${limit}&fields=${FIELDS}`;
  const { data } = await axios.get(url, {
    timeout: 10000,
    headers: { 'User-Agent': 'NovelReviewSite/1.0' },
  });
  return data.docs || [];
}

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();
    if (!keyword || !keyword.trim()) {
      return NextResponse.json({ error: 'Keyword required' }, { status: 400 });
    }

    const kw = keyword.trim();
    const encodedKeyword = encodeURIComponent(kw);
    const fallbackUrl = `https://search.books.com.tw/search/query/key/${encodedKeyword}/cat/all`;

    let docs: any[] = [];

    try {
      // Primary search
      docs = await searchOpenLibrary(kw, 10);

      // If no results and keyword is likely Chinese, also try without limit on language
      if (docs.length === 0) {
        docs = await searchOpenLibrary(kw, 10);
      }
    } catch (apiErr: any) {
      console.error('Open Library API error:', apiErr?.message);
      return NextResponse.json({
        results: [],
        fallbackUrl,
        message: `Open Library 搜尋暫時無法連線。請直接前往博客來搜尋「${kw}」，複製書籍網址後貼入下方新增。`,
      });
    }

    if (!docs.length) {
      return NextResponse.json({
        results: [],
        fallbackUrl,
        message: `找不到「${kw}」的相關書籍。您可以直接前往博客來搜尋，複製書籍網址後貼入下方新增。`,
      });
    }

    const seen = new Set<string>();
    const results = docs
      .filter((doc: any) => {
        const key = (doc.title || '').toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8)
      .map((doc: any) => {
        const title = doc.title || '';
        const authors = doc.author_name ? doc.author_name.slice(0, 2).join(', ') : '';
        const coverId = doc.cover_i;
        const thumbnail = coverId
          ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
          : '';
        // Link to Books.com.tw search using the book title
        const booksSearchUrl = `https://search.books.com.tw/search/query/key/${encodeURIComponent(title)}/cat/all`;

        return {
          title,
          authors,
          year: doc.first_publish_year || '',
          thumbnail,
          url: booksSearchUrl,
        };
      });

    return NextResponse.json({ results, fallbackUrl });
  } catch (error: any) {
    console.error('Search route error:', error?.message);
    return NextResponse.json(
      { error: '搜尋失敗，請稍後再試或直接貼上博客來網址。' },
      { status: 500 }
    );
  }
}
