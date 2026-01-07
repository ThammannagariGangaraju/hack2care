import { useState, useEffect, useRef } from "react";

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
      <div className="relative w-full max-w-md aspect-[4/3] bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden mb-6">
        
        <svg 
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid meet"
        >
          <rect x="0" y="260" width="400" height="40" fill="#d1d5db" />
          
          <g>
            <ellipse cx="200" cy="245" rx="130" ry="20" fill="#374151" />
            
            <ellipse cx="320" cy="230" rx="28" ry="24" fill="#fcd9b6" />
            <ellipse cx="328" cy="226" rx="3" ry="1.5" fill="#333" />
            <path d="M 318 238 Q 322 236 326 238" stroke="#a87d5a" strokeWidth="1.5" fill="none" />
            <ellipse cx="320" cy="212" rx="26" ry="10" fill="#5c4033" />
            
            <ellipse cx="200" cy="235" rx="50" ry="22" fill="#e5e7eb" />
            <ellipse cx="200" cy="230" rx="45" ry="18" fill="#f3f4f6" />
            
            <ellipse cx="80" cy="245" rx="45" ry="12" fill="#1e3a5f" />
            <ellipse cx="40" cy="250" rx="20" ry="10" fill="#0f172a" />
          </g>

          <g 
            className="transition-transform duration-75"
            style={{ 
              transform: isCompressing ? 'translateY(8px)' : 'translateY(0px)',
              transformOrigin: 'center bottom'
            }}
          >
            <ellipse cx="200" cy="80" rx="22" ry="24" fill="#fcd9b6" />
            
            <circle cx="192" cy="76" r="3" fill="#333" />
            <circle cx="208" cy="76" r="3" fill="#333" />
            <path d="M 195 88 Q 200 92 205 88" stroke="#333" strokeWidth="2" fill="none" />
            
            <ellipse cx="200" cy="60" rx="20" ry="12" fill="#10b981" />
            <path d="M 180 58 Q 200 48 220 58" fill="#10b981" />
            
            <path 
              d="M 175 105 Q 160 150 170 180 L 230 180 Q 240 150 225 105 Z" 
              fill="#10b981"
            />
            
            <path 
              d="M 175 115 Q 140 140 150 180 L 155 210 L 170 210 L 175 180 Q 175 160 185 140"
              fill="#10b981"
            />
            <path 
              d="M 225 115 Q 260 140 250 180 L 245 210 L 230 210 L 225 180 Q 225 160 215 140"
              fill="#10b981"
            />
          </g>

          <g
            className="transition-transform duration-75"
            style={{ 
              transform: isCompressing ? 'translateY(12px)' : 'translateY(0px)',
            }}
          >
            <path 
              d="M 168 180 Q 175 195 185 205"
              stroke="#fcd9b6" strokeWidth="14" strokeLinecap="round" fill="none"
            />
            <path 
              d="M 232 180 Q 225 195 215 205"
              stroke="#fcd9b6" strokeWidth="14" strokeLinecap="round" fill="none"
            />
            
            <ellipse cx="200" cy="215" rx="28" ry="12" fill="#fcd9b6" />
            <ellipse cx="200" cy="218" rx="22" ry="8" fill="#e5c9a8" />
            
            <line x1="185" y1="215" x2="190" y2="215" stroke="#d4a574" strokeWidth="1" />
            <line x1="193" y1="215" x2="198" y2="215" stroke="#d4a574" strokeWidth="1" />
            <line x1="202" y1="215" x2="207" y2="215" stroke="#d4a574" strokeWidth="1" />
            <line x1="210" y1="215" x2="215" y2="215" stroke="#d4a574" strokeWidth="1" />
          </g>

          <g
            className="transition-transform duration-75"
            style={{ 
              transform: isCompressing ? 'translateY(4px)' : 'translateY(0px)',
            }}
          >
            <path 
              d="M 170 180 Q 155 220 130 250"
              stroke="#1e3a5f" strokeWidth="24" strokeLinecap="round" fill="none"
            />
            <ellipse cx="125" cy="255" rx="12" ry="8" fill="#0f172a" />
            
            <path 
              d="M 230 180 Q 245 220 270 250"
              stroke="#1e3a5f" strokeWidth="24" strokeLinecap="round" fill="none"
            />
            <ellipse cx="275" cy="255" rx="12" ry="8" fill="#0f172a" />
          </g>

          {isCompressing && (
            <>
              <circle cx="200" cy="230" r="35" fill="none" stroke="#dc2626" strokeWidth="3" opacity="0.6">
                <animate attributeName="r" values="25;40;25" dur="0.3s" repeatCount="1" />
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.3s" repeatCount="1" />
              </circle>
              
              <g transform="translate(200, 180)">
                <path d="M 0 0 L 0 20" stroke="#dc2626" strokeWidth="3" strokeLinecap="round">
                  <animate attributeName="d" values="M 0 -5 L 0 15;M 0 5 L 0 25;M 0 -5 L 0 15" dur="0.3s" repeatCount="1" />
                </path>
                <path d="M -6 14 L 0 20 L 6 14" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" fill="none" />
              </g>
            </>
          )}

          <text x="200" y="30" textAnchor="middle" className="text-sm font-bold" fill="#dc2626" opacity={isCompressing ? 1 : 0.3}>
            PUSH HARD - 2 INCHES DEEP
          </text>
        </svg>

        <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          isCompressing ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'
        }`}>
          {isCompressing ? 'COMPRESS' : 'RELEASE'}
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 mb-4">
        <div className="text-center">
          <div 
            className={`text-7xl font-bold transition-all duration-100 ${
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

      <div className="w-full bg-muted/50 rounded-xl p-4">
        <p className="text-lg font-semibold mb-3 text-center">CPR Hand Position</p>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <span>Place heel of one hand on center of chest</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <span>Put other hand on top, interlace fingers</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <span>Keep arms straight, push hard and fast</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
            <span>Push 2 inches deep, 100-120 times per minute</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          After 30 compressions, give 2 rescue breaths if trained. Then continue.
        </p>
      </div>
    </div>
  );
}
