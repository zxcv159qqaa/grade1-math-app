'use client';

import { useState } from 'react';
import { Question } from '@/lib/question-generator';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
}

export default function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === question.answer;

    setTimeout(() => {
      onAnswer(answer);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }, 1500);
  };

  const isCorrect = selectedAnswer === question.answer;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg mb-8 border-2 border-gray-200">
      {/* 題目類型標籤 */}
      <div className="text-center mb-6">
        <span className="inline-block bg-gray-100 text-gray-800 px-6 py-3 rounded-full text-lg font-bold border-2 border-gray-300">
          {getTypeEmoji(question.type)} {getTypeLabel(question.type)}
        </span>
      </div>

      {/* 視覺化顯示 */}
      {question.visual && (
        <div className="text-center text-6xl mb-6 p-6 bg-gray-50 rounded-2xl">
          {question.visual}
        </div>
      )}

      {/* 題目文字 */}
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-gray-900">
          {question.question}
        </h2>
      </div>

      {/* 選項按鈕 - 簡潔設計 */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
        {(question.options || []).map((option, index) => {
          let buttonClass = 'font-bold text-3xl py-8 px-4 rounded-xl transition-all border-3 ';
          
          if (showFeedback && selectedAnswer === option) {
            if (isCorrect) {
              buttonClass += 'bg-green-100 border-green-400 text-green-800 border-4';
            } else {
              buttonClass += 'bg-red-100 border-red-400 text-red-800 border-4';
            }
          } else if (showFeedback && option === question.answer) {
            buttonClass += 'bg-green-100 border-green-400 text-green-800 border-4';
          } else {
            buttonClass += 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 border-2';
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              disabled={showFeedback}
              className={buttonClass}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* 回饋訊息 */}
      {showFeedback && (
        <div className="text-center mt-6">
          {isCorrect ? (
            <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
              <div className="text-6xl mb-2">🎉</div>
              <div className="text-3xl text-green-700 font-bold">
                答對了！太棒了！
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
              <div className="text-6xl mb-2">💪</div>
              <div className="text-2xl text-orange-700 font-bold">
                再試試看，你可以的！
              </div>
            </div>
          )}
        </div>
      )}
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