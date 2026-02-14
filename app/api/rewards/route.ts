import { NextResponse } from 'next/server';
import { dbOperations } from '@/lib/db';

export async function GET() {
  try {
    const studentId = 1; // 預設學生 ID
    const rewards = dbOperations.getRewards(studentId);
    
    return NextResponse.json(rewards || { stars: 0, total_correct: 0, total_questions: 0 });
  } catch (error) {
    console.error('獲取獎勵錯誤:', error);
    return NextResponse.json(
      { stars: 0, total_correct: 0, total_questions: 0 },
      { status: 200 } // 返回預設值而不是錯誤
    );
  }
}