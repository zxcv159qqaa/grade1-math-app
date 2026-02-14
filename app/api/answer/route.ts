import { NextRequest, NextResponse } from 'next/server';

// 簡單的記憶體儲存（生產環境應使用資料庫）
let userStats = {
  total_stars: 0,
  total_questions: 0,
  correct_answers: 0,
};

interface AnswerRequest {
  question: string;
  question_type: string;
  difficulty: number;
  correct_answer: string;
  user_answer: string;
  is_correct: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnswerRequest = await request.json();
    const { is_correct } = body;

    // 更新統計
    userStats.total_questions += 1;
    if (is_correct) {
      userStats.correct_answers += 1;
      userStats.total_stars += 1; // 答對得 1 顆星
    }

    // 回傳格式符合前端期待
    return NextResponse.json({
      success: true,
      rewards: {
        total_stars: userStats.total_stars,
        total_questions: userStats.total_questions,
        correct_answers: userStats.correct_answers,
      },
      message: is_correct ? '答對了！' : '再試試看！',
    });
  } catch (error) {
    console.error('Answer API error:', error);
    return NextResponse.json(
      { error: '無法記錄答案' },
      { status: 500 }
    );
  }
}

// 選擇性：提供 GET 方法查詢目前統計
export async function GET() {
  return NextResponse.json({
    rewards: userStats,
  });
}
