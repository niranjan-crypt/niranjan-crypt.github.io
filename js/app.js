// Main Application Script for Niranjan Krishnakumar's Portfolio
// Features: Neural Constellation Canvas, Web Audio API Synthesizer,
// Project Matrix Filtering, Cyber Terminal CLI, Modal Inspector, and HUD Telemetry.

(function() {
  'use strict';

  // =========================================================================
  // 1. WEB AUDIO API SYNTHESIZER (Cyber Sound FX)
  // =========================================================================
  class CyberAudio {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('audio_muted') !== 'true';
    }

    initCtx() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('audio_muted', (!this.enabled).toString());
      this.updateHudIcon();
      if (this.enabled) {
        this.initCtx();
        this.playSuccess();
      }
    }

    updateHudIcon() {
      const icon = document.getElementById('audio-icon');
      const text = document.getElementById('audio-text');
      if (icon) {
        icon.innerHTML = this.enabled 
          ? '<svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>'
          : '<svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>';
      }
      if (text) {
        text.textContent = this.enabled ? "AUDIO ON" : "AUDIO MUTED";
      }
    }

    playBlip(freq = 600, duration = 0.04) {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch(e) {}
    }

    playLaser() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
      } catch(e) {}
    }

    playSuccess() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);
          gain.gain.setValueAtTime(0.035, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.25);
        });
      } catch(e) {}
    }

    playKey() {
      if (!this.enabled) return;
      this.playBlip(1200 + Math.random() * 400, 0.02);
    }
  }

  const audio = new CyberAudio();
  window.PORTFOLIO_AUDIO = audio;

  // =========================================================================
  // 2. NEURAL CONSTELLATION CANVAS
  // =========================================================================
  class NeuralMesh {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.mouse = { x: -9999, y: -9999, radius: 120 };
      this.matrixMode = false;
      this.matrixDrops = [];
      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY + window.scrollY;
      });

      const count = Math.min(65, Math.floor((this.width * this.height) / 18000));
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 1.8 + 1.0,
          color: Math.random() > 0.4 ? '#38bdf8' : (Math.random() > 0.5 ? '#6366f1' : '#10b981')
        });
      }

      this.animate();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = document.documentElement.scrollHeight || window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      // Matrix drops
      const cols = Math.floor(this.width / 20);
      this.matrixDrops = Array(cols).fill(1);
    }

    toggleMatrix() {
      this.matrixMode = !this.matrixMode;
      return this.matrixMode;
    }

    animate() {
      if (this.matrixMode) {
        this.drawMatrix();
      } else {
        this.drawMesh();
      }
      requestAnimationFrame(() => this.animate());
    }

    drawMesh() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Render links
      for (let i = 0; i < this.particles.length; i++) {
        const p1 = this.particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > this.width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > this.height) p1.vy *= -1;

        // Mouse interaction
        const dxMouse = this.mouse.x - p1.x;
        const dyMouse = this.mouse.y - p1.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < this.mouse.radius) {
          const force = (this.mouse.radius - distMouse) / this.mouse.radius;
          p1.x -= (dxMouse / distMouse) * force * 1.5;
          p1.y -= (dyMouse / distMouse) * force * 1.5;
        }

        // Draw connections
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.22;
            this.ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            this.ctx.lineWidth = 0.8;
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
          }
        }

        // Draw particle dot
        this.ctx.fillStyle = p1.color;
        this.ctx.shadowColor = p1.color;
        this.ctx.shadowBlur = 6;
        this.ctx.beginPath();
        this.ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    }

    drawMatrix() {
      this.ctx.fillStyle = "rgba(8, 11, 17, 0.08)";
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.fillStyle = "#10b981";
      this.ctx.font = "14px JetBrains Mono, monospace";

      for (let i = 0; i < this.matrixDrops.length; i++) {
        const text = String.fromCharCode(0x30A0 + Math.random() * 96);
        const x = i * 20;
        const y = this.matrixDrops[i] * 20;

        this.ctx.fillText(text, x, y);

        if (y > this.height && Math.random() > 0.975) {
          this.matrixDrops[i] = 0;
        }
        this.matrixDrops[i]++;
      }
    }
  }

  // =========================================================================
  // 3. CYBER TERMINAL CLI (~ or Button)
  // =========================================================================
  class CyberTerminal {
    constructor() {
      this.modal = document.getElementById('terminal-modal');
      this.input = document.getElementById('terminal-input');
      this.output = document.getElementById('terminal-output');
      this.closeBtn = document.getElementById('terminal-close-btn');
      this.openBtn = document.getElementById('terminal-toggle-btn');
      this.history = [];
      this.historyIndex = -1;
      this.init();
    }

    init() {
      if (!this.modal || !this.input) return;

      if (this.openBtn) {
        this.openBtn.addEventListener('click', () => this.toggle());
      }
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => this.close());
      }

      window.addEventListener('keydown', (e) => {
        if (e.key === '`' || e.key === '~') {
          // Ignore if user is currently inside an input/textarea
          if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            this.toggle();
          }
        } else if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
          this.close();
        }
      });

      this.input.addEventListener('keydown', (e) => {
        audio.playKey();
        if (e.key === 'Enter') {
          const cmd = this.input.value.trim();
          this.execute(cmd);
          this.input.value = '';
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (this.history.length && this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.input.value = this.history[this.history.length - 1 - this.historyIndex];
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (this.historyIndex > 0) {
            this.historyIndex--;
            this.input.value = this.history[this.history.length - 1 - this.historyIndex];
          } else {
            this.historyIndex = -1;
            this.input.value = '';
          }
        }
      });
    }

    toggle() {
      if (this.modal.classList.contains('hidden')) {
        this.open();
      } else {
        this.close();
      }
    }

    open() {
      this.modal.classList.remove('hidden');
      audio.playLaser();
      setTimeout(() => this.input.focus(), 100);
    }

    close() {
      this.modal.classList.add('hidden');
      audio.playBlip(440, 0.05);
    }

    printLine(text, className = "text-slate-300") {
      const line = document.createElement('div');
      line.className = `${className} font-mono text-xs leading-relaxed my-0.5`;
      line.innerHTML = text;
      this.output.appendChild(line);
      this.output.scrollTop = this.output.scrollHeight;
    }

    execute(cmdStr) {
      if (!cmdStr) return;
      this.history.push(cmdStr);
      this.historyIndex = -1;

      this.printLine(`<span class="text-cyan-400">niranjan@research-hub:~$</span> <span class="text-white">${this.escape(cmdStr)}</span>`);

      const parts = cmdStr.split(' ');
      const main = parts[0].toLowerCase();
      const arg = parts.slice(1).join(' ');

      switch(main) {
        case 'help':
          this.printLine("AVAILABLE TERMINAL COMMANDS:", "text-cyan-400 font-bold");
          this.printLine("  <span class='text-amber-400'>projects</span>        - List all 8 research & engineering projects");
          this.printLine("  <span class='text-amber-400'>project &lt;id&gt;</span>    - Inspect deep project specifications & equations");
          this.printLine("  <span class='text-amber-400'>publications</span>    - View published IEEE EPREC-2026 paper details & DOI");
          this.printLine("  <span class='text-amber-400'>skills</span>          - Display core competencies & engineering matrix");
          this.printLine("  <span class='text-amber-400'>cat resume</span>      - Display ATS resume overview & direct view link");
          this.printLine("  <span class='text-amber-400'>matrix</span>          - Toggle digital rain backdrop on/off");
          this.printLine("  <span class='text-amber-400'>audio</span>           - Toggle audio sound fx (on / off)");
          this.printLine("  <span class='text-amber-400'>contact</span>         - Display email, GitHub, and research profiles");
          this.printLine("  <span class='text-amber-400'>clear</span>           - Clear terminal window buffer");
          this.printLine("  <span class='text-amber-400'>exit</span>            - Close terminal overlay");
          break;

        case 'projects':
          this.printLine("RESEARCH & SYSTEM REPOSITORIES (niranjan-crypt):", "text-cyan-400 font-bold");
          window.PORTFOLIO_PROJECTS.forEach((p, idx) => {
            this.printLine(`[${idx+1}] <a href="${p.repoUrl}" target="_blank" class="text-sky-300 underline font-semibold">${p.title}</a>`);
            this.printLine(`    Category: <span class="text-emerald-400">${p.categoryName}</span> | Stack: ${p.tags.slice(0, 4).join(', ')}`);
          });
          this.printLine("Type <span class='text-amber-400'>project 1..8</span> for deep telemetry details.", "text-slate-400");
          break;

        case 'project':
          const pIndex = parseInt(arg, 10) - 1;
          const proj = window.PORTFOLIO_PROJECTS[pIndex];
          if (proj) {
            this.printLine(`PROJECT: ${proj.title}`, "text-cyan-400 font-bold");
            this.printLine(`Badge: ${proj.badge} | Status: ${proj.status}`);
            this.printLine(`Summary: ${proj.tagline}`);
            this.printLine(`Formula: <code class="text-rose-300">${proj.mathFormula}</code>`);
            this.printLine(`GitHub: <a href="${proj.repoUrl}" target="_blank" class="text-amber-300 underline">${proj.repoUrl}</a>`);
          } else {
            this.printLine(`Unknown project ID '${arg}'. Use 'projects' to list valid IDs (1 to 8).`, "text-rose-400");
          }
          break;

        case 'publications':
          this.printLine("PEER-REVIEWED PUBLISHED RESEARCH:", "text-emerald-400 font-bold");
          this.printLine("Paper Title: <span class='text-white'>Hybrid Optimization for Congestion Management in Deregulated Power Systems</span>");
          this.printLine("Conference: 6th IEEE International Conference on Electric Power and Renewable Energy (EPREC-2026), IIT Bhilai");
          this.printLine("Publisher: IEEE | DOI: <a href='https://doi.org/10.1109/EPREC66546.2026.11412040' target='_blank' class='text-cyan-300 underline'>10.1109/EPREC66546.2026.11412040</a>");
          this.printLine("Mathematical Core: Power Transfer Distribution Factor (PTDF) Sensitivity: C = A · B");
          this.printLine("Metaheuristic: Tri-hybrid coupling of Orcas (OOA), Krill Herd (KHA), and Spotted Hyena (SHO).");
          break;

        case 'skills':
          this.printLine("CORE TECHNICAL PROFICIENCIES:", "text-cyan-400 font-bold");
          window.PORTFOLIO_SKILLS.forEach(cat => {
            this.printLine(`• ${cat.category.toUpperCase()}:`, "text-amber-300 font-semibold");
            const names = cat.skills.map(s => `${s.name} (${s.level}%)`).join(', ');
            this.printLine(`  ${names}`, "text-slate-300");
          });
          break;

        case 'cat':
          if (arg.includes('resume')) {
            this.printLine("NIRANJAN KRISHNAKUMAR — RESUME PROFILE", "text-emerald-400 font-bold");
            this.printLine("Department of Computer Science & Engineering, Amrita Vishwa Vidyapeetham");
            this.printLine("Published IEEE EPREC-2026 Author | Computer Vision, DL & Cyber-Physical Systems");
            this.printLine("Email: niranjankrishnakumar2005@gmail.com | GitHub: github.com/niranjan-crypt");
            this.printLine("View Full Printable Resume: <a href='resume.html' target='_blank' class='text-cyan-300 underline font-bold'>[OPEN RESUME.HTML]</a>");
          } else {
            this.printLine(`cat: ${arg}: No such file or directory. Try 'cat resume'.`, "text-rose-400");
          }
          break;

        case 'matrix':
          if (window.PORTFOLIO_MESH) {
            const isMatrix = window.PORTFOLIO_MESH.toggleMatrix();
            this.printLine(`Digital matrix stream: ${isMatrix ? "ENABLED" : "DISABLED"}`, "text-emerald-400");
          }
          break;

        case 'audio':
          if (arg === 'on') {
            if (!audio.enabled) audio.toggle();
            this.printLine("Audio sound effects enabled.", "text-emerald-400");
          } else if (arg === 'off') {
            if (audio.enabled) audio.toggle();
            this.printLine("Audio sound effects muted.", "text-slate-400");
          } else {
            audio.toggle();
            this.printLine(`Audio toggled: ${audio.enabled ? "ON" : "MUTED"}`, "text-cyan-400");
          }
          break;

        case 'contact':
          this.printLine("CONTACT & RESEARCH COLLABORATION:", "text-cyan-400 font-bold");
          this.printLine("Email:  niranjankrishnakumar2005@gmail.com");
          this.printLine("GitHub: https://github.com/niranjan-crypt");
          this.printLine("IEEE DOI: https://doi.org/10.1109/EPREC66546.2026.11412040");
          break;

        case 'clear':
          this.output.innerHTML = '';
          break;

        case 'exit':
        case 'close':
        case 'quit':
          this.close();
          break;

        default:
          this.printLine(`Command not recognized: '${cmdStr}'. Type <span class='text-amber-400'>help</span> for valid commands.`, "text-rose-400");
          break;
      }
    }

    escape(str) {
      return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
    }
  }

  // =========================================================================
  // 4. PROJECT SHOWCASE MATRIX & 3D TILT CARDS
  // =========================================================================
  function renderProjectCards(activeCategory = 'all') {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = activeCategory === 'all' 
      ? window.PORTFOLIO_PROJECTS 
      : window.PORTFOLIO_PROJECTS.filter(p => p.category === activeCategory);

    filtered.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = "cyber-card relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group overflow-hidden";
      card.setAttribute('data-project-id', p.id);

      const metricsHtml = p.metrics.map(m => `
        <div class="px-2.5 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/50">
          <div class="text-[10px] text-slate-400 font-mono uppercase tracking-wider">${m.label}</div>
          <div class="text-xs font-mono font-semibold text-cyan-300 truncate">${m.value}</div>
        </div>
      `).join('');

      const tagsHtml = p.tags.slice(0, 4).map(t => `
        <span class="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60">${t}</span>
      `).join('');

      card.innerHTML = `
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none"></div>
        
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="px-2.5 py-0.5 text-[11px] font-mono font-semibold rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">${p.badge}</span>
            <span class="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ${p.status}
            </span>
          </div>

          <h3 class="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight mb-2">
            ${p.title}
          </h3>

          <p class="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
            ${p.tagline}
          </p>

          <div class="grid grid-cols-2 gap-2 mb-4">
            ${metricsHtml}
          </div>
        </div>

        <div>
          <div class="flex flex-wrap gap-1.5 mb-5">
            ${tagsHtml}
          </div>

          <div class="flex items-center gap-2 pt-3 border-t border-slate-800/80">
            <a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              GitHub Code
            </a>
            <button class="inspect-btn p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all" title="Inspect Architecture & Math" data-idx="${idx}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

    // Attach inspect modal triggers
    document.querySelectorAll('.inspect-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        audio.playLaser();
        const idx = parseInt(btn.dataset.idx, 10);
        openProjectModal(filtered[idx]);
      });
    });

    // Add 3D card tilt physics
    initTiltPhysics();
  }

  function initTiltPhysics() {
    const cards = document.querySelectorAll('.cyber-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
      });
    });
  }

  function openProjectModal(project) {
    const modal = document.getElementById('project-modal');
    if (!modal || !project) return;

    document.getElementById('modal-title').textContent = project.title;
    document.getElementById('modal-badge').textContent = project.badge;
    document.getElementById('modal-category').textContent = project.categoryName;
    document.getElementById('modal-desc').textContent = project.description;
    document.getElementById('modal-repo-link').href = project.repoUrl;
    document.getElementById('modal-formula').textContent = project.mathFormula;

    const highlightsList = document.getElementById('modal-highlights');
    if (highlightsList) {
      highlightsList.innerHTML = project.highlights.map(h => `
        <li class="flex items-start gap-2 text-xs text-slate-300">
          <span class="text-cyan-400 mt-0.5">▹</span>
          <span>${h}</span>
        </li>
      `).join('');
    }

    const metricsDiv = document.getElementById('modal-metrics');
    if (metricsDiv) {
      metricsDiv.innerHTML = project.metrics.map(m => `
        <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <div class="text-[10px] text-slate-400 font-mono uppercase">${m.label}</div>
          <div class="text-sm font-mono font-bold text-cyan-300">${m.value}</div>
        </div>
      `).join('');
    }

    modal.classList.remove('hidden');
  }

  // =========================================================================
  // 5. TOAST NOTIFICATIONS & CLIPBOARD UTILITIES
  // =========================================================================
  function showToast(message, type = 'success') {
    audio.playSuccess();
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `p-4 rounded-xl backdrop-blur-md border font-mono text-xs shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-4 opacity-0 ${
      type === 'success' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40' : 'bg-cyan-950/90 text-cyan-300 border-cyan-500/40'
    }`;
    toast.innerHTML = `
      <svg class="w-5 h-5 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('translate-y-4', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // =========================================================================
  // 6. INITIALIZATION & DOM ATTACHMENTS
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Init background neural constellation
    const mesh = new NeuralMesh('neural-canvas');
    window.PORTFOLIO_MESH = mesh;

    // 2. Audio button in HUD
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => audio.toggle());
      audio.updateHudIcon();
    }

    // 3. Init Terminal CLI
    const terminal = new CyberTerminal();
    window.PORTFOLIO_TERMINAL = terminal;

    // 4. Render initial project matrix
    renderProjectCards('all');

    // 5. Project category filters
    const filterBtns = document.querySelectorAll('[data-filter]');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('bg-cyan-500/20', 'border-cyan-400', 'text-cyan-300');
          b.classList.add('bg-slate-800/60', 'border-slate-700/60', 'text-slate-400');
        });
        btn.classList.add('bg-cyan-500/20', 'border-cyan-400', 'text-cyan-300');
        btn.classList.remove('bg-slate-800/60', 'border-slate-700/60', 'text-slate-400');
        audio.playBlip(550, 0.04);
        renderProjectCards(btn.dataset.filter);
      });
    });

    // 6. Project Modal Close trigger
    const modalClose = document.getElementById('modal-close-btn');
    const modal = document.getElementById('project-modal');
    if (modalClose && modal) {
      modalClose.addEventListener('click', () => modal.classList.add('hidden'));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    }

    // 7. Clipboard buttons
    const copyEmailBtns = document.querySelectorAll('.copy-email-btn');
    copyEmailBtns.forEach(b => {
      b.addEventListener('click', () => {
        navigator.clipboard.writeText('niranjankrishnakumar2005@gmail.com');
        showToast("Email address copied to clipboard!");
      });
    });

    const copyUrlBtns = document.querySelectorAll('.copy-url-btn');
    copyUrlBtns.forEach(b => {
      b.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href);
        showToast("Portfolio link copied to clipboard!");
      });
    });

    const copyBibtexBtn = document.getElementById('copy-bibtex-btn');
    if (copyBibtexBtn) {
      copyBibtexBtn.addEventListener('click', () => {
        const bibtex = `@inproceedings{krishnakumar2026hybrid,
  title={Hybrid Optimization for Congestion Management in Deregulated Power Systems},
  author={Krishnakumar, Niranjan and et al.},
  booktitle={6th International Conference on Electric Power and Renewable Energy (EPREC-2026)},
  publisher={IEEE},
  year={2026},
  doi={10.1109/EPREC66546.2026.11412040}
}`;
        navigator.clipboard.writeText(bibtex);
        showToast("IEEE Citation BibTeX copied to clipboard!");
      });
    }

    // 8. Live Clock in HUD
    function updateClock() {
      const clock = document.getElementById('hud-clock');
      if (clock) {
        const now = new Date();
        clock.textContent = `${now.toLocaleTimeString('en-US', { hour12: false })} IST`;
      }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // 9. Research Lab Tab switching
    const labTabs = document.querySelectorAll('[data-lab-tab]');
    const labPanels = document.querySelectorAll('[data-lab-panel]');
    labTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.labTab;
        audio.playLaser();
        labTabs.forEach(t => {
          t.classList.remove('active', 'border-cyan-400', 'text-cyan-400', 'bg-cyan-950/40');
          t.classList.add('text-slate-400', 'border-transparent');
        });
        tab.classList.add('active', 'border-cyan-400', 'text-cyan-400', 'bg-cyan-950/40');
        tab.classList.remove('text-slate-400', 'border-transparent');

        labPanels.forEach(p => {
          if (p.dataset.labPanel === target) {
            p.classList.remove('hidden');
          } else {
            p.classList.add('hidden');
          }
        });

        // Trigger simulator canvas re-render if active
        if (target === 'hsi' && window.HyperspectralSim) window.HyperspectralSim.renderCanvas();
        if (target === 'metaheuristic' && window.MetaheuristicSim) window.MetaheuristicSim.render();
        if (target === 'glove' && window.KinoSyncSim) window.KinoSyncSim.renderHandCanvas();
      });
    });
  });

})();
