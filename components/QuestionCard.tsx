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

  const handleAnswerClick = (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === question.correctAnswer;
    setTimeout(() => {
      onAnswer(isCorrect);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }, 1000);
  };

  const getAnswerButtonClass = (answer: string) => {
    const baseClass = "flex-1 min-w-[100px] aspect-square rounded-2xl font-black text-5xl transition-all duration-300 transform border-4 shadow-xl";
    
    if (!showFeedback) {
      return `${baseClass} bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 border-blue-700 text-white hover:scale-110 hover:-rotate-3 active:scale-95`;
    }

    if (answer === question.correctAnswer) {
      return `${baseClass} bg-gradient-to-br from-green-400 to-green-600 border-green-700 text-white animate-bounce scale-110`;
    }

    if (answer === selectedAnswer) {
      return `${baseClass} bg-gradient-to-br from-red-400 to-red-600 border-red-700 text-white animate-shake scale-95`;
    }

    return `${baseClass} bg-gray-300 border-gray-400 text-gray-500 opacity-50`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* 題目卡片 - 超大超華麗 */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6 transform hover:scale-102 transition-all border-4 border-purple-300">
        {/* 裝飾性頂部 */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-3">
            <span className="text-5xl animate-bounce" style={{ animationDelay: '0s' }}>🎨</span>
            <span className="text-5xl animate-bounce" style={{ animationDelay: '0.1s' }}>🌟</span>
            <span className="text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎪</span>
          </div>
        </div>

        {/* 題目區域 */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl px-8 py-6 border-4 border-purple-300 shadow-lg">
            <p className="text-3xl font-bold text-purple-600 mb-4">請算一算：</p>
            <div className="text-7xl font-black text-gray-800 font-mono tracking-wider">
              {question.text}
            </div>
          </div>
        </div>

        {/* 大大的問號裝飾 */}
        <div className="text-center mb-6">
          <span className="text-8xl animate-pulse">🤔</span>
        </div>

        {/* 答案選項 - 橫向排列成一排 */}
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          {question.options.map((answer) => (
            <button
              key={answer}
              onClick={() => handleAnswerClick(answer)}
              disabled={showFeedback}
              className={getAnswerButtonClass(answer)}
            >
              {answer}
            </button>
          ))}
        </div>

        {/* 回饋訊息區域 */}
        {showFeedback && (
          <div className="text-center">
            {selectedAnswer === question.correctAnswer ? (
              <div className="space-y-3">
                <div className="text-8xl animate-bounce">🎉</div>
                <div className="text-4xl font-black text-green-600 animate-pulse">
                  答對了！太棒了！
                </div>
                <div className="flex justify-center gap-2">
                  <span className="text-5xl animate-bounce" style={{ animationDelay: '0s' }}>⭐</span>
                  <span className="text-5xl animate-bounce" style={{ animationDelay: '0.1s' }}>⭐</span>
                  <span className="text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-8xl animate-bounce">😢</div>
                <div className="text-4xl font-black text-red-600">
                  再想想看！
                </div>
                <div className="text-2xl text-gray-600 mt-2">
                  正確答案是：<span className="font-black text-green-600 text-4xl">{question.correctAnswer}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 底部裝飾 */}
        {!showFeedback && (
          <div className="flex justify-center gap-3 mt-6">
            <span className="text-4xl animate-pulse" style={{ animationDelay: '0s' }}>✨</span>
            <span className="text-4xl animate-pulse" style={{ animationDelay: '0.3s' }}>💫</span>
            <span className="text-4xl animate-pulse" style={{ animationDelay: '0.6s' }}>✨</span>
          </div>
        )}
      </div>
    </div>
  );
}
