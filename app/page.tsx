'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/lib/question-generator';
import QuestionCard from '@/components/QuestionCard';
import RewardDisplay from '@/components/RewardDisplay';

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
    try {
      const res = await fetch('/api/question');
      const data = await res.json();
      setCurrentQuestion(data);
    } catch (error) {
      console.error('獲取題目失敗:', error);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-3xl font-bold text-gray-600">
          <span className="text-6xl mr-2">📚</span> 載入中...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* 標題區 */}
        <div className="text-center mb-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
          <div className="text-6xl mb-3">🎓</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            小學一年級數學練習
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium">
            加油！每答對一題就可以得到星星 <span className="text-3xl">⭐</span>
          </p>
        </div>

        {/* 獎勵顯示 */}
        <RewardDisplay rewards={rewards} />

        {/* 開始練習按鈕 */}
        {!isPlaying && (
          <div className="text-center my-12">
            <button
              onClick={startPractice}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 px-12 rounded-full text-2xl md:text-3xl shadow-lg hover:shadow-xl transition-all w-full md:w-auto border-2 border-blue-600"
            >
              <span className="text-4xl mr-3">🚀</span>
              開始練習
            </button>
          </div>
        )}

        {/* 題目卡片 */}
        {isPlaying && currentQuestion && (
          <QuestionCard
            key={currentQuestion.question}
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        )}

        {/* 慶祝動畫 */}
        {showCelebration && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="text-[200px]">🎉</div>
          </div>
        )}

        {/* 家長入口 */}
        <div className="text-center mt-12">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-base md:text-lg text-blue-600 hover:text-blue-700 font-semibold bg-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all border-2 border-gray-200"
          >
            <span className="text-2xl">👨‍👩‍👧</span>
            家長看這裡
            <span className="text-xl">→</span>
          </a>
        </div>
      </div>
    </main>
  );
}