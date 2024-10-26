let rewards = [];
let angles = [];
let currentRotation = 0;
let isSpinning = false;

document.addEventListener("DOMContentLoaded", () => {
    const intro = document.getElementById("intro");
    const mainContent = document.getElementById("main-content");

    // Function to display the main content with grid structure
    const showMainContent = () => {
        intro.style.opacity = "0"; // Fade out the intro
        setTimeout(() => {
            intro.style.display = "none"; // Hide intro after fade out
            mainContent.style.display = "grid"; // Show main content as grid
            mainContent.style.opacity = "1"; // Fade in main content
        }, 1000);
    };

    setTimeout(showMainContent, 6000); // Delay for showing main content
});





// Helper to generate unique colors for each segment
function generateUniqueColors(count) {
  const colors = [];
  while (colors.length < count) {
    const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    if (!colors.includes(color) && color.length === 7) {
      colors.push(color);
    }
  }
  return colors;
}

// Add reward to the list
function addReward(name) {
  if (rewards.length >= 30) {
    alert("Maximum of 30 rewards reached");
    return;
  }
  rewards.push(name);
  renderRewards();
  document.getElementById("rewardName").value = ""; // Clear input after adding
}

// Delete reward from the list
function deleteReward(index) {
  rewards.splice(index, 1);
  renderRewards();
}

// Render rewards list
function renderRewards() {
  const rewardList = document.getElementById("rewardList");
  rewardList.innerHTML = "";
  rewards.forEach((reward, index) => {
    const rewardEl = document.createElement("div");
    rewardEl.classList.add("reward-item");
    rewardEl.innerHTML = `
            ${reward}
            <button onclick="deleteReward(${index})">Delete</button>
        `;
    rewardList.appendChild(rewardEl);
  });
}

// Clear and initialize the wheel
function initializeWheel() {
  const ctx = wheelCanvas.getContext("2d");
  const radius = wheelCanvas.width / 2; // Half the width of the canvas
  ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height); // Clear the canvas
  ctx.beginPath();
  ctx.arc(radius, radius, radius - 5, 0, Math.PI * 2); // Draw arc with slight padding
  ctx.strokeStyle = "#cfd1bf"; // Set the border color of the circle to #cfd1bf
  ctx.lineWidth = 5; // Border width
  ctx.stroke();
}

// Render the wheel with segments
function renderWheel(equalDistribution = true) {
  const ctx = wheelCanvas.getContext("2d");
  const radius = wheelCanvas.width / 2; // Ensure it's half the canvas width
  ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height); // Clear the canvas
  angles = []; // Reset angles

  const colors = generateUniqueColors(rewards.length); // Ensure unique colors for each segment

  if (equalDistribution) {
    const angle = 360 / rewards.length; // Equal angle for all rewards
    angles = Array(rewards.length).fill(angle);
  } else {
    angles = randomDistribution(); // Random distribution of angles
  }

  let startAngle = 0;
  rewards.forEach((reward, index) => {
    const endAngle = startAngle + (angles[index] * Math.PI) / 180; // Convert to radians
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius - 5, startAngle, endAngle); // Subtract 5 to match the border
    ctx.fillStyle = colors[index]; // Assign a unique color
    ctx.fill();
    ctx.strokeStyle = "#cfd1bf"; // Set the border color of the wheel segments
    ctx.lineWidth = 5; // Adjust the width of the border if needed
    ctx.stroke();
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate((startAngle + endAngle) / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#681827";
    ctx.font = "bold 16px Arial";
    ctx.fillText(reward, radius - 15, 10); // Position the text
    ctx.restore();
    startAngle = endAngle;
  });
}

// Random distribution logic to ensure total is 360 degrees
function randomDistribution() {
  let remaining = 360;
  let angles = [];
  for (let i = 0; i < rewards.length - 1; i++) {
    const angle = Math.random() * (remaining / (rewards.length - i)); // Random angle
    angles.push(angle);
    remaining -= angle;
  }
  angles.push(remaining); // Ensure last angle completes 360 degrees
  return angles;
}

// Spin functionality with rotation
document.getElementById("spinButton").addEventListener("click", () => {
  if (rewards.length === 0 || isSpinning) {
    alert("Please add rewards and choose a distribution.");
    return;
  }

  isSpinning = true; // Disable further spins
  disableButtons(); // Disable all buttons during spin

  const randomDegrees = Math.floor(Math.random() * 360) + 3600; // Random spin (at least 10 full rotations)
  const newRotation = currentRotation + randomDegrees;

  wheelCanvas.style.transition = "transform 4s ease-out";
  wheelCanvas.style.transform = `rotate(${newRotation}deg)`;
  currentRotation = newRotation;

  // Determine the winning segment after the spin
  setTimeout(() => {
    const finalRotation = (360 - (currentRotation % 360)) % 360; // Normalize and reverse rotation
    const winningReward = determineWinner(finalRotation);
    showWinnerPopup(winningReward);
  }, 4000);
});

// Determine the winning reward based on angle
function determineWinner(finalRotation) {
  let accumulatedAngle = 0;
  let winner = "";

  for (let i = 0; i < rewards.length; i++) {
    accumulatedAngle += angles[i];
    if (finalRotation <= accumulatedAngle) {
      winner = rewards[i];
      break;
    }
  }
  return winner;
}

// Add reward on button click
document.getElementById("addRewardButton").addEventListener("click", () => {
  const name = document.getElementById("rewardName").value;
  if (!name) return alert("Please enter a reward name");
  addReward(name);
});

// Equal distribution button
document.getElementById("equalDistribution").addEventListener("click", () => {
  if (rewards.length === 0) {
    alert("Add at least one reward before rendering the wheel.");
    return;
  }
  renderWheel(true);
});

// Random distribution button
document.getElementById("randomDistribution").addEventListener("click", () => {
  if (rewards.length === 0) {
    alert("Add at least one reward before rendering the wheel.");
    return;
  }
  renderWheel(false);
});

// Initialize empty wheel on page load
window.onload = function () {
  initializeWheel();
};

// Disable buttons during spin
function disableButtons() {
  document.getElementById("spinButton").disabled = true;
  document.getElementById("addRewardButton").disabled = true;
  document
    .querySelectorAll("button.deleteButton")
    .forEach((button) => (button.disabled = true));
  document.getElementById("equalDistribution").disabled = true;
  document.getElementById("randomDistribution").disabled = true;
}

// Show winner pop-up and reset game
function showWinnerPopup(winner) {
  const popup = document.createElement("div");
  popup.classList.add("winner-popup");
  popup.innerHTML = `
        <div class="popup-content">
            <h2>Congratulations!</h2>
            <p>You won: <strong>${winner}</strong></p>
            <button id="closePopupButton">Close</button>
        </div>
    `;

  document.body.appendChild(popup);

  document.getElementById("closePopupButton").addEventListener("click", () => {
    document.body.removeChild(popup);
    resetGame();
  });
}

// Reset game: clear rewards, reset wheel
function resetGame() {
  rewards = [];
  angles = [];
  currentRotation = 0;
  initializeWheel();
  document.getElementById("rewardList").innerHTML = ""; // Clear the reward list
  wheelCanvas.style.transition = "none"; // Reset rotation without animation
  wheelCanvas.style.transform = `rotate(0deg)`; // Reset rotation
  document.getElementById("spinButton").disabled = false; // Re-enable spin button
  document.getElementById("addRewardButton").disabled = false;
  document
    .querySelectorAll("button.deleteButton")
    .forEach((button) => (button.disabled = false));
  document.getElementById("equalDistribution").disabled = false;
  document.getElementById("randomDistribution").disabled = false;
  isSpinning = false; // Allow new spins
}
