// src/app/api/news/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const coinId = searchParams.get('coin'); // e.g., 'bitcoin'

  if (!coinId) {
    return NextResponse.json(
      { error: 'Coin ID is required' },
      { status: 400 }
    );
  }

  // IMPORTANT: Add your CoinGecko API Key to your environment variables
  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    console.error('CoinGecko API key is missing');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const newsResponse = await fetch(`https://api.coingecko.com/api/v3/news?x_cg_demo_api_key=${apiKey}`);
    if (!newsResponse.ok) {
      throw new Error('Failed to fetch news from CoinGecko');
    }
    const newsData = await newsResponse.json();

    // Filter the news for the specific coin
    const filteredNews = newsData.data.filter(article => 
      article.title.toLowerCase().includes(coinId.toLowerCase()) || 
      article.description.toLowerCase().includes(coinId.toLowerCase())
    );

    // Return the filtered news
    return NextResponse.json(filteredNews);

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch or process news' },
      { status: 500 }
    );
  }
}