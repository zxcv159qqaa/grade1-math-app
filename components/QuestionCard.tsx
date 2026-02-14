'use client';

import { useState } from 'react';
import { Question } from '@/lib/question-generator';
import { useSound } from '@/hooks/useSound';
import { 
  Plus, Minus, Search, Hash, HelpCircle, FileText,
  PartyPopper, Star, Sparkles, ThumbsUp, Smile, ChevronDown,
  CheckCircle2, XCircle
} from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
}

export default function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { play } = useSound();

  const handleSelect = (answer: string) => {
    if (showFeedback) return;

    play('click');
    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === question.answer;

    setTimeout(() => {
      onAnswer(isCorrect);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }, 1500);
  };

  const isCorrect = selectedAnswer === question.answer;
  const TypeIcon = getTypeIcon(question.type);

  return (
    <div className="relative">
      <div className="bg-white rounded-3xl p-8 shadow-2xl border-8 border-blue-300 relative overflow-hidden">
        {/* 背景裝飾圖案 */}
        <div className="absolute top-4 right-4 opacity-5">
          <TypeIcon className="w-32 h-32" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-5">
          <TypeIcon className="w-32 h-32" />
        </div>

        {/* 題目類型標籤 */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 px-8 py-4 rounded-full border-4 border-purple-300 shadow-lg">
            <TypeIcon className="w-8 h-8 text-purple-600 animate-pulse" />
            <span className="text-2xl font-bold text-gray-800">{getTypeLabel(question.type)}</span>
            <TypeIcon className="w-8 h-8 text-purple-600 animate-pulse" />
          </div>
        </div>

        {/* 視覺化顯示 */}
        {question.visual && (
          <div className="text-center mb-8 relative z-10">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-3xl border-6 border-yellow-200 shadow-inner">
              <div className="text-6xl leading-relaxed">
                {question.visual}
              </div>
            </div>
          </div>
        )}

        {/* 題目文字 - 超大顯示 */}
        <div className="text-center mb-10 relative z-10">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-10 rounded-3xl border-6 border-blue-200 shadow-lg">
            <h2 className="text-7xl font-bold text-gray-900 tracking-wider">
              {question.question}
            </h2>
          </div>
        </div>

        {/* 選項按鈕 - 橫向排列，更大更明顯 */}
        <div className="mb-6 relative z-10">
          {/* 提示文字 */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChevronDown className="w-8 h-8 text-gray-600 animate-bounce" />
            <p className="text-xl font-bold text-gray-600">選擇答案</p>
            <ChevronDown className="w-8 h-8 text-gray-600 animate-bounce" />
          </div>

          {/* 答案按鈕 - 全部橫向排在一起 */}
          <div className="flex justify-center gap-4 flex-wrap max-w-4xl mx-auto">
            {(question.options || []).map((option, index) => {
              let buttonClass = 'min-w-[120px] font-bold text-5xl py-8 px-8 rounded-3xl transition-all border-6 shadow-xl hover:scale-110 ';
              let showCheck = false;
              let showX = false;
              
              if (showFeedback && selectedAnswer === option) {
                if (isCorrect) {
                  buttonClass += 'bg-gradient-to-br from-green-400 to-green-500 border-green-600 text-white animate-pulse scale-110';
                  showCheck = true;
                } else {
                  buttonClass += 'bg-gradient-to-br from-red-400 to-red-500 border-red-600 text-white animate-shake';
                  showX = true;
                }
              } else if (showFeedback && option === question.answer) {
                buttonClass += 'bg-gradient-to-br from-green-400 to-green-500 border-green-600 text-white animate-pulse scale-110';
                showCheck = true;
              } else {
                buttonClass += 'bg-gradient-to-br from-white to-gray-50 border-blue-300 text-gray-900 hover:border-blue-400 hover:shadow-2xl';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(option)}
                  disabled={showFeedback}
                  className={buttonClass}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span>{option}</span>
                    {showCheck && <CheckCircle2 className="w-10 h-10 animate-bounce" />}
                    {showX && <XCircle className="w-10 h-10 animate-bounce" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 回饋訊息 - 更大更明顯 */}
        {showFeedback && (
          <div className="text-center mt-8 relative z-10">
            {isCorrect ? (
              <div className="bg-gradient-to-br from-green-100 via-green-50 to-green-100 rounded-3xl p-8 border-6 border-green-300 shadow-2xl relative overflow-hidden">
                {/* 慶祝圖示背景 */}
                <div className="absolute inset-0 flex items-center justify-around opacity-10">
                  <PartyPopper className="w-16 h-16 animate-bounce" />
                  <Star className="w-16 h-16 animate-bounce" style={{ animationDelay: '0.2s' } as any} />
                  <Sparkles className="w-16 h-16 animate-bounce" style={{ animationDelay: '0.4s' } as any} />
                  <Star className="w-16 h-16 animate-bounce" style={{ animationDelay: '0.6s' } as any} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <PartyPopper className="w-20 h-20 text-green-600 animate-bounce" />
                    <Star className="w-20 h-20 text-yellow-500 animate-bounce" style={{ animationDelay: '0.2s' } as any} />
                    <PartyPopper className="w-20 h-20 text-green-600 animate-bounce" style={{ animationDelay: '0.4s' } as any} />
                  </div>
                  <div className="text-5xl text-green-700 font-bold mb-2">
                    答對了！
                  </div>
                  <div className="text-3xl text-green-600 font-bold">
                    太棒了！你好厉害！
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <Star className="w-16 h-16 text-yellow-500 animate-pulse" />
                    <span className="text-2xl text-green-700 font-bold">+1 星星</span>
                    <Star className="w-16 h-16 text-yellow-500 animate-pulse" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100 rounded-3xl p-8 border-6 border-orange-300 shadow-2xl relative overflow-hidden">
                {/* 鼓勵圖示背景 */}
                <div className="absolute inset-0 flex items-center justify-around opacity-10">
                  <ThumbsUp className="w-16 h-16 animate-bounce" />
                  <Star className="w-16 h-16 animate-bounce" style={{ animationDelay: '0.2s' } as any} />
                  <ThumbsUp className="w-16 h-16 animate-bounce" style={{ animationDelay: '0.4s' } as any} />
                  <Star className="w-16 h-16 animate-bounce" style={{ animationDelay: '0.6s' } as any} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <ThumbsUp className="w-20 h-20 text-orange-600 animate-bounce" />
                    <Smile className="w-20 h-20 text-orange-600 animate-bounce" style={{ animationDelay: '0.2s' } as any} />
                    <ThumbsUp className="w-20 h-20 text-orange-600 animate-bounce" style={{ animationDelay: '0.4s' } as any} />
                  </div>
                  <div className="text-4xl text-orange-700 font-bold mb-2">
                    再試試看！
                  </div>
                  <div className="text-3xl text-orange-600 font-bold">
                    你可以的！加油！
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    addition: '加法',
    subtraction: '減法',
    compare: '比大小',
    counting: '數數',
    'missing-number': '找數字'
  };
  return labels[type] || '練習';
}

function getTypeIcon(type: string) {
  const icons: Record<string, any> = {
    addition: Plus,
    subtraction: Minus,
    compare: Search,
    counting: Hash,
    'missing-number': HelpCircle
  };
  return icons[type] || FileText;
}
