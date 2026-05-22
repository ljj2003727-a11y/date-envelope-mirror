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

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const maybeReplies = [
  `那我再认真一点邀请 ${recipientName}：一顿饭、一段路，还有值得记录的心动瞬间。`,
  `${recipientName} 可以慢慢想，我已经把期待悄悄放在这里了。`,
  `再给我一个机会，我会把约会安排得刚刚好，也把这份心意认真记下来。`,
];

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

function acceptInvitation() {
  stage.classList.add("is-accepted");
  responseText.textContent = `太好了，${recipientName}。那这一页，就先替我们记住第一件心动的小事。`;
  acceptDate.textContent = "已经赴约";
  acceptDate.disabled = true;
  maybeDate.style.transform = "translate(0, 0)";
  launchConfetti();
}

function teaseMaybe() {
  responseText.textContent = maybeReplies[maybeCount % maybeReplies.length];
  maybeCount += 1;

  if (window.innerWidth > 720 && !reducedMotion) {
    const x = Math.round((Math.random() - 0.5) * 70);
    const y = Math.round((Math.random() - 0.5) * 36);
    maybeDate.style.transform = `translate(${x}px, ${y}px)`;
  }
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  seedPetals();
}

function seedPetals() {
  const count = Math.max(28, Math.floor(window.innerWidth / 38));
  petals = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: 7 + Math.random() * 13,
    speed: 0.16 + Math.random() * 0.36,
    drift: -0.22 + Math.random() * 0.44,
    turn: Math.random() * Math.PI * 2,
    color: Math.random() > 0.45 ? "rgba(207, 95, 107, 0.36)" : "rgba(92, 132, 126, 0.26)",
  }));
}

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

function drawConfetti(piece) {
  ctx.save();
  ctx.translate(piece.x, piece.y);
  ctx.rotate(piece.turn);
  ctx.fillStyle = piece.color;
  ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.58);
  ctx.restore();
}

function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  petals.forEach((petal) => {
    drawPetal(petal);
    if (!reducedMotion) {
      petal.y += petal.speed;
      petal.x += petal.drift + Math.sin(petal.turn) * 0.08;
      petal.turn += 0.006;

      if (petal.y > window.innerHeight + 28) {
        petal.y = -28;
        petal.x = Math.random() * window.innerWidth;
      }
    }
  });

  confetti = confetti.filter((piece) => piece.life > 0);
  confetti.forEach((piece) => {
    drawConfetti(piece);
    if (!reducedMotion) {
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.vy += 0.035;
      piece.turn += piece.spin;
      piece.life -= 1;
    } else {
      piece.life = 0;
    }
  });

  window.requestAnimationFrame(animate);
}

function launchConfetti() {
  const colors = ["#cf5f6b", "#e2b44b", "#5c847e", "#dceff2", "#e98773"];
  const originX = window.innerWidth / 2;
  const originY = Math.min(window.innerHeight * 0.56, 520);

  for (let i = 0; i < 90; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const force = 2 + Math.random() * 4.6;
    confetti.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * force,
      vy: Math.sin(angle) * force - 2,
      size: 6 + Math.random() * 8,
      turn: Math.random() * Math.PI,
      spin: -0.12 + Math.random() * 0.24,
      life: 90 + Math.floor(Math.random() * 55),
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

openEnvelope.addEventListener("click", openLetter);
acceptDate.addEventListener("click", acceptInvitation);
maybeDate.addEventListener("click", teaseMaybe);
window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", () => window.scrollTo({ top: 0, behavior: "auto" }));

resizeCanvas();
animate();
