'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/lib/question-generator';
import QuestionCard from '@/components/QuestionCard';
import RewardDisplay from '@/components/RewardDisplay';
import StreakDisplay from '@/components/StreakDisplay';
import GachaModal from '@/components/GachaModal';
import { useSound } from '@/hooks/useSound';

type Difficulty = 'easy' | 'medium' | 'hard';

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [rewards, setRewards] = useState({ stars: 0, total_correct: 0, total_questions: 0 });
  const [showCelebration, setShowCelebration] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [showGachaModal, setShowGachaModal] = useState(false);
  const [streakKey, setStreakKey] = useState(0); // 用於刷新連續天數

  // 音效系統
  const { play, isEnabled, toggle: toggleSound } = useSound();

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
      const res = await fetch(`/api/question?difficulty=${difficulty}`);
      const data = await res.json();
      setCurrentQuestion(data);
    } catch (error) {
      console.error('獲取題目失敗:', error);
    }
  };

  // 開始練習
  const startPractice = () => {
    play('click');
    setIsPlaying(true);
    fetchNewQuestion();
  };

  // 處理答案提交
  const handleAnswer = async (selectedAnswer: string) => {
    if (!currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.answer;

    // 播放音效
    if (isCorrect) {
      play('correct');
      play('star'); // 得星星音效
    } else {
      play('wrong');
    }

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

    // 更新連續天數
    await fetch('/api/streak', { method: 'POST' });
    setStreakKey(prev => prev + 1); // 刷新連續天數顯示

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

  // 處理扭蛋抽取
  const handleGachaDraw = async () => {
    play('star');
    // 刷新獎勵資料
    const res = await fetch('/api/rewards');
    const data = await res.json();
    setRewards(data);
  };

  // 切換難度
  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    play('click');
    setDifficulty(newDifficulty);
    if (isPlaying) {
      // 如果正在練習，立即載入新難度的題目
      setTimeout(() => {
        fetch(`/api/question?difficulty=${newDifficulty}`)
          .then(res => res.json())
          .then(data => setCurrentQuestion(data));
      }, 100);
    }
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

        {/* 連續天數顯示 */}
        <StreakDisplay key={streakKey} />

        {/* 音效開關 */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleSound}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow border-2 border-gray-200 hover:bg-gray-50 transition-all"
          >
            <span className="text-2xl">{isEnabled ? '🔊' : '🔇'}</span>
            <span className="text-sm font-medium text-gray-700">
              {isEnabled ? '音效開啟' : '音效關閉'}
            </span>
          </button>
        </div>

        {/* 獎勵顯示 */}
        <RewardDisplay rewards={rewards} />

        {/* 扭蛋按鈕 */}
        <div className="mb-6">
          <button
            onClick={() => {
              play('click');
              setShowGachaModal(true);
            }}
            disabled={rewards.stars < 10}
            className={`w-full py-4 rounded-2xl font-bold text-xl shadow-lg border-2 transition-all ${
              rewards.stars >= 10
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 hover:shadow-xl hover:scale-105'
                : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
            }`}
          >
            <span className="text-3xl mr-2">🎰</span>
            扭蛋機 (10⭐)
            {rewards.stars >= 10 && <span className="ml-2 text-2xl">✨</span>}
          </button>
        </div>

        {/* 難度選擇 */}
        {!isPlaying && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              <span className="text-3xl mr-2">🎯</span>
              選擇難度
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleDifficultyChange('easy')}
                className={`py-4 px-6 rounded-xl font-bold text-lg transition-all border-2 ${
                  difficulty === 'easy'
                    ? 'bg-green-500 text-white border-green-600 shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:shadow'
                }`}
              >
                <div className="text-3xl mb-1">😊</div>
                簡單
                <div className="text-xs mt-1 opacity-80">1-10</div>
              </button>
              <button
                onClick={() => handleDifficultyChange('medium')}
                className={`py-4 px-6 rounded-xl font-bold text-lg transition-all border-2 ${
                  difficulty === 'medium'
                    ? 'bg-yellow-500 text-white border-yellow-600 shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-yellow-300 hover:shadow'
                }`}
              >
                <div className="text-3xl mb-1">😐</div>
                中等
                <div className="text-xs mt-1 opacity-80">1-20</div>
              </button>
              <button
                onClick={() => handleDifficultyChange('hard')}
                className={`py-4 px-6 rounded-xl font-bold text-lg transition-all border-2 ${
                  difficulty === 'hard'
                    ? 'bg-red-500 text-white border-red-600 shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:shadow'
                }`}
              >
                <div className="text-3xl mb-1">😤</div>
                困難
                <div className="text-xs mt-1 opacity-80">1-50</div>
              </button>
            </div>
          </div>
        )}

        {/* 難度顯示（練習中） */}
        {isPlaying && (
          <div className="mb-4 flex items-center justify-center gap-4">
            <div className="bg-white px-6 py-3 rounded-full shadow border-2 border-gray-200 font-bold">
              <span className="text-2xl mr-2">
                {difficulty === 'easy' ? '😊' : difficulty === 'medium' ? '😐' : '😤'}
              </span>
              目前難度：
              <span className={`ml-2 ${
                difficulty === 'easy' ? 'text-green-600' :
                difficulty === 'medium' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {difficulty === 'easy' ? '簡單' : difficulty === 'medium' ? '中等' : '困難'}
              </span>
            </div>
            <button
              onClick={() => {
                play('click');
                setIsPlaying(false);
                setCurrentQuestion(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-bold shadow border-2 border-gray-600 transition-all"
            >
              切換難度
            </button>
          </div>
        )}

        {/* 開始練習按鈕 */}
        {!isPlaying && (
          <div className="text-center my-12">
            <button
              onClick={startPractice}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 px-12 rounded-full text-2xl md:text-3xl shadow-lg hover:shadow-xl transition-all w-full md:w-auto border-2 border-blue-600 hover:scale-105"
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

        {/* 扭蛋彈窗 */}
        <GachaModal
          isOpen={showGachaModal}
          onClose={() => setShowGachaModal(false)}
          currentStars={rewards.stars}
          onGachaDraw={handleGachaDraw}
        />

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
