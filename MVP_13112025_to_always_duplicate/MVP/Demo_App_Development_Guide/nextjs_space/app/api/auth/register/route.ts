import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body;

    console.log('Registration attempt:', { email, role, hasPassword: !!password });

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['STARTUP', 'INVESTOR'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate UUID for new user
    const userId = randomUUID();

    try {
      // Create user in database
      console.log('Creating user profile...');
      const user = await prisma.users.create({
        data: {
          id: userId,
          email,
          password: hashedPassword,
          name,
          role: role as 'STARTUP' | 'INVESTOR',
          updatedAt: new Date(),
        },
      });

      console.log('User profile created successfully');

      // NOTE: user_profiles table doesn't exist in current schema
      // The users table already has all necessary fields
      // Removed the user_profiles insertion that was causing FK constraint errors

      // Create role-specific profile
      if (role === 'STARTUP') {
        console.log('Creating startup profile...');
        await prisma.startup_profiles.create({
          data: {
            id: randomUUID(),
            userId: user.id,
            companyName: name || 'My Startup',
            industry: 'Technology',
            stage: 'Pre-Seed',
            updatedAt: new Date(),
          },
        });
        console.log('Startup profile created successfully');
      } else if (role === 'INVESTOR') {
        console.log('Creating investor profile...');
        await prisma.investor_profiles.create({
          data: {
            id: randomUUID(),
            userId: user.id,
            updatedAt: new Date(),
          },
        });
        console.log('Investor profile created successfully');
      }

      console.log('Registration completed successfully for:', email);
      return NextResponse.json(
        {
          users: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: `Failed to create users: ${dbError instanceof Error ? dbError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Registration error (catch block):', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
