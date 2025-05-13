import React, { useState, useEffect } from 'react';

interface TimerProps {
  duration: number;
  onComplete: () => void;
  isActive?: boolean;
}

const Timer: React.FC<TimerProps> = ({ duration, onComplete, isActive = true }) => {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [startTime] = useState<number>(Date.now());

  const progressPercentage = (timeLeft / duration) * 100;

  useEffect(() => {
    let frameId: number;
    
    const updateTimer = () => {
      const currentTime = Date.now();
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
      const newTimeLeft = Math.max(0, duration - elapsedSeconds);
      
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft <= 0) {
        onComplete();
      } else if (isActive) {
        frameId = requestAnimationFrame(updateTimer);
      }
    };

    if (isActive) {
      frameId = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [duration, onComplete, startTime, isActive]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-600">Tempo Restante</span>
        <span className="text-lg font-bold font-baloo text-[#FF5757]">
          {formatTime(timeLeft)}
        </span>
      </div>
      
      <div className="timer-bar">
        <div 
          className="timer-progress"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default Timer;