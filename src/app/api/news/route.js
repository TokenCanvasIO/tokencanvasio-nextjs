// src/app/api/news/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const coinId = searchParams.get('coin');
  
  if (!coinId) {
    return NextResponse.json({ error: 'Coin ID is required' }, { status: 400 });
  }

  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    console.error('CoinGecko API key is missing');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const newsResponse = await fetch(
      `https://pro-api.coingecko.com/api/v3/news?x_cg_pro_api_key=${apiKey}&page=1`,
      {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      }
    );

    if (!newsResponse.ok) {
      const errorBody = await newsResponse.text();
      console.error('CoinGecko API Error:', newsResponse.status, errorBody);
      return NextResponse.json({ error: 'Failed to fetch news from CoinGecko', details: errorBody }, { status: newsResponse.status });
    }

    const newsData = await newsResponse.json();

    if (!newsData || !newsData.data || !Array.isArray(newsData.data)) {
      console.error('Invalid news data structure:', newsData);
      return NextResponse.json([]);
    }

    // ✅ FIX: Filter news by coin, handling null values
    const searchTerm = coinId.toLowerCase();
    const filteredNews = newsData.data.filter(article => {
      const title = (article.title || '').toLowerCase();
      const description = (article.description || '').toLowerCase();
      return title.includes(searchTerm) || description.includes(searchTerm);
    });

    console.log(`[News API] Found ${filteredNews.length} articles for "${coinId}"`);
    return NextResponse.json(filteredNews);

  } catch (error) {
    console.error('API Route Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch or process news', details: error.message }, { status: 500 });
  }
}