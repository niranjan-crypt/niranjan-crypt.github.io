// Live Interactive Simulators for Niranjan Krishnakumar's Research Portfolio

(function() {
  // --- UTILITY SOUND FX ---
  function playClickSound() {
    if (window.PORTFOLIO_AUDIO && window.PORTFOLIO_AUDIO.playBlip) {
      window.PORTFOLIO_AUDIO.playBlip(780, 0.05);
    }
  }

  // =========================================================================
  // SIMULATOR 1: HYPERSPECTRAL BAND & XAI SALIENCY EXPLORER
  // =========================================================================
  const HyperspectralSim = {
    currentWavelength: 560,
    selectedBands: [420, 480, 540, 575, 630, 700, 810, 890, 940, 970],
    viewMode: 'spectral', // 'spectral' or 'spatial'
    animFrame: null,

    init() {
      const slider = document.getElementById('hsi-wavelength-slider');
      const valDisplay = document.getElementById('hsi-wavelength-val');
      const bandNumDisplay = document.getElementById('hsi-band-num');
      const statusBadge = document.getElementById('hsi-band-status');
      const tissueNote = document.getElementById('hsi-tissue-note');
      const canvas = document.getElementById('hsi-canvas');
      if (!slider || !canvas) return;

      const update = () => {
        this.currentWavelength = parseInt(slider.value, 10);
        if (valDisplay) valDisplay.textContent = `${this.currentWavelength} nm`;
        
        // Map 400-1000nm to 1200 spectral bands
        const bandIndex = Math.round(((this.currentWavelength - 400) / 600) * 1200) + 1;
        if (bandNumDisplay) bandNumDisplay.textContent = `Band #${bandIndex} / 1200`;

        // Check if selected by metaheuristic optimization
        const isOptimal = this.selectedBands.some(b => Math.abs(b - this.currentWavelength) < 18);
        if (statusBadge) {
          if (isOptimal) {
            statusBadge.textContent = "OPTIMAL METAHEURISTIC SUBSET (PSO/GA/GWO)";
            statusBadge.className = "px-2 py-0.5 text-xs font-mono rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40";
          } else {
            statusBadge.textContent = "RAW CONTINUOUS SPECTRUM (ELIMINATED VIA SPARSITY)";
            statusBadge.className = "px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-slate-400 border border-slate-700";
          }
        }

        // Biological absorption feature notes
        let note = "Broad visible melanin scatter & baseline dermal epidermis reflectance.";
        if (this.currentWavelength >= 410 && this.currentWavelength <= 440) {
          note = "Soret band absorption peak of oxygenated hemoglobin (HbO2).";
        } else if (this.currentWavelength >= 540 && this.currentWavelength <= 585) {
          note = "Double peak absorption alpha/beta bands of oxygenated hemoglobin.";
        } else if (this.currentWavelength >= 720 && this.currentWavelength <= 820) {
          note = "Near-Infrared (NIR) diagnostic window: high melanin-to-hemoglobin contrast.";
        } else if (this.currentWavelength >= 930 && this.currentWavelength <= 980) {
          note = "Prominent subcutaneous tissue water / lipid absorption vibrational overtone.";
        }
        if (tissueNote) tissueNote.textContent = note;

        this.renderCanvas();
      };

      slider.addEventListener('input', () => {
        update();
        if (Math.random() > 0.6) playClickSound();
      });

      const modeBtns = document.querySelectorAll('[data-hsi-mode]');
      modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          modeBtns.forEach(b => b.classList.remove('active', 'border-cyan-400', 'text-cyan-400'));
          btn.classList.add('active', 'border-cyan-400', 'text-cyan-400');
          this.viewMode = btn.dataset.hsiMode;
          playClickSound();
          this.renderCanvas();
        });
      });

      window.addEventListener('resize', () => this.renderCanvas());
      update();
    },

    renderCanvas() {
      const canvas = document.getElementById('hsi-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.parentElement.clientWidth;
      const h = 260;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      ctx.clearRect(0, 0, w, h);

      if (this.viewMode === 'spectral') {
        this.renderSpectralCurve(ctx, w, h);
      } else {
        this.renderSpatialXAIMap(ctx, w, h);
      }
    },

    renderSpectralCurve(ctx, w, h) {
      const padding = { top: 30, right: 30, bottom: 40, left: 55 };
      const plotW = w - padding.left - padding.right;
      const plotH = h - padding.top - padding.bottom;

      // Draw Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 6; i++) {
        const x = padding.left + (plotW / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + plotH);
        ctx.stroke();

        ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
        ctx.font = "10px JetBrains Mono, monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${400 + i * 100}nm`, x, padding.top + plotH + 18);
      }

      for (let j = 0; j <= 4; j++) {
        const y = padding.top + (plotH / 4) * j;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + plotW, y);
        ctx.stroke();

        ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
        ctx.font = "10px JetBrains Mono, monospace";
        ctx.textAlign = "right";
        ctx.fillText(`${(1.0 - j * 0.25).toFixed(2)}`, padding.left - 8, y + 3);
      }

      // Draw Metaheuristic Selected Subset markers
      this.selectedBands.forEach(b => {
        const bx = padding.left + ((b - 400) / 600) * plotW;
        ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
        ctx.fillRect(bx - 6, padding.top, 12, plotH);
        ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
        ctx.strokeRect(bx - 6, padding.top, 12, plotH);
      });

      // Synthetic Biological Hyperspectral Reflectance curve R(λ)
      const getReflectance = (lambda) => {
        // Melanin base rise
        let r = 0.18 + 0.45 * Math.pow((lambda - 400) / 600, 0.7);
        // Hemoglobin dips at 420 and 540-575
        r -= 0.14 * Math.exp(-Math.pow((lambda - 420) / 25, 2));
        r -= 0.11 * Math.exp(-Math.pow((lambda - 542) / 20, 2));
        r -= 0.13 * Math.exp(-Math.pow((lambda - 576) / 20, 2));
        // Water absorption dip at 970
        r -= 0.12 * Math.exp(-Math.pow((lambda - 970) / 30, 2));
        return Math.max(0.05, Math.min(0.95, r));
      };

      // Draw Reflectance Curve
      ctx.beginPath();
      for (let x = 0; x <= plotW; x++) {
        const lambda = 400 + (x / plotW) * 600;
        const ref = getReflectance(lambda);
        const y = padding.top + (1 - ref) * plotH;
        if (x === 0) ctx.moveTo(padding.left + x, y);
        else ctx.lineTo(padding.left + x, y);
      }
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Current Pointer
      const curX = padding.left + ((this.currentWavelength - 400) / 600) * plotW;
      const curRef = getReflectance(this.currentWavelength);
      const curY = padding.top + (1 - curRef) * plotH;

      ctx.strokeStyle = "#f43f5e";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(curX, padding.top);
      ctx.lineTo(curX, padding.top + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#f43f5e";
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(curX, curY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label on top
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 11px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText(`λ = ${this.currentWavelength} nm | R = ${curRef.toFixed(3)}`, curX, Math.max(padding.top - 8, 15));
    },

    renderSpatialXAIMap(ctx, w, h) {
      // Facial Landmark Grad-CAM++ Visualizer
      ctx.save();
      const centerX = w / 2;
      const centerY = h / 2;

      // Draw stylized face wireframe
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 80, 105, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Facial landmarks
      const landmarks = [
        { x: centerX - 32, y: centerY - 25, label: "Left Eye", weight: 0.88 },
        { x: centerX + 32, y: centerY - 25, label: "Right Eye", weight: 0.86 },
        { x: centerX, y: centerY + 5, label: "Nose Bridge", weight: 0.95 },
        { x: centerX, y: centerY + 48, label: "Philtrum/Lips", weight: 0.76 },
        { x: centerX - 45, y: centerY + 18, label: "Left Cheek (HbO2)", weight: 0.92 },
        { x: centerX + 45, y: centerY + 18, label: "Right Cheek (HbO2)", weight: 0.91 }
      ];

      // Draw heat attribution halos based on wavelength & landmark
      const factor = (this.currentWavelength >= 540 && this.currentWavelength <= 585) ? 1.4 : 
                     (this.currentWavelength >= 800) ? 1.2 : 0.8;

      landmarks.forEach(lm => {
        const rad = 28 * lm.weight * factor;
        const grad = ctx.createRadialGradient(lm.x, lm.y, 4, lm.x, lm.y, rad);
        grad.addColorStop(0, "rgba(244, 63, 94, 0.75)");
        grad.addColorStop(0.5, "rgba(245, 158, 11, 0.45)");
        grad.addColorStop(1, "rgba(16, 185, 129, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(lm.x, lm.y, rad, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(lm.x, lm.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Spatial Grad-CAM++ HUD Info
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 12px JetBrains Mono, monospace";
      ctx.textAlign = "left";
      ctx.fillText("Grad-CAM++ Facial Landmark Activation", 20, 28);

      ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
      ctx.font = "11px JetBrains Mono, monospace";
      ctx.fillText(`Target Band: ${this.currentWavelength} nm`, 20, 48);
      ctx.fillText(`ArcFace Angular Margin: m = 0.50`, 20, 66);
      ctx.fillText(`Metric Subspace: S^127 Hypersphere`, 20, 84);

      ctx.textAlign = "right";
      ctx.fillStyle = "#10b981";
      ctx.fillText("Subsurface Tissue Identified: 98.4%", w - 20, 28);
      ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
      ctx.fillText("Anti-Spoofing Margin: Passed (+4.2σ)", w - 20, 48);

      ctx.restore();
    }
  };

  // =========================================================================
  // SIMULATOR 2: BIO-INSPIRED METAHEURISTIC CONVERGENCE BENCHMARK
  // =========================================================================
  const MetaheuristicSim = {
    isRunning: false,
    epoch: 0,
    maxEpochs: 60,
    psoHistory: [],
    gaHistory: [],
    hybridHistory: [],
    interval: null,

    init() {
      const btn = document.getElementById('run-metaheuristic-btn');
      const resetBtn = document.getElementById('reset-metaheuristic-btn');
      if (!btn) return;

      btn.addEventListener('click', () => {
        playClickSound();
        this.startBenchmark();
      });

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          playClickSound();
          this.reset();
        });
      }

      this.reset();
    },

    reset() {
      if (this.interval) clearInterval(this.interval);
      this.isRunning = false;
      this.epoch = 0;
      this.psoHistory = [210.0];
      this.gaHistory = [205.0];
      this.hybridHistory = [215.0];

      const btn = document.getElementById('run-metaheuristic-btn');
      if (btn) {
        btn.textContent = "Run Convergence Benchmark";
        btn.disabled = false;
      }

      const psoScore = document.getElementById('opt-pso-score');
      const gaScore = document.getElementById('opt-ga-score');
      const hybridScore = document.getElementById('opt-hybrid-score');
      if (psoScore) psoScore.textContent = "210.00";
      if (gaScore) gaScore.textContent = "205.00";
      if (hybridScore) hybridScore.textContent = "215.00";

      this.render();
    },

    startBenchmark() {
      if (this.isRunning) return;
      this.isRunning = true;
      const btn = document.getElementById('run-metaheuristic-btn');
      if (btn) {
        btn.textContent = "Optimizing Otsu Between-Class Variance...";
        btn.disabled = true;
      }

      let psoVal = 210.0;
      let gaVal = 205.0;
      let hybridVal = 215.0;

      this.psoHistory = [psoVal];
      this.gaHistory = [gaVal];
      this.hybridHistory = [hybridVal];
      this.epoch = 0;

      this.interval = setInterval(() => {
        this.epoch++;

        // PSO: climbs fast, plateaus early around epoch 18
        if (this.epoch < 18) {
          psoVal += (288.4 - psoVal) * 0.22 + (Math.random() - 0.45) * 1.5;
        } else {
          psoVal += (Math.random() - 0.5) * 0.25; // premature convergence
        }

        // GA: slower exploration, stepped jumps from crossovers
        if (Math.random() > 0.45) {
          gaVal += (294.2 - gaVal) * 0.12 + Math.random() * 2.0;
        }

        // Proposed Hybrid PSO-GA: Combines PSO fast exploitation + GA diversity to hit highest global optima
        hybridVal += (312.85 - hybridVal) * 0.16 + Math.random() * 1.8;

        this.psoHistory.push(psoVal);
        this.gaHistory.push(gaVal);
        this.hybridHistory.push(hybridVal);

        // Update score HUD
        const psoScore = document.getElementById('opt-pso-score');
        const gaScore = document.getElementById('opt-ga-score');
        const hybridScore = document.getElementById('opt-hybrid-score');
        if (psoScore) psoScore.textContent = psoVal.toFixed(2);
        if (gaScore) gaScore.textContent = gaVal.toFixed(2);
        if (hybridScore) hybridScore.textContent = hybridVal.toFixed(2);

        this.render();

        if (this.epoch >= this.maxEpochs) {
          clearInterval(this.interval);
          this.isRunning = false;
          if (btn) {
            btn.textContent = "Benchmark Complete (Hybrid Win +8.5%)";
            btn.disabled = false;
          }
          if (window.PORTFOLIO_AUDIO && window.PORTFOLIO_AUDIO.playSuccess) {
            window.PORTFOLIO_AUDIO.playSuccess();
          }
        }
      }, 50);
    },

    render() {
      const canvas = document.getElementById('metaheuristic-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.parentElement.clientWidth;
      const h = 260;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      ctx.clearRect(0, 0, w, h);

      const pad = { top: 30, right: 30, bottom: 40, left: 55 };
      const plotW = w - pad.left - pad.right;
      const plotH = h - pad.top - pad.bottom;

      // Draw Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 6; i++) {
        const x = pad.left + (plotW / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, pad.top);
        ctx.lineTo(x, pad.top + plotH);
        ctx.stroke();

        ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
        ctx.font = "10px JetBrains Mono, monospace";
        ctx.textAlign = "center";
        ctx.fillText(`Gen ${i * 10}`, x, pad.top + plotH + 18);
      }

      for (let j = 0; j <= 4; j++) {
        const y = pad.top + (plotH / 4) * j;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(pad.left + plotW, y);
        ctx.stroke();

        const val = 320 - j * 30;
        ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
        ctx.font = "10px JetBrains Mono, monospace";
        ctx.textAlign = "right";
        ctx.fillText(`${val}`, pad.left - 8, y + 3);
      }

      const mapY = (score) => {
        const norm = (score - 200) / (320 - 200);
        return pad.top + (1 - norm) * plotH;
      };

      const drawCurve = (hist, color, label) => {
        if (hist.length < 2) return;
        ctx.beginPath();
        hist.forEach((pt, i) => {
          const x = pad.left + (i / this.maxEpochs) * plotW;
          const y = mapY(pt);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      // Draw PSO, GA, and Hybrid
      drawCurve(this.psoHistory, "#38bdf8", "PSO (Premature Plateau)");
      drawCurve(this.gaHistory, "#10b981", "GA (Delayed Stagnation)");
      drawCurve(this.hybridHistory, "#f59e0b", "Hybrid PSO-GA (Global Peak)");

      // Legend in top-left
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.textAlign = "left";

      ctx.fillStyle = "#38bdf8";
      ctx.fillText("■ Standard PSO (Stagnates @ 288.4)", pad.left + 15, pad.top + 15);

      ctx.fillStyle = "#10b981";
      ctx.fillText("■ Standard GA (Reaches 294.2)", pad.left + 15, pad.top + 30);

      ctx.fillStyle = "#f59e0b";
      ctx.fillText("■ Proposed Hybrid PSO-GA (Max Between-Class Var 312.85)", pad.left + 15, pad.top + 45);
    }
  };

  // =========================================================================
  // SIMULATOR 3: INTELLIPQ REAL-TIME DSP OSCILLOSCOPE
  // =========================================================================
  const IntelliPQSim = {
    mode: 'normal', // 'normal', 'sag', 'swell', 'harmonics', 'transient'
    time: 0,
    animFrame: null,

    init() {
      const modeBtns = document.querySelectorAll('[data-pq-mode]');
      if (!modeBtns.length) return;

      modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          modeBtns.forEach(b => b.classList.remove('active', 'border-cyan-400', 'bg-cyan-950/60', 'text-cyan-400'));
          btn.classList.add('active', 'border-cyan-400', 'bg-cyan-950/60', 'text-cyan-400');
          this.mode = btn.dataset.pqMode;
          playClickSound();
          this.updateMetrics();
        });
      });

      this.updateMetrics();
      this.animate();
    },

    updateMetrics() {
      const thdElem = document.getElementById('pq-thd-val');
      const rmsElem = document.getElementById('pq-rms-val');
      const crestElem = document.getElementById('pq-crest-val');
      const ruleElem = document.getElementById('pq-rule-status');
      const aiElem = document.getElementById('pq-ai-status');
      const arbElem = document.getElementById('pq-arbitration-msg');

      if (!thdElem) return;

      switch(this.mode) {
        case 'normal':
          thdElem.textContent = "1.82%";
          rmsElem.textContent = "230.1 V";
          crestElem.textContent = "1.414";
          ruleElem.textContent = "PASS (IEEE 519 Compliant)";
          ruleElem.className = "text-emerald-400 font-mono text-xs";
          aiElem.textContent = "NORMAL GRID WAVEFORM (99.8%)";
          aiElem.className = "text-emerald-400 font-mono text-xs";
          arbElem.textContent = "No grid anomalies. Nominal operating envelope.";
          break;
        case 'sag':
          thdElem.textContent = "2.41%";
          rmsElem.textContent = "142.3 V (-38%)";
          crestElem.textContent = "1.418";
          ruleElem.textContent = "CRITICAL FAIL (IEEE 1159 Sag Limit)";
          ruleElem.className = "text-rose-400 font-mono text-xs";
          aiElem.textContent = "VOLTAGE SAG DETECTED (98.6%)";
          aiElem.className = "text-rose-400 font-mono text-xs";
          arbElem.textContent = "ACTION: AVR tap booster step-up + initiate sub-cycle UPS transfer.";
          break;
        case 'swell':
          thdElem.textContent = "3.10%";
          rmsElem.textContent = "315.6 V (+37%)";
          crestElem.textContent = "1.412";
          ruleElem.textContent = "CRITICAL FAIL (IEEE 1159 Swell Limit)";
          ruleElem.className = "text-amber-400 font-mono text-xs";
          aiElem.textContent = "VOLTAGE SWELL DETECTED (99.1%)";
          aiElem.className = "text-amber-400 font-mono text-xs";
          arbElem.textContent = "ACTION: De-energize capacitor banks + step-down primary transformer taps.";
          break;
        case 'harmonics':
          thdElem.textContent = "23.45% (Critical)";
          rmsElem.textContent = "234.8 V";
          crestElem.textContent = "1.742";
          ruleElem.textContent = "FAIL (IEEE 519 Limit: 5.0% Exceeded)";
          ruleElem.className = "text-rose-400 font-mono text-xs";
          aiElem.textContent = "3RD & 5TH HARMONIC RESONANCE (97.4%)";
          aiElem.className = "text-rose-400 font-mono text-xs";
          arbElem.textContent = "ACTION: Engage active harmonic power filter (APF) & inspect non-linear loads.";
          break;
        case 'transient':
          thdElem.textContent = "8.90%";
          rmsElem.textContent = "246.5 V";
          crestElem.textContent = "2.680 (High Spike)";
          ruleElem.textContent = "TRANSIENT VIOLATION";
          ruleElem.className = "text-rose-400 font-mono text-xs";
          aiElem.textContent = "SUB-CYCLE IMPULSIVE SPIKE (96.8%)";
          aiElem.className = "text-rose-400 font-mono text-xs";
          arbElem.textContent = "ACTION: Metal-Oxide Varistor (MOV) clamp triggered; log lightning/switching event.";
          break;
      }
    },

    animate() {
      this.time += 0.05;
      const canvas = document.getElementById('intellipq-canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const w = canvas.parentElement.clientWidth;
        const h = 220;
        canvas.width = w * window.devicePixelRatio;
        canvas.height = h * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        ctx.clearRect(0, 0, w, h);

        // Center line & grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        for (let x = 0; x < w; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }

        // Calculate Waveform v(t)
        ctx.beginPath();
        const midY = h / 2;
        const baseAmp = 65;

        for (let x = 0; x <= w; x++) {
          const t = this.time + (x / 50);
          let yVal = Math.sin(t * 1.5);

          if (this.mode === 'sag') {
            yVal *= 0.58;
          } else if (this.mode === 'swell') {
            yVal *= 1.38;
          } else if (this.mode === 'harmonics') {
            // Inject 3rd (150Hz) and 5th (250Hz) harmonics
            yVal = 0.85 * Math.sin(t * 1.5) + 0.32 * Math.sin(t * 4.5) + 0.18 * Math.sin(t * 7.5);
          } else if (this.mode === 'transient') {
            const spike = Math.exp(-Math.pow(((x % 160) - 80) / 6, 2)) * 1.4 * Math.sin(t * 8);
            yVal += spike;
          }

          const canvasY = midY - yVal * baseAmp;
          if (x === 0) ctx.moveTo(x, canvasY);
          else ctx.lineTo(x, canvasY);
        }

        let strokeColor = "#10b981";
        if (this.mode === 'sag' || this.mode === 'harmonics' || this.mode === 'transient') strokeColor = "#f43f5e";
        if (this.mode === 'swell') strokeColor = "#f59e0b";

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      this.animFrame = requestAnimationFrame(() => this.animate());
    }
  };

  // =========================================================================
  // SIMULATOR 4: KINOSYNC CYBER-PHYSICAL GLOVE TELEMETRY
  // =========================================================================
  const KinoSyncSim = {
    flexValues: { thumb: 20, index: 78, middle: 45, ring: 30, little: 15 },
    prevDominant: "index",
    bpm: 76,
    ecgPoints: [],
    ecgTime: 0,

    init() {
      const fingers = ['thumb', 'index', 'middle', 'ring', 'little'];
      fingers.forEach(f => {
        const slider = document.getElementById(`glove-${f}-slider`);
        const degDisplay = document.getElementById(`glove-${f}-deg`);
        if (slider) {
          slider.addEventListener('input', (e) => {
            const percent = parseInt(e.target.value, 10);
            this.flexValues[f] = percent;
            // Formula: theta = flexPercent * 0.9 (0% -> 0 deg, 100% -> 90 deg)
            const angle = (percent * 0.9).toFixed(1);
            if (degDisplay) degDisplay.textContent = `${angle}°`;
            this.updateDominantFinger();
            this.renderHandCanvas();
          });
        }
      });

      const bpmSlider = document.getElementById('glove-bpm-slider');
      const bpmDisplay = document.getElementById('glove-bpm-val');
      if (bpmSlider) {
        bpmSlider.addEventListener('input', (e) => {
          this.bpm = parseInt(e.target.value, 10);
          if (bpmDisplay) bpmDisplay.textContent = `${this.bpm} BPM`;
        });
      }

      this.updateDominantFinger();
      this.renderHandCanvas();
      this.animateECG();
    },

    updateDominantFinger() {
      // +12% Hysteresis dominant finger detection
      let maxFinger = this.prevDominant;
      let maxVal = this.flexValues[this.prevDominant];

      Object.entries(this.flexValues).forEach(([finger, val]) => {
        if (val > maxVal + 12) {
          maxFinger = finger;
          maxVal = val;
        }
      });
      this.prevDominant = maxFinger;

      const domElem = document.getElementById('glove-dominant-name');
      const domAngle = document.getElementById('glove-dominant-angle');
      if (domElem) {
        domElem.textContent = `${maxFinger.toUpperCase()} DIGIT`;
      }
      if (domAngle) {
        domAngle.textContent = `Flex: ${this.flexValues[maxFinger]}% (${(this.flexValues[maxFinger] * 0.9).toFixed(1)}°)`;
      }
    },

    renderHandCanvas() {
      const canvas = document.getElementById('kinosync-hand-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.parentElement.clientWidth;
      const h = 260;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      ctx.clearRect(0, 0, w, h);

      const wristX = w / 2;
      const wristY = h - 25;

      // Draw Palm Base HUD
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
      ctx.beginPath();
      ctx.roundRect(wristX - 60, wristY - 70, 120, 60, [15, 15, 5, 5]);
      ctx.fill();
      ctx.stroke();

      // Label ESP32 SDV Glove Base
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 9px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText("ESP32 BLE 5.0 GATT HUD", wristX, wristY - 35);

      // Draw 5 articulated cyber fingers
      const fingerConfigs = [
        { key: 'thumb',  baseX: wristX - 50, baseY: wristY - 50, len: 45, restAngle: -0.85 },
        { key: 'index',  baseX: wristX - 30, baseY: wristY - 70, len: 65, restAngle: -0.35 },
        { key: 'middle', baseX: wristX - 5,  baseY: wristY - 73, len: 75, restAngle: 0.00 },
        { key: 'ring',   baseX: wristX + 20, baseY: wristY - 70, len: 68, restAngle: 0.28 },
        { key: 'little', baseX: wristX + 45, baseY: wristY - 60, len: 52, restAngle: 0.65 }
      ];

      fingerConfigs.forEach(cfg => {
        const percent = this.flexValues[cfg.key];
        const flexRad = (percent / 100) * 0.95; // bend angle
        const isDom = (this.prevDominant === cfg.key);

        // Segment 1 (Metacarpal to Proximal)
        const angle1 = -Math.PI / 2 + cfg.restAngle + flexRad * 0.5;
        const seg1Len = cfg.len * 0.55;
        const j1X = cfg.baseX + Math.cos(angle1) * seg1Len;
        const j1Y = cfg.baseY + Math.sin(angle1) * seg1Len;

        // Segment 2 (Distal Phalange)
        const angle2 = angle1 + flexRad * 0.75;
        const seg2Len = cfg.len * 0.45;
        const tipX = j1X + Math.cos(angle2) * seg2Len;
        const tipY = j1Y + Math.sin(angle2) * seg2Len;

        // Draw bone links
        ctx.strokeStyle = isDom ? "#f43f5e" : "#38bdf8";
        ctx.lineWidth = isDom ? 4 : 2.5;
        ctx.shadowColor = isDom ? "#f43f5e" : "#38bdf8";
        ctx.shadowBlur = isDom ? 12 : 4;

        ctx.beginPath();
        ctx.moveTo(cfg.baseX, cfg.baseY);
        ctx.lineTo(j1X, j1Y);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Draw joint nodes
        ctx.fillStyle = isDom ? "#f43f5e" : "#38bdf8";
        [ [cfg.baseX, cfg.baseY], [j1X, j1Y], [tipX, tipY] ].forEach(([nx, ny]) => {
          ctx.beginPath();
          ctx.arc(nx, ny, isDom ? 4.5 : 3.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Tip label
        ctx.fillStyle = isDom ? "#f43f5e" : "#94a3b8";
        ctx.font = "9px JetBrains Mono, monospace";
        ctx.fillText(`${(percent * 0.9).toFixed(0)}°`, tipX, tipY - 8);
      });
    },

    animateECG() {
      this.ecgTime += 0.08;
      const canvas = document.getElementById('kinosync-ecg-canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const w = canvas.parentElement.clientWidth;
        const h = 75;
        canvas.width = w * window.devicePixelRatio;
        canvas.height = h * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        ctx.clearRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = "rgba(244, 63, 94, 0.12)";
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 25) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }

        // Draw PPG Heartbeat wave
        ctx.beginPath();
        const midY = h / 2;
        const speedFactor = (this.bpm / 60) * 2.8;

        for (let x = 0; x < w; x++) {
          const t = (x * 0.04 - this.ecgTime * speedFactor) % (Math.PI * 2);
          let y = Math.sin(t) * 4;

          // QRS complex spike
          if (t > 1.2 && t < 1.7) {
            y += -28 * Math.sin((t - 1.2) * (Math.PI / 0.5));
          } else if (t > 1.7 && t < 2.0) {
            y += 8 * Math.sin((t - 1.7) * (Math.PI / 0.3));
          }

          if (x === 0) ctx.moveTo(x, midY + y);
          else ctx.lineTo(x, midY + y);
        }

        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#f43f5e";
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(() => this.animateECG());
    }
  };

  // Initialize all simulators on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    HyperspectralSim.init();
    MetaheuristicSim.init();
    IntelliPQSim.init();
    KinoSyncSim.init();
  });

  window.HyperspectralSim = HyperspectralSim;
  window.MetaheuristicSim = MetaheuristicSim;
  window.IntelliPQSim = IntelliPQSim;
  window.KinoSyncSim = KinoSyncSim;
})();
