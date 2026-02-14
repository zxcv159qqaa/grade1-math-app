'use client';

import { useState } from 'react';
import { Question } from '@/lib/question-generator';
import { motion } from 'framer-motion';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
}

export default function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (answer: string) => {
    if (showFeedback) return; // 防止重複點擊

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === question.answer;

    // 播放音效（會在後續加入）
    if (isCorrect) {
      // 正確音效
    } else {
      // 錯誤音效
    }

    // 延遲後通知父組件
    setTimeout(() => {
      onAnswer(answer);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }, 1500);
  };

  const isCorrect = selectedAnswer === question.answer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card mb-8"
    >
      {/* 題目類型標籤 */}
      <div className="text-center mb-3 md:mb-4">
        <span className="inline-block bg-purple-100 text-purple-600 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold">
          {getTypeLabel(question.type)} - 等級 {question.difficulty}
        </span>
      </div>

      {/* 視覺化顯示 */}
      {question.visual && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-center text-3xl md:text-5xl mb-4 md:mb-6 p-3 md:p-4 bg-yellow-50 rounded-xl md:rounded-2xl"
        >
          {question.visual}
        </motion.div>
      )}

      {/* 題目文字 */}
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-5xl font-bold text-gray-800 mb-2">
          {question.question}
        </h2>
      </div>

      {/* 選項按鈕 */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-md mx-auto">
        {question.options.map((option, index) => {
          let buttonClass = 'btn-answer min-h-[56px] md:min-h-[60px] text-lg md:text-xl';
          
          if (showFeedback && selectedAnswer === option) {
            if (isCorrect) {
              buttonClass += ' bg-green-400 border-green-500 text-white';
            } else {
              buttonClass += ' bg-red-400 border-red-500 text-white';
            }
          } else if (showFeedback && option === question.answer) {
            buttonClass += ' bg-green-400 border-green-500 text-white';
          }

          return (
            <motion.button
              key={index}
              whileHover={!showFeedback ? { scale: 1.05 } : {}}
              whileTap={!showFeedback ? { scale: 0.95 } : {}}
              onClick={() => handleSelect(option)}
              disabled={showFeedback}
              className={buttonClass}
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      {/* 回饋訊息 */}
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-4 md:mt-6"
        >
          {isCorrect ? (
            <div className="text-2xl md:text-3xl text-green-600 font-bold">
              🎉 答對了！太棒了！
            </div>
          ) : (
            <div className="text-xl md:text-2xl text-orange-600 font-bold">
              💪 再試試看，你可以的！
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
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
