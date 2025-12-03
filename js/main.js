// js/main.js

let currentStep = 1;

const VALID_USERNAME = "rania";
const VALID_PASSWORD = "25525"; // placeholder for your special date

// =======================
// STEP NAVIGATION
// =======================
function showStep(stepNumber) {
  const screens = document.querySelectorAll(".screen");

  screens.forEach((screen) => {
    const screenStep = parseInt(screen.dataset.step, 10);

    if (screenStep === stepNumber) {
      screen.classList.add("active");
    } else {
      screen.classList.remove("active");
    }
  });

  currentStep = stepNumber;
}

function nextStep() {
  showStep(currentStep + 1);
}

function prevStep() {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
}

// =======================
// MOODBOARD LOGIC
// =======================

/**
 * Called when the “final gift” should unlock.
 * Moves to Screen 6 and renders the moodboard.
 * You can call this from game.js, e.g. after she finishes the game:
 *   unlockFinalGift();
 */
function unlockFinalGift() {
  showStep(6);
  renderMoodboard();
}

/**
 * Fetches data/moodboard.json and renders mood cards into #moodboard-container.
 */
async function renderMoodboard() {
  const container = document.getElementById("moodboard-container");
  if (!container) return;

  // Clear existing content and ensure layout class
  container.innerHTML = "";
  container.classList.add("moodboard-grid");

  try {
    const response = await fetch("data/moodboard.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const items = await response.json();

    if (!Array.isArray(items)) {
      throw new Error("Moodboard data is not an array");
    }

    if (items.length === 0) {
      container.innerHTML =
        '<p class="moodboard-empty">No moments here yet… I’ll fill this with our dreams very soon. 💙</p>';
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "mood-card";

      if (item.image) {
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.title || "Moodboard image";
        img.loading = "lazy";
        card.appendChild(img);
      }

      if (item.title) {
        const title = document.createElement("h3");
        title.textContent = item.title;
        card.appendChild(title);
      }

      if (item.description) {
        const desc = document.createElement("p");
        desc.textContent = item.description;
        card.appendChild(desc);
      }

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Failed to load moodboard:", error);
    container.innerHTML =
      '<p class="moodboard-error">Couldn’t load our moodboard right now — but all these moments are still in my heart. Try refreshing once more. ✨</p>';
  }
}

// =======================
// MUSIC + CONFETTI LOGIC
// =======================
let musicStarted = false;

function startMusic() {
  if (musicStarted) return;

  const audio = document.getElementById("bg-music");
  if (!audio) return;

  audio.volume = 0.4;
  audio
    .play()
    .then(() => {
      musicStarted = true;
    })
    .catch(() => {
      // If browser blocks autoplay, we'll try again on next interaction
    });
}

// simple confetti burst
function fireConfetti() {
  const container = document.getElementById("confetti");
  if (!container) return;

  const colors = ["color-1", "color-2", "color-3", "color-4", "color-5", "color-6"];
  const pieces = 80; // amount of confetti

  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement("div");
    piece.classList.add("confetti-piece");
    piece.classList.add(colors[Math.floor(Math.random() * colors.length)]);

    piece.style.left = Math.random() * 100 + "vw";
    piece.style.animationDelay = Math.random() * 0.8 + "s";
    piece.style.transform = `translateY(-20px) rotateZ(${Math.random() * 360}deg)`;

    container.appendChild(piece);

    // remove after animation ends
    setTimeout(() => {
      if (container.contains(piece)) {
        container.removeChild(piece);
      }
    }, 3000);
  }
}

// =======================
// DOM READY / EVENT BINDING
// =======================
document.addEventListener("DOMContentLoaded", () => {
  showStep(1);

  const loginForm = document.getElementById("login-form");
  const beginJourneyButton = document.getElementById("begin-journey");
  const continueToGameButton = document.getElementById("continue-to-game");
  const startGameButton = document.getElementById("start-game");
  const revealFinalMessageButton = document.getElementById("reveal-final-message");
  const loveButton = document.getElementById("love-button");

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const usernameInput = document.getElementById("username");
      const passwordInput = document.getElementById("password");
      const username = usernameInput ? usernameInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value.trim() : "";

      if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        const existingError = document.getElementById("login-error");
        if (existingError) {
          existingError.remove();
        }

        showStep(2);
        startMusic();
        fireConfetti();
      } else {
        let errorMessage = document.getElementById("login-error");
        if (!errorMessage) {
          errorMessage = document.createElement("p");
          errorMessage.id = "login-error";
          loginForm.appendChild(errorMessage);
        }
        errorMessage.textContent =
          "That doesn’t feel like our secret… try again, my rabbit.";
      }
    });
  }

  // INTRO → TIMELINE
  if (beginJourneyButton) {
    beginJourneyButton.addEventListener("click", () => {
      showStep(3);
      startMusic(); // in case it didn’t start on login
      fireConfetti();
    });
  }

  // TIMELINE → GAME INTRO
  if (continueToGameButton) {
    continueToGameButton.addEventListener("click", () => showStep(4));
  }

  // GAME INTRO → GAME
  if (startGameButton) {
    startGameButton.addEventListener("click", () => {
      if (typeof startPlatformerPhase === "function") {
        startPlatformerPhase();
      }
      showStep(5);
    });
  }

  // MOODBOARD → FINAL MESSAGE
  if (revealFinalMessageButton) {
    revealFinalMessageButton.addEventListener("click", () => showStep(7));
  }

  // FINAL "I LOVE YOU" BUTTON
  if (loveButton) {
    loveButton.addEventListener("click", () => {
      alert("I love you 💙");
    });
  }

  function startRoseGame() {
  const container = document.getElementById("game-container");
  const bunny = document.createElement("div");
  bunny.id = "bunny";
  container.appendChild(bunny);

  let bunnyX = 50; // percentage

  function renderBunny() {
    bunny.style.left = bunnyX + "%";
  }

  renderBunny();

  // Movement: tap left or right
  container.addEventListener("touchstart", (e) => {
    const tapX = e.touches[0].clientX;
    const mid = window.innerWidth / 2;

    if (tapX < mid) {
      bunnyX = Math.max(0, bunnyX - 10);
    } else {
      bunnyX = Math.min(100, bunnyX + 10);
    }
    renderBunny();
  });

  // Roses falling loop
  setInterval(() => {
    createRose(container, bunny);
  }, 1200);
}

function createRose(container, bunny) {
  const rose = document.createElement("div");
  rose.classList.add("rose");
  container.appendChild(rose);

  let y = 0;
  let x = Math.random() * 90;

  rose.style.left = x + "%";

  const fall = setInterval(() => {
    y += 2;
    rose.style.top = y + "%";

    // collision check
    const bunnyRect = bunny.getBoundingClientRect();
    const roseRect = rose.getBoundingClientRect();

    if (
      roseRect.bottom >= bunnyRect.top &&
      roseRect.left < bunnyRect.right &&
      roseRect.right > bunnyRect.left
    ) {
      rose.remove();
      clearInterval(fall);
      // Add sparkle animation here
    }

    if (y > 100) {
      rose.remove();
      clearInterval(fall);
    }
  }, 50);
}

function startRoseGame() {
  const container = document.getElementById("game-container");

  // Create bunny
  const bunny = document.createElement("div");
  bunny.id = "bunny";
  container.appendChild(bunny);

  let bunnyX = 50; // percent
  const step = 6;  // movement amount per press

  function renderBunny() {
    bunny.style.left = bunnyX + "%";
  }

  renderBunny();

  // Button controls
  const btnLeft = document.getElementById("btn-left");
  const btnRight = document.getElementById("btn-right");

  btnLeft.addEventListener("touchstart", moveLeft);
  btnRight.addEventListener("touchstart", moveRight);

  btnLeft.addEventListener("click", moveLeft);
  btnRight.addEventListener("click", moveRight);

  function moveLeft() {
    bunnyX = Math.max(0, bunnyX - step);
    renderBunny();
  }

  function moveRight() {
    bunnyX = Math.min(100, bunnyX + step);
    renderBunny();
  }

  // Roses falling
  setInterval(() => {
    createRose(container, bunny);
  }, 1300);
}

function createRose(container, bunny) {
  const rose = document.createElement("div");
  rose.classList.add("rose");
  container.appendChild(rose);

  let y = 0;
  let x = Math.random() * 90;

  rose.style.left = x + "%";

  const fall = setInterval(() => {
    y += 2;
    rose.style.top = y + "%";

    const bunnyRect = bunny.getBoundingClientRect();
    const roseRect = rose.getBoundingClientRect();

    if (
      roseRect.bottom >= bunnyRect.top &&
      roseRect.left < bunnyRect.right &&
      roseRect.right > bunnyRect.left
    ) {
      rose.remove();
      clearInterval(fall);
      // Optional: sparkles or hearts
    }

    if (y > 100) {
      rose.remove();
      clearInterval(fall);
    }
  }, 50);
}


});
