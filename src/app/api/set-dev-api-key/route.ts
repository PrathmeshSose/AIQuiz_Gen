import { type NextRequest, NextResponse } from 'next/server';
import { setDeveloperApiKey } from '@/ai/apiKeyHolder';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development mode.' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const apiKey = body.apiKey; // Expects { apiKey: "YOUR_KEY" } or { apiKey: null }

    if (typeof apiKey === 'string' || apiKey === null) {
      setDeveloperApiKey(apiKey);
      return NextResponse.json({ message: apiKey ? 'API key set for current development session.' : 'API key cleared for current development session.' });
    }
    return NextResponse.json({ error: 'Invalid API key provided. Must be a string or null.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error setting dev API key:', error);
    return NextResponse.json({ error: 'Failed to set API key.', details: error.message || 'Unknown error' }, { status: 500 });
  }
}
