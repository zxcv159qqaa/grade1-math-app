import { NextResponse } from 'next/server';

type QuestionType = 'addition' | 'subtraction' | 'compare';

interface Question {
  id: string;
  question: string;
  answer: string;
  type: QuestionType;
  difficulty: number;
  visual?: string;
  options: string[];
}

/**
 * 生成隨機整數（包含 min 和 max）
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成選項陣列（包含正確答案和3個錯誤選項）
 */
function generateOptions(correctAnswer: number, min: number, max: number): string[] {
  const options = new Set<string>();
  options.add(correctAnswer.toString());
  
  // 生成3個不同的錯誤選項
  while (options.size < 4) {
    const wrongAnswer = randomInt(min, max);
    if (wrongAnswer !== correctAnswer) {
      options.add(wrongAnswer.toString());
    }
  }
  
  // 打亂選項順序
  return Array.from(options).sort(() => Math.random() - 0.5);
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
  
  // 生成選項：正確答案 + 3個錯誤選項
  const options = generateOptions(answer, 1, 20);
  
  return {
    id: Date.now().toString(),
    question: `${num1} + ${num2} = ?`,
    answer: answer.toString(),
    type: 'addition',
    difficulty: 1,
    visual: '🍎'.repeat(num1) + ' + ' + '🍎'.repeat(num2),
    options
  };
}

/**
 * 生成減法題目
 * 規則：被減數 2-10，減數小於被減數，結果不為負數
 */
function generateSubtraction(): Question {
  const num1 = randomInt(2, 10); // 被減數至少為 2
  const num2 = randomInt(1, num1 - 1); // 減數小於被減數
  const answer = num1 - num2;
  
  // 生成選項：正確答案 + 3個錯誤選項
  const options = generateOptions(answer, 0, 10);
  
  return {
    id: Date.now().toString(),
    question: `${num1} - ${num2} = ?`,
    answer: answer.toString(),
    type: 'subtraction',
    difficulty: 1,
    visual: '🍊'.repeat(num1) + ' ➖ ' + '❌'.repeat(num2),
    options
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
    id: Date.now().toString(),
    question: `${num1} __ ${num2}`,
    answer: answer,
    type: 'compare',
    difficulty: 1,
    visual: '🔢',
    options: ['>', '<']
  };
}

/**
 * 隨機生成一題數學題目
 */
function generateQuestion(): Question {
  const types: QuestionType[] = ['addition', 'subtraction', 'compare'];
  const randomType = types[randomInt(0, types.length - 1)];
  
  switch (randomType) {
    case 'addition':
      return generateAddition();
    case 'subtraction':
      return generateSubtraction();
    case 'compare':
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
