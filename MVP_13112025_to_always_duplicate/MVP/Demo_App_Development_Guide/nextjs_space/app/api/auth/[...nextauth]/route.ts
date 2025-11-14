/**
 * This file is deprecated - using Supabase Auth instead of NextAuth
 * Keeping for backward compatibility during migration
 * TODO: Remove after full migration to Supabase Auth
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'NextAuth is deprecated. Please use Supabase Auth.' },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'NextAuth is deprecated. Please use Supabase Auth.' },
    { status: 410 }
  );
}
