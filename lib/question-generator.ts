// 題目類型定義
export type QuestionType = 'addition' | 'subtraction' | 'compare' | 'counting' | 'missing-number';

export interface Question {
  type: QuestionType;
  difficulty: number;
  question: string;
  answer: string;
  options: string[];
  visual?: string; // emoji 視覺化
}

// 生成隨機數字（根據難度）
function getRandomNumber(difficulty: number): number {
  if (difficulty === 1) return Math.floor(Math.random() * 5) + 1; // 1-5
  if (difficulty === 2) return Math.floor(Math.random() * 10) + 1; // 1-10
  if (difficulty === 3) return Math.floor(Math.random() * 20) + 1; // 1-20
  return Math.floor(Math.random() * 50) + 1; // 1-50
}

// 生成視覺化 emoji
function generateVisual(num: number): string {
  const emojis = ['🍎', '⭐', '🎈', '🌸', '🐟'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  return emoji.repeat(Math.min(num, 10)); // 最多顯示10個
}

// 生成錯誤選項
function generateOptions(correctAnswer: string, count: number = 4): string[] {
  const correct = parseInt(correctAnswer);
  const options = new Set<string>([correctAnswer]);
  
  while (options.size < count) {
    const offset = Math.floor(Math.random() * 6) - 3; // -3 到 +3
    const wrong = correct + offset;
    if (wrong >= 0 && wrong !== correct) {
      options.add(wrong.toString());
    }
  }
  
  return Array.from(options).sort(() => Math.random() - 0.5); // 隨機排序
}

// 加法題目生成器
export function generateAddition(difficulty: number): Question {
  const num1 = getRandomNumber(difficulty);
  const num2 = getRandomNumber(difficulty);
  const answer = num1 + num2;
  
  return {
    type: 'addition',
    difficulty,
    question: `${num1} + ${num2} = ?`,
    answer: answer.toString(),
    options: generateOptions(answer.toString()),
    visual: `${generateVisual(num1)} ➕ ${generateVisual(num2)}`
  };
}

// 減法題目生成器
export function generateSubtraction(difficulty: number): Question {
  let num1 = getRandomNumber(difficulty);
  let num2 = getRandomNumber(difficulty);
  
  // 確保不會出現負數
  if (num1 < num2) [num1, num2] = [num2, num1];
  
  const answer = num1 - num2;
  
  return {
    type: 'subtraction',
    difficulty,
    question: `${num1} - ${num2} = ?`,
    answer: answer.toString(),
    options: generateOptions(answer.toString()),
    visual: `${generateVisual(num1)} ➖ ${generateVisual(num2)}`
  };
}

// 比大小題目生成器
export function generateCompare(difficulty: number): Question {
  const num1 = getRandomNumber(difficulty);
  const num2 = getRandomNumber(difficulty);
  
  let answer: string;
  if (num1 > num2) answer = '>';
  else if (num1 < num2) answer = '<';
  else answer = '=';
  
  return {
    type: 'compare',
    difficulty,
    question: `${num1} __ ${num2}`,
    answer,
    options: ['>', '<', '='],
    visual: `${generateVisual(num1)} 和 ${generateVisual(num2)}`
  };
}

// 數數題目生成器
export function generateCounting(difficulty: number): Question {
  const num = getRandomNumber(difficulty);
  
  return {
    type: 'counting',
    difficulty,
    question: '數一數有幾個？',
    answer: num.toString(),
    options: generateOptions(num.toString()),
    visual: generateVisual(num)
  };
}

// 找缺失數字題目生成器
export function generateMissingNumber(difficulty: number): Question {
  const start = getRandomNumber(difficulty);
  const missing = start + 1;
  const end = start + 2;
  
  return {
    type: 'missing-number',
    difficulty,
    question: `填入缺少的數字：${start}, __, ${end}`,
    answer: missing.toString(),
    options: generateOptions(missing.toString()),
    visual: `${start} ➡️ ? ➡️ ${end}`
  };
}

// 主要題目生成器
export function generateQuestion(type?: QuestionType, difficulty: number = 1): Question {
  // 如果沒有指定類型，隨機選擇
  const types: QuestionType[] = ['addition', 'subtraction', 'compare', 'counting', 'missing-number'];
  const selectedType = type || types[Math.floor(Math.random() * types.length)];
  
  switch (selectedType) {
    case 'addition':
      return generateAddition(difficulty);
    case 'subtraction':
      return generateSubtraction(difficulty);
    case 'compare':
      return generateCompare(difficulty);
    case 'counting':
      return generateCounting(difficulty);
    case 'missing-number':
      return generateMissingNumber(difficulty);
    default:
      return generateAddition(difficulty);
  }
}

// 題目類型中文名稱
export const questionTypeNames: Record<QuestionType, string> = {
  addition: '加法',
  subtraction: '減法',
  compare: '比大小',
  counting: '數數',
  'missing-number': '找數字'
};