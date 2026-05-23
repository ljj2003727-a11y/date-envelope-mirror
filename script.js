const stage = document.querySelector(".stage");
const openEnvelope = document.querySelector("#openEnvelope");
const letter = document.querySelector("#letter");
const acceptDate = document.querySelector("#acceptDate");
const maybeDate = document.querySelector("#maybeDate");
const responseText = document.querySelector("#responseText");
const canvas = document.querySelector("#petalCanvas");
const ctx = canvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const recipientName = "林夏";

let maybeCount = 0;
let petals = [];
let confetti = [];
let fireflies = [];

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const maybeReplies = [
  `那我再认真一点邀请 ${recipientName}：一顿饭、一段路，还有值得记录的心动瞬间。`,
  `${recipientName} 可以慢慢想，我已经把期待悄悄放在这里了。`,
  `再给我一个机会，我会把约会安排得刚刚好，也把这份心意认真记下来。`,
];

/* ===== Envelope open ===== */
function openLetter() {
  stage.classList.add("is-open");
  openEnvelope.setAttribute("aria-expanded", "true");
  letter.setAttribute("aria-hidden", "false");
  letter.removeAttribute("inert");
  window.scrollTo({ top: 0, behavior: "auto" });

  window.setTimeout(() => {
    acceptDate.focus({ preventScroll: true });
  }, 720);
}

/* ===== Accept invitation ===== */
function acceptInvitation() {
  stage.classList.add("is-accepted");
  responseText.textContent =
    `太好了，${recipientName}。那这一页，就先替我们记住第一件心动的小事。`;
  acceptDate.textContent = "已经赴约";
  acceptDate.disabled = true;
  maybeDate.style.transform = "translate(0, 0)";
  launchConfetti();
  launchHeartBurst();
}

/* ===== Tease / maybe ===== */
function teaseMaybe() {
  responseText.textContent = maybeReplies[maybeCount % maybeReplies.length];
  maybeCount += 1;

  if (window.innerWidth > 720 && !reducedMotion) {
    const x = Math.round((Math.random() - 0.5) * 70);
    const y = Math.round((Math.random() - 0.5) * 36);
    maybeDate.style.transform = `translate(${x}px, ${y}px)`;
  }
}

/* ===== Canvas sizing ===== */
function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  seedPetals();
  seedFireflies();
}

/* ===== Petals ===== */
function seedPetals() {
  const count = Math.max(32, Math.floor(window.innerWidth / 34));
  petals = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: 7 + Math.random() * 13,
    speed: 0.14 + Math.random() * 0.38,
    drift: -0.22 + Math.random() * 0.44,
    turn: Math.random() * Math.PI * 2,
    color:
      Math.random() > 0.45
        ? "rgba(207, 95, 107, 0.36)"
        : "rgba(92, 132, 126, 0.26)",
  }));
}

/* ===== Fireflies ===== */
function seedFireflies() {
  const count = Math.max(8, Math.floor(window.innerWidth / 120));
  fireflies = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight * 0.7,
    size: 2 + Math.random() * 3,
    baseX: Math.random() * window.innerWidth,
    baseY: Math.random() * window.innerHeight * 0.7,
    phase: Math.random() * Math.PI * 2,
    speed: 0.003 + Math.random() * 0.008,
    amplitude: 30 + Math.random() * 60,
    glowPhase: Math.random() * Math.PI * 2,
    glowSpeed: 0.02 + Math.random() * 0.04,
  }));
}

/* ===== Draw helpers ===== */
function drawPetal(item) {
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(item.turn);
  ctx.fillStyle = item.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, item.size * 0.38, item.size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFirefly(item) {
  const glowAlpha = 0.2 + Math.sin(item.glowPhase) * 0.35;
  const glow = ctx.createRadialGradient(
    item.x, item.y, 0,
    item.x, item.y, item.size * 5
  );
  glow.addColorStop(0, `rgba(226, 180, 75, ${glowAlpha})`);
  glow.addColorStop(0.4, `rgba(226, 180, 75, ${glowAlpha * 0.25})`);
  glow.addColorStop(1, "rgba(226, 180, 75, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(item.x, item.y, item.size * 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255, 245, 210, ${0.5 + Math.sin(item.glowPhase) * 0.4})`;
  ctx.beginPath();
  ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
  ctx.fill();
}

function drawConfettiPiece(piece) {
  ctx.save();
  ctx.translate(piece.x, piece.y);
  ctx.rotate(piece.turn);

  if (piece.shape === "heart") {
    ctx.font = `${piece.size * 1.4}px serif`;
    ctx.fillStyle = piece.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("♥", 0, 0);
  } else {
    ctx.fillStyle = piece.color;
    ctx.fillRect(
      -piece.size / 2,
      -piece.size / 2,
      piece.size,
      piece.size * 0.58
    );
  }

  ctx.restore();
}

/* ===== Animation loop ===== */
let windGust = 0;
let windTimer = 0;

function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  if (!reducedMotion) {
    windTimer += 1;
    if (windTimer > 180 + Math.random() * 320) {
      windGust = (Math.random() - 0.5) * 1.4;
      windTimer = 0;
    }
    windGust *= 0.94;

    petals.forEach((petal) => {
      petal.y += petal.speed;
      petal.x += petal.drift + Math.sin(petal.turn) * 0.08 + windGust;
      petal.turn += 0.006;
      if (petal.y > window.innerHeight + 28) {
        petal.y = -28;
        petal.x = Math.random() * window.innerWidth;
      }
    });
  }

  petals.forEach((petal) => drawPetal(petal));

  fireflies.forEach((f) => {
    if (!reducedMotion) {
      f.phase += f.speed;
      f.glowPhase += f.glowSpeed;
      f.x = f.baseX + Math.sin(f.phase) * f.amplitude;
      f.y = f.baseY + Math.cos(f.phase * 1.3) * f.amplitude * 0.55;
    }
    drawFirefly(f);
  });

  confetti = confetti.filter((piece) => piece.life > 0);
  confetti.forEach((piece) => {
    drawConfettiPiece(piece);
    if (!reducedMotion) {
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.vy += 0.032;
      piece.turn += piece.spin;
      piece.life -= 1;
    } else {
      piece.life = 0;
    }
  });

  window.requestAnimationFrame(animate);
}

/* ===== Enhanced confetti ===== */
function launchConfetti() {
  const colors = ["#cf5f6b", "#e2b44b", "#5c847e", "#dceff2", "#e98773"];
  const originX = window.innerWidth / 2;
  const originY = Math.min(window.innerHeight * 0.56, 520);

  for (let i = 0; i < 130; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const force = 2 + Math.random() * 5.2;
    confetti.push({
      x: originX + (Math.random() - 0.5) * 50,
      y: originY + (Math.random() - 0.5) * 24,
      vx: Math.cos(angle) * force,
      vy: Math.sin(angle) * force - 2.6,
      size: 5 + Math.random() * 10,
      turn: Math.random() * Math.PI,
      spin: -0.14 + Math.random() * 0.28,
      life: 75 + Math.floor(Math.random() * 70),
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.45 ? "heart" : "rect",
    });
  }
}

/* ===== Heart burst (DOM) ===== */
function launchHeartBurst() {
  const originX = window.innerWidth / 2;
  const originY = Math.min(window.innerHeight * 0.48, 380);
  const emojis = ["♥", "💕", "💖", "✨", "💗", "🌸"];

  for (let i = 0; i < 35; i++) {
    const heart = document.createElement("span");
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.className = "floating-heart";
    heart.style.left = `${originX}px`;
    heart.style.top = `${originY}px`;
    heart.style.setProperty("--hx", `${(Math.random() - 0.5) * 340}px`);
    heart.style.setProperty("--hy", `${-120 - Math.random() * 320}px`);
    heart.style.setProperty("--hr", `${(Math.random() - 0.5) * 80}deg`);
    heart.style.animationDuration = `${2.2 + Math.random() * 2.2}s`;
    heart.style.fontSize = `${14 + Math.random() * 24}px`;
    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 4500);
  }
}

/* ===== Cursor trail ===== */
let cursorThrottle = false;
document.addEventListener("mousemove", (e) => {
  if (reducedMotion || window.innerWidth <= 720) return;
  if (cursorThrottle) return;
  cursorThrottle = true;
  requestAnimationFrame(() => {
    cursorThrottle = false;

    const heart = document.createElement("span");
    const kind = Math.random();
    if (kind < 0.55) {
      heart.textContent = "♥";
      heart.style.color = "#cf5f6b";
    } else if (kind < 0.8) {
      heart.textContent = "✦";
      heart.style.color = "#e2b44b";
    } else {
      heart.textContent = "·";
      heart.style.color = "#5c847e";
    }

    heart.className = "cursor-heart";
    heart.style.left = `${e.clientX}px`;
    heart.style.top = `${e.clientY}px`;
    heart.style.setProperty("--dx", `${(Math.random() - 0.5) * 56}px`);
    heart.style.setProperty("--dy", `${-22 - Math.random() * 38}px`);
    heart.style.setProperty("--dr", `${(Math.random() - 0.5) * 40}deg`);

    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1200);
  });
});

/* ===== Background music ===== */
function toggleMusic() {
  const btn = document.getElementById("musicToggle");
  const audio = document.getElementById("bgMusic");
  if (!btn || !audio) return;

  if (audio.paused) {
    audio.volume = 0.35;
    audio.play().then(() => {
      btn.classList.add("is-playing");
      btn.setAttribute("aria-label", "暂停音乐");
      btn.textContent = "♪";
    }).catch(() => {
      // Audio not available
    });
  } else {
    audio.pause();
    btn.classList.remove("is-playing");
    btn.setAttribute("aria-label", "播放背景音乐");
    btn.textContent = "♫";
  }
}

/* ===== Event bindings ===== */
openEnvelope.addEventListener("click", openLetter);
acceptDate.addEventListener("click", acceptInvitation);
maybeDate.addEventListener("click", teaseMaybe);
window.addEventListener("resize", () => {
  resizeCanvas();
  fireflies.forEach((f) => {
    f.baseX = Math.random() * window.innerWidth;
    f.baseY = Math.random() * window.innerHeight * 0.7;
  });
});
window.addEventListener("load", () =>
  window.scrollTo({ top: 0, behavior: "auto" })
);

const musicBtn = document.getElementById("musicToggle");
if (musicBtn) {
  musicBtn.addEventListener("click", toggleMusic);
}

/* ===== Init ===== */
resizeCanvas();
animate();
