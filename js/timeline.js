// js/timeline.js

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("timeline-container");
  if (!container) return; // safe guard if screen not present

  // Show a gentle loading state
  container.textContent = "Loading our little universe...";

  fetch("data/timeline.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((entries) => {
      // Clear loading text
      container.innerHTML = "";

      if (!Array.isArray(entries) || entries.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.classList.add("timeline-empty");
        emptyMessage.textContent =
          "Our story is still being written… I’ll fill this with our moments soon.";
        container.appendChild(emptyMessage);
        return;
      }

      entries.forEach((entry) => {
        const card = document.createElement("article");
        card.classList.add("timeline-card");

        const title = document.createElement("h3");
        title.textContent = entry.title || "A Moment in Our Universe";

        const date = document.createElement("p");
        date.classList.add("timeline-date");
        date.textContent = entry.date || "Date to be written";

        const description = document.createElement("p");
        description.classList.add("timeline-description");
        description.textContent =
          entry.description || "I’ll write this memory in later, my love.";

        card.appendChild(title);
        card.appendChild(date);
        card.appendChild(description);

        container.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error loading timeline:", error);

      container.innerHTML = "";

      const errorMessage = document.createElement("p");
      errorMessage.classList.add("timeline-error");
      errorMessage.textContent =
        "Couldn’t load our story right now… but it still lives in my heart. (I’ll fix this soon.)";

      container.appendChild(errorMessage);
    });
});
