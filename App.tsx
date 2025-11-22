import React, { useState, useEffect } from 'react';
import PiVisualizer from './components/PiVisualizer';
import Menu from './components/Menu';

function App() {
  const [progress, setProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;
      
      const maxScroll = documentHeight - windowHeight;
      
      if (maxScroll <= 0) {
        setProgress(1);
        return;
      }

      // Smoother scroll mapping
      const rawProgress = scrollY / maxScroll;
      const clamped = Math.min(Math.max(rawProgress, 0), 1);
      setProgress(clamped);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative w-full min-h-[6000vh] bg-black font-mono selection:bg-white selection:text-black">
      
      {/* Background Audio (Hidden Youtube Embed) */}
      <div className="hidden">
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/ntOYYaZz6y8?autoplay=1&loop=1&playlist=ntOYYaZz6y8&controls=0&showinfo=0" 
          title="Background Audio" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      </div>

      {/* Menu Trigger: A point in the top right */}
      <header className="fixed top-0 right-0 p-8 z-40 mix-blend-difference">
        <button 
            onClick={() => setIsMenuOpen(true)}
            className="group flex items-center justify-center w-12 h-12 cursor-pointer"
            aria-label="Open Menu"
        >
           <div className="w-2 h-2 bg-white rounded-full group-hover:scale-150 transition-transform duration-300 shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
        </button>
      </header>

      {/* Sticky Visualizer Container */}
      <main className="fixed top-0 left-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden z-10">
         <PiVisualizer progress={progress} />
      </main>

      {/* Menu Overlay */}
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Subtle scroll hint that fades out */}
      <div 
        className="fixed bottom-10 w-full text-center pointer-events-none z-20 transition-opacity duration-500"
        style={{ opacity: Math.max(0, 1 - progress * 15) }}
      >
          <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase">Scroll to trace the infinite</p>
      </div>

    </div>
  );
}

export default App;