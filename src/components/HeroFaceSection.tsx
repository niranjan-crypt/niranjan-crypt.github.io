import React from 'react';
import { motion } from 'framer-motion';
import { PillBadge } from './ui/PillBadge';
import { ActionButtons } from './ui/ActionButtons';
import { GlassCard } from './ui/GlassCard';
import { InteractiveFace } from './3d/InteractiveFace';

export const HeroFaceSection: React.FC = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 sm:px-10 lg:px-16 py-20 lg:py-28">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#0284c7]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
        {/* Left Column: Project Editorial & Information */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 flex flex-col items-start space-y-6"
        >
          {/* Pills Hierarchy */}
          <div className="flex flex-col items-start gap-2.5">
            <PillBadge label="01 · COMPUTER VISION · 3D-CNN" variant="primary" dot />
            <PillBadge label="UWA-HSFD Benchmark" variant="secondary" />
          </div>

          {/* Large Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#F5F5F7] leading-[1.15]">
            Real–Time Hyperspectral <br className="hidden sm:inline" />
            Face ID &amp; Explainable AI
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#9296A0] font-normal tracking-wide">
            33-Band Spatial-Spectral Datacube · ArcFace Biometric Loss
          </p>

          {/* Technical Datacube Specification Box */}
          <div className="w-full max-w-lg p-3.5 sm:p-4 rounded-2xl bg-[#090d16]/80 border border-white/10 font-mono text-xs sm:text-sm text-[#94a3b8] leading-relaxed shadow-inner">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
              <span>λ ∈ [400, 720 nm] · ArcFace (s=30, m=0.5)</span>
            </div>
            <div className="pl-3.5 text-[#cbd5e1] text-[11px] sm:text-xs pt-1">
              • Spectral SHAP
            </div>
          </div>

          {/* Description Paragraph */}
          <p className="text-sm sm:text-base text-[#8e95a5] leading-relaxed max-w-xl font-normal">
            Full-stack biometric system processing 33-band hyperspectral imagery (400–720 nm) with 3D-CNN spatial-spectral feature extraction, ArcFace angular-margin loss (s = 30, m = 0.5), Spectral SHAP explainability, and edge deployment on Raspberry Pi 4.
          </p>

          {/* Action Buttons */}
          <ActionButtons
            exploreLink="#project-06"
            codeLink="https://github.com/niranjan-crypt/hyperspectral-face-recognition"
          />
        </motion.div>

        {/* Right Column: 3D Interactive Face Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 w-full flex justify-center"
        >
          <GlassCard className="h-[420px] sm:h-[480px] lg:h-[520px]">
            <InteractiveFace />
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
};
