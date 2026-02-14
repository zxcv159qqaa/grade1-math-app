'use client';

import { useState } from 'react';
import { GachaItem, getRarityColor, getRarityName } from '@/lib/gacha-items';
import { Gift, Star, Sparkles, X } from 'lucide-react';

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStars: number;
  onGachaDraw: () => void;
}

export default function GachaModal({ isOpen, onClose, currentStars, onGachaDraw }: GachaModalProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnItem, setDrawnItem] = useState<GachaItem | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!isOpen) return null;

  const handleDraw = async () => {
    if (currentStars < 10) {
      alert('需要 10 顆星星才能抽扭蛋！');
      return;
    }

    setIsDrawing(true);
    setShowResult(false);

    try {
      const response = await fetch('/api/gacha', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // 動畫效果：延遲顯示結果
        setTimeout(() => {
          setDrawnItem(data.item);
          setShowResult(true);
          setIsDrawing(false);
          onGachaDraw();
        }, 1500);
      } else {
        alert(data.error || '抽扭蛋失敗');
        setIsDrawing(false);
      }
    } catch (error) {
      console.error('Error drawing gacha:', error);
      alert('抽扭蛋時發生錯誤');
      setIsDrawing(false);
    }
  };

  const handleClose = () => {
    setDrawnItem(null);
    setShowResult(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-purple-300 relative">
        {/* 關閉按鈕 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* 標題 */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <Gift className="w-16 h-16 text-purple-600 animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">扭蛋機</h2>
          <p className="text-gray-600 mt-2 flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>10 顆星星抽一次</span>
          </p>
        </div>

        {/* 當前星星數 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-100 px-6 py-3 rounded-full border-4 border-yellow-300">
            <span className="text-lg text-gray-700">你有</span>
            <Star className="w-6 h-6 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-600">{currentStars}</span>
          </div>
        </div>

        {/* 抽取中動畫 */}
        {isDrawing && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <Sparkles className="w-24 h-24 text-purple-600 animate-bounce" />
            </div>
            <div className="text-xl text-gray-600 font-bold">抽取中...</div>
          </div>
        )}

        {/* 抽取結果 */}
        {showResult && drawnItem && (
          <div className="text-center py-8">
            <div className="text-8xl mb-4 animate-pulse">{drawnItem.emoji}</div>
            <div className={`inline-block px-6 py-2 rounded-lg border-4 ${getRarityColor(drawnItem.rarity)} mb-3 font-bold`}>
              {getRarityName(drawnItem.rarity)}
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{drawnItem.name}</div>
            <div className="text-lg text-gray-600">{drawnItem.category}</div>
          </div>
        )}

        {/* 操作按鈕 */}
        {!isDrawing && !showResult && (
          <div className="space-y-3">
            <button
              onClick={handleDraw}
              disabled={currentStars < 10}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 border-4 ${
                currentStars >= 10
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 shadow-lg border-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'
              }`}
            >
              {currentStars >= 10 ? (
                <>
                  <Gift className="w-6 h-6" />
                  <span>抽一次</span>
                  <div className="flex items-center gap-1">
                    <span>(10</span>
                    <Star className="w-5 h-5" />
                    <span>)</span>
                  </div>
                </>
              ) : (
                <>
                  <Star className="w-6 h-6" />
                  <span>星星不足</span>
                </>
              )}
            </button>
            <button
              onClick={handleClose}
              className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all border-4 border-gray-300"
            >
              關閉
            </button>
          </div>
        )}

        {showResult && (
          <button
            onClick={handleClose}
            className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-all shadow-lg border-4 border-blue-600"
          >
            確定
          </button>
        )}
      </div>
    </div>
  );
}
