import React from 'react';
import { motion } from 'framer-motion';
import { PillBadge } from './ui/PillBadge';
import { ActionButtons } from './ui/ActionButtons';
import { GlassCard } from './ui/GlassCard';
import { InteractiveBrain } from './3d/InteractiveBrain';

export const ProjectBrainSection: React.FC = () => {
  return (
    <section id="project-06" className="relative w-full min-h-screen flex items-center justify-center px-6 sm:px-10 lg:px-16 py-20 lg:py-28 border-t border-white/[0.06]">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#7c3aed]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
        {/* Left Column: 3D Interactive Brain Visual (Mirrored from Hero) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 w-full flex justify-center order-2 lg:order-1"
        >
          <GlassCard className="h-[420px] sm:h-[480px] lg:h-[520px]">
            <InteractiveBrain />
          </GlassCard>
        </motion.div>

        {/* Right Column: Project Editorial & Information */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 flex flex-col items-start space-y-6 order-1 lg:order-2"
        >
          {/* Pills Hierarchy */}
          <div className="flex flex-col items-start gap-2.5">
            <PillBadge label="06 · MEDICAL IMAGING · OPTIMIZATION · MACHINE LEARNING" variant="primary" dot />
            <PillBadge label="PSO + GA Hybrid Optimization" variant="secondary" />
          </div>

          {/* Large Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#F5F5F7] leading-[1.15]">
            Hybrid PSO–GA Multilevel <br className="hidden sm:inline" />
            Otsu MRI Segmentation
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#9296A0] font-normal tracking-wide">
            Multilevel Thresholding · Swarm Intelligence · Haralick Textures
          </p>

          {/* Technical Multi-Threshold Specification Box */}
          <div className="w-full max-w-lg p-3.5 sm:p-4 rounded-2xl bg-[#090d16]/80 border border-white/10 font-mono text-xs sm:text-sm text-[#94a3b8] leading-relaxed shadow-inner">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
              <span>Swarm Optimization · Multi-Threshold</span>
            </div>
            <div className="pl-3.5 text-[#cbd5e1] text-[11px] sm:text-xs pt-1">
              • Grayscale Histogram · GLCM Texture
            </div>
          </div>

          {/* Description Paragraph */}
          <p className="text-sm sm:text-base text-[#8e95a5] leading-relaxed max-w-xl font-normal">
            Biomedical image segmentation pipeline using hybrid Particle Swarm Optimization and Genetic Algorithms to determine optimal multilevel Otsu thresholds on brain MRI scans. Extracts Haralick GLCM features for automated tissue characterization.
          </p>

          {/* Action Buttons */}
          <ActionButtons
            exploreLink="#project-01"
            codeLink="https://github.com/niranjan-crypt/Hybrid-PSO-GA-Based-Multilevel-Otsu-MRI-Segmentation-with-Machine-Learning-Validation"
          />
        </motion.div>
      </div>
    </section>
  );
};
