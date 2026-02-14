'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/lib/question-generator';
import QuestionCard from '@/components/QuestionCard';
import StreakDisplay from '@/components/StreakDisplay';
import GachaModal from '@/components/GachaModal';
import { useSound } from '@/hooks/useSound';

type Difficulty = 'easy' | 'medium' | 'hard';

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [showGacha, setShowGacha] = useState(false);
  const [rewards, setRewards] = useState({ stars: 0, trophies: 0, accuracy: 0 });
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastPracticeDate: null });
  
  const { play, isEnabled, toggle } = useSound();

  // 載入獎勵數據
  useEffect(() => {
    fetchRewards();
    fetchStreak();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await fetch('/api/rewards');
      const data = await res.json();
      if (data.success) {
        setRewards(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
    }
  };

  const fetchStreak = async () => {
    try {
      const res = await fetch('/api/streak');
      const data = await res.json();
      if (data.success) {
        setStreak(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch streak:', error);
    }
  };

  const startPractice = () => {
    play('click');
    setIsPracticing(true);
    loadQuestion();
  };

  const loadQuestion = async () => {
    try {
      const res = await fetch(`/api/question?difficulty=${difficulty}`);
      const data = await res.json();
      if (data.success) {
        setCurrentQuestion(data.data);
      }
    } catch (error) {
      console.error('Failed to load question:', error);
    }
  };

  const handleAnswer = async (isCorrect: boolean) => {
    if (isCorrect) {
      play('correct');
      play('star');
      
      // 更新獎勵
      try {
        const res = await fetch('/api/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correct: true })
        });
        const data = await res.json();
        if (data.success) {
          setRewards(data.data);
        }
      } catch (error) {
        console.error('Failed to update rewards:', error);
      }

      // 更新連續天數
      try {
        const res = await fetch('/api/streak', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setStreak(data.data);
        }
      } catch (error) {
        console.error('Failed to update streak:', error);
      }
    } else {
      play('wrong');
      
      // 答錯也要更新統計
      try {
        await fetch('/api/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correct: false })
        });
      } catch (error) {
        console.error('Failed to update rewards:', error);
      }
    }

    // 載入下一題
    setTimeout(() => {
      loadQuestion();
    }, 1500);
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    play('click');
    setDifficulty(newDifficulty);
    if (isPracticing) {
      // 如果正在練習，立即載入新難度的題目
      setTimeout(() => {
        fetch(`/api/question?difficulty=${newDifficulty}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setCurrentQuestion(data.data);
            }
          });
      }, 100);
    }
  };

  const handleGachaDraw = async () => {
    play('click');
    try {
      const res = await fetch('/api/gacha', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        // 更新星星數量
        fetchRewards();
        return data.data.item;
      } else {
        alert(data.error || '抽扭蛋失敗');
        return null;
      }
    } catch (error) {
      console.error('Failed to draw gacha:', error);
      alert('抽扭蛋失敗，請稍後再試');
      return null;
    }
  };

  const getDifficultyEmoji = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return '😊';
      case 'medium': return '😐';
      case 'hard': return '😤';
    }
  };

  const getDifficultyLabel = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return '簡單';
      case 'medium': return '中等';
      case 'hard': return '困難';
    }
  };

  if (!isPracticing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-orange-50 to-pink-50 p-4">
        {/* 裝飾性元素 - 頂部 */}
        <div className="fixed top-0 left-0 w-full flex justify-around text-4xl pointer-events-none z-0 opacity-30">
          <span className="animate-bounce" style={{ animationDelay: '0s' }}>🌟</span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
          <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>✨</span>
          <span className="animate-bounce" style={{ animationDelay: '0.6s' }}>🌟</span>
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          {/* 標題區 */}
          <div className="text-center mb-6 relative">
            <div className="absolute -top-2 -left-2 text-6xl animate-pulse">🎓</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              小學一年級數學練習
            </h1>
            <p className="text-xl text-gray-600 flex items-center justify-center gap-2">
              <span className="text-3xl animate-bounce">⭐</span>
              加油！每答對一題就可以得到星星
              <span className="text-3xl animate-bounce" style={{ animationDelay: '0.3s' }}>⭐</span>
            </p>
            <div className="absolute -top-2 -right-2 text-6xl animate-pulse" style={{ animationDelay: '0.5s' }}>📚</div>
          </div>

          {/* 音效開關 */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { toggle(); play('click'); }}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all border-4 border-purple-300 hover:scale-105"
            >
              <span className="text-2xl">{isEnabled ? '🔊' : '🔇'}</span>
              <span className="font-bold text-gray-700">{isEnabled ? '音效開啟' : '音效關閉'}</span>
            </button>
          </div>

          {/* 連續天數卡片 */}
          <div className="mb-6 relative">
            <div className="absolute -top-3 -left-3 text-5xl animate-spin" style={{ animationDuration: '3s' }}>🔥</div>
            <div className="absolute -top-3 -right-3 text-5xl animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>🔥</div>
            <StreakDisplay />
          </div>

          {/* 獎勵統計卡片 */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border-8 border-yellow-300 relative overflow-hidden">
            {/* 背景裝飾 */}
            <div className="absolute top-0 right-0 text-9xl opacity-10">🏆</div>
            <div className="absolute bottom-0 left-0 text-9xl opacity-10">⭐</div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl animate-bounce">🎯</span>
                <h2 className="text-2xl font-bold text-gray-800">我的成就</h2>
                <span className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎯</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-4 border-4 border-yellow-400 hover:scale-105 transition-transform">
                  <div className="text-5xl mb-2 animate-pulse">⭐</div>
                  <div className="text-3xl font-bold text-yellow-700">{rewards.stars}</div>
                  <div className="text-gray-600 font-bold">星星</div>
                </div>
                
                <div className="text-center bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-4 border-4 border-amber-400 hover:scale-105 transition-transform">
                  <div className="text-5xl mb-2 animate-pulse" style={{ animationDelay: '0.2s' }}>🏆</div>
                  <div className="text-3xl font-bold text-amber-700">{rewards.trophies}</div>
                  <div className="text-gray-600 font-bold">獎章</div>
                </div>
                
                <div className="text-center bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-4 border-4 border-green-400 hover:scale-105 transition-transform">
                  <div className="text-5xl mb-2 animate-pulse" style={{ animationDelay: '0.4s' }}>📊</div>
                  <div className="text-3xl font-bold text-green-700">{rewards.accuracy}%</div>
                  <div className="text-gray-600 font-bold">正確率</div>
                </div>
              </div>
            </div>
          </div>

          {/* 扭蛋按鈕 */}
          <div className="mb-6 relative">
            <div className="absolute -top-4 -left-4 text-6xl animate-bounce">🎰</div>
            <div className="absolute -top-4 -right-4 text-6xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎁</div>
            <button
              onClick={() => { play('click'); setShowGacha(true); }}
              disabled={rewards.stars < 10}
              className={`w-full py-6 rounded-3xl font-bold text-xl transition-all border-8 shadow-2xl relative overflow-hidden ${
                rewards.stars >= 10
                  ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 text-white hover:scale-105 border-pink-500 animate-pulse'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">🎰</span>
                <span>扭蛋機</span>
                <span className="text-3xl">✨</span>
                <span>(10 ⭐)</span>
              </div>
              {rewards.stars >= 10 && (
                <div className="absolute inset-0 bg-white opacity-20 animate-ping"></div>
              )}
            </button>
            <div className="text-center mt-2 text-gray-600 font-bold flex items-center justify-center gap-2">
              <span className="text-2xl">🎯</span>
              <span>距離下一個獎章 {10 - (rewards.stars % 10)} 顆星星</span>
              <span className="text-2xl">⭐</span>
            </div>
          </div>

          {/* 難度選擇 */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border-8 border-blue-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 text-8xl opacity-10">🎮</div>
            <div className="absolute bottom-0 right-0 text-8xl opacity-10">🎯</div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl animate-bounce">😊</span>
                <h3 className="text-2xl font-bold text-gray-800">目前難度：{getDifficultyLabel(difficulty)}</h3>
                <span className="text-4xl">{getDifficultyEmoji(difficulty)}</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-3xl animate-pulse">👉</span>
                <p className="text-gray-600 font-bold text-lg">切換難度</p>
                <span className="text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>👈</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleDifficultyChange('easy')}
                  className={`py-4 rounded-2xl font-bold text-lg transition-all border-4 hover:scale-105 ${
                    difficulty === 'easy'
                      ? 'bg-gradient-to-br from-green-400 to-green-500 text-white border-green-600 shadow-xl scale-105'
                      : 'bg-white text-gray-700 border-green-300 hover:border-green-400'
                  }`}
                >
                  <div className="text-4xl mb-2">😊</div>
                  <div>簡單</div>
                  <div className="text-sm">(1-10)</div>
                </button>
                
                <button
                  onClick={() => handleDifficultyChange('medium')}
                  className={`py-4 rounded-2xl font-bold text-lg transition-all border-4 hover:scale-105 ${
                    difficulty === 'medium'
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white border-yellow-600 shadow-xl scale-105'
                      : 'bg-white text-gray-700 border-yellow-300 hover:border-yellow-400'
                  }`}
                >
                  <div className="text-4xl mb-2">😐</div>
                  <div>中等</div>
                  <div className="text-sm">(1-20)</div>
                </button>
                
                <button
                  onClick={() => handleDifficultyChange('hard')}
                  className={`py-4 rounded-2xl font-bold text-lg transition-all border-4 hover:scale-105 ${
                    difficulty === 'hard'
                      ? 'bg-gradient-to-br from-red-400 to-red-500 text-white border-red-600 shadow-xl scale-105'
                      : 'bg-white text-gray-700 border-red-300 hover:border-red-400'
                  }`}
                >
                  <div className="text-4xl mb-2">😤</div>
                  <div>困難</div>
                  <div className="text-sm">(1-50)</div>
                </button>
              </div>
            </div>
          </div>

          {/* 開始按鈕 */}
          <div className="relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-6xl animate-bounce">👇</div>
            <button
              onClick={startPractice}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-8 rounded-3xl font-bold text-3xl hover:scale-105 transition-all shadow-2xl border-8 border-white relative overflow-hidden group"
            >
              <div className="flex items-center justify-center gap-4">
                <span className="text-5xl group-hover:scale-125 transition-transform">🚀</span>
                <span>開始練習</span>
                <span className="text-5xl group-hover:scale-125 transition-transform">🚀</span>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
          </div>

          {/* 裝飾性元素 - 底部 */}
          <div className="mt-8 flex justify-center gap-8 text-6xl opacity-40">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>🎨</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎪</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🎭</span>
            <span className="animate-bounce" style={{ animationDelay: '0.6s' }}>🎬</span>
          </div>
        </div>

        {/* 扭蛋彈窗 */}
        <GachaModal
          isOpen={showGacha}
          onClose={() => setShowGacha(false)}
          currentStars={rewards.stars}
          onGachaDraw={handleGachaDraw}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 p-4">
      {/* 裝飾性浮動元素 */}
      <div className="fixed top-10 left-10 text-6xl animate-bounce opacity-30">🌈</div>
      <div className="fixed top-20 right-10 text-6xl animate-bounce opacity-30" style={{ animationDelay: '0.5s' }}>⭐</div>
      <div className="fixed bottom-20 left-20 text-6xl animate-bounce opacity-30" style={{ animationDelay: '1s' }}>🎈</div>
      <div className="fixed bottom-10 right-20 text-6xl animate-bounce opacity-30" style={{ animationDelay: '1.5s' }}>🎁</div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* 頂部信息欄 */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border-8 border-purple-300">
          <div className="flex items-center justify-between">
            {/* 獎勵顯示 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-4xl animate-pulse">⭐</span>
                <span className="text-3xl font-bold text-yellow-600">{rewards.stars}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-4xl animate-pulse">🏆</span>
                <span className="text-3xl font-bold text-amber-600">{rewards.trophies}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-4xl animate-pulse">📊</span>
                <span className="text-2xl font-bold text-green-600">{rewards.accuracy}%</span>
              </div>
            </div>
            {/* 音效按鈕 */}
            <button
              onClick={() => { play('click'); toggle(); }}
              className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full font-bold hover:scale-110 transition-all shadow-lg border-4 border-white"
            >
              <span className="text-2xl">{isEnabled ? '🔊' : '🔇'}</span>
            </button>
          </div>
        </div>

        {/* 難度指示器 */}
        <div className="bg-white rounded-2xl shadow-xl p-3 mb-4 border-4 border-blue-300 flex items-center justify-center gap-3">
          <span className="text-3xl animate-pulse">{getDifficultyEmoji(difficulty)}</span>
          <span className="font-bold text-gray-700 text-lg">目前難度：{getDifficultyLabel(difficulty)}</span>
          <span className="text-3xl animate-pulse">{getDifficultyEmoji(difficulty)}</span>
        </div>

        {/* 題目卡片 */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        )}

        {/* 快速切換難度 */}
        <div className="mt-6 bg-white rounded-3xl shadow-xl p-4 border-6 border-yellow-300">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">🎯</span>
            <p className="text-center font-bold text-gray-700">快速切換難度</p>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => handleDifficultyChange(diff)}
                className={`py-3 rounded-xl font-bold transition-all border-4 hover:scale-105 ${
                  difficulty === diff
                    ? 'bg-gradient-to-br from-blue-400 to-purple-400 text-white border-blue-600 shadow-lg scale-105'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="text-3xl mb-1">{getDifficultyEmoji(diff)}</div>
                <div className="text-sm">{getDifficultyLabel(diff)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 返回按鈕 */}
        <button
          onClick={() => { play('click'); setIsPracticing(false); }}
          className="mt-6 w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 rounded-3xl font-bold text-xl hover:scale-105 transition-all shadow-xl border-6 border-white flex items-center justify-center gap-3"
        >
          <span className="text-3xl">🏠</span>
          <span>返回首頁</span>
          <span className="text-3xl">🏠</span>
        </button>
      </div>
    </div>
  );
}
