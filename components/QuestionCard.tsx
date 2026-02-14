'use client';

import { useState } from 'react';
import { Question } from '@/lib/question-generator';
import { useSound } from '@/hooks/useSound';

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

  return (
    <div className="relative">
      {/* 裝飾性背景元素 */}
      <div className="absolute -top-6 -left-6 text-7xl animate-bounce opacity-40">🎈</div>
      <div className="absolute -top-6 -right-6 text-7xl animate-bounce opacity-40" style={{ animationDelay: '0.3s' }}>🎈</div>
      
      <div className="bg-white rounded-3xl p-8 shadow-2xl border-8 border-blue-300 relative overflow-hidden">
        {/* 背景裝飾圖案 */}
        <div className="absolute top-0 right-0 text-9xl opacity-5">
          {getTypeEmoji(question.type)}
        </div>
        <div className="absolute bottom-0 left-0 text-9xl opacity-5">
          {getTypeEmoji(question.type)}
        </div>

        {/* 題目類型標籤 */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 px-8 py-4 rounded-full border-4 border-purple-300 shadow-lg">
            <span className="text-4xl animate-pulse">{getTypeEmoji(question.type)}</span>
            <span className="text-2xl font-bold text-gray-800">{getTypeLabel(question.type)}</span>
            <span className="text-4xl animate-pulse" style={{ animationDelay: '0.5s' }}>{getTypeEmoji(question.type)}</span>
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
            <span className="text-4xl animate-bounce">👇</span>
            <p className="text-xl font-bold text-gray-600">選擇答案</p>
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>👇</span>
          </div>

          {/* 答案按鈕 - 全部橫向排在一起 */}
          <div className="flex justify-center gap-4 flex-wrap max-w-4xl mx-auto">
            {(question.options || []).map((option, index) => {
              let buttonClass = 'min-w-[120px] font-bold text-5xl py-8 px-8 rounded-3xl transition-all border-6 shadow-xl hover:scale-110 ';
              let decoration = '';
              
              if (showFeedback && selectedAnswer === option) {
                if (isCorrect) {
                  buttonClass += 'bg-gradient-to-br from-green-400 to-green-500 border-green-600 text-white animate-pulse scale-110';
                  decoration = '✅';
                } else {
                  buttonClass += 'bg-gradient-to-br from-red-400 to-red-500 border-red-600 text-white animate-shake';
                  decoration = '❌';
                }
              } else if (showFeedback && option === question.answer) {
                buttonClass += 'bg-gradient-to-br from-green-400 to-green-500 border-green-600 text-white animate-pulse scale-110';
                decoration = '✅';
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
                    {decoration && <span className="text-4xl animate-bounce">{decoration}</span>}
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
                {/* 慶祝動畫背景 */}
                <div className="absolute inset-0 flex items-center justify-around text-6xl opacity-20">
                  <span className="animate-bounce">🎉</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🎊</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.6s' }}>✨</span>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-8xl animate-bounce">🎉</span>
                    <span className="text-8xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
                    <span className="text-8xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎉</span>
                  </div>
                  <div className="text-5xl text-green-700 font-bold mb-2">
                    答對了！
                  </div>
                  <div className="text-3xl text-green-600 font-bold">
                    太棒了！你好厲害！
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <span className="text-6xl animate-pulse">⭐</span>
                    <span className="text-2xl text-green-700 font-bold">+1 星星</span>
                    <span className="text-6xl animate-pulse">⭐</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100 rounded-3xl p-8 border-6 border-orange-300 shadow-2xl relative overflow-hidden">
                {/* 鼓勵圖案背景 */}
                <div className="absolute inset-0 flex items-center justify-around text-6xl opacity-20">
                  <span className="animate-bounce">💪</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🌟</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>💪</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.6s' }}>🌟</span>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-8xl animate-bounce">💪</span>
                    <span className="text-8xl animate-bounce" style={{ animationDelay: '0.2s' }}>😊</span>
                    <span className="text-8xl animate-bounce" style={{ animationDelay: '0.4s' }}>💪</span>
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

      {/* 底部裝飾元素 */}
      <div className="absolute -bottom-6 left-1/4 text-7xl animate-bounce opacity-40" style={{ animationDelay: '0.6s' }}>🌟</div>
      <div className="absolute -bottom-6 right-1/4 text-7xl animate-bounce opacity-40" style={{ animationDelay: '0.9s' }}>⭐</div>
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

function getTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    addition: '➕',
    subtraction: '➖',
    compare: '🔍',
    counting: '🔢',
    'missing-number': '❓'
  };
  return emojis[type] || '📝';
}
