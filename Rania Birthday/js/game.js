// js/game.js

// Wrap in an IIFE to avoid polluting global scope, then expose only what we need.
(() => {
  // =======================
  // SHARED HELPERS
  // =======================
  function getGameContainer() {
    return document.getElementById("game-container");
  }

  function clearGameContainer() {
    const container = getGameContainer();
    if (!container) return;
    container.innerHTML = "";
  }

  // =======================
  // PLATFORMER / ROSE GAME (PHASE 1)
  // =======================

  let roseScore = 0;
  const ROSE_TARGET = 5;
  let roseIntervalId = null;
  let gameTapHandler = null;
  let gameAreaEl = null;
  let scoreEl = null;
  let gameActive = false;

  function updateRoseScoreDisplay() {
    if (!scoreEl) return;
    scoreEl.textContent = `Roses collected: ${roseScore}`;
  }

  function spawnFallingRose() {
    if (!gameActive || !gameAreaEl) return;

    const rose = document.createElement("img");
    rose.src = "assets/images/rose.png";
    rose.alt = "Falling rose";
    rose.className = "falling-rose";

    const randomX = 10 + Math.random() * 80; // between 10% and 90%
    rose.style.left = `${randomX}%`;

    // randomize duration a bit for cuteness
    const duration = 3 + Math.random() * 2; // 3–5s
    rose.style.animationDuration = `${duration}s`;

    rose.addEventListener("animationend", () => {
      rose.remove();
    });

    gameAreaEl.appendChild(rose);
  }

  function spawnRosePopEffect(x, y) {
    if (!gameAreaEl) return;

    const rect = gameAreaEl.getBoundingClientRect();
    const relX = x - rect.left;
    const relY = y - rect.top;

    const pop = document.createElement("div");
    pop.className = "rose-pop";
    pop.textContent = "+1 🌹";

    pop.style.left = `${relX}px`;
    pop.style.top = `${relY}px`;

    gameAreaEl.appendChild(pop);

    pop.addEventListener("animationend", () => {
      pop.remove();
    });
  }

  function endPlatformerGame() {
    gameActive = false;

    if (roseIntervalId !== null) {
      clearInterval(roseIntervalId);
      roseIntervalId = null;
    }

    if (gameAreaEl && gameTapHandler) {
      if (window.PointerEvent) {
        gameAreaEl.removeEventListener("pointerdown", gameTapHandler);
      } else {
        gameAreaEl.removeEventListener("click", gameTapHandler);
        gameAreaEl.removeEventListener("touchstart", gameTapHandler);
      }
    }

    // Tiny pause so the last +1 can animate
    setTimeout(finishPlatformerPhase, 700);
  }

  function createTapHandler() {
    return function (event) {
      if (!gameActive) return;

      event.preventDefault();

      let clientX;
      let clientY;

      if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      roseScore += 1;
      updateRoseScoreDisplay();
      spawnRosePopEffect(clientX, clientY);

      if (roseScore >= ROSE_TARGET) {
        endPlatformerGame();
      }
    };
  }

  function startPlatformerPhase() {
    const container = getGameContainer();
    if (!container) return;

    clearGameContainer();

    // Reset game state
    roseScore = 0;
    gameActive = true;

    const wrapper = document.createElement("div");
    wrapper.className = "phase-wrapper phase-platformer";

    const title = document.createElement("h3");
    title.textContent = "Collect the Birthday Roses 🌹";

    const description = document.createElement("p");
    description.textContent =
      "Tap anywhere inside the box to catch roses for your bunny. When you’ve collected enough, the story continues…";

    scoreEl = document.createElement("p");
    scoreEl.className = "rose-score";
    scoreEl.textContent = "Roses collected: 0";

    gameAreaEl = document.createElement("div");
    gameAreaEl.className = "game-area";

    // Bunny player at bottom center
    const bunny = document.createElement("img");
    bunny.src = "assets/images/bunny.png";
    bunny.alt = "Bunny";
    bunny.className = "bunny-player";
    gameAreaEl.appendChild(bunny);

    wrapper.appendChild(title);
    wrapper.appendChild(description);
    wrapper.appendChild(scoreEl);
    wrapper.appendChild(gameAreaEl);
    container.appendChild(wrapper);

    // Tap / click handler
    gameTapHandler = createTapHandler();

    if (window.PointerEvent) {
      gameAreaEl.addEventListener("pointerdown", gameTapHandler);
    } else {
      // Fallback for older browsers
      gameAreaEl.addEventListener("click", gameTapHandler);
      gameAreaEl.addEventListener("touchstart", gameTapHandler);
    }

    // Start spawning falling roses
    spawnFallingRose(); // one immediately
    roseIntervalId = window.setInterval(spawnFallingRose, 900);

    updateRoseScoreDisplay();
  }

  function finishPlatformerPhase() {
    // Move directly into the quiz phase once enough roses are collected
    startQuizPhase();
  }

  // =======================
  // QUIZ (PHASE 2)
  // =======================
  let quizQuestions = [];
  let currentQuestionIndex = 0;
  let quizScore = 0;
  let quizLoaded = false;

  async function loadQuizData() {
    if (quizLoaded && quizQuestions.length > 0) return;

    try {
      const response = await fetch("data/quiz.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load quiz.json");
      }
      const data = await response.json();

      if (!data || !Array.isArray(data.questions)) {
        throw new Error("quiz.json must contain { questions: [] }");
      }

      quizQuestions = data.questions;
      quizLoaded = true;
    } catch (error) {
      console.error("Error loading quiz:", error);
      const container = getGameContainer();
      if (container) {
        clearGameContainer();
        const msg = document.createElement("p");
        msg.className = "quiz-error";
        msg.textContent =
          "Couldn’t load the quiz right now, but the universe still loves you. 💙";
        container.appendChild(msg);
      }
    }
  }

  async function startQuizPhase() {
    const container = getGameContainer();
    if (!container) return;

    clearGameContainer();

    const intro = document.createElement("div");
    intro.className = "quiz-intro";
    intro.innerHTML = `
      <h3>How Well Do You Know Us? 💫</h3>
      <p>Time for a tiny quiz about you, me, and our little universe.</p>
    `;
    container.appendChild(intro);

    // Load quiz data first
    await loadQuizData();

    if (!quizLoaded || quizQuestions.length === 0) {
      // If something failed, just move on to the next phase after a delay
      setTimeout(finishQuizPhase, 1500);
      return;
    }

    // Reset state
    currentQuestionIndex = 0;
    quizScore = 0;

    renderCurrentQuizQuestion();
  }

  function renderCurrentQuizQuestion() {
    const container = getGameContainer();
    if (!container) return;

    // Remove previous question, keep intro if present
    const existingQuestionBlock = container.querySelector(".quiz-card");
    if (existingQuestionBlock) {
      existingQuestionBlock.remove();
    }

    if (currentQuestionIndex >= quizQuestions.length) {
      finishQuizPhase();
      return;
    }

    const questionData = quizQuestions[currentQuestionIndex];

    const card = document.createElement("div");
    card.className = "quiz-card";

    const progress = document.createElement("p");
    progress.className = "quiz-progress";
    progress.textContent = `Question ${
      currentQuestionIndex + 1
    } of ${quizQuestions.length}`;

    const questionEl = document.createElement("h4");
    questionEl.className = "quiz-question";
    questionEl.textContent = questionData.question || "Question";

    const optionsList = document.createElement("div");
    optionsList.className = "quiz-options";

    // Clear any old feedback
    const oldFeedback = container.querySelector(".quiz-feedback");
    if (oldFeedback) oldFeedback.remove();

    questionData.options.forEach((optionText, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-option-btn";
      btn.textContent = optionText;

      btn.addEventListener("click", () =>
        handleQuizOptionClick(btn, index, questionData.correctIndex)
      );

      optionsList.appendChild(btn);
    });

    card.appendChild(progress);
    card.appendChild(questionEl);
    card.appendChild(optionsList);

    container.appendChild(card);
  }

  function handleQuizOptionClick(buttonEl, selectedIndex, correctIndex) {
    const container = getGameContainer();
    if (!container) return;

    const optionButtons = container.querySelectorAll(".quiz-option-btn");

    // Disable all buttons
    optionButtons.forEach((btn) => {
      btn.disabled = true;
    });

    let feedbackText = "";

    if (selectedIndex === correctIndex) {
      buttonEl.classList.add("correct");
      feedbackText = "Correct! Of course you knew that, my clever rabbit. 💙";
      quizScore += 1;
    } else {
      buttonEl.classList.add("incorrect");

      // Highlight the correct one too
      optionButtons.forEach((btn, idx) => {
        if (idx === correctIndex) {
          btn.classList.add("correct");
        }
      });

      feedbackText = "Not quite, but it’s okay — I still choose you. ✨";
    }

    // Remove any existing feedback
    const oldFeedback = container.querySelector(".quiz-feedback");
    if (oldFeedback) oldFeedback.remove();

    const feedback = document.createElement("p");
    feedback.className = "quiz-feedback";
    feedback.textContent = feedbackText;
    container.appendChild(feedback);

    // Move to next question after a short delay
    setTimeout(() => {
      currentQuestionIndex += 1;
      renderCurrentQuizQuestion();
    }, 800);
  }

  function finishQuizPhase() {
    const container = getGameContainer();
    if (!container) return;

    clearGameContainer();

    const wrapper = document.createElement("div");
    wrapper.className = "phase-wrapper phase-quiz-complete";

    const title = document.createElement("h3");
    title.textContent = "Quiz Complete 🌟";

    const summary = document.createElement("p");
    summary.innerHTML = `
      You answered <strong>${quizScore}</strong> out of 
      <strong>${quizQuestions.length}</strong> questions.  
      No matter the score, you’re always the right answer to me. 💙
    `;

    wrapper.appendChild(title);
    wrapper.appendChild(summary);
    container.appendChild(wrapper);

    // After a brief pause, move to the final ship phase
    setTimeout(startShipPhase, 1200);
  }

  // =======================
  // SHIP / LONDON (PHASE 3)
  // =======================
  function startShipPhase() {
    const container = getGameContainer();
    if (!container) return;

    clearGameContainer();

    const wrapper = document.createElement("div");
    wrapper.className = "phase-wrapper phase-ship";

    const title = document.createElement("h3");
    title.textContent = "Flying Over Our London Night ✈️🎄";

    const description = document.createElement("p");
    description.textContent =
      "Close your eyes and imagine us floating over London, Christmas lights glowing under us, your royal blue scarf in the wind, and my hand holding yours.";

    const button = document.createElement("button");
    button.className = "phase-action-btn";
    button.textContent = "Land safely in our universe 💙";
    button.addEventListener("click", finishShipPhase);

    wrapper.appendChild(title);
    wrapper.appendChild(description);
    wrapper.appendChild(button);
    container.appendChild(wrapper);
  }

  function finishShipPhase() {
    // This function should unlock the moodboard + final gift
    if (typeof unlockFinalGift === "function") {
      unlockFinalGift();
    } else {
      console.warn(
        "unlockFinalGift() is not defined. Make sure main.js is loaded before game.js."
      );
    }
  }

  // =======================
  // EXPOSE ENTRY POINT FOR main.js
  // =======================
  // main.js calls startPlatformerPhase() when the game starts
  window.startPlatformerPhase = startPlatformerPhase;
})();
