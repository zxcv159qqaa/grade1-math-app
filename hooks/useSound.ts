'use client';

import { useEffect, useRef, useState } from 'react';

// 音效類型
export type SoundType = 'correct' | 'wrong' | 'star' | 'click';

// 使用 Web Audio API 生成音效（不需要外部檔案）
class SoundGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // 答對音效：愉悅的上升音調
  playCorrect() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
    oscillator.frequency.exponentialRampToValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  // 答錯音效：溫和的低音提示
  playWrong() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(392, this.audioContext.currentTime); // G4
    oscillator.frequency.exponentialRampToValueAtTime(349.23, this.audioContext.currentTime + 0.15); // F4
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  // 獲得星星音效：閃亮的音效
  playStar() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(1046.50, this.audioContext.currentTime); // C6
    oscillator.frequency.exponentialRampToValueAtTime(1318.51, this.audioContext.currentTime + 0.05); // E6
    oscillator.frequency.exponentialRampToValueAtTime(1567.98, this.audioContext.currentTime + 0.1); // G6
    oscillator.frequency.exponentialRampToValueAtTime(2093, this.audioContext.currentTime + 0.15); // C7
    
    gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.25);
  }

  // 點擊音效：簡單的點擊聲
  playClick() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }
}

export function useSound() {
  const [isEnabled, setIsEnabled] = useState(true);
  const soundGeneratorRef = useRef<SoundGenerator | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      soundGeneratorRef.current = new SoundGenerator();
    }
    
    return () => {
      soundGeneratorRef.current = null;
    };
  }, []);

  const play = (type: SoundType) => {
    if (!isEnabled || !soundGeneratorRef.current) return;

    try {
      switch (type) {
        case 'correct':
          soundGeneratorRef.current.playCorrect();
          break;
        case 'wrong':
          soundGeneratorRef.current.playWrong();
          break;
        case 'star':
          soundGeneratorRef.current.playStar();
          break;
        case 'click':
          soundGeneratorRef.current.playClick();
          break;
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const toggle = () => {
    setIsEnabled(!isEnabled);
  };

  return {
    play,
    isEnabled,
    toggle
  };
}
