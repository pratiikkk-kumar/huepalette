document.addEventListener("DOMContentLoaded", function () {
  const currentYearEl = document.getElementById("currentYear");
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  const carouselContainer = document.querySelector(".color-carousel");
  if (carouselContainer) {
    createColorCarousel();
  }

  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener("click", function () {
      mobileMenuToggle.classList.toggle("active");
      mobileMenu.classList.toggle("active");
    });
  }
});

function createColorCarousel() {
  const carouselContainer = document.querySelector(".color-carousel");
  if (!carouselContainer) return;

  const colors = generateColors(30);

  colors.forEach((color) => {
    const colorItem = document.createElement("div");
    colorItem.className = "color-item";
    colorItem.style.backgroundColor = color;
    carouselContainer.appendChild(colorItem);
  });

  const colorItems = carouselContainer.querySelectorAll(".color-item");
  colorItems.forEach((item) => {
    const clone = item.cloneNode(true);
    carouselContainer.appendChild(clone);
  });
}

function generateColors(count) {
  const colors = [];

  const baseColors = [
    "#6A5ACD",
    "#8A2BE2",
    "#FF6347",
    "#4CAF50",
    "#FF9800",
    "#E91E63",
    "#2196F3",
    "#9C27B0",
    "#00BCD4",
    "#FFEB3B",
  ];

  colors.push(...baseColors);

  for (let i = 0; i < count - baseColors.length; i++) {
    colors.push(getRandomColor());
  }

  return shuffleArray(colors);
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
