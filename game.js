const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const keyboardRows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

const scoreEl = document.querySelector("#score");
const streakEl = document.querySelector("#streak");
const timeEl = document.querySelector("#time");
const targetSign = document.querySelector("#targetSign");
const bigLetter = document.querySelector("#bigLetter");
const message = document.querySelector("#message");
const car = document.querySelector("#car");
const finishGlow = document.querySelector("#finishGlow");
const startBtn = document.querySelector("#startBtn");
const soundBtn = document.querySelector("#soundBtn");
const speedRange = document.querySelector("#speedRange");
const speedLabel = document.querySelector("#speedLabel");
const keyboard = document.querySelector("#keyboard");
const keyboardHint = document.querySelector("#keyboardHint");

let target = "A";
let score = 0;
let streak = 0;
let bestStreak = 0;
let timeLeft = 60;
let timer = null;
let playing = false;
let soundOn = true;
let audioContext = null;
let lastLetter = "";

function buildKeyboard() {
  keyboard.innerHTML = "";
  keyboardRows.forEach((rowLetters, rowIndex) => {
    const row = document.createElement("div");
    row.className = `keyboard-row keyboard-row-${rowIndex + 1}`;
    rowLetters.split("").forEach((letter) => {
      const key = document.createElement("span");
      key.className = "key";
      key.dataset.key = letter;
      key.textContent = letter;
      row.appendChild(key);
    });
    keyboard.appendChild(row);
  });
}

function setTarget() {
  const pool = letters.filter((letter) => letter !== lastLetter);
  target = pool[Math.floor(Math.random() * pool.length)];
  lastLetter = target;
  targetSign.textContent = target;
  bigLetter.textContent = target;
  keyboardHint.textContent = `找一找 ${target} 在哪里`;
  document.querySelectorAll(".key").forEach((key) => {
    key.classList.toggle("active", key.dataset.key === target);
    key.classList.remove("hit", "miss");
  });
}

function updateStats() {
  scoreEl.textContent = score;
  streakEl.textContent = streak;
  timeEl.textContent = timeLeft;
}

function ensureAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playTone(type) {
  if (!soundOn) return;
  const ctx = ensureAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = type === "good" ? "triangle" : "sawtooth";
  osc.frequency.setValueAtTime(type === "good" ? 620 : 160, now);
  if (type === "good") {
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.1);
  } else {
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.16);
  }

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(type === "good" ? 0.18 : 0.12, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}

function levelSeconds() {
  return [75, 60, 45][Number(speedRange.value) - 1];
}

function startGame() {
  if (timer) clearInterval(timer);
  score = 0;
  streak = 0;
  bestStreak = 0;
  timeLeft = levelSeconds();
  playing = true;
  startBtn.textContent = "重新开始";
  message.textContent = "看准字母，按键出发";
  updateStats();
  setTarget();
  timer = setInterval(() => {
    timeLeft -= 1;
    updateStats();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  playing = false;
  clearInterval(timer);
  timer = null;
  message.textContent = `完成！得分 ${score}，最高连击 ${bestStreak}`;
  document.querySelectorAll(".key").forEach((key) => key.classList.remove("active"));
}

function markKey(letter, className) {
  const key = document.querySelector(`.key[data-key="${letter}"]`);
  if (!key) return;
  key.classList.add(className);
  setTimeout(() => key.classList.remove(className), 220);
}

function handleLetter(letter) {
  if (!playing || !letters.includes(letter)) return;

  if (letter === target) {
    score += 10 + Math.min(streak, 10);
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);
    message.textContent = streak >= 5 ? "连击加速，真棒！" : "正确！小车冲刺";
    car.classList.add("correct");
    finishGlow.classList.add("flash");
    markKey(letter, "hit");
    playTone("good");
    setTimeout(() => {
      car.classList.remove("correct");
      finishGlow.classList.remove("flash");
    }, 180);
    setTarget();
  } else {
    score = Math.max(0, score - 3);
    streak = 0;
    message.textContent = `再试试：按 ${target}`;
    car.classList.add("wrong");
    markKey(letter, "miss");
    playTone("bad");
    setTimeout(() => car.classList.remove("wrong"), 260);
  }
  updateStats();
}

document.addEventListener("keydown", (event) => {
  const letter = event.key.toUpperCase();
  if (event.key === "Enter" && !playing) startGame();
  handleLetter(letter);
});

startBtn.addEventListener("click", startGame);

soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "音效开" : "音效关";
  soundBtn.setAttribute("aria-pressed", String(soundOn));
});

speedRange.addEventListener("input", () => {
  speedLabel.textContent = ["轻松", "标准", "挑战"][Number(speedRange.value) - 1];
});

buildKeyboard();
setTarget();
updateStats();
