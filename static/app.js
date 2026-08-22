const form = document.querySelector("#qr-form");
const urlInput = document.querySelector("#url");
const message = document.querySelector("#form-message");
const picker = document.querySelector("#color-picker");
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

let currentBlobUrl = null;
let hasGenerated = false;
let livePreviewTimer = null;
let latestRequest = 0;

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

function applyColor(hex) {
  const normalized = hex.toUpperCase();
  const rgb = hexToRgb(normalized);
  picker.value = normalized;
  hexInput.value = normalized;
  redInput.value = rgb.red;
  greenInput.value = rgb.green;
  blueInput.value = rgb.blue;
  swatch.style.background = normalized;
  document.querySelector(".wheel-center").style.background = normalized;
  presets.forEach((preset) => {
    preset.classList.toggle("is-active", preset.dataset.color === normalized);
  });
  scheduleLivePreview();
}

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

picker.addEventListener("input", () => applyColor(picker.value));

hexInput.addEventListener("input", () => {
  const value = hexInput.value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) applyColor(value);
});

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

applyColor("#000000");
