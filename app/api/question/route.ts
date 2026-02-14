import { NextResponse } from 'next/server';

type QuestionType = 'addition' | 'subtraction' | 'comparison';

interface Question {
  question: string;
  answer: string;
  type: QuestionType;
}

/**
 * 生成隨機整數（包含 min 和 max）
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成加法題目
 * 規則：1-10 的兩個數字相加，結果不超過 20
 */
function generateAddition(): Question {
  const num1 = randomInt(1, 10);
  const maxNum2 = Math.min(10, 20 - num1); // 確保結果不超過 20
  const num2 = randomInt(1, maxNum2);
  const answer = num1 + num2;
  
  return {
    question: `${num1} + ${num2} = ?`,
    answer: answer.toString(),
    type: 'addition'
  };
}

/**
 * 生成減法題目
 * 規則：被減數 1-10，減數小於被減數，結果不為負數
 */
function generateSubtraction(): Question {
  const num1 = randomInt(2, 10); // 被減數至少為 2
  const num2 = randomInt(1, num1 - 1); // 減數小於被減數
  const answer = num1 - num2;
  
  return {
    question: `${num1} - ${num2} = ?`,
    answer: answer.toString(),
    type: 'subtraction'
  };
}

/**
 * 生成比大小題目
 * 規則：兩個 1-10 的數字，答案是 ">" 或 "<"
 */
function generateComparison(): Question {
  let num1 = randomInt(1, 10);
  let num2 = randomInt(1, 10);
  
  // 確保兩個數字不相等
  while (num1 === num2) {
    num2 = randomInt(1, 10);
  }
  
  const answer = num1 > num2 ? '>' : '<';
  
  return {
    question: `${num1} __ ${num2}`,
    answer: answer,
    type: 'comparison'
  };
}

/**
 * 隨機生成一題數學題目
 */
function generateQuestion(): Question {
  const types: QuestionType[] = ['addition', 'subtraction', 'comparison'];
  const randomType = types[randomInt(0, types.length - 1)];
  
  switch (randomType) {
    case 'addition':
      return generateAddition();
    case 'subtraction':
      return generateSubtraction();
    case 'comparison':
      return generateComparison();
    default:
      return generateAddition();
  }
}

/**
 * GET /api/question
 * 回傳隨機生成的數學題目
 */
export async function GET() {
  try {
    const question = generateQuestion();
    
    return NextResponse.json(question, { status: 200 });
  } catch (error) {
    console.error('生成題目時發生錯誤:', error);
    
    return NextResponse.json(
      { error: '生成題目失敗' },
      { status: 500 }
    );
  }
}
