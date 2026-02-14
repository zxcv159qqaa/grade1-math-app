'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/lib/question-generator';
import QuestionCard from '@/components/QuestionCard';
import RewardDisplay from '@/components/RewardDisplay';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [rewards, setRewards] = useState({ stars: 0, total_correct: 0, total_questions: 0 });
  const [showCelebration, setShowCelebration] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // 載入獎勵資訊
  useEffect(() => {
    fetch('/api/rewards')
      .then(res => res.json())
      .then(data => {
        setRewards(data);
        setLoading(false);
      });
  }, []);

  // 獲取新題目
  const fetchNewQuestion = async () => {
    const res = await fetch('/api/question');
    const data = await res.json();
    setCurrentQuestion(data);
  };

  // 開始練習
  const startPractice = () => {
    setIsPlaying(true);
    fetchNewQuestion();
  };

  // 處理答案提交
  const handleAnswer = async (selectedAnswer: string) => {
    if (!currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.answer;

    // 提交答案到後端
    const res = await fetch('/api/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: currentQuestion.question,
        question_type: currentQuestion.type,
        difficulty: currentQuestion.difficulty,
        correct_answer: currentQuestion.answer,
        user_answer: selectedAnswer,
        is_correct: isCorrect,
      }),
    });

    const data = await res.json();
    
    // 更新獎勵顯示
    setRewards(data.rewards);

    // 如果答對，顯示慶祝動畫
    if (isCorrect) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }

    // 延遲載入下一題
    setTimeout(() => {
      fetchNewQuestion();
    }, isCorrect ? 2000 : 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">載入中...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* 標題區 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-bold text-purple-600 mb-2">
            🎓 小學一年級數學練習
          </h1>
          <p className="text-sm md:text-base text-gray-600">加油！每答對一題就可以得到星星 ⭐</p>
        </div>

        {/* 獎勵顯示 */}
        <RewardDisplay rewards={rewards} />

        {/* 開始練習按鈕 - 只在未開始時顯示 */}
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center my-8"
          >
            <button
              onClick={startPractice}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl text-xl md:text-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 min-h-[60px] w-full md:w-auto"
            >
              🚀 開始練習
            </button>
          </motion.div>
        )}

        {/* 題目卡片 - 只在開始後顯示 */}
        <AnimatePresence mode="wait">
          {isPlaying && currentQuestion && (
            <QuestionCard
              key={currentQuestion.question}
              question={currentQuestion}
              onAnswer={handleAnswer}
            />
          )}
        </AnimatePresence>

        {/* 慶祝動畫 */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <div className="text-9xl">🎉</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 家長入口 */}
        <div className="text-center mt-8">
          <a
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            家長看這裡 →
          </a>
        </div>
      </div>
    </main>
  );
}
