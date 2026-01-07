import { useState, useEffect, useRef } from "react";
import cprImage from "@assets/image_1767781394467.png";

export default function CPRAnimation() {
  const [count, setCount] = useState(1);
  const [isCompressing, setIsCompressing] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  const COMPRESSION_INTERVAL = 545;
  const COMPRESSIONS_PER_CYCLE = 30;

  useEffect(() => {
    startTimeRef.current = Date.now();
    
    const compressionInterval = setInterval(() => {
      setCount(prev => {
        if (prev >= COMPRESSIONS_PER_CYCLE) {
          return 1;
        }
        return prev + 1;
      });
      
      setIsCompressing(true);
      setTimeout(() => setIsCompressing(false), COMPRESSION_INTERVAL / 2);
    }, COMPRESSION_INTERVAL);

    const timeInterval = setInterval(() => {
      if (startTimeRef.current) {
        setTotalSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);

    return () => {
      clearInterval(compressionInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-100 rounded-2xl overflow-hidden mb-4 p-4">
        <div 
          className="relative transition-transform duration-100 ease-out"
          style={{
            transform: isCompressing ? 'scale(1.02) translateY(2px)' : 'scale(1) translateY(0px)'
          }}
        >
          <img 
            src={cprImage} 
            alt="CPR chest compressions demonstration showing proper hand position"
            className="w-full h-auto object-contain"
          />
          
          <div 
            className={`absolute top-[45%] left-[35%] w-12 h-12 transition-all duration-100 ${
              isCompressing ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
            }`}
          >
            <div className="w-full h-full rounded-full bg-red-500/40 animate-ping" />
          </div>
          
          {isCompressing && (
            <div className="absolute top-[30%] left-[35%] flex flex-col items-center">
              <svg 
                className="w-8 h-8 text-red-500 animate-bounce"
                viewBox="0 0 24 24" 
                fill="none"
              >
                <path 
                  d="M12 4L12 20M12 20L6 14M12 20L18 14" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        <div className={`absolute bottom-2 left-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-100 ${
          isCompressing 
            ? 'bg-red-600 text-white' 
            : 'bg-gray-200 text-gray-700'
        }`}>
          {isCompressing ? 'PUSH!' : 'RELEASE'}
        </div>

        <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
          {formatTime(totalSeconds)}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mb-4 w-full">
        <div className="text-center flex-1">
          <div 
            className={`text-6xl font-bold transition-all duration-100 ${
              isCompressing 
                ? 'text-red-500 scale-110' 
                : 'text-foreground scale-100'
            }`}
            data-testid="text-cpr-count"
          >
            {count}
          </div>
          <div className="text-sm text-muted-foreground mt-1">of 30 compressions</div>
        </div>
        
        <div className="h-16 w-px bg-border" />
        
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-muted-foreground" data-testid="text-cpr-time">
            100-120
          </div>
          <div className="text-sm text-muted-foreground mt-1">per minute</div>
        </div>
      </div>

      <div className="w-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <p className="text-base font-bold text-red-700 dark:text-red-400 mb-3 text-center">
          CPR Hand Position
        </p>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <span className="text-foreground">Place heel of hand on CENTER of chest</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <span className="text-foreground">Put other hand on top, interlace fingers</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <span className="text-foreground">Keep arms STRAIGHT, push hard and fast</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
            <span className="text-foreground">Push 2 INCHES deep (5 cm)</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center border-t border-red-200 dark:border-red-800 pt-3">
          After 30 compressions, give 2 rescue breaths if trained. Then continue.
        </p>
      </div>
    </div>
  );
}
