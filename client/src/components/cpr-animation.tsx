import { useState, useEffect, useRef } from "react";

export default function CPRAnimation() {
  const [count, setCount] = useState(1);
  const [isCompressing, setIsCompressing] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // CPR rhythm: 100-120 compressions per minute = ~1.7-2 compressions per second
  // We'll use 110 BPM = 545ms per compression
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
      
      // Animate compression
      setIsCompressing(true);
      setTimeout(() => setIsCompressing(false), COMPRESSION_INTERVAL / 2);
    }, COMPRESSION_INTERVAL);

    // Update total time
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
      {/* CPR Animation Container */}
      <div className="relative w-full max-w-md aspect-[4/3] bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-2xl overflow-hidden mb-6">
        {/* Ground/Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-300 dark:bg-gray-700" />
        
        {/* Patient (lying down) */}
        <svg 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          width="280"
          height="60"
          viewBox="0 0 280 60"
        >
          {/* Patient body (horizontal) */}
          <ellipse cx="140" cy="45" rx="100" ry="12" fill="#8B7355" opacity="0.8" />
          
          {/* Patient head */}
          <circle cx="250" cy="40" r="18" fill="#DEB887" />
          
          {/* Patient face details */}
          <ellipse cx="258" cy="38" rx="2" ry="1" fill="#333" /> {/* Eye closed */}
          
          {/* Patient arms */}
          <line x1="180" y1="45" x2="200" y2="55" stroke="#DEB887" strokeWidth="8" strokeLinecap="round" />
          <line x1="100" y1="45" x2="80" y2="55" stroke="#DEB887" strokeWidth="8" strokeLinecap="round" />
          
          {/* Patient legs */}
          <line x1="60" y1="45" x2="30" y2="50" stroke="#4A5568" strokeWidth="12" strokeLinecap="round" />
          <line x1="50" y1="50" x2="20" y2="55" stroke="#2D3748" strokeWidth="10" strokeLinecap="round" />
          
          {/* Chest area marker */}
          <ellipse 
            cx="160" 
            cy="40" 
            rx="20" 
            ry="8" 
            fill="none" 
            stroke="#DC2626" 
            strokeWidth="2" 
            strokeDasharray="4 2"
            className={isCompressing ? "opacity-100" : "opacity-50"}
          />
        </svg>
        
        {/* Rescuer (performing CPR) */}
        <svg 
          className="absolute bottom-8 left-1/2 transition-transform duration-75"
          style={{ 
            transform: `translateX(-50%) translateY(${isCompressing ? '8px' : '0px'})`,
          }}
          width="120"
          height="140"
          viewBox="0 0 120 140"
        >
          {/* Rescuer body (kneeling) */}
          {/* Head */}
          <circle cx="60" cy="25" r="20" fill="#DEB887" />
          
          {/* Face features */}
          <circle cx="52" cy="22" r="2" fill="#333" />
          <circle cx="68" cy="22" r="2" fill="#333" />
          <path d="M 55 30 Q 60 34 65 30" stroke="#333" strokeWidth="2" fill="none" />
          
          {/* Hair */}
          <ellipse cx="60" cy="12" rx="18" ry="8" fill="#4A3728" />
          
          {/* Torso */}
          <path 
            d="M 40 45 L 35 90 L 85 90 L 80 45 Z" 
            fill="#3B82F6"
            className={isCompressing ? "opacity-90" : "opacity-100"}
          />
          
          {/* Arms (pressing down) */}
          <g className={`transition-transform duration-75 ${isCompressing ? 'translate-y-1' : ''}`}>
            {/* Left arm */}
            <line x1="35" y1="55" x2="20" y2="100" stroke="#DEB887" strokeWidth="10" strokeLinecap="round" />
            {/* Right arm */}
            <line x1="85" y1="55" x2="100" y2="100" stroke="#DEB887" strokeWidth="10" strokeLinecap="round" />
            
            {/* Hands (interlocked on chest) */}
            <ellipse cx="60" cy="105" rx="25" ry="12" fill="#DEB887" />
            <ellipse cx="60" cy="108" rx="20" ry="8" fill="#C4A574" />
          </g>
          
          {/* Legs (kneeling position) */}
          <ellipse cx="45" cy="100" rx="12" ry="20" fill="#2D3748" />
          <ellipse cx="75" cy="100" rx="12" ry="20" fill="#2D3748" />
          
          {/* Knees */}
          <ellipse cx="35" cy="115" rx="8" ry="6" fill="#1A202C" />
          <ellipse cx="85" cy="115" rx="8" ry="6" fill="#1A202C" />
        </svg>

        {/* Compression Indicator */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full transition-all duration-75 ${
            isCompressing 
              ? 'bg-red-500/30 scale-110' 
              : 'bg-red-500/10 scale-100'
          }`}
        />

        {/* Push indicator arrows */}
        {isCompressing && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="text-red-500 font-bold text-sm animate-bounce">PUSH</div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-500">
              <path d="M12 4L12 20M12 20L6 14M12 20L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>

      {/* Count Display */}
      <div className="flex items-center justify-center gap-8 mb-4">
        <div className="text-center">
          <div 
            className={`text-8xl font-bold transition-all duration-100 ${
              isCompressing 
                ? 'text-red-500 scale-110' 
                : 'text-foreground scale-100'
            }`}
            data-testid="text-cpr-count"
          >
            {count}
          </div>
          <div className="text-lg text-muted-foreground mt-1">of 30</div>
        </div>
        
        <div className="h-20 w-px bg-border" />
        
        <div className="text-center">
          <div className="text-4xl font-bold text-muted-foreground" data-testid="text-cpr-time">
            {formatTime(totalSeconds)}
          </div>
          <div className="text-lg text-muted-foreground mt-1">elapsed</div>
        </div>
      </div>

      {/* Rhythm Guide */}
      <div className="w-full bg-muted/50 rounded-xl p-4 text-center">
        <p className="text-lg font-semibold mb-2">CPR Rhythm Guide</p>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <span className="text-2xl">Push hard</span>
          <span className="text-xl">&bull;</span>
          <span className="text-2xl">Push fast</span>
          <span className="text-xl">&bull;</span>
          <span className="text-2xl">100-120/min</span>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          After 30 compressions, give 2 rescue breaths if trained. Then continue.
        </p>
      </div>
    </div>
  );
}
