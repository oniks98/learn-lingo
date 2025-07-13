import { NextResponse } from 'next/server';
import { getLoginSession } from '@/lib/api/auth';

export async function GET() {
  const session = await getLoginSession();
  return NextResponse.json({ session });
}
