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
 * difficulty: 'easy' (1-10), 'medium' (1-20), 'hard' (1-50)
 */
function generateAddition(difficulty: 'easy' | 'medium' | 'hard' = 'easy'): Question {
  const maxNum = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 50;
  const maxResult = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 40 : 100;
  
  const num1 = randomInt(1, maxNum);
  const maxNum2 = Math.min(maxNum, maxResult - num1);
  const num2 = randomInt(1, maxNum2);
  const answer = num1 + num2;
  
  // 生成選項：正確答案 + 3個錯誤選項
  const options = generateOptions(answer, 1, maxResult);
  
  return {
    id: Date.now().toString(),
    question: `${num1} + ${num2} = ?`,
    answer: answer.toString(),
    type: 'addition',
    difficulty: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
    visual: difficulty === 'easy' ? '🍎'.repeat(num1) + ' + ' + '🍎'.repeat(num2) : '🔢',
    options
  };
}

/**
 * 生成減法題目
 * difficulty: 'easy' (2-10), 'medium' (2-20), 'hard' (2-50)
 */
function generateSubtraction(difficulty: 'easy' | 'medium' | 'hard' = 'easy'): Question {
  const maxNum = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 50;
  
  const num1 = randomInt(2, maxNum);
  const num2 = randomInt(1, num1 - 1);
  const answer = num1 - num2;
  
  // 生成選項：正確答案 + 3個錯誤選項
  const options = generateOptions(answer, 0, maxNum);
  
  return {
    id: Date.now().toString(),
    question: `${num1} - ${num2} = ?`,
    answer: answer.toString(),
    type: 'subtraction',
    difficulty: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
    visual: difficulty === 'easy' ? '🍊'.repeat(num1) + ' ➖ ' + '❌'.repeat(num2) : '🔢',
    options
  };
}

/**
 * 生成比大小題目
 * difficulty: 'easy' (1-10), 'medium' (1-20), 'hard' (1-50)
 */
function generateComparison(difficulty: 'easy' | 'medium' | 'hard' = 'easy'): Question {
  const maxNum = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 50;
  
  let num1 = randomInt(1, maxNum);
  let num2 = randomInt(1, maxNum);
  
  // 確保兩個數字不相等
  while (num1 === num2) {
    num2 = randomInt(1, maxNum);
  }
  
  const answer = num1 > num2 ? '>' : '<';
  
  return {
    id: Date.now().toString(),
    question: `${num1} __ ${num2}`,
    answer: answer,
    type: 'compare',
    difficulty: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
    visual: '🔢',
    options: ['>', '<']
  };
}

/**
 * 隨機生成一題數學題目
 */
function generateQuestion(difficulty: 'easy' | 'medium' | 'hard' = 'easy'): Question {
  const types: QuestionType[] = ['addition', 'subtraction', 'compare'];
  const randomType = types[randomInt(0, types.length - 1)];
  
  switch (randomType) {
    case 'addition':
      return generateAddition(difficulty);
    case 'subtraction':
      return generateSubtraction(difficulty);
    case 'compare':
      return generateComparison(difficulty);
    default:
      return generateAddition(difficulty);
  }
}

/**
 * GET /api/question?difficulty=easy|medium|hard
 * 回傳隨機生成的數學題目
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = (searchParams.get('difficulty') || 'easy') as 'easy' | 'medium' | 'hard';
    
    // 驗證難度參數
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json(
        { error: '無效的難度參數，請使用 easy, medium 或 hard' },
        { status: 400 }
      );
    }
    
    const question = generateQuestion(difficulty);
    
    return NextResponse.json(question, { status: 200 });
  } catch (error) {
    console.error('生成題目時發生錯誤:', error);
    
    return NextResponse.json(
      { error: '生成題目失敗' },
      { status: 500 }
    );
  }
}
