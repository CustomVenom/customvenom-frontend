import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate
    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: 'Invalid input. Password must be at least 8 characters.' },
        { status: 400 },
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with Design System v2.0 enums
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        tier: 'FREE', // Default to FREE tier (Hatchling)
        role: 'USER', // Default to USER role
        legacyRole: 'free', // Backward compatibility
        legacyTier: 'free', // Backward compatibility
        emailVerified: null, // Will be verified via email link later
      },
      select: {
        id: true,
        email: true,
        name: true,
        tier: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        message: 'Account created successfully. Please sign in.',
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error('Signup error:', error);

    // Handle unique constraint violations
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 },
    );
  }
}
