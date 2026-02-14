import { NextResponse } from 'next/server';
import { dbOperations } from '@/lib/db';

// 獲取連續天數
export async function GET() {
  try {
    const studentId = 1; // 預設學生
    const streak = await dbOperations.getStreak(studentId);
    
    return NextResponse.json({
      success: true,
      streak: streak || {
        streak_days: 0,
        longest_streak: 0,
        last_practice_date: null,
        total_practice_days: 0
      }
    });
  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch streak data' },
      { status: 500 }
    );
  }
}

// 更新連續天數（答題時自動更新）
export async function POST() {
  try {
    const studentId = 1; // 預設學生
    await dbOperations.updateStreak(studentId);
    const updatedStreak = await dbOperations.getStreak(studentId);
    
    return NextResponse.json({
      success: true,
      streak: updatedStreak
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update streak' },
      { status: 500 }
    );
  }
}
