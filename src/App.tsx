import React from 'react';
import { HeroFaceSection } from './components/HeroFaceSection';
import { ProjectBrainSection } from './components/ProjectBrainSection';

export const App: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#030509] text-[#F5F5F7] selection:bg-[#38bdf8]/30 selection:text-white">
      {/* Subtle Noise / Star Dust Background Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:32px_32px] opacity-40 z-0" />

      {/* Minimal Top Brand Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-4 flex items-center justify-between text-xs font-mono tracking-wider text-[#94a3b8]">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_10px_#38bdf8]" />
          <span className="text-white font-semibold tracking-widest uppercase">Niranjan Krishnakumar</span>
          <span className="text-[#64748b]">/</span>
          <span className="text-[#38bdf8]">ELC Researcher</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/niranjan-crypt"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub ↗
          </a>
          <a
            href="mailto:niranjankrishnakumar2005@gmail.com"
            className="hover:text-white transition-colors"
          >
            Contact
          </a>
        </div>
      </header>

      {/* Main Content: The Two 3D Project Showcases */}
      <main className="relative z-10 flex flex-col">
        {/* Section 1: Hero Hyperspectral Face ID (Reference Images 1 & 3) */}
        <HeroFaceSection />

        {/* Section 2: Hybrid PSO-GA MRI Brain (Reference Images 2 & 4) */}
        <ProjectBrainSection />
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full border-t border-white/[0.06] py-12 px-6 sm:px-10 lg:px-16 text-center text-xs font-mono text-[#64748b]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Niranjan Krishnakumar · Electrical and Computer Engineering (ELC)</p>
          <p className="text-[#475569]">Interactive 3D WebGL · Powered by Three.js &amp; React Three Fiber</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
