'use client';

import { useState, useEffect } from 'react';
import { Question, generateQuestion } from '@/lib/question-generator';
import QuestionCard from '@/components/QuestionCard';
import { useSound } from '@/hooks/useSound';
import GachaModal from '@/components/GachaModal';
import StreakDisplay from '@/components/StreakDisplay';

export default function Home() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showGacha, setShowGacha] = useState(false);
  const [gachaReward, setGachaReward] = useState<any>(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const { play } = useSound();

  useEffect(() => {
    setQuestion(generateQuestion());
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const response = await fetch('/api/progress');
      if (response.ok) {
        const data = await response.json();
        setScore(data.score || 0);
        setStreak(data.streak || 0);
        setTotalAnswered(data.totalAnswered || 0);
        setCorrectAnswers(data.correctAnswers || 0);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const saveProgress = async (newScore: number, newStreak: number, isCorrect: boolean) => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: newScore,
          streak: newStreak,
          totalAnswered: totalAnswered + 1,
          correctAnswers: correctAnswers + (isCorrect ? 1 : 0),
        }),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleAnswer = async (isCorrect: boolean) => {
    setLastAnswerCorrect(isCorrect);
    const newTotalAnswered = totalAnswered + 1;
    const newCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0);
    
    setTotalAnswered(newTotalAnswered);
    setCorrectAnswers(newCorrectAnswers);

    if (isCorrect) {
      const newScore = score + 10;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      play('correct');
      
      await saveProgress(newScore, newStreak, true);

      if (newStreak % 5 === 0) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }

      if (newScore % 50 === 0) {
        try {
          const response = await fetch('/api/gacha', { method: 'POST' });
          const data = await response.json();
          if (data.reward) {
            setGachaReward(data.reward);
            setShowGacha(true);
            play('reward');
          }
        } catch (error) {
          console.error('Gacha error:', error);
        }
      }
    } else {
      const newStreak = 0;
      setStreak(newStreak);
      play('incorrect');
      await saveProgress(score, newStreak, false);
    }

    setTimeout(() => {
      setQuestion(generateQuestion());
      setLastAnswerCorrect(null);
    }, 1500);
  };

  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300">
        <div className="text-2xl font-bold text-white animate-pulse">載入中...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 p-4 md:p-8 relative overflow-hidden">
      {/* 背景裝飾 - 浮動的數學符號和可愛圖案 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>🌟</div>
        <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}>✨</div>
        <div className="absolute bottom-20 left-20 text-6xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '3.5s' }}>🎈</div>
        <div className="absolute bottom-10 right-10 text-5xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}>🎨</div>
        <div className="absolute top-1/3 left-1/4 text-4xl animate-spin" style={{ animationDuration: '10s' }}>➕</div>
        <div className="absolute top-2/3 right-1/4 text-4xl animate-spin" style={{ animationDuration: '12s' }}>➖</div>
        <div className="absolute top-1/2 left-10 text-5xl animate-pulse">🌈</div>
        <div className="absolute top-1/4 right-1/3 text-4xl animate-pulse" style={{ animationDelay: '1s' }}>🎪</div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* 標題區域 - 超大超可愛 */}
        <div className="text-center mb-8 transform hover:scale-105 transition-transform">
          <div className="inline-block bg-white/90 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-2xl border-4 border-yellow-300">
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="text-6xl animate-bounce" style={{ animationDuration: '1s' }}>🎯</span>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                數學大冒險
              </h1>
              <span className="text-6xl animate-bounce" style={{ animationDuration: '1s', animationDelay: '0.2s' }}>🚀</span>
            </div>
            <p className="text-2xl text-gray-600 font-bold">一起來挑戰吧！</p>
          </div>
        </div>

        {/* 統計卡片區域 - 三張華麗卡片橫排 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* 分數卡片 */}
          <div className="bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl p-6 shadow-xl transform hover:scale-105 hover:rotate-1 transition-all border-4 border-yellow-500">
            <div className="text-center">
              <div className="text-6xl mb-3 animate-bounce">🏆</div>
              <div className="text-white text-sm font-bold mb-1">總分數</div>
              <div className="text-5xl font-black text-white drop-shadow-lg">{score}</div>
            </div>
          </div>

          {/* 連續答對卡片 */}
          <div className="bg-gradient-to-br from-green-300 to-emerald-400 rounded-2xl p-6 shadow-xl transform hover:scale-105 hover:rotate-1 transition-all border-4 border-green-500">
            <div className="text-center">
              <div className="text-6xl mb-3 animate-pulse">🔥</div>
              <div className="text-white text-sm font-bold mb-1">連續答對</div>
              <div className="text-5xl font-black text-white drop-shadow-lg">{streak}</div>
              {streak >= 5 && (
                <div className="mt-2 text-xl font-bold text-yellow-200 animate-bounce">太厲害了！</div>
              )}
            </div>
          </div>

          {/* 正確率卡片 */}
          <div className="bg-gradient-to-br from-blue-300 to-purple-400 rounded-2xl p-6 shadow-xl transform hover:scale-105 hover:rotate-1 transition-all border-4 border-blue-500">
            <div className="text-center">
              <div className="text-6xl mb-3 animate-spin" style={{ animationDuration: '3s' }}>🎯</div>
              <div className="text-white text-sm font-bold mb-1">正確率</div>
              <div className="text-5xl font-black text-white drop-shadow-lg">{accuracy}%</div>
              <div className="text-sm text-white/90 mt-1">{correctAnswers}/{totalAnswered}</div>
            </div>
          </div>
        </div>

        {/* 連續天數顯示 */}
        <div className="mb-8">
          <StreakDisplay />
        </div>

        {/* 題目卡片 */}
        <QuestionCard question={question} onAnswer={handleAnswer} />

        {/* 慶祝動畫 - 每5題連對 */}
        {showCelebration && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="text-9xl animate-ping">🎉</div>
            <div className="absolute text-6xl font-black text-white animate-bounce">
              太棒了！連對 {streak} 題！
            </div>
          </div>
        )}

        {/* 抽獎彈窗 */}
        {showGacha && gachaReward && (
          <GachaModal
            reward={gachaReward}
            onClose={() => {
              setShowGacha(false);
              setGachaReward(null);
            }}
          />
        )}

        {/* 提示區域 */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border-2 border-pink-300">
            <div className="flex items-center gap-3">
              <span className="text-4xl">💡</span>
              <div className="text-left">
                <p className="text-lg font-bold text-gray-700">小提示：</p>
                <p className="text-gray-600">每答對一題得 10 分，每 50 分可以抽一次獎！</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
