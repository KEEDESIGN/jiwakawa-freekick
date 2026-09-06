/**
 * じわかわフリーキック - Game Engine (with Animated Splash Screen)
 */

class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playKick() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.16);
      gain.gain.setValueAtTime(0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  playGoal() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.07;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.35, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch (e) {}
  }

  playPost() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [1100, 1750, 2400].forEach(f => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch (e) {}
  }

  playBlock() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.22);
      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  playSlip() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  playMiss() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.35);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }
}

class Game {
  constructor() {
    // Splash Elements
    this.splash = document.getElementById('splash');
    this.splashBar = document.getElementById('splashBar');

    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container = document.getElementById('game-container');

    // Menu Elements
    this.menuBtn = document.getElementById('menu-btn');
    this.streakBadge = document.getElementById('streak-badge');
    this.menuModal = document.getElementById('menu-modal');
    this.menuBackdrop = document.getElementById('menu-backdrop');
    this.closeMenuBtn = document.getElementById('close-menu-btn');
    this.modalStreak = document.getElementById('modal-streak');
    this.modalBest = document.getElementById('modal-best');
    this.soundBtn = document.getElementById('sound-btn');
    this.soundIcon = document.getElementById('sound-icon');
    this.soundStatus = document.getElementById('sound-status');
    this.resetBtn = document.getElementById('reset-btn');

    this.promptBanner = document.getElementById('prompt-banner');
    this.resultBanner = document.getElementById('result-banner');
    this.resultText = document.getElementById('result-text');
    this.resultSub = document.getElementById('result-sub');

    this.sound = new SoundFX();

    this.streak = 0;
    this.bestStreak = parseInt(localStorage.getItem('jk_best') || '0', 10);
    this.updateHUD();

    this.state = 'READY';
    this.width = 600;
    this.height = 800;

    // Load Images
    this.images = {
      bg: new Image(),
      wall: new Image(),
      ball: new Image(),
      player: new Image()
    };
    this.images.bg.src = 'assets/background.png';
    this.images.wall.src = 'assets/wall.png';
    this.images.ball.src = 'assets/ball.png';
    this.images.player.src = 'assets/player.png';

    // Ball flight state
    this.ball = {
      startX: 0,
      startY: 0,
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      progress: 0,
      scale: 1,
      rot: 0,
      spin: 0,
      isBlocked: false,
      blockBounceX: 0,
      blockBounceY: 0,
      curveOffsets: [],
      hasSlipped: false
    };

    // Wall state
    this.wall = {
      xRatio: 0.5,
      yRatio: 0.65,
      widthRatio: 0.44,
      heightRatio: 0.30,
      jump: 0,
      squash: 1,
      shake: 0
    };

    // Player state
    this.playerRecoil = 0;

    // Swipe stroke tracking
    this.strokePoints = [];
    this.isDrawing = false;

    // Floating text / Reactions
    this.floatingTexts = [];
    this.sparks = [];

    this.init();
  }

  async init() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    this.bindEvents();
    this.resetRound();

    // Start Splash animation sequence
    this.runSplashSequence();

    requestAnimationFrame(() => this.loop());
  }

  async runSplashSequence() {
    if (!this.splash) return;

    // Progress bar fills over 1.2 seconds
    const startTime = Date.now();
    const duration = 1200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      if (this.splashBar) this.splashBar.style.width = `${pct}%`;

      if (elapsed >= duration) {
        clearInterval(interval);
        // Fade out splash
        this.splash.classList.add('done');
        setTimeout(() => {
          if (this.splash) this.splash.style.display = 'none';
        }, 600);
      }
    }, 20);
  }

  updateHUD() {
    if (this.streakBadge) this.streakBadge.textContent = this.streak;
    if (this.modalStreak) this.modalStreak.textContent = this.streak;
    if (this.modalBest) this.modalBest.textContent = this.bestStreak;
  }

  handleResize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.width = rect.width;
    this.height = rect.height;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (this.state === 'READY') {
      this.ball.startX = this.width * 0.5;
      this.ball.startY = this.height * 0.68;
      this.ball.x = this.ball.startX;
      this.ball.y = this.ball.startY;
    }
  }

  bindEvents() {
    // Menu Modal open/close
    this.menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.sound.init();
      this.updateHUD();
      this.menuModal.classList.remove('hidden');
    });

    const closeMenu = (e) => {
      e.stopPropagation();
      this.menuModal.classList.add('hidden');
    };

    this.closeMenuBtn.addEventListener('click', closeMenu);
    this.menuBackdrop.addEventListener('click', closeMenu);

    // Sound button in modal
    this.soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.sound.init();
      const on = this.sound.toggle();
      this.soundIcon.textContent = on ? '🔊' : '🔇';
      this.soundStatus.textContent = on ? 'ON' : 'OFF';
    });

    // Reset button in modal
    this.resetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.streak = 0;
      this.updateHUD();
      this.menuModal.classList.add('hidden');
      this.resetRound();
    });

    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (this.width / rect.width),
        y: (clientY - rect.top) * (this.height / rect.height)
      };
    };

    const startSwipe = (e) => {
      if (this.splash && !this.splash.classList.contains('done')) return;
      if (!this.menuModal.classList.contains('hidden')) return;
      if (this.state === 'RESULT') {
        this.resetRound();
        return;
      }
      if (this.state !== 'READY') return;
      this.sound.init();
      const p = getPos(e);
      this.isDrawing = true;
      this.strokePoints = [p];
      this.state = 'AIMING';
      this.promptBanner.classList.add('hidden');
    };

    const moveSwipe = (e) => {
      if (!this.isDrawing || this.state !== 'AIMING') return;
      const p = getPos(e);
      this.strokePoints.push(p);
    };

    const endSwipe = () => {
      if (!this.isDrawing || this.state !== 'AIMING') return;
      this.isDrawing = false;

      if (this.strokePoints.length >= 2) {
        const start = this.strokePoints[0];
        const end = this.strokePoints[this.strokePoints.length - 1];
        const totalDy = end.y - start.y;

        if (totalDy < -15) {
          this.kickWithStroke(this.strokePoints);
        } else {
          this.state = 'READY';
          this.promptBanner.classList.remove('hidden');
        }
      } else {
        this.state = 'READY';
        this.promptBanner.classList.remove('hidden');
      }
      this.strokePoints = [];
    };

    this.canvas.addEventListener('mousedown', startSwipe);
    window.addEventListener('mousemove', moveSwipe);
    window.addEventListener('mouseup', endSwipe);

    this.canvas.addEventListener('touchstart', startSwipe, { passive: false });
    window.addEventListener('touchmove', moveSwipe, { passive: false });
    window.addEventListener('touchend', endSwipe, { passive: false });
  }

  resetRound() {
    this.state = 'READY';
    this.resultBanner.classList.add('hidden');
    this.promptBanner.classList.remove('hidden');

    this.ball.startX = this.width * 0.5;
    this.ball.startY = this.height * 0.68;
    this.ball.x = this.ball.startX;
    this.ball.y = this.ball.startY;
    this.ball.scale = 1;
    this.ball.rot = 0;
    this.ball.progress = 0;
    this.ball.isBlocked = false;
    this.ball.hasSlipped = false;
    this.ball.curveOffsets = [];

    this.playerRecoil = 0;
    this.sparks = [];
    this.floatingTexts = [];

    const wallPositions = [0.3, 0.5, 0.7];
    if (this.streak === 0) {
      this.wall.xRatio = Math.random() > 0.5 ? 0.32 : 0.68;
    } else {
      this.wall.xRatio = wallPositions[Math.floor(Math.random() * wallPositions.length)];
    }
    this.wall.jump = 0;
    this.wall.squash = 1;
    this.wall.shake = 0;
  }

  kickWithStroke(stroke) {
    this.state = 'FLYING';
    this.sound.playKick();
    this.playerRecoil = 1;

    const start = stroke[0];
    const end = stroke[stroke.length - 1];

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    const bgScale = this.width;
    const goalCenterY = bgScale * 0.25;

    this.ball.targetX = this.width * 0.5 + dx * 1.8;
    this.ball.targetY = Math.max(Math.min(goalCenterY + dy * 0.5, bgScale * 0.44), bgScale * 0.05);

    const offsets = [];
    const strokeLen = stroke.length;
    let netCurve = 0;

    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const strokeIdx = Math.min(Math.floor(t * (strokeLen - 1)), strokeLen - 1);
      const strokeP = stroke[strokeIdx];

      const lineX = start.x + (end.x - start.x) * t;
      const deviationX = (strokeP.x - lineX) * 1.5;
      offsets.push(deviationX);
      netCurve += deviationX;
    }

    this.ball.curveOffsets = offsets;
    this.ball.spin = (dx * 0.06) + (netCurve * 0.04);
    this.ball.progress = 0;
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.playerRecoil > 0) {
      this.playerRecoil *= 0.85;
      if (this.playerRecoil < 0.01) this.playerRecoil = 0;
    }

    if (this.wall.shake > 0) {
      this.wall.shake *= 0.88;
      if (this.wall.shake < 0.2) this.wall.shake = 0;
    }

    // Update sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.3;
      s.life -= 0.03;
      if (s.life <= 0) this.sparks.splice(i, 1);
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= 0.02;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    if (this.state === 'FLYING') {
      const b = this.ball;
      b.progress += 0.024;

      if (b.isBlocked) {
        b.x += b.blockBounceX;
        b.y += b.blockBounceY;
        b.blockBounceY += 0.8;
        b.rot += 12;
        return;
      }

      const t = Math.min(b.progress, 1);

      const offsetIndex = Math.min(Math.floor(t * 20), 19);
      const frac = (t * 20) - offsetIndex;
      const c1 = b.curveOffsets[offsetIndex] || 0;
      const c2 = b.curveOffsets[offsetIndex + 1] || c1;
      const curveX = c1 + (c2 - c1) * frac;

      b.x = b.startX + (b.targetX - b.startX) * t + curveX;

      const linearY = b.startY + (b.targetY - b.startY) * t;
      const arc = Math.sin(t * Math.PI) * (this.height * 0.16);
      b.y = linearY - arc;

      b.scale = 1 - t * 0.65;
      b.rot += b.spin;

      // Wall collision check at t ≈ 0.46 to 0.58
      if (t >= 0.46 && t <= 0.58 && !b.hasSlipped) {
        const bgScale = this.width;
        const wallW = this.width * this.wall.widthRatio * 0.85;
        const wallH = bgScale * this.wall.heightRatio * 0.88;
        const wallLeft = this.width * this.wall.xRatio - wallW * 0.5;
        const wallRight = wallLeft + wallW;
        const wallBottom = bgScale * this.wall.yRatio;
        const wallTop = wallBottom - wallH;

        const ballR = (this.width * 0.18 * b.scale) * 0.4;

        if (b.x + ballR > wallLeft && b.x - ballR < wallRight && b.y + ballR > wallTop && b.y - ballR < wallBottom) {
          const canSlip = Math.random() < 0.40;

          if (canSlip) {
            b.hasSlipped = true;
            this.sound.playSlip();
            this.wall.shake = 8;
            this.addFloatingText(this.width * this.wall.xRatio, wallTop - 10, ['すり抜けたー！', '股抜き成功！', '壁の油断！', 'ギリギリ通過！'][Math.floor(Math.random() * 4)], '#2ed573');
            this.spawnSparks(b.x, b.y, '#2ed573', 12);
          } else {
            b.isBlocked = true;
            b.blockBounceX = (Math.random() - 0.5) * 6;
            b.blockBounceY = -7;
            this.wall.jump = -12;
            this.wall.shake = 12;
            this.sound.playBlock();
            this.showResult('block', 'BLOCK!', '壁に阻まれた！');
            this.streak = 0;
            this.updateHUD();
            setTimeout(() => this.resetRound(), 1800);
            return;
          }
        }
      }

      // Reached Goal Line (t >= 1.0)
      if (t >= 1) {
        this.evaluateGoal();
      }
    }
  }

  evaluateGoal() {
    const bx = this.ball.x;
    const by = this.ball.y;
    const w = this.width;
    const bgScale = this.width;

    const xRatio = bx / w;
    const yRatio = by / bgScale;

    const isLeftPost = (xRatio >= 0.165 && xRatio <= 0.235 && yRatio >= 0.065 && yRatio <= 0.430);
    const isRightPost = (xRatio >= 0.755 && xRatio <= 0.825 && yRatio >= 0.065 && yRatio <= 0.430);
    const isCrossbar = (yRatio >= 0.065 && yRatio <= 0.138 && xRatio >= 0.165 && xRatio <= 0.825);

    if (isLeftPost || isRightPost || isCrossbar) {
      this.sound.playPost();
      this.spawnSparks(bx, by, '#fff', 16);

      this.ball.isBlocked = true;
      this.ball.blockBounceX = (xRatio < 0.5 ? -3 : 3);
      this.ball.blockBounceY = 4;

      this.showResult('post', 'POST!', 'ポスト直撃！枠に嫌われた！');
      this.streak = 0;
      this.updateHUD();
      setTimeout(() => this.resetRound(), 1800);
      return;
    }

    if (xRatio > 0.235 && xRatio < 0.755 && yRatio > 0.138 && yRatio < 0.425) {
      this.sound.playGoal();
      this.spawnSparks(bx, by, '#ffd32a', 24);

      this.streak++;
      if (this.streak > this.bestStreak) {
        this.bestStreak = this.streak;
        localStorage.setItem('jk_best', this.bestStreak);
      }
      this.updateHUD();
      this.showResult('goal', 'GOAL!!', 'ナイスシュート！');
      setTimeout(() => this.resetRound(), 1800);
    } else {
      this.sound.playMiss();
      this.showResult('miss', 'MISS', '枠外…！');
      this.streak = 0;
      this.updateHUD();
      setTimeout(() => this.resetRound(), 1800);
    }
  }

  addFloatingText(x, y, text, color = '#ffd32a') {
    this.floatingTexts.push({
      x: x,
      y: y,
      text: text,
      color: color,
      vy: -1.2,
      life: 1.0
    });
  }

  spawnSparks(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: color,
        size: Math.random() * 4 + 3,
        life: 1.0
      });
    }
  }

  showResult(type, title, sub) {
    this.state = 'RESULT';
    this.resultText.className = `result-text ${type}`;
    this.resultText.textContent = title;
    this.resultSub.textContent = sub;
    this.resultBanner.classList.remove('hidden');
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const bgScale = this.width;

    // 1. Draw Field Turf Background Color
    ctx.fillStyle = '#6eff82';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Draw Goal & Sky Background (1:1 Aspect Ratio)
    if (this.images.bg.complete) {
      ctx.drawImage(this.images.bg, 0, 0, this.width, bgScale);
    }

    // 3. Draw Wall Dummy
    if (this.images.wall.complete) {
      const wallW = this.width * this.wall.widthRatio;
      const wallH = bgScale * this.wall.heightRatio;
      const shakeOffset = (Math.random() - 0.5) * this.wall.shake;
      const wallX = this.width * this.wall.xRatio - wallW * 0.5 + shakeOffset;
      const wallY = bgScale * this.wall.yRatio - wallH + this.wall.jump;

      // Wall Ground Shadow
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(this.width * this.wall.xRatio + shakeOffset, bgScale * this.wall.yRatio, wallW * 0.45, wallH * 0.12, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fill();
      ctx.restore();

      ctx.drawImage(this.images.wall, wallX, wallY, wallW, wallH);
    }

    // 4. Draw Swipe Stroke Trail
    if (this.state === 'AIMING' && this.strokePoints.length >= 2) {
      ctx.save();
      ctx.strokeStyle = '#ffd32a';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(255, 211, 42, 0.8)';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(this.strokePoints[0].x, this.strokePoints[0].y);
      for (let i = 1; i < this.strokePoints.length; i++) {
        ctx.lineTo(this.strokePoints[i].x, this.strokePoints[i].y);
      }
      ctx.stroke();

      const tip = this.strokePoints[this.strokePoints.length - 1];
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();
    }

    // 5. Draw Soccer Ball
    if (this.images.ball.complete) {
      const ballSize = Math.max(this.width * 0.22 * this.ball.scale, 16);
      const bgScale = this.width;

      // Ball Shadow
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(this.ball.x, this.ball.startY - (this.ball.startY - bgScale * 0.43) * (this.ball.progress || 0), ballSize * 0.4, ballSize * 0.14, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();
      ctx.restore();

      // Ball Sprite
      ctx.save();
      ctx.translate(this.ball.x, this.ball.y);
      ctx.rotate((this.ball.rot * Math.PI) / 180);
      ctx.drawImage(this.images.ball, -ballSize * 0.5, -ballSize * 0.5, ballSize, ballSize);
      ctx.restore();
    }

    // 6. Draw Player in FRONT FOREGROUND at bottom
    if (this.images.player.complete) {
      const pW = this.width * 0.62;
      const pH = pW;
      const pX = this.width * 0.5 - pW * 0.5;
      const pY = this.height - pH * 0.88 + this.playerRecoil * 18;

      ctx.save();
      ctx.translate(pX + pW * 0.5, pY + pH * 0.5);
      ctx.rotate((this.playerRecoil * (this.ball.spin > 0 ? 5 : -5) * Math.PI) / 180);
      ctx.drawImage(this.images.player, -pW * 0.5, -pH * 0.5, pW, pH);
      ctx.restore();
    }

    // 7. Draw Sparks
    this.sparks.forEach(s => {
      ctx.save();
      ctx.globalAlpha = s.life;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 8. Draw Floating Comic Text Reactions
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = ft.life;
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
