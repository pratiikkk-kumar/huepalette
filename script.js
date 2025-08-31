document.addEventListener("DOMContentLoaded", function () {
  const colorPreview = document.getElementById("colorPreview");
  const colorInput = document.getElementById("colorInput");
  const colorPicker = document.getElementById("colorPicker");
  const paletteDisplay = document.getElementById("paletteDisplay");
  const generateRandomBtn = document.getElementById("generateRandom");
  const generateFromColorBtn = document.getElementById("generateFromColor");
  const savePaletteBtn = document.getElementById("savePalette");
  const exportPaletteBtn = document.getElementById("exportPalette");
  const savedPalettesContainer = document.getElementById("savedPalettes");
  const notification = document.getElementById("notification");

  const currentYearEl = document.getElementById("currentYear");
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  let savedPalettes = JSON.parse(localStorage.getItem("savedPalettes")) || [];

  colorPreview.style.backgroundColor = "#6A5ACD";
  generatePaletteFromColor("#6A5ACD");
  renderSavedPalettes();

  generateRandomBtn.addEventListener("click", generateRandomPalette);
  generateFromColorBtn.addEventListener("click", () =>
    generatePaletteFromColor(colorInput.value)
  );
  savePaletteBtn.addEventListener("click", savePalette);
  exportPaletteBtn.addEventListener("click", exportPaletteAsCSS);

  colorPreview.addEventListener("click", () => colorPicker.click());

  colorPicker.addEventListener("input", (e) => {
    const color = e.target.value;
    colorInput.value = color;
    colorPreview.style.backgroundColor = color;
  });

  colorInput.addEventListener("input", function () {
    const color = validateColor(colorInput.value);
    if (color) {
      colorPreview.style.backgroundColor = color;
      colorPicker.value = color;
    }
  });

  colorInput.addEventListener("change", function () {
    const color = validateColor(colorInput.value);
    if (color) {
      generatePaletteFromColor(color);
    }
  });

  function generateRandomPalette() {
    const baseColor = getRandomColor();
    colorInput.value = baseColor;
    colorPicker.value = baseColor;
    colorPreview.style.backgroundColor = baseColor;
    generatePaletteFromColor(baseColor);
  }

  function generatePaletteFromColor(baseColor) {
    const validColor = validateColor(baseColor) || "#6A5ACD";
    colorInput.value = validColor;
    colorPicker.value = validColor;
    colorPreview.style.backgroundColor = validColor;

    paletteDisplay.innerHTML = "";

    const palette = generateColorPalette(validColor);
    const labels = [
      "Base",
      "Complementary",
      "Analogous",
      "Analogous",
      "Light",
      "Dark",
    ];

    palette.forEach((color, index) => {
      const colorElement = document.createElement("div");
      colorElement.className = "palette-color";
      colorElement.style.backgroundColor = color;
      colorElement.setAttribute("role", "button");
      colorElement.setAttribute("aria-label", `Color ${index + 1}: ${color}`);

      const colorLabel = document.createElement("div");
      colorLabel.className = "color-label";
      colorLabel.textContent = labels[index];

      const hexCode = document.createElement("div");
      hexCode.className = "hex-code";
      hexCode.textContent = color;

      colorElement.appendChild(colorLabel);
      colorElement.appendChild(hexCode);

      colorElement.addEventListener("click", () => copyToClipboard(color));

      paletteDisplay.appendChild(colorElement);
    });
  }

  function generateColorPalette(baseColor) {
    const base = hexToHSL(baseColor);
    const palette = [baseColor];

    palette.push(HSLToHex([(base[0] + 180) % 360, base[1], base[2]]));
    palette.push(HSLToHex([(base[0] + 30) % 360, base[1], base[2]]));
    palette.push(HSLToHex([(base[0] - 30 + 360) % 360, base[1], base[2]]));
    palette.push(
      HSLToHex([base[0], Math.max(base[1] - 20, 0), Math.min(base[2] + 20, 95)])
    );
    palette.push(
      HSLToHex([
        base[0],
        Math.min(base[1] + 20, 100),
        Math.max(base[2] - 20, 5),
      ])
    );

    return palette;
  }

  function savePalette() {
    const colors = Array.from(paletteDisplay.children).map(
      (child) => child.style.backgroundColor
    );
    const palette = {
      id: Date.now(),
      colors: colors,
      baseColor: colorPicker.value,
    };

    savedPalettes.push(palette);
    localStorage.setItem("savedPalettes", JSON.stringify(savedPalettes));
    renderSavedPalettes();
    showNotification("Palette saved!");
  }

  function renderSavedPalettes() {
    savedPalettesContainer.innerHTML = "";

    if (savedPalettes.length === 0) {
      savedPalettesContainer.innerHTML = `<p class="empty-state">You have no saved palettes yet. Create one and click 'Save'!</p>`;
      return;
    }

    savedPalettes.forEach((palette) => {
      const paletteElement = document.createElement("div");
      paletteElement.className = "saved-palette";

      const colorsContainer = document.createElement("div");
      colorsContainer.className = "saved-palette-colors";

      palette.colors.forEach((color) => {
        const colorDiv = document.createElement("div");
        colorDiv.className = "saved-palette-color";
        colorDiv.style.backgroundColor = color;
        colorsContainer.appendChild(colorDiv);
      });

      const paletteInfo = document.createElement("div");
      paletteInfo.className = "saved-palette-info";

      const actions = document.createElement("div");
      actions.className = "saved-palette-actions";

      const loadBtn = document.createElement("button");
      loadBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Load';
      loadBtn.addEventListener("click", () => {
        colorPicker.value = palette.baseColor;
        colorInput.value = palette.baseColor;
        colorPreview.style.backgroundColor = palette.baseColor;
        generatePaletteFromColor(palette.baseColor);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
      deleteBtn.addEventListener("click", () => {
        savedPalettes = savedPalettes.filter((p) => p.id !== palette.id);
        localStorage.setItem("savedPalettes", JSON.stringify(savedPalettes));
        renderSavedPalettes();
        showNotification("Palette deleted!");
      });

      actions.appendChild(loadBtn);
      actions.appendChild(deleteBtn);

      paletteInfo.appendChild(actions);

      paletteElement.appendChild(colorsContainer);
      paletteElement.appendChild(paletteInfo);

      savedPalettesContainer.appendChild(paletteElement);
    });
  }

  function exportPaletteAsCSS() {
    const colors = Array.from(paletteDisplay.children).map(
      (child) => child.style.backgroundColor
    );
    let css = ":root {\n";
    colors.forEach((color, index) => {
      css += `    --color-${index + 1}: ${rgbToHex(color)};\n`;
    });
    css += "}";

    copyToClipboard(css);
    showNotification("CSS variables copied!");
  }

  function validateColor(color) {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(color)) {
      return color.length === 4
        ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
        : color;
    }
    return null;
  }

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function hexToHSL(hex) {
    let r = 0,
      g = 0,
      b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }

    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  }

  function HSLToHex(hsl) {
    let [h, s, l] = hsl;
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    const toHex = (x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
  }

  function rgbToHex(rgb) {
    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    rgb = rgb.substr(4).split(")")[0].split(sep);

    let r = (+rgb[0]).toString(16),
      g = (+rgb[1]).toString(16),
      b = (+rgb[2]).toString(16);

    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;

    return "#" + r + g + b;
  }

  function showNotification(message, isWarning = false) {
    notification.innerHTML = `<i class="fas fa-${
      isWarning ? "exclamation-triangle" : "check-circle"
    }"></i> ${message}`;
    notification.classList.toggle("warning", isWarning);
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
    }, 2000);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showNotification("Copied to clipboard!");
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showNotification("Copied to clipboard!");
    }
  }
});
