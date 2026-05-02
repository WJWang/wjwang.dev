import { Search } from 'lucide-react';
import { SITE } from '@/lib/site-config';

export function Hero() {
  return (
    <section className="w-full py-16 md:py-24 relative overflow-hidden border-b border-border">
      {/* 3D Geometric Background with massive wireframes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dense wireframe mesh - top right */}
        <svg className="absolute top-0 right-0 w-full h-full opacity-30" viewBox="0 0 1200 600">
          <defs>
            <linearGradient id="neonGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#00ff88', stopOpacity: 0.6 }} />
              <stop offset="50%" style={{ stopColor: '#ff1493', stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: '#404040', stopOpacity: 0.2 }} />
            </linearGradient>
          </defs>

          {/* Sparse diagonal lines */}
          <line x1="700" y1="0" x2="1200" y2="300" stroke="#202020" strokeWidth="0.5" opacity="0.5" />
          <line x1="750" y1="0" x2="1200" y2="250" stroke="#00ff88" strokeWidth="0.8" opacity="0.6" />
          <line x1="900" y1="0" x2="1200" y2="100" stroke="#ff1493" strokeWidth="0.8" opacity="0.6" />

          {/* Minimal grid lines */}
          <line x1="700" y1="150" x2="1200" y2="150" stroke="#00ff88" strokeWidth="0.5" opacity="0.5" />
          <line x1="1050" y1="0" x2="1050" y2="300" stroke="#ff1493" strokeWidth="0.5" opacity="0.5" />

        </svg>

        {/* Dense wireframe mesh - bottom left */}
        <svg className="absolute bottom-0 left-0 w-full h-full opacity-25" viewBox="0 0 1200 600">
          <defs>
            <linearGradient id="neonGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ff1493', stopOpacity: 0.5 }} />
              <stop offset="50%" style={{ stopColor: '#00ff88', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#404040', stopOpacity: 0.2 }} />
            </linearGradient>
          </defs>

          {/* Sparse diagonal lines */}
          <line x1="0" y1="300" x2="500" y2="600" stroke="#202020" strokeWidth="0.5" opacity="0.5" />
          <line x1="0" y1="350" x2="450" y2="600" stroke="#ff1493" strokeWidth="0.8" opacity="0.6" />
          <line x1="50" y1="200" x2="650" y2="600" stroke="#00ff88" strokeWidth="0.8" opacity="0.6" />

          {/* Minimal grid lines */}
          <line x1="0" y1="450" x2="500" y2="450" stroke="#ff1493" strokeWidth="0.5" opacity="0.5" />
          <line x1="250" y1="300" x2="250" y2="600" stroke="#00ff88" strokeWidth="0.5" opacity="0.5" />

        </svg>

        {/* 3D Wireframe Polyhedron - Right */}
        <svg className="absolute top-[calc(50%+70px)] right-[calc(10%-50px)] -translate-y-1/2 w-[900px] h-[900px] md:w-[1260px] md:h-[1260px] opacity-30" viewBox="0 0 800 800">
          <defs>
            <radialGradient id="centerGlow">
              <stop offset="0%" style={{ stopColor: '#00d4ff', stopOpacity: 0.3 }} />
              <stop offset="50%" style={{ stopColor: '#0099cc', stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: '#006688', stopOpacity: 0.1 }} />
            </radialGradient>
          </defs>

          {/* Outer wireframe network */}
          {/* Top connections */}
          <line x1="100" y1="100" x2="400" y2="300" stroke="#404040" strokeWidth="0.5" opacity="0.4" />
          <line x1="200" y1="80" x2="400" y2="300" stroke="#404040" strokeWidth="0.5" opacity="0.4" />
          <line x1="300" y1="90" x2="400" y2="300" stroke="#404040" strokeWidth="0.5" opacity="0.4" />
          <line x1="400" y1="60" x2="400" y2="300" stroke="#00d4ff" strokeWidth="0.8" opacity="0.6" />
          <line x1="500" y1="80" x2="400" y2="300" stroke="#404040" strokeWidth="0.5" opacity="0.4" />
          <line x1="600" y1="90" x2="400" y2="300" stroke="#404040" strokeWidth="0.5" opacity="0.4" />
          <line x1="700" y1="100" x2="400" y2="300" stroke="#404040" strokeWidth="0.5" opacity="0.4" />

          {/* Right connections */}
          <line x1="700" y1="200" x2="500" y2="400" stroke="#404040" strokeWidth="0.5" opacity="0.4" />
          <line x1="720" y1="300" x2="500" y2="400" stroke="#0099cc" strokeWidth="0.8" opacity="0.6" />
          <line x1="700" y1="400" x2="500" y2="400" stroke="#404040" strokeWidth="0.5" opacity="0.4" />
          <line x1="720" y1="500" x2="500" y2="400" stroke="#404040" strokeWidth="0.5" opacity="0.4" />
          <line x1="700" y1="600" x2="500" y2="400" stroke="#404040" strokeWidth="0.5" opacity="0.4" />

          {/* Bottom connections */}
          <line x1="100" y1="700" x2="300" y2="500" stroke="#404040" strokeWidth="0.5" opacity="0.4" />
          <line x1="200" y1="720" x2="300" y2="500" stroke="#404040" strokeWidth="0.5" opacity="0.4" />
          <line x1="300" y1="710" x2="300" y2="500" stroke="#404040" strokeWidth="0.5" opacity="0.4" />
          <line x1="400" y1="740" x2="300" y2="500" stroke="#00f0ff" strokeWidth="0.8" opacity="0.7" />
          <line x1="500" y1="720" x2="300" y2="500" stroke="#404040" strokeWidth="0.5" opacity="0.4" />
          <line x1="600" y1="700" x2="300" y2="500" stroke="#404040" strokeWidth="0.5" opacity="0.4" />

          {/* Left connections */}
          <line x1="80" y1="200" x2="300" y2="350" stroke="#404040" strokeWidth="0.5" opacity="0.4" />
          <line x1="60" y1="300" x2="300" y2="350" stroke="#404040" strokeWidth="0.5" opacity="0.4" />
          <line x1="80" y1="400" x2="300" y2="350" stroke="#0099cc" strokeWidth="0.8" opacity="0.6" />
          <line x1="100" y1="500" x2="300" y2="350" stroke="#404040" strokeWidth="0.5" opacity="0.4" />

          {/* Central 3D Polyhedron */}
          {/* Top face - Light Blue */}
          <polygon points="400,300 500,250 450,350" fill="#00f0ff" opacity="0.25" stroke="#00f0ff" strokeWidth="2.5" />

          {/* Right face - Medium Blue */}
          <polygon points="500,250 550,400 450,350" fill="#00d4ff" opacity="0.3" stroke="#00d4ff" strokeWidth="2.5" />

          {/* Bottom face - Bright Blue */}
          <polygon points="450,350 550,400 350,450" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" strokeWidth="2.5" />

          {/* Left face - Dark Blue */}
          <polygon points="400,300 350,450 300,350" fill="#0099cc" opacity="0.15" stroke="#0099cc" strokeWidth="2" />

          {/* Back face - Medium Blue dark */}
          <polygon points="300,350 350,450 450,350" fill="#00b8e6" opacity="0.2" stroke="#00b8e6" strokeWidth="2" />

          {/* Inner structure lines */}
          <line x1="400" y1="300" x2="350" y2="450" stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
          <line x1="500" y1="250" x2="350" y2="450" stroke="#00b8e6" strokeWidth="1.5" opacity="0.8" />
          <line x1="550" y1="400" x2="300" y2="350" stroke="#00f0ff" strokeWidth="1.5" opacity="0.9" />
          <line x1="450" y1="350" x2="300" y2="350" stroke="#0099cc" strokeWidth="1" opacity="0.6" />

          {/* Additional network nodes */}
          <circle cx="400" cy="300" r="3" fill="#00f0ff" opacity="0.8" />
          <circle cx="500" cy="250" r="3" fill="#00d4ff" opacity="0.8" />
          <circle cx="550" cy="400" r="3" fill="#00b8e6" opacity="0.8" />
          <circle cx="350" cy="450" r="3" fill="#00f0ff" opacity="0.9" />
          <circle cx="300" cy="350" r="3" fill="#0099cc" opacity="0.8" />
          <circle cx="450" cy="350" r="2" fill="#00d4ff" opacity="0.7" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-6 md:gap-8">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-lg"></div>
            <img
              src={SITE.author.avatar}
              alt={SITE.author.name}
              className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-primary/60"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 text-foreground">
              {SITE.name}
            </h1>
            <p className="text-base md:text-xl text-muted-foreground">
              {SITE.tagline}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-8 relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜尋文章..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      </div>
    </section>
  );
}
