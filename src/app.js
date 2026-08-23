import QRCode from "qrcode";
import { normalizeUrl } from "./url.js";

const $ = (selector) => document.querySelector(selector);
const form = $("#qr-form");
const urlInput = $("#url");
const message = $("#qr-message");
const canvas = $("#qr-canvas");
const empty = $("#qr-empty");
const saveButton = $("#save-qr");
const transparentInput = $("#transparent");
const hexInput = $("#hex-color");
const rgbInputs = [$("#red"), $("#green"), $("#blue")];
const nativePicker = $("#native-color");
const wheel = $("#color-wheel");
const marker = $("#wheel-marker");
const presets = [...document.querySelectorAll("[data-color]")];

let hasGenerated = false;
let timer = 0;
let renderSequence = 0;

function clamp(value) {
  return Math.max(0, Math.min(255, Number.parseInt(value, 10) || 0));
}

function rgbToHex(red, green, blue) {
  return `#${[red, green, blue].map((value) => clamp(value).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16));
}

function hsvToRgb(hue, saturation, value = 1) {
  const chroma = value * saturation;
  const segment = hue / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const offset = value - chroma;
  let rgb = [chroma, x, 0];
  if (segment >= 1 && segment < 2) rgb = [x, chroma, 0];
  else if (segment >= 2 && segment < 3) rgb = [0, chroma, x];
  else if (segment >= 3 && segment < 4) rgb = [0, x, chroma];
  else if (segment >= 4 && segment < 5) rgb = [x, 0, chroma];
  else if (segment >= 5) rgb = [chroma, 0, x];
  return rgb.map((part) => Math.round((part + offset) * 255));
}

function rgbToHsv(red, green, blue) {
  const [r, g, b] = [red, green, blue].map((value) => value / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta && max === r) hue = 60 * (((g - b) / delta) % 6);
  else if (delta && max === g) hue = 60 * ((b - r) / delta + 2);
  else if (delta) hue = 60 * ((r - g) / delta + 4);
  return { hue: (hue + 360) % 360, saturation: max ? delta / max : 0 };
}

function setMessage(text, state = "neutral") {
  message.textContent = text;
  message.dataset.state = state;
}

function updateMarker(hex) {
  const [red, green, blue] = hexToRgb(hex);
  const hsv = rgbToHsv(red, green, blue);
  const radius = wheel.clientWidth / 2;
  const distance = hsv.saturation * Math.max(0, radius - 8);
  const angle = hsv.hue * Math.PI / 180;
  marker.style.translate = `${Math.cos(angle) * distance}px ${Math.sin(angle) * distance}px`;
  wheel.setAttribute("aria-valuetext", hex);
}

function applyColor(hex, shouldRender = true) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
  const normalized = hex.toUpperCase();
  const rgb = hexToRgb(normalized);
  hexInput.value = normalized;
  nativePicker.value = normalized;
  rgbInputs.forEach((input, index) => { input.value = rgb[index]; });
  updateMarker(normalized);
  presets.forEach((preset) => preset.classList.toggle("active", preset.dataset.color === normalized));
  if (shouldRender) scheduleRender();
}

function selectWheelColor(clientX, clientY) {
  const bounds = wheel.getBoundingClientRect();
  const radius = bounds.width / 2;
  let x = clientX - bounds.left - radius;
  let y = clientY - bounds.top - radius;
  const length = Math.hypot(x, y);
  if (length > radius) {
    x = x / length * radius;
    y = y / length * radius;
  }
  const hue = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  const saturation = Math.min(1, Math.hypot(x, y) / radius);
  applyColor(rgbToHex(...hsvToRgb(hue, saturation)));
}

async function render({ quiet = false } = {}) {
  let url;
  try {
    url = normalizeUrl(urlInput.value);
  } catch (error) {
    if (!quiet) {
      setMessage(error.message, "error");
      urlInput.focus();
    }
    return;
  }

  const sequence = ++renderSequence;
  try {
    await QRCode.toCanvas(canvas, url, {
      width: 640,
      margin: 4,
      errorCorrectionLevel: "H",
      color: {
        dark: `${hexInput.value}FF`,
        light: transparentInput.checked ? "#00000000" : "#FFFFFFFF",
      },
    });
    if (sequence !== renderSequence) return;
    urlInput.value = url;
    canvas.hidden = false;
    empty.hidden = true;
    saveButton.disabled = false;
    hasGenerated = true;
    setMessage("Ready to save.", "success");
  } catch {
    setMessage("The QR code could not be generated.", "error");
  }
}

function scheduleRender() {
  if (!hasGenerated) return;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => render({ quiet: true }), 70);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});
urlInput.addEventListener("input", scheduleRender);
transparentInput.addEventListener("change", scheduleRender);
nativePicker.addEventListener("input", () => applyColor(nativePicker.value));
hexInput.addEventListener("input", () => applyColor(hexInput.value.trim()));
rgbInputs.forEach((input) => input.addEventListener("input", () => applyColor(rgbToHex(...rgbInputs.map((field) => field.value)))));
presets.forEach((preset) => preset.addEventListener("click", () => applyColor(preset.dataset.color)));

let dragging = false;
wheel.addEventListener("pointerdown", (event) => {
  dragging = true;
  wheel.setPointerCapture(event.pointerId);
  selectWheelColor(event.clientX, event.clientY);
});
wheel.addEventListener("pointermove", (event) => {
  if (dragging) selectWheelColor(event.clientX, event.clientY);
});
wheel.addEventListener("pointerup", () => { dragging = false; });
wheel.addEventListener("pointercancel", () => { dragging = false; });
wheel.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  const [red, green, blue] = hexToRgb(hexInput.value);
  const hsv = rgbToHsv(red, green, blue);
  if (event.key === "ArrowLeft") hsv.hue = (hsv.hue + 357) % 360;
  if (event.key === "ArrowRight") hsv.hue = (hsv.hue + 3) % 360;
  if (event.key === "ArrowUp") hsv.saturation = Math.min(1, hsv.saturation + 0.04);
  if (event.key === "ArrowDown") hsv.saturation = Math.max(0, hsv.saturation - 0.04);
  applyColor(rgbToHex(...hsvToRgb(hsv.hue, hsv.saturation)));
});

saveButton.addEventListener("click", () => {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "qr-code.png";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }, "image/png");
});

transparentInput.checked = true;
applyColor("#000000", false);
window.addEventListener("resize", () => updateMarker(hexInput.value), { passive: true });

if ("serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js"));
}
