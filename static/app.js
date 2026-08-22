const form = document.querySelector("#qr-form");
const urlInput = document.querySelector("#url");
const message = document.querySelector("#form-message");
const picker = document.querySelector("#color-picker");
const wheelMarker = document.querySelector("#wheel-marker");
const particleCanvas = document.querySelector("#particle-background");
const hexInput = document.querySelector("#hex-color");
const redInput = document.querySelector("#red");
const greenInput = document.querySelector("#green");
const blueInput = document.querySelector("#blue");
const swatch = document.querySelector("#color-swatch");
const transparentInput = document.querySelector("#transparent");
const previewFrame = document.querySelector("#preview-frame");
const preview = document.querySelector("#qr-preview");
const emptyPreview = document.querySelector("#empty-preview");
const saveButton = document.querySelector("#save-button");
const presets = [...document.querySelectorAll(".preset")];
const themeToggle = document.querySelector("#theme-toggle");
const themeLabel = document.querySelector("#theme-label");

let currentBlobUrl = null;
let hasGenerated = false;
let livePreviewTimer = null;
let latestRequest = 0;

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
}

function initialTheme() {
  try {
    const stored = window.localStorage.getItem("qr-generator-theme");
    if (["light", "dark"].includes(stored)) return stored;
  } catch {
    // The interface still works when browser storage is unavailable.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  try {
    window.localStorage.setItem("qr-generator-theme", nextTheme);
  } catch {
    // Theme persistence is optional.
  }
});

function clamp(value) {
  return Math.max(0, Math.min(255, Number.parseInt(value, 10) || 0));
}

function componentToHex(value) {
  return clamp(value).toString(16).padStart(2, "0").toUpperCase();
}

function rgbToHex(red, green, blue) {
  return `#${componentToHex(red)}${componentToHex(green)}${componentToHex(blue)}`;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return {
    red: Number.parseInt(value.slice(0, 2), 16),
    green: Number.parseInt(value.slice(2, 4), 16),
    blue: Number.parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHsv(red, green, blue) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue = (hue * 60 + 360) % 360;
  }
  return {hue, saturation: max ? delta / max : 0, value: max};
}

function hsvToRgb(hue, saturation, value) {
  const chroma = value * saturation;
  const segment = hue / 60;
  const secondary = chroma * (1 - Math.abs((segment % 2) - 1));
  const offset = value - chroma;
  let rgb;
  if (segment < 1) rgb = [chroma, secondary, 0];
  else if (segment < 2) rgb = [secondary, chroma, 0];
  else if (segment < 3) rgb = [0, chroma, secondary];
  else if (segment < 4) rgb = [0, secondary, chroma];
  else if (segment < 5) rgb = [secondary, 0, chroma];
  else rgb = [chroma, 0, secondary];
  return rgb.map((component) => Math.round((component + offset) * 255));
}

function drawColorWheel() {
  const context = picker.getContext("2d");
  const width = picker.width;
  const radius = width / 2;
  const image = context.createImageData(width, width);
  for (let y = 0; y < width; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const dx = x - radius;
      const dy = y - radius;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const index = (y * width + x) * 4;
      if (distance > radius - 1) continue;
      const hue = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
      const saturation = Math.min(1, distance / (radius - 1));
      const [red, green, blue] = hsvToRgb(hue, saturation, 1);
      image.data[index] = red;
      image.data[index + 1] = green;
      image.data[index + 2] = blue;
      image.data[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
}

function updateWheelMarker(rgb) {
  const hsv = rgbToHsv(rgb.red, rgb.green, rgb.blue);
  const radius = picker.clientWidth / 2;
  const markerRadius = Math.max(0, radius - 6) * hsv.saturation;
  const angle = hsv.hue * Math.PI / 180;
  wheelMarker.style.left = `${radius + Math.cos(angle) * markerRadius}px`;
  wheelMarker.style.top = `${radius + Math.sin(angle) * markerRadius}px`;
}

function selectWheelColor(clientX, clientY) {
  const bounds = picker.getBoundingClientRect();
  const radius = bounds.width / 2;
  let dx = clientX - bounds.left - radius;
  let dy = clientY - bounds.top - radius;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > radius) {
    dx = dx / distance * radius;
    dy = dy / distance * radius;
  }
  const hue = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
  const saturation = Math.min(1, Math.sqrt(dx * dx + dy * dy) / radius);
  const current = hexToRgb(hexInput.value);
  const currentValue = rgbToHsv(current.red, current.green, current.blue).value;
  const value = currentValue < 0.25 ? 0.9 : currentValue;
  applyColor(rgbToHex(...hsvToRgb(hue, saturation, value)));
}

function applyColor(hex) {
  const normalized = hex.toUpperCase();
  const rgb = hexToRgb(normalized);
  hexInput.value = normalized;
  redInput.value = rgb.red;
  greenInput.value = rgb.green;
  blueInput.value = rgb.blue;
  swatch.style.background = normalized;
  picker.setAttribute("aria-valuetext", normalized);
  updateWheelMarker(rgb);
  presets.forEach((preset) => {
    preset.classList.toggle("is-active", preset.dataset.color === normalized);
  });
  scheduleLivePreview();
}

let wheelDragging = false;
picker.addEventListener("pointerdown", (event) => {
  wheelDragging = true;
  picker.setPointerCapture(event.pointerId);
  selectWheelColor(event.clientX, event.clientY);
});
picker.addEventListener("pointermove", (event) => {
  if (wheelDragging) selectWheelColor(event.clientX, event.clientY);
});
picker.addEventListener("pointerup", () => { wheelDragging = false; });
picker.addEventListener("pointercancel", () => { wheelDragging = false; });
picker.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  const rgb = hexToRgb(hexInput.value);
  const hsv = rgbToHsv(rgb.red, rgb.green, rgb.blue);
  if (event.key === "ArrowLeft") hsv.hue = (hsv.hue + 357) % 360;
  if (event.key === "ArrowRight") hsv.hue = (hsv.hue + 3) % 360;
  if (event.key === "ArrowUp") hsv.saturation = Math.min(1, hsv.saturation + 0.04);
  if (event.key === "ArrowDown") hsv.saturation = Math.max(0, hsv.saturation - 0.04);
  const value = hsv.value < 0.25 ? 0.9 : hsv.value;
  applyColor(rgbToHex(...hsvToRgb(hsv.hue, hsv.saturation, value)));
});

function setMessage(text, state = "neutral") {
  message.textContent = text;
  message.dataset.state = state;
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Enter a web address.");

  const candidate = /^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed.replace(/^\/+/, "")}`;
  const parsed = new URL(candidate);
  if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname) {
    throw new Error("Enter a valid web address.");
  }
  return candidate;
}

function scheduleLivePreview() {
  if (!hasGenerated) return;
  window.clearTimeout(livePreviewTimer);
  livePreviewTimer = window.setTimeout(() => generateQr({live: true}), 80);
}

async function generateQr({live = false} = {}) {
  let url;
  try {
    url = normalizeUrl(urlInput.value);
  } catch (error) {
    if (!live) {
      setMessage(error.message, "error");
      urlInput.focus();
    }
    return;
  }
  urlInput.value = url;

  const requestId = ++latestRequest;
  setMessage(live ? "Updating preview..." : "Generating QR code...", "loading");
  if (!live) saveButton.disabled = true;

  try {
    const response = await fetch("/api/qr", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        url,
        color: hexInput.value,
        transparent: transparentInput.checked,
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "The QR code could not be generated.");
    }

    const blob = await response.blob();
    if (requestId !== latestRequest) return;
    if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = URL.createObjectURL(blob);
    preview.src = currentBlobUrl;
    preview.hidden = false;
    emptyPreview.hidden = true;
    previewFrame.classList.toggle("dark-preview", hexInput.value === "#FFFFFF" && transparentInput.checked);
    hasGenerated = true;
    saveButton.disabled = false;
    setMessage("QR code ready to save.", "success");
  } catch (error) {
    if (requestId === latestRequest) setMessage(error.message, "error");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generateQr();
});

hexInput.addEventListener("input", () => {
  const value = hexInput.value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) applyColor(value);
});

function startParticleBackground() {
  const context = particleCanvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let particles = [];
  let lastTime = performance.now();

  function createParticle(fromBottom = false) {
    return {
      x: Math.random() * window.innerWidth,
      y: fromBottom ? window.innerHeight + Math.random() * 80 : Math.random() * window.innerHeight,
      radius: 0.6 + Math.random() * 1.8,
      speed: 10 + Math.random() * 28,
      drift: (Math.random() - 0.5) * 8,
      alpha: 0.12 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    };
  }

  function resizeParticles() {
    const scale = Math.min(2, window.devicePixelRatio || 1);
    particleCanvas.width = Math.round(window.innerWidth * scale);
    particleCanvas.height = Math.round(window.innerHeight * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const count = Math.max(36, Math.min(88, Math.round(window.innerWidth / 20)));
    particles = Array.from({length: count}, () => createParticle(false));
  }

  function drawParticles(time) {
    const elapsed = Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const particle of particles) {
      if (!reducedMotion) {
        particle.y -= particle.speed * elapsed;
        particle.x += (particle.drift + Math.sin(time / 1600 + particle.phase) * 3) * elapsed;
        if (particle.y < -10 || particle.x < -20 || particle.x > window.innerWidth + 20) {
          Object.assign(particle, createParticle(true));
        }
      }
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255,255,255,${particle.alpha})`;
      context.fill();
    }
    if (!reducedMotion) window.requestAnimationFrame(drawParticles);
  }

  resizeParticles();
  window.addEventListener("resize", resizeParticles, {passive: true});
  window.requestAnimationFrame(drawParticles);
}

[redInput, greenInput, blueInput].forEach((input) => {
  input.addEventListener("input", () => {
    input.value = clamp(input.value);
    applyColor(rgbToHex(redInput.value, greenInput.value, blueInput.value));
  });
});

presets.forEach((preset) => {
  preset.addEventListener("click", () => {
    applyColor(preset.dataset.color);
    if (preset.dataset.color === "#FFFFFF") transparentInput.checked = true;
  });
});

transparentInput.addEventListener("change", scheduleLivePreview);

saveButton.addEventListener("click", () => {
  if (!currentBlobUrl) return;
  const link = document.createElement("a");
  link.href = currentBlobUrl;
  link.download = "qr-code.png";
  link.click();
});

transparentInput.checked = true;
applyTheme(initialTheme());
drawColorWheel();
applyColor("#000000");
startParticleBackground();
