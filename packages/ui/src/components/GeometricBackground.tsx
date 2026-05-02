export function GeometricBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top right massive wireframe network */}
      <svg className="absolute top-0 right-0 w-2/3 h-2/3 opacity-25" viewBox="0 0 800 800">
        <defs>
          <linearGradient id="bgWire1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#00ff88', stopOpacity: 0.5 }} />
            <stop offset="50%" style={{ stopColor: '#ff1493', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#202020', stopOpacity: 0.2 }} />
          </linearGradient>
        </defs>

        {/* Sparse wireframe lines */}
        <line x1="400" y1="0" x2="800" y2="400" stroke="#202020" strokeWidth="0.5" opacity="0.5" />
        <line x1="450" y1="0" x2="800" y2="350" stroke="#00ff88" strokeWidth="0.8" opacity="0.6" />
        <line x1="600" y1="0" x2="800" y2="200" stroke="#ff1493" strokeWidth="0.8" opacity="0.6" />

        {/* Minimal grid lines */}
        <line x1="400" y1="200" x2="800" y2="200" stroke="#00ff88" strokeWidth="0.5" opacity="0.5" />
        <line x1="600" y1="0" x2="600" y2="500" stroke="#ff1493" strokeWidth="0.5" opacity="0.5" />

        {/* Sparse 3D Polygons */}
        <polygon points="450,120 680,80 760,280 540,320" fill="rgba(0, 255, 136, 0.04)" stroke="#00ff88" strokeWidth="2" opacity="0.8" />
        <polygon points="520,160 660,190 630,340 490,310" fill="rgba(255, 20, 147, 0.04)" stroke="#ff1493" strokeWidth="2" opacity="0.8" />
        <polygon points="650,380 780,350 820,500 690,530" fill="rgba(0, 240, 255, 0.05)" stroke="#00f0ff" strokeWidth="2" opacity="0.85" />
      </svg>

      {/* Bottom left massive wireframe network */}
      <svg className="absolute bottom-0 left-0 w-2/3 h-2/3 opacity-20" viewBox="0 0 800 800">
        <defs>
          <linearGradient id="bgWire2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ff1493', stopOpacity: 0.4 }} />
            <stop offset="50%" style={{ stopColor: '#00ff88', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#202020', stopOpacity: 0.2 }} />
          </linearGradient>
        </defs>

        {/* Sparse wireframe lines */}
        <line x1="0" y1="400" x2="400" y2="800" stroke="#ff1493" strokeWidth="0.8" opacity="0.6" />
        <line x1="0" y1="500" x2="300" y2="800" stroke="#202020" strokeWidth="0.5" opacity="0.5" />
        <line x1="50" y1="300" x2="550" y2="800" stroke="#00ff88" strokeWidth="0.8" opacity="0.6" />

        {/* Minimal grid lines */}
        <line x1="0" y1="600" x2="500" y2="600" stroke="#ff1493" strokeWidth="0.5" opacity="0.5" />
        <line x1="300" y1="300" x2="300" y2="800" stroke="#00ff88" strokeWidth="0.5" opacity="0.5" />

        {/* Sparse 3D Polygons */}
        <polygon points="100,550 320,510 400,680 200,720" fill="rgba(255, 20, 147, 0.04)" stroke="#ff1493" strokeWidth="2" opacity="0.8" />
        <polygon points="280,620 440,590 480,720 320,750" fill="rgba(0, 255, 136, 0.04)" stroke="#00ff88" strokeWidth="2" opacity="0.8" />
        <polygon points="40,350 180,320 230,460 90,490" fill="rgba(0, 240, 255, 0.05)" stroke="#00f0ff" strokeWidth="2" opacity="0.85" />
      </svg>

      {/* Center 3D focal polyhedron - SPARSE */}
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] opacity-20" viewBox="0 0 700 700">
        {/* 3D icosahedron style - SPARSE */}
        <polygon points="350,140 520,230 480,420 310,330" fill="rgba(0, 255, 136, 0.06)" stroke="#00ff88" strokeWidth="3" opacity="0.9" />
        <polygon points="310,330 480,420 400,580 230,490" fill="rgba(255, 20, 147, 0.05)" stroke="#ff1493" strokeWidth="2.5" opacity="0.85" />
        <polygon points="180,120 320,160 290,300 150,260" fill="rgba(0, 240, 255, 0.06)" stroke="#00f0ff" strokeWidth="2.5" opacity="0.9" />

        {/* Radiating web - SPARSE */}
        <line x1="300" y1="300" x2="150" y2="450" stroke="#ff1493" strokeWidth="1.2" opacity="0.6" />
        <line x1="220" y1="210" x2="120" y2="140" stroke="#00f0ff" strokeWidth="1.2" opacity="0.7" />
      </svg>

      {/* Neon accent dots */}
      <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-[#00ff88]/50"></div>
      <div className="absolute top-1/3 left-1/3 w-1 h-1 rounded-full bg-[#ff1493]/40"></div>
      <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-[#00ff88]/40"></div>
      <div className="absolute bottom-1/3 right-1/3 w-1 h-1 rounded-full bg-[#ff1493]/35"></div>
      <div className="absolute top-1/2 right-1/2 w-1 h-1 rounded-full bg-[#00ff88]/30"></div>
    </div>
  );
}
