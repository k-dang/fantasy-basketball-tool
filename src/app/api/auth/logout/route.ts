import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // Clear all auth cookies
  cookieStore.delete('yahoo_access_token');
  cookieStore.delete('yahoo_refresh_token');
  cookieStore.delete('yahoo_token_expires_at');

  return NextResponse.json({ success: true });
}

