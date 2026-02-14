'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/lib/question-generator';
import QuestionCard from '@/components/QuestionCard';
import StreakDisplay from '@/components/StreakDisplay';
import GachaModal from '@/components/GachaModal';
import { useSound } from '@/hooks/useSound';
import { 
  Star, Trophy, TrendingUp, Volume2, VolumeX, Sparkles, 
  Gamepad2, Flame, Gift, Target, Smile, Meh, Frown,
  Rocket, Home as HomeIcon, ChevronDown
} from 'lucide-react';

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

  const getDifficultyIcon = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return Smile;
      case 'medium': return Meh;
      case 'hard': return Frown;
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
        <div className="max-w-2xl mx-auto">
          {/* 標題區 */}
          <div className="text-center mb-6">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4 flex items-center justify-center gap-4 drop-shadow-lg">
              <Target className="w-14 h-14 text-blue-500 animate-bounce drop-shadow-[0_5px_5px_rgba(59,130,246,0.5)]" />
              小學一年級數學練習
              <Target className="w-14 h-14 text-pink-500 animate-bounce drop-shadow-[0_5px_5px_rgba(236,72,153,0.5)]" />
            </h1>
            <p className="text-2xl font-bold text-gray-700 flex items-center justify-center gap-3 drop-shadow-md">
              <Star className="w-8 h-8 text-yellow-400 animate-spin drop-shadow-[0_5px_5px_rgba(250,204,21,0.6)]" style={{ animationDuration: '3s' }} />
              加油！每答對一題就可以得到星星
              <Star className="w-8 h-8 text-yellow-400 animate-spin drop-shadow-[0_5px_5px_rgba(250,204,21,0.6)]" style={{ animationDuration: '3s' }} />
            </p>
          </div>

          {/* 音效開關 */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { toggle(); play('click'); }}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all border-4 border-purple-300 hover:scale-105"
            >
              {isEnabled ? (
                <Volume2 className="w-6 h-6 text-purple-600" />
              ) : (
                <VolumeX className="w-6 h-6 text-gray-500" />
              )}
              <span className="font-bold text-gray-700">{isEnabled ? '音效開啟' : '音效關閉'}</span>
            </button>
          </div>

          {/* 連續天數卡片 */}
          <div className="mb-6">
            <StreakDisplay />
          </div>

          {/* 獎勵統計卡片 */}
          <div className="bg-gradient-to-br from-white via-yellow-50 to-amber-50 rounded-3xl shadow-2xl p-6 mb-6 border-8 border-yellow-400">
            <div className="flex items-center justify-center gap-3 mb-5">
              <Trophy className="w-10 h-10 text-amber-500 animate-bounce drop-shadow-[0_5px_5px_rgba(245,158,11,0.5)]" />
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">我的成就</h2>
              <Trophy className="w-10 h-10 text-amber-500 animate-bounce drop-shadow-[0_5px_5px_rgba(245,158,11,0.5)]" />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 rounded-2xl p-5 border-4 border-yellow-500 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer">
                <Star className="w-16 h-16 mx-auto mb-2 text-yellow-700 animate-pulse drop-shadow-[0_5px_10px_rgba(234,179,8,0.6)]" />
                <div className="text-4xl font-black text-yellow-800 drop-shadow-md">{rewards.stars}</div>
                <div className="text-gray-700 font-black text-lg">星星</div>
              </div>
              
              <div className="text-center bg-gradient-to-br from-amber-200 via-amber-300 to-orange-400 rounded-2xl p-5 border-4 border-amber-500 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer">
                <Trophy className="w-16 h-16 mx-auto mb-2 text-amber-700 animate-pulse drop-shadow-[0_5px_10px_rgba(217,119,6,0.6)]" />
                <div className="text-4xl font-black text-amber-800 drop-shadow-md">{rewards.trophies}</div>
                <div className="text-gray-700 font-black text-lg">獎章</div>
              </div>
              
              <div className="text-center bg-gradient-to-br from-green-200 via-green-300 to-emerald-400 rounded-2xl p-5 border-4 border-green-500 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer">
                <TrendingUp className="w-16 h-16 mx-auto mb-2 text-green-700 animate-pulse drop-shadow-[0_5px_10px_rgba(22,163,74,0.6)]" />
                <div className="text-4xl font-black text-green-800 drop-shadow-md">{rewards.accuracy}%</div>
                <div className="text-gray-700 font-black text-lg">正確率</div>
              </div>
            </div>
          </div>

          {/* 扭蛋按鈕 */}
          <div className="mb-6">
            <button
              onClick={() => { play('click'); setShowGacha(true); }}
              disabled={rewards.stars < 10}
              className={`w-full py-8 rounded-3xl font-black text-2xl transition-all border-8 shadow-2xl relative overflow-hidden ${
                rewards.stars >= 10
                  ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 text-white hover:scale-110 border-pink-600 animate-bounce hover:animate-none'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'
              }`}
              style={{ animationDuration: '1s' }}
            >
              <div className="flex items-center justify-center gap-4">
                <Gift className="w-12 h-12 drop-shadow-[0_5px_10px_rgba(236,72,153,0.5)]" />
                <span className="drop-shadow-lg">扭蛋機</span>
                <Sparkles className="w-12 h-12 drop-shadow-[0_5px_10px_rgba(168,85,247,0.5)] animate-spin" style={{ animationDuration: '2s' }} />
                <span className="drop-shadow-lg">(10 <Star className="w-6 h-6 inline animate-pulse" />)</span>
              </div>
              {rewards.stars >= 10 && (
                <div className="absolute inset-0 bg-white opacity-20 animate-ping"></div>
              )}
            </button>
            <div className="text-center mt-3 text-gray-700 font-black text-lg flex items-center justify-center gap-2 drop-shadow-sm">
              <Target className="w-6 h-6 text-blue-500 animate-pulse" />
              <span>距離下一個獎章 {10 - (rewards.stars % 10)} 顆星星</span>
              <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
            </div>
          </div>

          {/* 難度選擇 */}
          <div className="bg-gradient-to-br from-white via-blue-50 to-cyan-50 rounded-3xl shadow-2xl p-6 mb-6 border-8 border-blue-400">
            <div className="flex items-center justify-center gap-3 mb-5">
              <Gamepad2 className="w-10 h-10 text-blue-500 animate-bounce drop-shadow-[0_5px_5px_rgba(59,130,246,0.5)]" />
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">目前難度：{getDifficultyLabel(difficulty)}</h3>
              {(() => {
                const Icon = getDifficultyIcon(difficulty);
                return <Icon className="w-10 h-10 text-cyan-500 animate-bounce drop-shadow-[0_5px_5px_rgba(6,182,212,0.5)]" />;
              })()}
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-5">
              <ChevronDown className="w-7 h-7 text-gray-700 animate-bounce drop-shadow-md" />
              <p className="text-gray-700 font-black text-xl drop-shadow-sm">快速切換難度</p>
              <ChevronDown className="w-7 h-7 text-gray-700 animate-bounce drop-shadow-md" />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleDifficultyChange('easy')}
                className={`py-5 rounded-2xl font-black text-xl transition-all border-6 hover:scale-110 shadow-lg ${
                  difficulty === 'easy'
                    ? 'bg-gradient-to-br from-green-300 via-green-400 to-emerald-500 text-white border-green-700 shadow-2xl scale-110 animate-pulse'
                    : 'bg-white text-gray-700 border-green-400 hover:border-green-500'
                }`}
              >
                <Smile className="w-14 h-14 mx-auto mb-2 drop-shadow-lg" />
                <div className="drop-shadow-md">簡單</div>
                <div className="text-base font-bold drop-shadow-sm">(1-10)</div>
              </button>
              
              <button
                onClick={() => handleDifficultyChange('medium')}
                className={`py-5 rounded-2xl font-black text-xl transition-all border-6 hover:scale-110 shadow-lg ${
                  difficulty === 'medium'
                    ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 text-white border-yellow-700 shadow-2xl scale-110 animate-pulse'
                    : 'bg-white text-gray-700 border-yellow-400 hover:border-yellow-500'
                }`}
              >
                <Meh className="w-14 h-14 mx-auto mb-2 drop-shadow-lg" />
                <div className="drop-shadow-md">中等</div>
                <div className="text-base font-bold drop-shadow-sm">(1-20)</div>
              </button>
              
              <button
                onClick={() => handleDifficultyChange('hard')}
                className={`py-5 rounded-2xl font-black text-xl transition-all border-6 hover:scale-110 shadow-lg ${
                  difficulty === 'hard'
                    ? 'bg-gradient-to-br from-red-300 via-red-400 to-rose-500 text-white border-red-700 shadow-2xl scale-110 animate-pulse'
                    : 'bg-white text-gray-700 border-red-400 hover:border-red-500'
                }`}
              >
                <Frown className="w-14 h-14 mx-auto mb-2 drop-shadow-lg" />
                <div className="drop-shadow-md">困難</div>
                <div className="text-base font-bold drop-shadow-sm">(1-50)</div>
              </button>
            </div>
          </div>

          {/* 開始按鈕 */}
          <div className="relative">
            <button
              onClick={startPractice}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-10 rounded-3xl font-black text-4xl hover:scale-110 transition-all shadow-2xl border-8 border-white relative overflow-hidden group animate-pulse hover:animate-none"
            >
              <div className="flex items-center justify-center gap-5">
                <Rocket className="w-16 h-16 group-hover:scale-150 group-hover:rotate-12 transition-all drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]" />
                <span className="drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)]">開始練習</span>
                <Rocket className="w-16 h-16 group-hover:scale-150 group-hover:-rotate-12 transition-all drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]" />
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-30 transition-opacity"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-pulse"></div>
            </button>
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
      <div className="max-w-2xl mx-auto">
        {/* 頂部信息欄 */}
        <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl p-6 mb-6 border-8 border-purple-400">
          <div className="flex items-center justify-between">
            {/* 獎勵顯示 */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full border-4 border-yellow-400 shadow-lg">
                <Star className="w-10 h-10 text-yellow-500 animate-spin drop-shadow-[0_5px_5px_rgba(234,179,8,0.5)]" style={{ animationDuration: '3s' }} />
                <span className="text-4xl font-black text-yellow-700 drop-shadow-md">{rewards.stars}</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full border-4 border-amber-400 shadow-lg">
                <Trophy className="w-10 h-10 text-amber-600 animate-bounce drop-shadow-[0_5px_5px_rgba(217,119,6,0.5)]" />
                <span className="text-4xl font-black text-amber-700 drop-shadow-md">{rewards.trophies}</span>
              </div>
              <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full border-4 border-green-400 shadow-lg">
                <TrendingUp className="w-10 h-10 text-green-600 animate-pulse drop-shadow-[0_5px_5px_rgba(22,163,74,0.5)]" />
                <span className="text-3xl font-black text-green-700 drop-shadow-md">{rewards.accuracy}%</span>
              </div>
            </div>
            {/* 音效按鈕 */}
            <button
              onClick={() => { play('click'); toggle(); }}
              className="px-6 py-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full font-black text-lg hover:scale-125 transition-all shadow-xl border-4 border-white drop-shadow-lg"
            >
              {isEnabled ? (
                <Volume2 className="w-8 h-8 drop-shadow-md" />
              ) : (
                <VolumeX className="w-8 h-8 drop-shadow-md" />
              )}
            </button>
          </div>
        </div>

        {/* 難度指示器 */}
        <div className="bg-gradient-to-r from-blue-100 via-cyan-100 to-blue-100 rounded-2xl shadow-xl p-4 mb-4 border-6 border-blue-500 flex items-center justify-center gap-4">
          {(() => {
            const Icon = getDifficultyIcon(difficulty);
            return (
              <>
                <Icon className="w-12 h-12 text-blue-600 animate-bounce drop-shadow-[0_5px_5px_rgba(37,99,235,0.5)]" />
                <span className="font-black text-gray-800 text-2xl drop-shadow-md">目前難度：{getDifficultyLabel(difficulty)}</span>
                <Icon className="w-12 h-12 text-cyan-600 animate-bounce drop-shadow-[0_5px_5px_rgba(8,145,178,0.5)]" />
              </>
            );
          })()}
        </div>

        {/* 題目卡片 */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        )}

        {/* 快速切換難度 */}
        <div className="mt-6 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-3xl shadow-xl p-5 border-6 border-yellow-400">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="w-8 h-8 text-blue-600 animate-pulse drop-shadow-md" />
            <p className="text-center font-black text-gray-800 text-xl drop-shadow-sm">快速切換難度</p>
            <Target className="w-8 h-8 text-pink-600 animate-pulse drop-shadow-md" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
              const Icon = getDifficultyIcon(diff);
              return (
                <button
                  key={diff}
                  onClick={() => handleDifficultyChange(diff)}
                  className={`py-4 rounded-xl font-black text-lg transition-all border-5 hover:scale-110 shadow-lg ${
                    difficulty === diff
                      ? 'bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 text-white border-blue-700 shadow-2xl scale-110 animate-pulse'
                      : 'bg-white text-gray-600 border-gray-400 hover:border-blue-400'
                  }`}
                >
                  <Icon className="w-12 h-12 mx-auto mb-1 drop-shadow-lg" />
                  <div className="text-base drop-shadow-md">{getDifficultyLabel(diff)}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 返回按鈕 */}
        <button
          onClick={() => { play('click'); setIsPracticing(false); }}
          className="mt-6 w-full bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white py-6 rounded-3xl font-black text-2xl hover:scale-110 transition-all shadow-2xl border-6 border-white flex items-center justify-center gap-4"
        >
          <HomeIcon className="w-10 h-10 drop-shadow-lg" />
          <span className="drop-shadow-lg">返回首頁</span>
          <HomeIcon className="w-10 h-10 drop-shadow-lg" />
        </button>
      </div>
    </div>
  );
}
